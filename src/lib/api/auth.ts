/**
 * Authentication API
 * Handles user authentication, registration, and session management
 */

import { AuthResponse, User } from "@/types";
import { apiFetch, APIError } from "./client";
import { ClaimInviteResponse } from "./types";

export const authAPI = {
  /**
   * Login with email and password
   * Sets HTTP-only cookie on success
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Register new user (no org created - user enters invite code after email verification)
   * Sets HTTP-only cookie on success
   */
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Verify email with token
   */
  async verifyEmail(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(
      "/api/v1/auth/verify-email",
      {
        method: "POST",
        body: JSON.stringify({ token }),
      }
    );
  },

  /**
   * Resend verification email
   */
  async resendVerification(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(
      "/api/v1/auth/resend-verification",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  },

  /**
   * Get current authenticated user
   * Validates token from HTTP-only cookie
   */
  async me(): Promise<User> {
    return apiFetch<User>("/api/v1/auth/me", {
      method: "GET",
    });
  },

  /**
   * Logout user
   * Calls backend to properly clear HTTP-only cookie with correct attributes
   */
  async logout(): Promise<void> {
    await apiFetch<{ message: string }>("/api/v1/auth/logout", {
      method: "POST",
    });
  },

  /**
   * Claim an invite code to join or create an organization
   * Called after email verification
   */
  async claimInvite(code: string): Promise<ClaimInviteResponse> {
    return apiFetch<ClaimInviteResponse>("/api/v1/auth/claim-invite", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  /**
   * Request password reset email
   * Always returns success to prevent email enumeration
   */
  async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token,
        password,
        confirm_password: confirmPassword,
      }),
    });
  },

  /**
   * Validate a password reset token
   * Returns whether token is valid and masked email
   */
  async validateResetToken(
    token: string
  ): Promise<{ valid: boolean; email?: string; message?: string }> {
    return apiFetch("/api/v1/auth/validate-reset-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },
};

/**
 * Check if user is authenticated
 * Returns user if authenticated, null if not
 */
export async function checkAuth(): Promise<User | null> {
  try {
    const user = await authAPI.me();
    return user;
  } catch (error) {
    if (error instanceof APIError && error.status === 401) {
      return null;
    }
    throw error;
  }
}
