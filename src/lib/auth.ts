/**
 * Authentication service with backend API integration
 * Uses HTTP-only cookies for secure JWT token storage
 *
 * Security: JWT tokens are stored ONLY in HTTP-only cookies (set by backend)
 * This prevents XSS attacks from accessing tokens via JavaScript
 * User data is cached in localStorage for quick UI, but auth state comes from cookies
 */

import { User, AuthResponse } from "@/types";
import { api, APIError } from "./api-client";

const USER_STORAGE_KEY = "subtribe-user";

/**
 * Authenticate user with email and password
 * Backend sets HTTP-only cookie automatically
 * @returns User object if successful, null otherwise
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  try {
    const response: AuthResponse = await api.auth.login(email, password);

    // Token is stored in HTTP-only cookie by backend (secure, not accessible via JS)
    // Only cache user data for quick UI access
    if (response.user) {
      setUserData(response.user);
    }

    return response.user;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw error;
  }
}

/**
 * Register new user (no org created - user enters invite code after email verification)
 * Backend sets HTTP-only cookie automatically
 * @returns User object if successful, null otherwise
 */
export async function registerUser(data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<User | null> {
  try {
    const response: AuthResponse = await api.auth.register(data);

    // Token is stored in HTTP-only cookie by backend (secure, not accessible via JS)
    // Only cache user data for quick UI access
    if (response.user) {
      setUserData(response.user);
    }

    return response.user;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw error;
  }
}

/**
 * Verify email with token
 * @returns success status and message
 */
export async function verifyEmail(
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    return await api.auth.verifyEmail(token);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw error;
  }
}

/**
 * Resend verification email
 * @returns success status and message
 */
export async function resendVerificationEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    return await api.auth.resendVerification(email);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw error;
  }
}

/**
 * Get current authenticated user from API
 * Validates token from HTTP-only cookie
 * @returns User object if authenticated, null if not
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await api.auth.me();

    if (user) {
      setUserData(user);
    }

    return user;
  } catch (error) {
    if (error instanceof APIError && error.status === 401) {
      removeUserData();
      return null;
    }
    throw error;
  }
}

export function setUserData(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

/**
 * Get cached user data from localStorage
 * Note: Does not validate token - use getCurrentUser() for validation
 */
export function getCachedUserData(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function removeUserData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

/**
 * Logout user and clear all auth data
 * Backend clears the HTTP-only cookie, we just clear cached user data
 */
export async function logoutUser(): Promise<void> {
  try {
    await api.auth.logout();
  } finally {
    // Only clear cached user data - cookie is cleared by backend
    removeUserData();
  }
}
