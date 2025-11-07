"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service (e.g., Sentry)
    // For now, we'll just store it in state
    if (process.env.NODE_ENV === "development") {
      // In development, log to console for debugging
      console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }
    // In production, you would send this to an error tracking service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  Something went wrong
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  We&apos;re sorry for the inconvenience. An unexpected error
                  has occurred.
                </p>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md text-left">
                    <p className="text-xs font-mono text-red-800 break-all">
                      {this.state.error.message}
                    </p>
                  </div>
                )}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    className="flex-1"
                  >
                    Reload Page
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
