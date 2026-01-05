"use client";

import { Shield, AlertTriangle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { VerificationBadgeProps } from "../types";
import { getConfidenceColor } from "../types";

/**
 * VerificationBadge - Displays confidence level with tooltip explanation
 *
 * Shows High/Medium/Low confidence indicator based on red flags
 * and evidence quality from the evaluation.
 */
export function VerificationBadge({
  confidence,
  redFlagsSummary,
}: VerificationBadgeProps) {
  const colorClasses = getConfidenceColor(confidence);

  const Icon =
    confidence === "high"
      ? Shield
      : confidence === "medium"
        ? Info
        : AlertTriangle;

  const labels: Record<typeof confidence, string> = {
    high: "High Confidence",
    medium: "Moderate Confidence",
    low: "Low Confidence",
  };

  const descriptions: Record<typeof confidence, string> = {
    high: "Strong evidence supports this evaluation with minimal red flags.",
    medium: "Some areas need verification. Review the highlighted concerns.",
    low: "Multiple concerns detected. Manual review recommended.",
  };

  // Build tooltip content
  const tooltipContent = (
    <div className="space-y-2 max-w-xs">
      <p className="font-medium">{labels[confidence]}</p>
      <p className="text-sm text-gray-600">{descriptions[confidence]}</p>

      {redFlagsSummary && redFlagsSummary.total_flags > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-1">
            Red Flags Detected:
          </p>
          <div className="flex gap-2 text-xs">
            {redFlagsSummary.by_severity.concern > 0 && (
              <span className="text-red-600">
                {redFlagsSummary.by_severity.concern} concern
                {redFlagsSummary.by_severity.concern > 1 ? "s" : ""}
              </span>
            )}
            {redFlagsSummary.by_severity.investigate > 0 && (
              <span className="text-amber-600">
                {redFlagsSummary.by_severity.investigate} to investigate
              </span>
            )}
            {redFlagsSummary.by_severity.info > 0 && (
              <span className="text-blue-600">
                {redFlagsSummary.by_severity.info} info
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              text-xs font-medium border cursor-help
              transition-all duration-200 hover:shadow-sm
              ${colorClasses}
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{labels[confidence].split(" ")[0]}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
