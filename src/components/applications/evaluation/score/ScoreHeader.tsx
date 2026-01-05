"use client";

import { AlertTriangle, Ban } from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";
import type { ScoreHeaderProps, RedFlagsSummary } from "../types";
import {
  getTierLabel,
  getTierColor,
  isBlockedTier,
  isFlaggedTier,
} from "../types";

/**
 * ScoreHeader - Displays the main score, tier badge, and verification confidence
 *
 * Shows:
 * - Final score (0-10 scale)
 * - Tier badge (Strong Match, Good Match, etc.)
 * - Verification confidence badge
 * - Blocker alert if candidate cannot proceed
 */
export function ScoreHeader({
  finalScore,
  tier,
  verificationConfidence,
  canProceed,
  blockers,
  redFlagsSummary,
}: ScoreHeaderProps & { redFlagsSummary?: RedFlagsSummary }) {
  const tierLabel = getTierLabel(tier);
  const tierColor = getTierColor(tier);
  const isBlocked = isBlockedTier(tier);
  const isFlagged = isFlaggedTier(tier);

  return (
    <div className="space-y-3">
      {/* Main Score Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Score */}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {finalScore.toFixed(1)}
            </span>
            <span className="text-lg text-gray-400">/10</span>
          </div>

          {/* Tier Badge */}
          <div
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
              text-sm font-medium border
              ${tierColor}
            `}
          >
            {isBlocked && <Ban className="w-3.5 h-3.5" />}
            {isFlagged && <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{tierLabel}</span>
          </div>
        </div>

        {/* Verification Badge */}
        <VerificationBadge
          confidence={verificationConfidence}
          redFlagsSummary={redFlagsSummary}
        />
      </div>

      {/* Blocker Alert */}
      {!canProceed && blockers.length > 0 && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-start gap-2">
            <Ban className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800 text-sm">
                Candidate Blocked
              </p>
              <ul className="mt-1 space-y-1">
                {blockers.map((blocker, idx) => (
                  <li key={idx} className="text-sm text-red-700">
                    {blocker.type === "dealbreaker_skill" && (
                      <>
                        Missing required skill:{" "}
                        <span className="font-medium">{blocker.skill_id}</span>
                      </>
                    )}
                    {blocker.type === "dealbreaker_constraint" && (
                      <>{blocker.description}</>
                    )}
                    {blocker.type === "manipulation_attempt" && (
                      <>
                        Resume manipulation detected
                        {blocker.details && (
                          <span className="text-red-600">
                            {" "}
                            - {blocker.details}
                          </span>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Flagged Warning (manipulation detected but still proceeding) */}
      {isFlagged && canProceed && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 text-sm">
                Evaluation Flagged
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                Potential issues detected. Review red flags before proceeding.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
