"use client";

import { MapPin } from "lucide-react";
import type { SkillMatch, EvidenceQuality, SkillDepth } from "../types";
import { getDepthPercentage, getEvidenceQualityPercentage } from "../types";

interface SkillEvidenceTooltipProps {
  skillName: string;
  match: SkillMatch;
}

/**
 * Progress bar component for evidence/depth visualization
 */
function EvidenceBar({
  label,
  value,
  percentage,
  color,
}: {
  label: string;
  value: string;
  percentage: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700 capitalize">
          {value.replace(/_/g, " ")}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Get color class based on evidence quality
 */
function getEvidenceColor(quality: EvidenceQuality): string {
  const colors: Record<EvidenceQuality, string> = {
    strong_evidence: "bg-emerald-500",
    weak_evidence: "bg-amber-500",
    keyword_only: "bg-gray-400",
  };
  return colors[quality];
}

/**
 * Get color class based on skill depth
 */
function getDepthColor(depth: SkillDepth): string {
  const colors: Record<SkillDepth, string> = {
    strong: "bg-emerald-500",
    moderate: "bg-blue-500",
    basic: "bg-amber-500",
    unclear: "bg-gray-400",
  };
  return colors[depth];
}

/**
 * SkillEvidenceTooltip - Rich tooltip content for skill pills
 *
 * Shows:
 * - Skill name with icon
 * - Source reference (company/project)
 * - Evidence quality bar
 * - Depth indicator bar
 * - Evidence text snippet
 */
export function SkillEvidenceTooltip({
  skillName,
  match,
}: SkillEvidenceTooltipProps) {
  const evidencePercentage = getEvidenceQualityPercentage(
    match.evidence_quality
  );
  const depthPercentage = getDepthPercentage(match.depth);

  // Clean up evidence text for display
  const evidenceText = match.evidence
    .replace(/\[Auto-reconciled.*?\]/g, "")
    .replace(/WHERE:.*?WHAT:/, "")
    .trim();

  // Check if this was auto-reconciled
  const isReconciled =
    match._reconciled || match.evidence.includes("[Auto-reconciled");

  return (
    <div className="space-y-3 min-w-[280px] max-w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">{skillName}</h4>
        {isReconciled && (
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
            Auto-detected
          </span>
        )}
      </div>

      {/* Source Reference */}
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <MapPin className="w-3.5 h-3.5 text-gray-400" />
        <span>Source: {match.source_reference}</span>
      </div>

      {/* Evidence Quality & Depth Bars */}
      <div className="space-y-2.5 py-2 border-t border-b border-gray-100">
        <EvidenceBar
          label="Evidence"
          value={match.evidence_quality}
          percentage={evidencePercentage}
          color={getEvidenceColor(match.evidence_quality)}
        />
        <EvidenceBar
          label="Depth"
          value={match.depth}
          percentage={depthPercentage}
          color={getDepthColor(match.depth)}
        />
      </div>

      {/* Evidence Text */}
      {evidenceText && (
        <div className="text-sm text-gray-600 italic leading-relaxed">
          &ldquo;
          {evidenceText.length > 150
            ? `${evidenceText.slice(0, 150)}...`
            : evidenceText}
          &rdquo;
        </div>
      )}

      {/* Keyword-only warning */}
      {match.evidence_quality === "keyword_only" && (
        <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded">
          This skill was mentioned but lacks supporting evidence in work
          history.
        </div>
      )}
    </div>
  );
}
