"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SkillEvidenceTooltip } from "./SkillEvidenceTooltip";
import type { TechStackItem } from "../types";

interface SkillEvidencePillProps {
  skill: TechStackItem;
}

/**
 * Get status-based styling for the pill
 */
function getStatusStyles(status: TechStackItem["status"]): string {
  const styles: Record<typeof status, string> = {
    present:
      "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300",
    uncertain:
      "bg-gray-50 text-gray-500 border-gray-200 opacity-80 hover:opacity-100 hover:bg-gray-100",
    missing: "bg-gray-100 text-gray-400 border-gray-200 line-through",
  };
  return styles[status];
}

/**
 * SkillEvidencePill - Tech stack pill with hover tooltip
 *
 * Features:
 * - Status-based styling (present/uncertain/missing)
 * - Hover to show evidence details
 * - Devicon for skill icons
 * - Smooth hover interactions
 */
export function SkillEvidencePill({ skill }: SkillEvidencePillProps) {
  const [open, setOpen] = useState(false);
  const hasEvidence = skill.evidence !== undefined;
  const statusStyles = getStatusStyles(skill.status);

  // If no evidence, render simple pill without popover
  if (!hasEvidence || skill.status === "missing") {
    return (
      <div
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full
          text-sm font-medium border transition-all duration-200
          ${statusStyles}
        `}
      >
        <i className={`${skill.icon} text-base`} />
        <span>{skill.name}</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            text-sm font-medium border transition-all duration-200
            cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            ${statusStyles}
            ${open ? "ring-2 ring-blue-500 ring-offset-1" : ""}
          `}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <i className={`${skill.icon} text-base`} />
          <span>{skill.name}</span>
          {/* Evidence quality dot indicator */}
          {skill.evidence && (
            <span
              className={`
                w-1.5 h-1.5 rounded-full
                ${skill.evidence.evidence_quality === "strong_evidence" ? "bg-emerald-500" : ""}
                ${skill.evidence.evidence_quality === "weak_evidence" ? "bg-amber-500" : ""}
                ${skill.evidence.evidence_quality === "keyword_only" ? "bg-gray-400" : ""}
              `}
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-4 w-auto"
        side="top"
        align="center"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <SkillEvidenceTooltip skillName={skill.name} match={skill.evidence!} />
      </PopoverContent>
    </Popover>
  );
}
