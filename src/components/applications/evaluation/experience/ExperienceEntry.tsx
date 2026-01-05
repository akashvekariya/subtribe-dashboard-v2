"use client";

import { useState } from "react";
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Briefcase,
} from "lucide-react";
import type { ExperienceEntry as ExperienceEntryType } from "../types";

interface ExperienceEntryProps {
  entry: ExperienceEntryType;
  isFirst?: boolean;
  isLast?: boolean;
}

/**
 * Format duration in months to readable string
 */
function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} mo`;
  }
  if (remainingMonths === 0) {
    return `${years} yr${years > 1 ? "s" : ""}`;
  }
  return `${years} yr${years > 1 ? "s" : ""} ${remainingMonths} mo`;
}

/**
 * Format experience type to readable string
 */
function formatExperienceType(type: string): string {
  const labels: Record<string, string> = {
    full_time: "Full-Time",
    internship: "Internship",
    contract: "Contract",
    freelance: "Freelance",
    part_time: "Part-Time",
    research: "Research",
    teaching: "Teaching",
    founder: "Founder",
    volunteer: "Volunteer",
    other: "Other",
  };
  return (
    labels[type] ||
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/**
 * ExperienceEntry - Expandable experience card
 *
 * Features:
 * - Company, title, duration display
 * - Current role indicator
 * - Expandable contributions and skills
 * - Timeline visual elements
 */
export function ExperienceEntry({
  entry,
  isFirst = false,
  isLast = false,
}: ExperienceEntryProps) {
  const [isExpanded, setIsExpanded] = useState(isFirst);

  return (
    <div className="relative pl-6">
      {/* Timeline connector */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />

      {/* Timeline dot */}
      <div
        className={`
          absolute left-0 top-3 w-2.5 h-2.5 rounded-full border-2 -translate-x-1
          ${
            entry.is_current
              ? "bg-emerald-500 border-emerald-500 animate-pulse"
              : "bg-white border-gray-300"
          }
        `}
      />

      {/* Entry Card */}
      <div
        className={`
          ml-4 mb-4 rounded-lg border transition-all duration-200
          ${isExpanded ? "bg-white shadow-sm" : "bg-gray-50 hover:bg-white hover:shadow-sm"}
          ${entry.is_current ? "border-emerald-200" : "border-gray-200"}
        `}
      >
        {/* Header (always visible) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-start justify-between text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-gray-900">{entry.title}</h4>
              {entry.is_current && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded">
                  CURRENT
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Building2 className="w-3.5 h-3.5" />
              <span>{entry.company}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDuration(entry.duration_months)}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {formatExperienceType(entry.experience_type)}
              </span>
            </div>
          </div>

          {/* Duration bar */}
          <div className="flex items-center gap-2 ml-4">
            <div
              className="h-2 rounded-full bg-blue-100"
              style={{ width: `${Math.min(entry.duration_months * 2, 80)}px` }}
            >
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: "100%" }}
              />
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-0 space-y-4 border-t border-gray-100">
            {/* Key Contributions */}
            {entry.key_contributions.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Key Contributions
                </h5>
                <ul className="space-y-1.5">
                  {entry.key_contributions.map((contribution, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-blue-500 mt-1.5">•</span>
                      <span>{contribution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills Demonstrated */}
            {entry.skills_demonstrated.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Skills Demonstrated
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {entry.skills_demonstrated.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {entry.key_contributions.length === 0 &&
              entry.skills_demonstrated.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No detailed contributions extracted from resume.
                </p>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
