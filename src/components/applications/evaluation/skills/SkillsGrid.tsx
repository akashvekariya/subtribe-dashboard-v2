"use client";

import { SkillEvidencePill } from "./SkillEvidencePill";
import type { TechStackItem, SkillAnalysis } from "../types";

interface SkillsGridProps {
  skills: TechStackItem[];
  skillAnalysis?: SkillAnalysis;
}

/**
 * SkillsGrid - Two-column layout for Must Have and Good to Have skills
 *
 * Features:
 * - Separates required vs preferred skills
 * - Shows skill coverage stats
 * - Responsive layout
 */
export function SkillsGrid({ skills, skillAnalysis }: SkillsGridProps) {
  // Separate must-have (first 5 or required) from good-to-have
  // In a real implementation, we'd use is_required from framework
  // For now, split roughly in half or use first 5
  const splitIndex = Math.min(5, Math.ceil(skills.length / 2));
  const mustHaveSkills = skills.slice(0, splitIndex);
  const goodToHaveSkills = skills.slice(splitIndex);

  // Count present skills
  const presentCount = skills.filter((s) => s.status === "present").length;
  const uncertainCount = skills.filter((s) => s.status === "uncertain").length;

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      {skillAnalysis && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="text-gray-500">Skill Coverage:</span>
            <span className="font-medium text-gray-900">
              {Math.round(skillAnalysis.skill_coverage * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />
              {presentCount} matched
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-gray-300 mr-1" />
              {uncertainCount} uncertain
            </span>
          </div>
        </div>
      )}

      {/* Two-column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Must Have Skills */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Must Have Skills
            <span className="text-xs text-gray-400 font-normal">
              ({mustHaveSkills.filter((s) => s.status === "present").length}/
              {mustHaveSkills.length})
            </span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {mustHaveSkills.map((skill) => (
              <SkillEvidencePill key={skill.id} skill={skill} />
            ))}
            {mustHaveSkills.length === 0 && (
              <span className="text-sm text-gray-400 italic">
                No required skills defined
              </span>
            )}
          </div>
        </div>

        {/* Good to Have Skills */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Good to Have Skills
            <span className="text-xs text-gray-400 font-normal">
              ({goodToHaveSkills.filter((s) => s.status === "present").length}/
              {goodToHaveSkills.length})
            </span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {goodToHaveSkills.map((skill) => (
              <SkillEvidencePill key={skill.id} skill={skill} />
            ))}
            {goodToHaveSkills.length === 0 && (
              <span className="text-sm text-gray-400 italic">
                No preferred skills defined
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown (if available) */}
      {skillAnalysis?.category_scores &&
        Object.keys(skillAnalysis.category_scores).length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Category Breakdown
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(skillAnalysis.category_scores).map(
                ([category, score]) => (
                  <div
                    key={category}
                    className="p-2 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="text-xs text-gray-500 capitalize mb-1">
                      {category.replace(/_/g, " ")}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}
