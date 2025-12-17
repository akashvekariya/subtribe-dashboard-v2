/**
 * Authentication service with backend API integration
 * Uses HTTP-only cookies for secure JWT token storage
 */

import { User, AuthResponse } from "@/types";
import { api, APIError } from "./api-client";

const USER_STORAGE_KEY = "subtribe-user";
const TOKEN_STORAGE_KEY = "subtribe-token";

/**
 * Store authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

/**
 * Authenticate user with email and password
 * @returns User object if successful, null otherwise
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  try {
    const response: AuthResponse = await api.auth.login(email, password);

    if (response.access_token) {
      setAuthToken(response.access_token);
    }

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
 * Register new user (creates org or joins via invite token)
 * @returns User object if successful, null otherwise
 */
export async function registerUser(data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  invite_token?: string;
}): Promise<User | null> {
  try {
    const response: AuthResponse = await api.auth.register(data);

    if (response.access_token) {
      setAuthToken(response.access_token);
    }

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
 */
export async function logoutUser(): Promise<void> {
  try {
    await api.auth.logout();
  } finally {
    removeAuthToken();
    removeUserData();
  }
}
