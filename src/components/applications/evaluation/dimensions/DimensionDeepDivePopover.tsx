"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { DimensionAssessment, DimensionScores } from "../types";
import { formatDimensionName } from "../types";

interface DimensionDeepDivePopoverProps {
  dimension: keyof DimensionScores;
  score: number;
  assessment?: DimensionAssessment;
}

/**
 * Get level badge styling
 */
function getLevelBadge(level: string): {
  bg: string;
  text: string;
  label: string;
} {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    strong: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Strong" },
    good: { bg: "bg-blue-100", text: "text-blue-700", label: "Good" },
    moderate: { bg: "bg-amber-100", text: "text-amber-700", label: "Moderate" },
    weak: { bg: "bg-orange-100", text: "text-orange-700", label: "Weak" },
    poor: { bg: "bg-red-100", text: "text-red-700", label: "Poor" },
  };
  return (
    styles[level] || { bg: "bg-gray-100", text: "text-gray-700", label: level }
  );
}

/**
 * DimensionDeepDivePopover - Rich content for radar chart dimension click
 *
 * Shows:
 * - Dimension name and score
 * - Assessment level badge
 * - LLM reasoning text
 * - Positive signals as green chips
 * - Negative signals as amber/red chips
 */
export function DimensionDeepDivePopover({
  dimension,
  score,
  assessment,
}: DimensionDeepDivePopoverProps) {
  const dimensionName = formatDimensionName(dimension);
  const levelBadge = assessment ? getLevelBadge(assessment.raw_level) : null;

  return (
    <div className="space-y-4 min-w-[320px] max-w-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg">{dimensionName}</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {score.toFixed(1)}
          </span>
          <span className="text-sm text-gray-400">/10</span>
        </div>
      </div>

      {/* Assessment Level */}
      {levelBadge && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Assessment:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelBadge.bg} ${levelBadge.text}`}
          >
            {levelBadge.label}
          </span>
        </div>
      )}

      {/* Reasoning */}
      {assessment?.reasoning && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">
            {assessment.reasoning}
          </p>
        </div>
      )}

      {/* Positive Signals */}
      {assessment?.positive_signals &&
        assessment.positive_signals.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>Positive Signals</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assessment.positive_signals.map((signal, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* Negative Signals */}
      {assessment?.negative_signals &&
        assessment.negative_signals.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-rose-700">
              <AlertTriangle className="w-4 h-4" />
              <span>Concerns</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assessment.negative_signals.map((signal, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-rose-50 text-rose-700 rounded-md border border-rose-100"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* No assessment data fallback */}
      {!assessment && (
        <div className="text-sm text-gray-400 italic">
          Detailed assessment not available for this dimension.
        </div>
      )}
    </div>
  );
}
