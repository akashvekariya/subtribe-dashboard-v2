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
