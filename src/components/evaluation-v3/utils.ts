/**
 * Evaluation V3 - Shared Utility Functions
 */

import type { Tier } from './types';

/**
 * Get initials from a name (max 2 characters)
 * @param name - Full name string
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Format date string as relative time or absolute date
 * @param dateStr - ISO date string (YYYY-MM-DD)
 * @returns Formatted string (e.g., "2h ago", "5d ago", "12 Jan")
 */
export const formatRelativeDate = (dateStr?: string): string => {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const currentYear = now.getFullYear();

  if (year === currentYear) return `${day} ${month}`;
  return `${day} ${month} ${year}`;
};

/**
 * Format date string from YYYY-MM format to "Mon YYYY"
 * @param dateStr - Date string in YYYY-MM format
 * @returns Formatted string (e.g., "Jan 2024")
 */
export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return month ? `${monthNames[parseInt(month) - 1]} ${year}` : year;
};

/**
 * Format a Date object as time ago for refresh indicator
 * Shows precise seconds for recent times
 * @param date - Date object or null
 * @returns Formatted string (e.g., "Just now", "5s ago", "2m ago", "1h ago")
 */
export const formatTimeAgo = (date: Date | null): string => {
  if (!date) return 'Never';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

/**
 * Map backend evaluation tier to UI tier
 * Backend: strong_match, good_match, moderate_match, weak_match, mismatch
 * UI: excellent_match, good_match, average_match, poor_match
 */
export const mapBackendTierToUI = (backendTier: string | null | undefined): Tier => {
  if (!backendTier) return 'poor_match';

  // Handle tiers with suffixes like _blocked or _flagged
  const baseTier = backendTier.split('_blocked')[0].split('_flagged')[0];

  const tierMap: Record<string, Tier> = {
    'strong_match': 'excellent_match',
    'good_match': 'good_match',
    'moderate_match': 'average_match',
    'weak_match': 'poor_match',
    'mismatch': 'mismatch',
  };

  return tierMap[baseTier] || 'mismatch';
};
