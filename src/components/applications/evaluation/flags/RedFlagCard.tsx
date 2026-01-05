"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Search,
  Info,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import type { RedFlag, RedFlagSeverity } from "../types";
import { getSeverityColor } from "../types";

interface RedFlagCardProps {
  flag: RedFlag;
}

/**
 * Get icon for severity level
 */
function getSeverityIcon(severity: RedFlagSeverity) {
  const icons: Record<RedFlagSeverity, React.ReactNode> = {
    concern: <AlertTriangle className="w-4 h-4" />,
    investigate: <Search className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
  };
  return icons[severity];
}

/**
 * Get label for severity level
 */
function getSeverityLabel(severity: RedFlagSeverity): string {
  const labels: Record<RedFlagSeverity, string> = {
    concern: "CONCERN",
    investigate: "INVESTIGATE",
    info: "INFO",
  };
  return labels[severity];
}

/**
 * Format flag type to readable string
 */
function formatFlagType(type: string): string {
  const labels: Record<string, string> = {
    short_tenure: "Short Tenure",
    employment_gap: "Employment Gap",
    title_experience_mismatch: "Title/Experience Mismatch",
    vague_contributions: "Vague Contributions",
    unverifiable_claims: "Unverifiable Claims",
  };
  return (
    labels[type] ||
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/**
 * RedFlagCard - Individual severity-coded flag card
 *
 * Features:
 * - Severity-based styling (concern/investigate/info)
 * - Flag type and details display
 * - Expandable interview probe section
 * - Context information
 */
export function RedFlagCard({ flag }: RedFlagCardProps) {
  const [isProbeExpanded, setIsProbeExpanded] = useState(false);
  const severityColor = getSeverityColor(flag.severity);

  return (
    <div className={`rounded-lg border ${severityColor}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`
                p-1.5 rounded-md
                ${flag.severity === "concern" ? "bg-red-100" : ""}
                ${flag.severity === "investigate" ? "bg-amber-100" : ""}
                ${flag.severity === "info" ? "bg-blue-100" : ""}
              `}
            >
              {getSeverityIcon(flag.severity)}
            </div>
            <div>
              <span
                className={`
                  text-[10px] font-bold tracking-wider
                  ${flag.severity === "concern" ? "text-red-600" : ""}
                  ${flag.severity === "investigate" ? "text-amber-600" : ""}
                  ${flag.severity === "info" ? "text-blue-600" : ""}
                `}
              >
                {getSeverityLabel(flag.severity)}
              </span>
              <h4 className="font-medium text-gray-900 text-sm">
                {formatFlagType(flag.flag_type)}
              </h4>
            </div>
          </div>
        </div>

        {/* Details */}
        <p className="mt-3 text-sm text-gray-700 leading-relaxed">
          {flag.details}
        </p>

        {/* Context (if available) */}
        {flag.context && (
          <div className="mt-2 p-2 bg-white/50 rounded border border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Context: </span>
              {flag.context}
            </p>
          </div>
        )}
      </div>

      {/* Interview Probe Section */}
      {flag.interview_probe && (
        <div className="border-t border-gray-200/50">
          <button
            onClick={() => setIsProbeExpanded(!isProbeExpanded)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span>Interview Probe</span>
            </div>
            {isProbeExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isProbeExpanded && (
            <div className="px-4 pb-4">
              <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  &ldquo;{flag.interview_probe}&rdquo;
                </p>
              </div>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(flag.interview_probe)
                }
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
