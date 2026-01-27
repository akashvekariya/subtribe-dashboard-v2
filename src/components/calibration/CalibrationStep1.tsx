import React, { useMemo } from "react";
import { Icons } from "../Icons";
import {
  CalibrationData,
  CalibrationQuestionsPayload,
  ExtractedSkill,
  SectionFeedback,
} from "../../types";
import FeedbackWidget from "./FeedbackWidget";
import InfoPopup, { SECTION_INFO } from "./InfoPopup";
import CustomInputOption from "./CustomInputOption";

// Fisher-Yates shuffle - creates a shuffled copy of array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface CalibrationStep1Props {
  questions: CalibrationQuestionsPayload;
  calibrationData: CalibrationData;
  updateCalibrationData: (updates: Partial<CalibrationData>) => void;
  onFeedback: (feedback: SectionFeedback) => void;
}

// Category icons and colors for visual scanning
const categoryConfig: Record<
  string,
  { icon: React.ReactNode; bg: string; border: string; selectedBg: string }
> = {
  Technical: {
    icon: <Icons.Code2 className="w-3.5 h-3.5" />,
    bg: "bg-blue-50",
    border: "border-blue-200",
    selectedBg: "bg-blue-600",
  },
  Soft: {
    icon: <Icons.Users className="w-3.5 h-3.5" />,
    bg: "bg-purple-50",
    border: "border-purple-200",
    selectedBg: "bg-purple-600",
  },
  Domain: {
    icon: <Icons.Briefcase className="w-3.5 h-3.5" />,
    bg: "bg-amber-50",
    border: "border-amber-200",
    selectedBg: "bg-amber-600",
  },
};

// Checkbox item for multi-select with optional hint
interface CheckboxItemProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  accentColor?: "blue" | "purple";
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({
  label,
  hint,
  checked,
  onChange,
  disabled = false,
  icon,
  accentColor = "blue",
}) => {
  const colors = {
    blue: {
      selected: "bg-blue-600 border-blue-600",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    purple: {
      selected: "bg-purple-600 border-purple-600",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
  };
  const colorConfig = colors[accentColor];

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onChange}
      disabled={disabled}
      className={`
        w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200
        ${
          checked
            ? `${colorConfig.selected} text-white shadow-md`
            : disabled
              ? "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
              : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 cursor-pointer"
        }
      `}
    >
      {icon && (
        <span
          className={`
          w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5
          ${checked ? "bg-white/20" : colorConfig.iconBg}
        `}
        >
          <span className={checked ? "text-white" : colorConfig.iconColor}>
            {icon}
          </span>
        </span>
      )}
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm font-medium block ${checked ? "text-white" : "text-zinc-900"}`}
        >
          {label}
        </span>
        {hint && (
          <span
            className={`text-xs block mt-0.5 ${checked ? "text-white/70" : "text-zinc-500"}`}
          >
            {hint}
          </span>
        )}
      </div>
      {checked && <Icons.Check className="w-5 h-5 shrink-0 mt-0.5" />}
    </button>
  );
};

// Skill Pill Component - with icon for visual scanning
interface SkillPillProps {
  skill: ExtractedSkill;
  selected: boolean;
  onClick: () => void;
}

const SkillPill: React.FC<SkillPillProps> = ({ skill, selected, onClick }) => {
  const config = categoryConfig[skill.category] || categoryConfig.Technical;

  return (
    <button
      onClick={onClick}
      className={`
        group px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200
        flex items-center gap-2 whitespace-nowrap
        ${
          selected
            ? `${config.selectedBg} border-transparent text-white shadow-md`
            : `bg-white ${config.border} text-zinc-700 hover:shadow-sm hover:border-zinc-300`
        }
      `}
    >
      <span
        className={`flex items-center justify-center w-5 h-5 rounded ${selected ? "bg-white/20" : config.bg}`}
      >
        {config.icon}
      </span>
      <span>{skill.name}</span>
      {selected && <Icons.Check className="w-4 h-4 ml-auto" />}
    </button>
  );
};

// Custom Skill Pill Component - for user-added skills
interface CustomSkillPillProps {
  skillId: string;
  selected: boolean;
  onClick: () => void;
  variant?: "mustHave" | "goodToHave";
}

const CustomSkillPill: React.FC<CustomSkillPillProps> = ({
  skillId,
  selected,
  onClick,
  variant = "mustHave",
}) => {
  // Extract display name from custom ID
  const prefix =
    variant === "mustHave" ? "custom_musthave_" : "custom_goodtohave_";
  const displayName = skillId.replace(prefix, "").replace(/_/g, " ");
  const config = categoryConfig.Technical; // Custom skills default to Technical style

  return (
    <button
      onClick={onClick}
      className={`
        group px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200
        flex items-center gap-2 whitespace-nowrap
        ${
          selected
            ? `${config.selectedBg} border-transparent text-white shadow-md`
            : `bg-white ${config.border} text-zinc-700 hover:shadow-sm hover:border-zinc-300`
        }
      `}
    >
      <span
        className={`flex items-center justify-center w-5 h-5 rounded ${selected ? "bg-white/20" : config.bg}`}
      >
        <Icons.Plus className="w-3.5 h-3.5" />
      </span>
      <span className="capitalize">{displayName}</span>
      {selected && <Icons.Check className="w-4 h-4 ml-auto" />}
    </button>
  );
};

export default function CalibrationStep1({
  questions,
  calibrationData,
  updateCalibrationData,
  onFeedback,
}: CalibrationStep1Props) {
  const { skillRealityCheck, pipelineCalibration } = questions || {};
  const {
    mustHaveSkills,
    goodToHaveSkills,
    pipelineCalibration: pipelineData,
  } = calibrationData;

  // Shuffle skills once on mount (stable across re-renders)
  const shuffledMustHaveSkills = useMemo(
    () => shuffleArray(skillRealityCheck?.mustHaveSkills || []),
    [skillRealityCheck?.mustHaveSkills]
  );
  const shuffledGoodToHaveSkills = useMemo(
    () => shuffleArray(skillRealityCheck?.goodToHaveSkills || []),
    [skillRealityCheck?.goodToHaveSkills]
  );

  const handleMustHaveToggle = (skillId: string) => {
    const current = mustHaveSkills;
    const isSelected = current.includes(skillId);

    if (isSelected) {
      updateCalibrationData({
        mustHaveSkills: current.filter((id) => id !== skillId),
      });
    } else {
      updateCalibrationData({ mustHaveSkills: [...current, skillId] });
    }
  };

  const handleGoodToHaveToggle = (skillId: string) => {
    const current = goodToHaveSkills;
    const isSelected = current.includes(skillId);

    if (isSelected) {
      updateCalibrationData({
        goodToHaveSkills: current.filter((id) => id !== skillId),
      });
    } else {
      updateCalibrationData({ goodToHaveSkills: [...current, skillId] });
    }
  };

  // Custom skill handlers
  const handleCustomMustHaveSkill = (skillName: string) => {
    const customId = `custom_musthave_${skillName.toLowerCase().replace(/\s+/g, "_")}`;
    if (mustHaveSkills.includes(customId)) return;
    updateCalibrationData({ mustHaveSkills: [...mustHaveSkills, customId] });
  };

  const handleCustomGoodToHaveSkill = (skillName: string) => {
    const customId = `custom_goodtohave_${skillName.toLowerCase().replace(/\s+/g, "_")}`;
    if (goodToHaveSkills.includes(customId)) return;
    updateCalibrationData({
      goodToHaveSkills: [...goodToHaveSkills, customId],
    });
  };

  // Assessment Priorities Handler - simple toggle
  const handleAssessmentPriorityToggle = (id: string) => {
    const current = pipelineData?.assessmentPriorities || [];
    const isSelected = current.includes(id);
    updateCalibrationData({
      pipelineCalibration: {
        ...pipelineData,
        assessmentPriorities: isSelected
          ? current.filter((p) => p !== id)
          : [...current, id],
      },
    });
  };

  // Custom assessment priority
  const handleCustomAssessmentPriority = (label: string) => {
    const current = pipelineData?.assessmentPriorities || [];
    const customId = `custom_${label.toLowerCase().replace(/\s+/g, "_")}`;
    if (current.includes(customId)) return;
    updateCalibrationData({
      pipelineCalibration: {
        ...pipelineData,
        assessmentPriorities: [...current, customId],
      },
    });
  };

  // Problem Types Handler - simple toggle
  const handleProblemTypeToggle = (id: string) => {
    const current = pipelineData?.problemTypes || [];
    const isSelected = current.includes(id);
    updateCalibrationData({
      pipelineCalibration: {
        ...pipelineData,
        problemTypes: isSelected
          ? current.filter((p) => p !== id)
          : [...current, id],
      },
    });
  };

  // Custom problem type
  const handleCustomProblemType = (label: string) => {
    const current = pipelineData?.problemTypes || [];
    const customId = `custom_${label.toLowerCase().replace(/\s+/g, "_")}`;
    if (current.includes(customId)) return;
    updateCalibrationData({
      pipelineCalibration: {
        ...pipelineData,
        problemTypes: [...current, customId],
      },
    });
  };

  const skillsValid = mustHaveSkills.length >= 1;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Section 1: Confirm Key Skills */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
              <Icons.Target className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                Confirm Key Skills
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                Select the skills that are truly essential for this role
              </p>
            </div>
          </div>
          <InfoPopup title="Confirm Key Skills">
            {SECTION_INFO.confirmSkills}
          </InfoPopup>
        </div>

        {/* Must Have Skills Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Must Have
            </h4>
            <span className="text-xs text-zinc-400">
              ({mustHaveSkills.length} confirmed)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {shuffledMustHaveSkills.map((skill: ExtractedSkill) => (
              <SkillPill
                key={skill.id}
                skill={skill}
                selected={mustHaveSkills.includes(skill.id)}
                onClick={() => handleMustHaveToggle(skill.id)}
              />
            ))}
            {/* Custom must-have skills */}
            {mustHaveSkills
              .filter((id) => id.startsWith("custom_musthave_"))
              .map((customId) => (
                <CustomSkillPill
                  key={customId}
                  skillId={customId}
                  selected={true}
                  onClick={() => handleMustHaveToggle(customId)}
                  variant="mustHave"
                />
              ))}
          </div>
          <div className="mt-3">
            <CustomInputOption
              placeholder="e.g., Kubernetes, GraphQL, Team Leadership"
              onAdd={handleCustomMustHaveSkill}
            />
          </div>
        </div>

        {/* Good To Have Skills Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Good To Have
            </h4>
            <span className="text-xs text-zinc-400">
              ({goodToHaveSkills.length} confirmed)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {shuffledGoodToHaveSkills.map((skill: ExtractedSkill) => (
              <SkillPill
                key={skill.id}
                skill={skill}
                selected={goodToHaveSkills.includes(skill.id)}
                onClick={() => handleGoodToHaveToggle(skill.id)}
              />
            ))}
            {/* Custom good-to-have skills */}
            {goodToHaveSkills
              .filter((id) => id.startsWith("custom_goodtohave_"))
              .map((customId) => (
                <CustomSkillPill
                  key={customId}
                  skillId={customId}
                  selected={true}
                  onClick={() => handleGoodToHaveToggle(customId)}
                  variant="goodToHave"
                />
              ))}
          </div>
          <div className="mt-3">
            <CustomInputOption
              placeholder="e.g., AWS Certification, Public Speaking"
              onAdd={handleCustomGoodToHaveSkill}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
          <span
            className={`text-sm ${skillsValid ? "text-green-600" : "text-zinc-400"}`}
          >
            {mustHaveSkills.length + goodToHaveSkills.length} skills confirmed
            {skillsValid && <Icons.Check className="w-4 h-4 inline ml-1" />}
          </span>
          <FeedbackWidget
            sectionId="skills"
            existingFeedback={calibrationData.sectionFeedback?.find(
              (f) => f.sectionId === "skills"
            )}
            onFeedback={onFeedback}
          />
        </div>
      </div>

      {/* Section 2: What Matters Most in Candidates */}
      {pipelineCalibration && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                <Icons.Zap className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  What Matters Most in Candidates
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Select the qualities that matter most for this role
                </p>
              </div>
            </div>
            <InfoPopup title="Assessment Priorities">
              {SECTION_INFO.assessmentPriorities}
            </InfoPopup>
          </div>

          <div className="grid gap-3">
            {pipelineCalibration.assessmentPriorities.map((priority) => (
              <CheckboxItem
                key={priority.id}
                label={priority.label}
                hint={priority.hint}
                checked={(pipelineData?.assessmentPriorities || []).includes(
                  priority.id
                )}
                onChange={() => handleAssessmentPriorityToggle(priority.id)}
                icon={<Icons.Zap className="w-4 h-4" />}
                accentColor="blue"
              />
            ))}
            {/* Custom priorities */}
            {(pipelineData?.assessmentPriorities || [])
              .filter((id) => id.startsWith("custom_"))
              .map((customId) => (
                <CheckboxItem
                  key={customId}
                  label={customId.replace("custom_", "").replace(/_/g, " ")}
                  checked={true}
                  onChange={() => handleAssessmentPriorityToggle(customId)}
                  icon={<Icons.Zap className="w-4 h-4" />}
                  accentColor="blue"
                />
              ))}
            <CustomInputOption
              placeholder="e.g., Domain expertise in healthcare"
              onAdd={handleCustomAssessmentPriority}
            />
          </div>

          <div className="flex items-center justify-end mt-4 pt-4 border-t border-zinc-100">
            <FeedbackWidget
              sectionId="assessment_priorities"
              existingFeedback={calibrationData.sectionFeedback?.find(
                (f) => f.sectionId === "assessment_priorities"
              )}
              onFeedback={onFeedback}
            />
          </div>
        </div>
      )}

      {/* Section 3: Type of Challenges They'll Face */}
      {pipelineCalibration && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                <Icons.Puzzle className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  {"Type of Challenges They'll Face"}
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Select the primary problems this person will solve
                </p>
              </div>
            </div>
            <InfoPopup title="Problem Types">
              {SECTION_INFO.problemTypes}
            </InfoPopup>
          </div>

          <div className="grid gap-3">
            {pipelineCalibration.problemTypes.map((problemType) => (
              <CheckboxItem
                key={problemType.id}
                label={problemType.label}
                hint={problemType.hint}
                checked={(pipelineData?.problemTypes || []).includes(
                  problemType.id
                )}
                onChange={() => handleProblemTypeToggle(problemType.id)}
                icon={<Icons.Puzzle className="w-4 h-4" />}
                accentColor="purple"
              />
            ))}
            {/* Custom problem types */}
            {(pipelineData?.problemTypes || [])
              .filter((id) => id.startsWith("custom_"))
              .map((customId) => (
                <CheckboxItem
                  key={customId}
                  label={customId.replace("custom_", "").replace(/_/g, " ")}
                  checked={true}
                  onChange={() => handleProblemTypeToggle(customId)}
                  icon={<Icons.Puzzle className="w-4 h-4" />}
                  accentColor="purple"
                />
              ))}
            <CustomInputOption
              placeholder="e.g., Customer migration projects"
              onAdd={handleCustomProblemType}
            />
          </div>

          <div className="flex items-center justify-end mt-4 pt-4 border-t border-zinc-100">
            <FeedbackWidget
              sectionId="problem_types"
              existingFeedback={calibrationData.sectionFeedback?.find(
                (f) => f.sectionId === "problem_types"
              )}
              onFeedback={onFeedback}
            />
          </div>
        </div>
      )}
    </div>
  );
}
