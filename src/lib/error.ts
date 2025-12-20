/**
 * Error Handling
 * Simplified error utilities following React Query patterns
 */

import { APIError } from "./api-client";

/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

/**
 * Check if error is authentication error and handle redirect
 * Returns true if handled
 */
export function handleAuthError(error: unknown): boolean {
  const isAuthError =
    (error instanceof APIError && error.status === 401) ||
    (error instanceof Error &&
      (error.message.includes("401") ||
        error.message.includes("Unauthorized") ||
        error.message.includes("Authentication required")));

  if (isAuthError && typeof window !== "undefined") {
    // Only clear cached user data - cookie is handled by backend
    localStorage.removeItem("subtribe-user");
    window.location.href = "/sign-in";
    return true;
  }

  return false;
}
