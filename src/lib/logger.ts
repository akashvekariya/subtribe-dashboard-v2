/**
 * Structured JSON Logger for Google Cloud Logging
 *
 * IMPORTANT: This logger outputs a SINGLE JSON entry per request to prevent log flooding.
 * Each log entry contains all context in one consolidated JSON object.
 *
 * BAD (creates 5 separate log entries):
 *   console.log('Request started');
 *   console.log('User ID:', userId);
 *   console.log('Method:', method);
 *   console.log('Path:', path);
 *   console.log('Duration:', duration);
 *
 * GOOD (creates 1 consolidated log entry):
 *   logger.info('Request processed', {
 *     requestId, userId, method, path, status, duration
 *   });
 *
 * Google Cloud Logging automatically parses JSON and makes fields searchable.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Record<string, unknown>;
}

export interface LogEntry extends LogContext {
  level: LogLevel;
  message: string;
  timestamp: string;
}

export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   * Useful for adding request-scoped data (requestId, userId, etc.)
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Internal log method that outputs a single JSON entry
   */
  private log(level: LogLevel, message: string, data?: LogContext): void {
    // Skip logging in test environment
    if (process.env.NODE_ENV === "test") {
      return;
    }

    // Emergency kill switch - disable all logging if needed
    // Set DISABLE_LOGGING=true in environment to suppress all logs
    // (Use only for extreme traffic spikes or cost control)
    if (process.env.DISABLE_LOGGING === "true") {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...data,
    };

    // Single console.log call with JSON string
    // Google Cloud Logging parses this automatically
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Log informational message
   */
  info(message: string, data?: LogContext): void {
    this.log("info", message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: LogContext): void {
    this.log("warn", message, data);
  }

  /**
   * Log error message
   */
  error(message: string, data?: LogContext): void {
    this.log("error", message, data);
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, data?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, data);
    }
  }
}

// Default logger instance
export const logger = new Logger({
  service: "subtribe-frontend",
  environment: process.env.NODE_ENV || "development",
});
