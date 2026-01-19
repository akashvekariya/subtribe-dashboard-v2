/**
 * Evaluation V3 - Variant Configuration
 * Centralized styling and configuration for all variant types
 */

import type {
  PillVariant,
  FlagSeverity,
  SignalStrength,
  SourceType,
  Tier,
  ApplicationStatus,
  CandidateSortOption,
} from "../types";

// Pill Variant Styles (Tailwind classes)
export const pillVariantStyles: Record<PillVariant, string> = {
  success: "bg-emerald-100 text-emerald-700 border-t border-emerald-200/90",
  warning: "bg-orange-100 text-orange-700 border-t border-orange-200/90",
  error: "bg-red-100 text-red-600 border-t border-red-200/90",
  info: "bg-blue-100 text-blue-700 border-t border-blue-200/90",
  purple: "bg-violet-100 text-violet-700 border-t border-violet-200/90",
  neutral: "bg-zinc-200 text-zinc-600 border-t border-zinc-300/90",
};

// Eligibility Configuration
export interface EligibilityConfig {
  style: string;
  label: string;
  colorClass: string;
}

export const eligibilityConfig: Record<string, EligibilityConfig> = {
  true: {
    style: pillVariantStyles.success,
    label: "Pass",
    colorClass: "eval-color-success",
  },
  review: {
    style: pillVariantStyles.warning,
    label: "Review",
    colorClass: "eval-color-warning",
  },
  false: {
    style: pillVariantStyles.error,
    label: "Fail",
    colorClass: "eval-color-error",
  },
};

// Severity Configuration
export interface SeverityConfig {
  label: string;
  colorClass: string;
  bgClass: string;
}

export const severityConfig: Record<FlagSeverity, SeverityConfig> = {
  concern: {
    label: "Concern",
    colorClass: "eval-color-error",
    bgClass: "eval-bg-error",
  },
  investigate: {
    label: "Investigate",
    colorClass: "eval-color-warning",
    bgClass: "eval-bg-warning",
  },
  info: {
    label: "Info",
    colorClass: "eval-color-info",
    bgClass: "eval-bg-info",
  },
};

// Signal Strength Configuration
export interface SignalConfig {
  label: string;
  variant: PillVariant;
  textColor: string;
  description: string;
}

export const signalConfig: Record<SignalStrength, SignalConfig> = {
  strong: {
    label: "Experienced",
    variant: "success",
    textColor: "text-emerald-700",
    description:
      "Demonstrated through work experience with concrete evidence of application in real projects.",
  },
  moderate: {
    label: "Some Experience",
    variant: "warning",
    textColor: "text-orange-700",
    description:
      "Has some practical exposure but limited evidence of deep or recent application.",
  },
  academic: {
    label: "Studied",
    variant: "info",
    textColor: "text-blue-700",
    description:
      "Learned through formal education, coursework, or certifications without professional application.",
  },
  listed: {
    label: "Self-reported",
    variant: "purple",
    textColor: "text-violet-700",
    description:
      "Listed in skills section but no supporting evidence found in experience or projects.",
  },
  missing: {
    label: "Missing",
    variant: "neutral",
    textColor: "text-zinc-600",
    description:
      "This skill was not found in the candidate's resume or experience.",
  },
};

// Source Type Labels
export const sourceLabels: Record<SourceType, string> = {
  experience: "Work Experience",
  education: "Education",
  project: "Project",
  keyword_only: "Skills Section",
  inferred: "Inferred",
};

// Tier Configuration
export interface TierConfig {
  label: string;
  pillClass: string;
}

export const tierConfig: Record<Tier, TierConfig> = {
  excellent_match: {
    label: "Excellent Match",
    pillClass: "bg-emerald-600 text-white",
  },
  good_match: { label: "Good Match", pillClass: "bg-blue-600 text-white" },
  average_match: {
    label: "Average Match",
    pillClass: "bg-amber-500 text-white",
  },
  poor_match: { label: "Poor Match", pillClass: "bg-orange-500 text-white" },
  mismatch: { label: "Mismatch", pillClass: "bg-red-500 text-white" },
};

// Flag Type Labels
export const flagTypeLabels: Record<string, string> = {
  short_tenure: "Short Tenure",
  vague_contributions: "Vague Contributions",
  job_hopping: "Job Hopping",
  career_regression: "Career Regression",
  unexplained_gaps: "Unexplained Gaps",
  skill_mismatch: "Skill Mismatch",
  overqualified: "Overqualified",
  inconsistencies: "Inconsistencies",
};

// Helper function to format flag type to label
export const getFlagTypeLabel = (flagType: string): string => {
  return (
    flagTypeLabels[flagType] ||
    flagType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

// Tier styles for CandidateList
export interface TierStyleConfig {
  label: string;
  className: string;
  color: string;
}

export const tierStyles: Record<Tier, TierStyleConfig> = {
  excellent_match: {
    label: "Excellent",
    className: "candidate-tier-excellent",
    color: "#059669",
  },
  good_match: {
    label: "Good",
    className: "candidate-tier-good",
    color: "#2563eb",
  },
  average_match: {
    label: "Average",
    className: "candidate-tier-average",
    color: "#d97706",
  },
  poor_match: {
    label: "Poor",
    className: "candidate-tier-poor",
    color: "#ea580c",
  },
  mismatch: {
    label: "Mismatch",
    className: "candidate-tier-mismatch",
    color: "#dc2626",
  },
};

// Application status styles
export interface StatusStyleConfig {
  label: string;
  className: string;
}

export const statusStyles: Record<ApplicationStatus, StatusStyleConfig> = {
  applied: { label: "Applied", className: "status-applied" },
  screening: { label: "Screening", className: "status-screening" },
  interviewing: { label: "Interviewing", className: "status-interviewing" },
  offer: { label: "Offer", className: "status-offer" },
  hired: { label: "Hired", className: "status-hired" },
  rejected: { label: "Rejected", className: "status-rejected" },
};

// Sort options for CandidateList
export interface SortOptionConfig {
  value: CandidateSortOption;
  label: string;
}

export const sortOptions: SortOptionConfig[] = [
  { value: "score_desc", label: "Score: High to Low" },
  { value: "score_asc", label: "Score: Low to High" },
  { value: "date_desc", label: "Date: Newest" },
  { value: "date_asc", label: "Date: Oldest" },
  { value: "name_asc", label: "Name: A-Z" },
  { value: "name_desc", label: "Name: Z-A" },
];
