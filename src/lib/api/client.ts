/**
 * Base API Client Utilities
 * Handles HTTP requests, error management, and authentication
 */

import { ApiError } from "@/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    `Missing required environment variable: NEXT_PUBLIC_API_URL\n` +
      `Please ensure .env.development file exists with:\n` +
      `NEXT_PUBLIC_API_URL=your_value\n` +
      `If the file exists, try restarting the dev server.`
  );
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "APIError";
  }
}

export async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    // Handle 204 No Content or empty responses
    const contentLength = response.headers.get("content-length");
    if (response.status === 204 || contentLength === "0") {
      return {} as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      // Check if body is empty before parsing
      const text = await response.text();
      if (!text || text.trim() === "") {
        return {} as T;
      }
      return JSON.parse(text);
    }
    return {} as T;
  }

  let errorData: ApiError | null = null;
  try {
    errorData = await response.json();
  } catch {
    // JSON parsing failed
  }

  const message =
    errorData?.error?.message || response.statusText || "An error occurred";
  const code = errorData?.error?.code;
  const details = errorData?.error?.details;

  throw new APIError(message, response.status, code, details);
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Authentication is handled via HTTP-only cookies (credentials: "include")
  // No need to send Authorization header - cookies are more secure against XSS
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Sends HTTP-only auth cookie automatically
  };

  try {
    const response = await fetch(url, config);
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : "Network error occurred",
      0
    );
  }
}
