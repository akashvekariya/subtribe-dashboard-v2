"use client";

import { Clock, Briefcase } from "lucide-react";
import { ExperienceEntry } from "./ExperienceEntry";
import type {
  ExperienceEntry as ExperienceEntryType,
  ExperienceSummary,
} from "../types";

interface ExperienceTimelineProps {
  entries: ExperienceEntryType[];
  summary?: ExperienceSummary;
  requiredMin?: number;
  requiredMax?: number;
}

/**
 * ExperienceTimeline - Interactive company-by-company breakdown
 *
 * Features:
 * - Visual timeline with duration bars
 * - Total experience vs required range
 * - Expandable entries with contributions
 * - Current role highlighting
 */
export function ExperienceTimeline({
  entries,
  summary,
  requiredMin,
  requiredMax,
}: ExperienceTimelineProps) {
  const totalYears = summary?.total_years || 0;
  const hasCurrentRole =
    summary?.has_current_role || entries.some((e) => e.is_current);

  // Calculate experience fit
  const meetsMinimum =
    requiredMin !== undefined ? totalYears >= requiredMin : true;
  const withinRange =
    requiredMin !== undefined && requiredMax !== undefined
      ? totalYears >= requiredMin && totalYears <= requiredMax
      : meetsMinimum;

  // Sort entries by start date (most recent first)
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.is_current && !b.is_current) return -1;
    if (!a.is_current && b.is_current) return 1;
    // Parse start dates for comparison
    const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
    const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  if (entries.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No experience entries extracted from resume.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          Experience Timeline
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-900">
            {totalYears.toFixed(1)} years
          </span>
          {hasCurrentRole && (
            <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
              Currently Employed
            </span>
          )}
        </div>
      </div>

      {/* Experience Range Indicator */}
      {(requiredMin !== undefined || requiredMax !== undefined) && (
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Required Experience:</span>
            <span className="font-medium text-gray-700">
              {requiredMin !== undefined && requiredMax !== undefined
                ? `${requiredMin}-${requiredMax} years`
                : requiredMin !== undefined
                  ? `${requiredMin}+ years`
                  : `Up to ${requiredMax} years`}
            </span>
          </div>

          {/* Visual bar */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-visible">
            {/* Required range overlay */}
            {requiredMin !== undefined && requiredMax !== undefined && (
              <div
                className="absolute h-full bg-blue-100 rounded-full"
                style={{
                  left: `${(requiredMin / 15) * 100}%`,
                  width: `${((requiredMax - requiredMin) / 15) * 100}%`,
                }}
              />
            )}

            {/* Candidate experience marker */}
            <div
              className={`
                absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow-sm
                ${
                  withinRange
                    ? "bg-emerald-500 border-emerald-600"
                    : meetsMinimum
                      ? "bg-amber-500 border-amber-600"
                      : "bg-red-500 border-red-600"
                }
              `}
              style={{
                left: `calc(${Math.min((totalYears / 15) * 100, 100)}% - 8px)`,
              }}
            />

            {/* Year markers */}
            <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[10px] text-gray-400">
              <span>0</span>
              <span>5</span>
              <span>10</span>
              <span>15+</span>
            </div>
          </div>

          {/* Status text */}
          <div className="mt-6 text-xs text-center">
            {withinRange && (
              <span className="text-emerald-600 font-medium">
                Experience matches the required range
              </span>
            )}
            {!withinRange && meetsMinimum && (
              <span className="text-amber-600 font-medium">
                Above the preferred experience range
              </span>
            )}
            {!meetsMinimum && (
              <span className="text-red-600 font-medium">
                Below the minimum experience requirement
              </span>
            )}
          </div>
        </div>
      )}

      {/* Experience Type Breakdown */}
      {summary?.by_type && Object.keys(summary.by_type).length > 1 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(summary.by_type).map(([type, data]) => (
            <span
              key={type}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
            >
              {type.replace(/_/g, " ")}:{" "}
              {Math.round((data.months / 12) * 10) / 10} yrs
            </span>
          ))}
        </div>
      )}

      {/* Timeline Entries */}
      <div className="pt-2">
        {sortedEntries.map((entry, idx) => (
          <ExperienceEntry
            key={`${entry.company}-${entry.title}-${idx}`}
            entry={entry}
            isFirst={idx === 0}
            isLast={idx === sortedEntries.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
