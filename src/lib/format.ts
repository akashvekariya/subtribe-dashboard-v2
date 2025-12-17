/**
 * Formatting Utilities
 * Uses native Intl APIs and simple formatters
 */

/**
 * Format date using Intl.DateTimeFormat
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: "short" | "long" = "short"
): string {
  if (!date) return "—";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "—";

  return format === "long"
    ? dateObj.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

/**
 * Format date with time using Intl.DateTimeFormat
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  format: "short" | "long" = "short"
): string {
  if (!date) return "—";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "—";

  const dateOptions: Intl.DateTimeFormatOptions =
    format === "long"
      ? { month: "long", day: "numeric", year: "numeric" }
      : { month: "short", day: "numeric" };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const formattedDate = dateObj.toLocaleDateString("en-US", dateOptions);
  const formattedTime = dateObj.toLocaleTimeString("en-US", timeOptions);

  return `${formattedDate}, ${formattedTime}`;
}

/**
 * Format currency using Intl.NumberFormat
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "INR"
): string {
  if (amount === null || amount === undefined) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Simple pluralization
 */
export function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

/**
 * Format a date as relative time (e.g., "Posted 3 days ago", "Posted 2 weeks ago")
 */
export function formatRelativeTime(
  date: string | Date | null | undefined
): string {
  if (!date) return "—";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Posted today";
  if (diffDays === 1) return "Posted 1 day ago";
  if (diffDays < 7) return `Posted ${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "Posted 1 week ago";
  if (diffWeeks < 4) return `Posted ${diffWeeks} weeks ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "Posted 1 month ago";
  if (diffMonths < 12) return `Posted ${diffMonths} months ago`;

  return "Posted over a year ago";
}

/**
 * Format applicant count for display
 * Currently hardcoded to "20+ applicants" for better traction
 */
export function formatApplicantCount(): string {
  return "20+ applicants";
}
