/**
 * Application Constants
 * Single source of truth for status options, color mappings, and display labels
 */

import {
  ApplicationStatus,
  PositionType,
  LocationType,
  JobStatus,
} from "@/types";

/**
 * Application status colors for badges
 */
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: "bg-blue-100 text-blue-800",
  screening: "bg-yellow-100 text-yellow-800",
  interviewing: "bg-purple-100 text-purple-800",
  offer: "bg-green-100 text-green-800",
  hired: "bg-green-200 text-green-900",
  rejected: "bg-red-100 text-red-800",
};

/**
 * Job status colors for badges
 */
export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  active: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  closed: "bg-gray-100 text-gray-800",
};

/**
 * Application status options for dropdowns
 */
export const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

/**
 * Position type display labels
 */
export const POSITION_TYPE_LABELS: Record<PositionType, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  temporary: "Temporary",
  internship: "Internship",
  volunteer: "Volunteer",
  other: "Other",
};

/**
 * Location type display labels
 */
export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

/**
 * Job status display labels
 */
export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  active: "Active",
  draft: "Draft",
  closed: "Closed",
};

// ============================================================================
// Candidate Scoring
// ============================================================================

export const SCORING = {
  /** Base score for all candidates */
  BASE_SCORE: 40,

  /** Bonus points for having LinkedIn profile */
  LINKEDIN_BONUS: 12,

  /** Bonus points for having GitHub profile */
  GITHUB_BONUS: 18,

  /** Bonus points for having portfolio */
  PORTFOLIO_BONUS: 15,

  /** Bonus for realistic salary expectations (<=30% growth) */
  REALISTIC_SALARY_BONUS: 10,

  /** Bonus for moderate salary expectations (<=50% growth) */
  MODERATE_SALARY_BONUS: 5,

  /** Threshold for "realistic" salary growth expectation (percentage) */
  REALISTIC_SALARY_THRESHOLD: 30,

  /** Threshold for "moderate" salary growth expectation (percentage) */
  MODERATE_SALARY_THRESHOLD: 50,

  /** Score thresholds for candidate tiers */
  THRESHOLDS: {
    /** Score >= 85 = Exceptional */
    EXCEPTIONAL: 85,
    /** Score >= 70 = Strong */
    STRONG: 70,
    /** Score >= 55 = Good */
    GOOD: 55,
  },
} as const;

// ============================================================================
// AI Evaluation Thresholds
// ============================================================================

export const AI_SCORE = {
  /** AI considers candidate "good" at this score or above */
  HIGH_THRESHOLD: 70,

  /** AI considers candidate "low-scoring" below this */
  LOW_THRESHOLD: 50,
} as const;

// ============================================================================
// Pagination
// ============================================================================

export const PAGINATION = {
  /** Default page size for candidate lists */
  DEFAULT_PAGE_SIZE: 20,

  /** Max jobs to fetch in bulk operations */
  JOBS_LIMIT: 100,
} as const;

// ============================================================================
// Validation Limits
// ============================================================================

export const VALIDATION = {
  /** Max length for standard form fields */
  MAX_FIELD_LENGTH: 100,

  /** Max length for company tagline */
  MAX_TAGLINE_LENGTH: 200,

  /** Max length for company about text */
  MAX_ABOUT_LENGTH: 1000,
} as const;

// ============================================================================
// Time Constants
// ============================================================================

export const TIME = {
  /** Days in a week */
  DAYS_PER_WEEK: 7,

  /** Weeks in a month (approximate) */
  WEEKS_PER_MONTH: 4,

  /** Months in a year */
  MONTHS_PER_YEAR: 12,

  /** Milliseconds in a day */
  MS_PER_DAY: 86_400_000,
} as const;
