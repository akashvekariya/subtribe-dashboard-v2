import React from "react";
import { Icons } from "../Icons";
import {
  CalibrationData,
  CalibrationQuestionsPayload,
  Trajectory,
  SectionFeedback,
} from "../../types";
import {
  ROLE_OPEN_REASONS,
  AUTONOMY_LEVEL_OPTIONS,
} from "../../lib/calibration-constants";
import FeedbackWidget from "./FeedbackWidget";
import InfoPopup, { SECTION_INFO } from "./InfoPopup";
import CustomInputOption from "./CustomInputOption";

interface CalibrationStep3Props {
  questions: CalibrationQuestionsPayload;
  calibrationData: CalibrationData;
  updateCalibrationData: (updates: Partial<CalibrationData>) => void;
  onFeedback: (feedback: SectionFeedback) => void;
}

// Selection Pill for single select options
const SelectionPill = ({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      h-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex flex-col gap-1
      ${
        selected
          ? "bg-zinc-900 border-zinc-900 text-white shadow-md"
          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
      }
    `}
  >
    <span
      className={`font-medium text-sm ${selected ? "text-white" : "text-zinc-900"}`}
    >
      {label}
    </span>
    {description && (
      <span
        className={`text-xs ${selected ? "text-zinc-400" : "text-zinc-500"}`}
      >
        {description}
      </span>
    )}
  </button>
);

// Checkbox item for multi-select
const CheckboxItem = ({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={disabled ? undefined : onChange}
    disabled={disabled}
    className={`
      w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-300
      ${
        checked
          ? "bg-zinc-900 border-zinc-900 cursor-pointer"
          : disabled
            ? "bg-zinc-50 border-zinc-100 cursor-not-allowed opacity-80"
            : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 cursor-pointer"
      }
    `}
  >
    <div
      className={`
      w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300
      ${
        checked
          ? "bg-white border-white"
          : disabled
            ? "border-zinc-200 bg-zinc-100"
            : "border-zinc-300 bg-white"
      }
    `}
    >
      {checked && <Icons.Check className="w-3.5 h-3.5 text-zinc-900" />}
    </div>
    <span
      className={`text-sm leading-relaxed transition-colors duration-300 ${checked ? "text-white" : disabled ? "text-zinc-400" : "text-zinc-700"}`}
    >
      {label}
    </span>
  </button>
);

// Milestone Checkbox Component
const MilestoneCheckbox = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3
      ${
        selected
          ? "bg-zinc-900 border-zinc-900 text-white shadow-md"
          : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
      }
    `}
  >
    <div
      className={`
      w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
      ${selected ? "bg-white border-white" : "border-zinc-300"}
    `}
    >
      {selected && <Icons.Check className="w-3.5 h-3.5 text-zinc-900" />}
    </div>
    <span className={`text-sm font-medium ${selected ? "text-white" : ""}`}>
      {label}
    </span>
  </button>
);

export default function CalibrationStep3({
  questions,
  calibrationData,
  updateCalibrationData,
  onFeedback,
}: CalibrationStep3Props) {
  const {
    pipelineCalibration,
    honestAssessment,
    day60Expectations,
    skillRealityCheck,
  } = questions || {};

  const {
    pipelineCalibration: pipelineData,
    honestAssessment: assessmentData,
    roleContext: roleContextData,
    day60Expectations: selectedMilestones,
    mustHaveSkills,
    goodToHaveSkills,
  } = calibrationData;

  // Helper to get skill name by ID
  const getSkillName = (skillId: string): string => {
    // Handle custom skills
    if (skillId.startsWith("custom_musthave_")) {
      return skillId.replace("custom_musthave_", "").replace(/_/g, " ");
    }
    if (skillId.startsWith("custom_goodtohave_")) {
      return skillId.replace("custom_goodtohave_", "").replace(/_/g, " ");
    }
    // Look up from LLM-generated skills
    const allSkills = [
      ...(skillRealityCheck?.mustHaveSkills || []),
      ...(skillRealityCheck?.goodToHaveSkills || []),
    ];
    const skill = allSkills.find((s) => s.id === skillId);
    return skill?.name || skillId;
  };

  // Handlers
  const handleTrajectorySelect = (trajectory: Trajectory) => {
    updateCalibrationData({
      pipelineCalibration: { ...pipelineData, trajectory },
    });
  };

  const handleChallengeToggle = (challenge: string) => {
    const current = assessmentData.challenges;
    const isSelected = current.includes(challenge);
    const maxReached = current.length >= 3 && !isSelected;
    if (maxReached) return;
    updateCalibrationData({
      honestAssessment: {
        ...assessmentData,
        challenges: isSelected
          ? current.filter((c) => c !== challenge)
          : [...current, challenge],
      },
    });
  };

  const handleCustomChallenge = (challenge: string) => {
    const current = assessmentData.challenges;
    if (current.length >= 3) return;
    if (current.includes(challenge)) return; // Avoid duplicates
    updateCalibrationData({
      honestAssessment: {
        ...assessmentData,
        challenges: [...current, challenge],
      },
    });
  };

  const handleCustomMilestone = (milestone: string) => {
    const current = selectedMilestones;
    if (current.includes(milestone)) return; // Avoid duplicates
    updateCalibrationData({
      day60Expectations: [...current, milestone],
    });
  };

  const handleRoleOpenSelect = (reason: string) => {
    updateCalibrationData({
      roleContext: {
        ...roleContextData,
        roleOpenReason:
          roleContextData?.roleOpenReason === reason ? undefined : reason,
      },
    });
  };

  const handleAutonomySelect = (level: string) => {
    updateCalibrationData({
      roleContext: {
        ...roleContextData,
        autonomyLevel:
          roleContextData?.autonomyLevel === level ? undefined : level,
      },
    });
  };

  const handleMilestoneToggle = (milestone: string) => {
    const current = selectedMilestones;
    const isSelected = current.includes(milestone);
    updateCalibrationData({
      day60Expectations: isSelected
        ? current.filter((m) => m !== milestone)
        : [...current, milestone],
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Section 1: Role Expectations */}
      {pipelineCalibration && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                <Icons.TrendingUp className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  Role Expectations
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Help candidates understand growth and collaboration style
                </p>
              </div>
            </div>
            <InfoPopup title="Role Expectations">
              {SECTION_INFO.careerPath}
            </InfoPopup>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Where can this role lead?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-fr gap-3">
              {pipelineCalibration.trajectoryOptions.map((opt) => (
                <SelectionPill
                  key={opt.id}
                  label={opt.label}
                  description={opt.hint}
                  selected={pipelineData?.trajectory === opt.id}
                  onClick={() => handleTrajectorySelect(opt.id as Trajectory)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end mt-4 pt-4 border-t border-zinc-100">
            <FeedbackWidget
              sectionId="career_path"
              existingFeedback={calibrationData.sectionFeedback?.find(
                (f) => f.sectionId === "career_path"
              )}
              onFeedback={onFeedback}
            />
          </div>
        </div>
      )}

      {/* Section 3: Role Challenges */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
              <Icons.AlertTriangle className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Role Challenges
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                Honest expectations help find candidates who thrive
              </p>
            </div>
          </div>
          <InfoPopup title="Role Challenges">
            {SECTION_INFO.roleChallenges}
          </InfoPopup>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            What challenges come with this role?{" "}
            <span className="text-red-500">(Select up to 3)</span>
          </label>
          <div className="grid gap-3">
            {honestAssessment.challengeOptions.map((challenge) => {
              const selected = assessmentData.challenges.includes(challenge);
              const maxReached = assessmentData.challenges.length >= 3;
              return (
                <CheckboxItem
                  key={challenge}
                  label={challenge}
                  checked={selected}
                  disabled={!selected && maxReached}
                  onChange={() => handleChallengeToggle(challenge)}
                />
              );
            })}
            {/* Show custom challenges that were added */}
            {assessmentData.challenges
              .filter((c) => !honestAssessment.challengeOptions.includes(c))
              .map((customChallenge) => (
                <CheckboxItem
                  key={customChallenge}
                  label={customChallenge}
                  checked={true}
                  onChange={() => handleChallengeToggle(customChallenge)}
                />
              ))}
            <CustomInputOption
              placeholder="e.g., Heavy context-switching between projects"
              onAdd={handleCustomChallenge}
              disabled={assessmentData.challenges.length >= 3}
            />
          </div>
        </div>

        <div className="flex items-center justify-end mt-4 pt-4 border-t border-zinc-100">
          <FeedbackWidget
            sectionId="role_challenges"
            existingFeedback={calibrationData.sectionFeedback?.find(
              (f) => f.sectionId === "role_challenges"
            )}
            onFeedback={onFeedback}
          />
        </div>
      </div>

      {/* Section 4: Optional Context (Hardcoded) */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
              <Icons.Info className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Additional Context
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                Optional information to refine matching.
              </p>
            </div>
          </div>
          <InfoPopup title="Additional Context">
            {SECTION_INFO.additionalContext}
          </InfoPopup>
        </div>

        <div className="space-y-8">
          {/* Role Open Reason */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Why is this role open?{" "}
              <span className="text-zinc-400">(Optional)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-fr gap-3">
              {ROLE_OPEN_REASONS.map((reason) => (
                <SelectionPill
                  key={reason.id}
                  label={reason.label}
                  description={reason.description}
                  selected={roleContextData?.roleOpenReason === reason.id}
                  onClick={() => handleRoleOpenSelect(reason.id)}
                />
              ))}
            </div>
          </div>

          {/* Autonomy Level */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Level of autonomy/guidance?{" "}
              <span className="text-zinc-400">(Optional)</span>
            </label>
            <p className="text-xs text-zinc-400 mb-3">
              How much guidance will be available during onboarding?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-fr gap-3">
              {AUTONOMY_LEVEL_OPTIONS.map((level) => (
                <SelectionPill
                  key={level.id}
                  label={level.label}
                  description={level.description}
                  selected={roleContextData?.autonomyLevel === level.id}
                  onClick={() => handleAutonomySelect(level.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4 pt-4 border-t border-zinc-100">
          <FeedbackWidget
            sectionId="additional_context"
            existingFeedback={calibrationData.sectionFeedback?.find(
              (f) => f.sectionId === "additional_context"
            )}
            onFeedback={onFeedback}
          />
        </div>
      </div>

      {/* Section 5: Day 60 Expectations */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
              <Icons.Calendar className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Day 60 Expectations
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                {day60Expectations.instruction}
              </p>
            </div>
          </div>
          <InfoPopup title="Day 60 Expectations">
            {SECTION_INFO.day60Expectations}
          </InfoPopup>
        </div>

        <div className="grid gap-3">
          {day60Expectations.milestones.map((milestone) => (
            <MilestoneCheckbox
              key={milestone}
              label={milestone}
              selected={selectedMilestones.includes(milestone)}
              onClick={() => handleMilestoneToggle(milestone)}
            />
          ))}
          {/* Show custom milestones that were added */}
          {selectedMilestones
            .filter((m) => !day60Expectations.milestones.includes(m))
            .map((customMilestone) => (
              <MilestoneCheckbox
                key={customMilestone}
                label={customMilestone}
                selected={true}
                onClick={() => handleMilestoneToggle(customMilestone)}
              />
            ))}
          <CustomInputOption
            placeholder="e.g., Complete first project independently"
            onAdd={handleCustomMilestone}
          />
        </div>

        <div className="flex items-center justify-end mt-4 pt-4 border-t border-zinc-100">
          <FeedbackWidget
            sectionId="day60_expectations"
            existingFeedback={calibrationData.sectionFeedback?.find(
              (f) => f.sectionId === "day60_expectations"
            )}
            onFeedback={onFeedback}
          />
        </div>
      </div>

      {/* Summary Preview */}
      <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-zinc-200">
            <Icons.CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">
              Calibration Summary
            </h3>
            <p className="text-sm text-zinc-500 mt-1">Review before saving.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Must-Have Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {mustHaveSkills.length > 0 ? (
                mustHaveSkills.map((skillId) => (
                  <span
                    key={skillId}
                    className="px-2 py-1 bg-white border border-zinc-200 rounded text-xs text-zinc-700"
                  >
                    {getSkillName(skillId)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-400 italic">
                  None selected
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Good-To-Have Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {goodToHaveSkills.length > 0 ? (
                goodToHaveSkills.map((skillId) => (
                  <span
                    key={skillId}
                    className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700"
                  >
                    {getSkillName(skillId)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-400 italic">
                  None selected
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Growth
            </h4>
            <div className="text-xs text-zinc-600">
              <p>
                Trajectory:{" "}
                <span className="font-medium capitalize">
                  {pipelineData?.trajectory?.replace("_", " ") || "Not set"}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Challenges
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {assessmentData.challenges.length > 0 ? (
                assessmentData.challenges.slice(0, 3).map((c) => (
                  <span
                    key={c}
                    className="px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700"
                  >
                    {c.length > 30 ? c.substring(0, 30) + "..." : c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-400 italic">
                  None selected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
