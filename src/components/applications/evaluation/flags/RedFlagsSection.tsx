"use client";

import { Flag, AlertTriangle, Search, Info } from "lucide-react";
import { RedFlagCard } from "./RedFlagCard";
import type { RedFlag, RedFlagsSummary } from "../types";

interface RedFlagsSectionProps {
  flags: RedFlag[];
  summary?: RedFlagsSummary;
}

/**
 * RedFlagsSection - Container for all red flag cards
 *
 * Features:
 * - Summary header with counts by severity
 * - Grouped display by severity
 * - Empty state when no flags
 */
export function RedFlagsSection({ flags, summary }: RedFlagsSectionProps) {
  // Group flags by severity for organized display
  const concernFlags = flags.filter((f) => f.severity === "concern");
  const investigateFlags = flags.filter((f) => f.severity === "investigate");
  const infoFlags = flags.filter((f) => f.severity === "info");

  const totalFlags = flags.length;

  // If no flags, show success state
  if (totalFlags === 0) {
    return (
      <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
          <Flag className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="font-medium text-emerald-800">No Red Flags Detected</h3>
        <p className="text-sm text-emerald-600 mt-1">
          Resume appears consistent and well-documented.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Flag className="w-4 h-4 text-gray-400" />
          Red Flags
        </h3>
        <div className="flex items-center gap-3 text-xs">
          {concernFlags.length > 0 && (
            <span className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              {concernFlags.length} concern{concernFlags.length > 1 ? "s" : ""}
            </span>
          )}
          {investigateFlags.length > 0 && (
            <span className="flex items-center gap-1 text-amber-600">
              <Search className="w-3.5 h-3.5" />
              {investigateFlags.length} to investigate
            </span>
          )}
          {infoFlags.length > 0 && (
            <span className="flex items-center gap-1 text-blue-600">
              <Info className="w-3.5 h-3.5" />
              {infoFlags.length} info
            </span>
          )}
        </div>
      </div>

      {/* Flags grouped by severity */}
      <div className="space-y-3">
        {/* Concerns first (most important) */}
        {concernFlags.map((flag, idx) => (
          <RedFlagCard key={`concern-${idx}`} flag={flag} />
        ))}

        {/* Then investigate */}
        {investigateFlags.map((flag, idx) => (
          <RedFlagCard key={`investigate-${idx}`} flag={flag} />
        ))}

        {/* Finally info */}
        {infoFlags.map((flag, idx) => (
          <RedFlagCard key={`info-${idx}`} flag={flag} />
        ))}
      </div>

      {/* Verification confidence note */}
      {summary && summary.verification_confidence !== "high" && (
        <div
          className={`
            p-3 rounded-lg text-sm
            ${
              summary.verification_confidence === "medium"
                ? "bg-amber-50 border border-amber-100 text-amber-800"
                : "bg-red-50 border border-red-100 text-red-800"
            }
          `}
        >
          <span className="font-medium">
            {summary.verification_confidence === "medium" ? "Moderate" : "Low"}{" "}
            verification confidence
          </span>
          <span className="text-gray-600"> — </span>
          <span>{summary.summary}</span>
        </div>
      )}
    </div>
  );
}
