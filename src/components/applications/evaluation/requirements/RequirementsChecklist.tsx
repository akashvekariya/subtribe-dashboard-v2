"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  ConstraintResult,
  ConstraintAnalysis,
  ConstraintStatus,
} from "../types";
import { getConstraintStatusColor } from "../types";

interface RequirementsChecklistProps {
  constraintResults: ConstraintResult[];
  constraintAnalysis?: ConstraintAnalysis;
  frameworkConstraints?: Array<{
    constraint_type: string;
    description: string;
    severity: string;
    original_text?: string;
  }>;
}

/**
 * Get icon for constraint status
 */
function getStatusIcon(status: ConstraintStatus) {
  const icons: Record<ConstraintStatus, React.ReactNode> = {
    pass: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    fail: <XCircle className="w-5 h-5 text-red-500" />,
    deferred: <HelpCircle className="w-5 h-5 text-amber-500" />,
  };
  return icons[status];
}

/**
 * Get status label
 */
function getStatusLabel(status: ConstraintStatus): string {
  const labels: Record<ConstraintStatus, string> = {
    pass: "Pass",
    fail: "Fail",
    deferred: "Deferred",
  };
  return labels[status];
}

interface ConstraintRowProps {
  result: ConstraintResult;
  constraint?: {
    constraint_type: string;
    description: string;
    severity: string;
    original_text?: string;
  };
}

function ConstraintRow({ result, constraint }: ConstraintRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusColor = getConstraintStatusColor(result.status);
  const isDealbreaker = constraint?.constraint_type === "dealbreaker";

  return (
    <div
      className={`
        border-l-4 rounded-r-lg transition-all duration-200
        ${statusColor}
        ${isDealbreaker && result.status === "fail" ? "ring-1 ring-red-300" : ""}
      `}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {getStatusIcon(result.status)}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 text-sm">
                {constraint?.description ||
                  `Constraint ${result.constraint_idx + 1}`}
              </span>
              {isDealbreaker && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
                  DEALBREAKER
                </span>
              )}
            </div>
            {constraint?.original_text && (
              <span className="text-xs text-gray-500 line-clamp-1">
                {constraint.original_text}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`
              px-2 py-0.5 rounded text-xs font-medium
              ${result.status === "pass" ? "bg-green-100 text-green-700" : ""}
              ${result.status === "fail" ? "bg-red-100 text-red-700" : ""}
              ${result.status === "deferred" ? "bg-amber-100 text-amber-700" : ""}
            `}
          >
            {getStatusLabel(result.status)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Evidence */}
      {isExpanded && result.evidence && (
        <div className="px-3 pb-3 pt-0 ml-8">
          <div className="p-2 bg-white/50 rounded border border-gray-100 text-sm text-gray-600">
            {result.evidence}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * RequirementsChecklist - Constraint pass/fail visualization
 *
 * Features:
 * - List of hard constraints with status icons
 * - Expandable rows with evidence
 * - Dealbreaker highlighting
 * - Summary stats in header
 */
export function RequirementsChecklist({
  constraintResults,
  constraintAnalysis,
  frameworkConstraints,
}: RequirementsChecklistProps) {
  // Calculate stats
  const passCount = constraintResults.filter((r) => r.status === "pass").length;
  const failCount = constraintResults.filter((r) => r.status === "fail").length;
  const deferredCount = constraintResults.filter(
    (r) => r.status === "deferred"
  ).length;
  const total = constraintResults.length;

  if (total === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        No hard constraints defined for this role.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Requirements Checklist</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-green-600 font-medium">{passCount} passed</span>
          {failCount > 0 && (
            <span className="text-red-600 font-medium">{failCount} failed</span>
          )}
          {deferredCount > 0 && (
            <span className="text-amber-600 font-medium">
              {deferredCount} deferred
            </span>
          )}
        </div>
      </div>

      {/* Constraint List */}
      <div className="space-y-2">
        {constraintResults.map((result) => (
          <ConstraintRow
            key={result.constraint_idx}
            result={result}
            constraint={frameworkConstraints?.[result.constraint_idx]}
          />
        ))}
      </div>

      {/* Penalty Info (if applicable) */}
      {constraintAnalysis && constraintAnalysis.penalty_factor < 1 && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
          <span className="text-gray-500">Score penalty applied: </span>
          <span className="font-medium text-gray-700">
            {Math.round((1 - constraintAnalysis.penalty_factor) * 100)}%
            reduction
          </span>
          <span className="text-gray-400"> due to constraint failures</span>
        </div>
      )}
    </div>
  );
}
