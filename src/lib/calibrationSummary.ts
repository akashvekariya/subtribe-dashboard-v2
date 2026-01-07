import {
  BasicJobData,
  CalibrationData,
  CalibrationQuestionsPayload,
  RoleAnalysis,
  ExtractedSkill,
  TradeoffScenario,
  PriorityOption,
  SkillCategory,
} from "../types";
import {
  ROLE_OPEN_REASONS,
  AUTONOMY_LEVEL_OPTIONS,
} from "./calibration-constants";

// Types for the summary JSON
export interface SkillSummaryItem {
  id: string;
  name: string;
  category: string;
  selected: boolean;
  source: "llm" | "custom";
}

export interface TradeoffSummaryItem {
  id: string;
  title: string;
  description: string;
  optionA: { id: string; label: string; description: string };
  optionB: { id: string; label: string; description: string };
  value: number | null;
  answered: boolean;
  relevance: string;
  isRoleSpecific: boolean;
}

export interface PrioritySummaryItem {
  id: string;
  label: string;
  hint: string;
  selected: boolean;
  source: "llm" | "custom";
}

export interface RedFlagSummaryItem {
  value: string;
  selected: boolean;
  source: "llm" | "custom";
}

export interface ChallengeSummaryItem {
  value: string;
  selected: boolean;
  source: "llm" | "custom";
}

export interface MilestoneSummaryItem {
  value: string;
  selected: boolean;
  source: "llm" | "custom";
}

export interface TrajectorySummaryItem {
  id: string;
  label: string;
  hint: string;
  selected: boolean;
}

export interface CalibrationSummaryJSON {
  meta: {
    generatedAt: string;
    jobId: string;
  };
  basicJobInfo: {
    title: string;
    description: string;
    positionType: string;
    department?: string;
    locationType: string;
    experienceRange: { min?: number; max?: number };
  };
  roleAnalysis: RoleAnalysis;
  calibrationSummary: {
    skills: {
      mustHave: {
        instruction: string;
        items: SkillSummaryItem[];
        stats: { total: number; selected: number; custom: number };
      };
      goodToHave: {
        items: SkillSummaryItem[];
        stats: { total: number; selected: number; custom: number };
      };
    };
    assessmentPriorities: {
      items: PrioritySummaryItem[];
      stats: { total: number; selected: number; custom: number };
    };
    problemTypes: {
      items: PrioritySummaryItem[];
      stats: { total: number; selected: number; custom: number };
    };
    tradeoffs: {
      experience: {
        items: TradeoffSummaryItem[];
        stats: { total: number; answered: number };
      };
      roleSpecific: {
        instruction: string;
        items: TradeoffSummaryItem[];
        stats: { total: number; answered: number };
      };
    };
    redFlags: {
      rejectionBehaviors: {
        items: RedFlagSummaryItem[];
        stats: { total: number; selected: number; custom: number };
      };
      trainableGaps: {
        items: RedFlagSummaryItem[];
        stats: { total: number; selected: number; custom: number };
      };
      nonTrainableGaps: {
        items: RedFlagSummaryItem[];
        stats: { total: number; selected: number; custom: number };
      };
    };
    trajectory: {
      items: TrajectorySummaryItem[];
      selectedId: string | null;
    };
    challenges: {
      items: ChallengeSummaryItem[];
      stats: { total: number; selected: number; custom: number };
    };
    day60Milestones: {
      instruction: string;
      items: MilestoneSummaryItem[];
      stats: { total: number; selected: number; custom: number };
    };
    roleContext: {
      roleOpenReason: { id: string | null; label: string | null };
      autonomyLevel: { id: string | null; label: string | null };
    };
  };
}

/**
 * Generate a comprehensive summary JSON that shows both LLM suggestions
 * and user selections, with clear indication of what was selected vs not.
 */
export function generateCalibrationSummaryJSON(
  jobId: string,
  basicJobData: BasicJobData,
  roleAnalysis: RoleAnalysis,
  calibrationQuestions: CalibrationQuestionsPayload,
  calibrationData: CalibrationData
): CalibrationSummaryJSON {
  const {
    skillRealityCheck,
    experienceTradeoffs,
    roleSpecificTradeoffs,
    redFlags,
    pipelineCalibration,
    honestAssessment,
    day60Expectations,
  } = calibrationQuestions;

  // Helper to process skills
  const processSkills = (
    llmSkills: ExtractedSkill[],
    selectedIds: string[],
    customPrefix: string
  ): {
    items: SkillSummaryItem[];
    stats: { total: number; selected: number; custom: number };
  } => {
    const items: SkillSummaryItem[] = [];

    // Add LLM skills
    llmSkills.forEach((skill) => {
      items.push({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        selected: selectedIds.includes(skill.id),
        source: "llm",
      });
    });

    // Add custom skills with 'Custom' category
    const customSkillIds = selectedIds.filter((id) =>
      id.startsWith(customPrefix)
    );
    customSkillIds.forEach((customId) => {
      const name = customId.replace(customPrefix, "").replace(/_/g, " ");
      items.push({
        id: customId,
        name,
        category: "Custom" as SkillCategory,
        selected: true,
        source: "custom",
      });
    });

    const llmSelected = llmSkills.filter((s) =>
      selectedIds.includes(s.id)
    ).length;

    return {
      items,
      stats: {
        total: items.length,
        selected: llmSelected + customSkillIds.length,
        custom: customSkillIds.length,
      },
    };
  };

  // Helper to process priority options
  const processPriorityOptions = (
    llmOptions: PriorityOption[],
    selectedIds: string[]
  ): {
    items: PrioritySummaryItem[];
    stats: { total: number; selected: number; custom: number };
  } => {
    const items: PrioritySummaryItem[] = [];

    // Add LLM options
    llmOptions.forEach((opt) => {
      items.push({
        id: opt.id,
        label: opt.label,
        hint: opt.hint,
        selected: selectedIds.includes(opt.id),
        source: "llm",
      });
    });

    // Add custom options
    const customIds = selectedIds.filter((id) => id.startsWith("custom_"));
    customIds.forEach((customId) => {
      const label = customId.replace("custom_", "").replace(/_/g, " ");
      items.push({
        id: customId,
        label,
        hint: "User-added",
        selected: true,
        source: "custom",
      });
    });

    const llmSelected = llmOptions.filter((o) =>
      selectedIds.includes(o.id)
    ).length;

    return {
      items,
      stats: {
        total: items.length,
        selected: llmSelected + customIds.length,
        custom: customIds.length,
      },
    };
  };

  // Helper to process tradeoffs
  // Note: Internal values are 0-4, but UI displays 1-5, so we convert for output
  const processTradeoffs = (
    scenarios: TradeoffScenario[],
    values: Record<string, number>
  ): {
    items: TradeoffSummaryItem[];
    stats: { total: number; answered: number };
  } => {
    const items = scenarios.map((scenario) => {
      const rawValue = values[scenario.id];
      // Convert from internal 0-4 to display 1-5
      const displayValue = rawValue !== undefined ? rawValue + 1 : null;

      return {
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        optionA: {
          id: scenario.options[0]?.id || "",
          label: scenario.options[0]?.label || "",
          description: scenario.options[0]?.description || "",
        },
        optionB: {
          id: scenario.options[1]?.id || "",
          label: scenario.options[1]?.label || "",
          description: scenario.options[1]?.description || "",
        },
        value: displayValue,
        answered: rawValue !== undefined,
        relevance: scenario.relevance,
        isRoleSpecific: scenario.isRoleSpecific,
      };
    });

    return {
      items,
      stats: {
        total: items.length,
        answered: items.filter((i) => i.answered).length,
      },
    };
  };

  // Helper to process red flags (string arrays)
  const processRedFlags = (
    llmOptions: string[],
    selectedItems: string[]
  ): {
    items: RedFlagSummaryItem[];
    stats: { total: number; selected: number; custom: number };
  } => {
    const items: RedFlagSummaryItem[] = [];

    // Add LLM options
    llmOptions.forEach((opt) => {
      items.push({
        value: opt,
        selected: selectedItems.includes(opt),
        source: "llm",
      });
    });

    // Add custom options (items in selected that are not in llmOptions)
    const customItems = selectedItems.filter(
      (item) => !llmOptions.includes(item)
    );
    customItems.forEach((custom) => {
      items.push({
        value: custom,
        selected: true,
        source: "custom",
      });
    });

    const llmSelected = llmOptions.filter((o) =>
      selectedItems.includes(o)
    ).length;

    return {
      items,
      stats: {
        total: items.length,
        selected: llmSelected + customItems.length,
        custom: customItems.length,
      },
    };
  };

  // Helper to process challenges/milestones (string arrays)
  const processStringOptions = (
    llmOptions: string[],
    selectedItems: string[]
  ): {
    items: ChallengeSummaryItem[];
    stats: { total: number; selected: number; custom: number };
  } => {
    const items: ChallengeSummaryItem[] = [];

    // Add LLM options
    llmOptions.forEach((opt) => {
      items.push({
        value: opt,
        selected: selectedItems.includes(opt),
        source: "llm",
      });
    });

    // Add custom options
    const customItems = selectedItems.filter(
      (item) => !llmOptions.includes(item)
    );
    customItems.forEach((custom) => {
      items.push({
        value: custom,
        selected: true,
        source: "custom",
      });
    });

    const llmSelected = llmOptions.filter((o) =>
      selectedItems.includes(o)
    ).length;

    return {
      items,
      stats: {
        total: items.length,
        selected: llmSelected + customItems.length,
        custom: customItems.length,
      },
    };
  };

  // Process trajectory options
  const trajectoryItems: TrajectorySummaryItem[] =
    pipelineCalibration.trajectoryOptions.map((opt) => ({
      id: opt.id,
      label: opt.label,
      hint: opt.hint,
      selected: calibrationData.pipelineCalibration?.trajectory === opt.id,
    }));

  // Filter experience tradeoffs by relevance (High/Medium only, as shown in UI)
  const relevantExperienceTradeoffs = experienceTradeoffs.scenarios.filter(
    (s) => s.relevance === "High" || s.relevance === "Medium"
  );

  // Get role context labels
  const roleOpenReasonLabel =
    ROLE_OPEN_REASONS.find(
      (r) => r.id === calibrationData.roleContext?.roleOpenReason
    )?.label || null;

  const autonomyLevelLabel =
    AUTONOMY_LEVEL_OPTIONS.find(
      (a) => a.id === calibrationData.roleContext?.autonomyLevel
    )?.label || null;

  // Process tradeoffs and filter out unanswered ones
  const experienceTradeoffsProcessed = processTradeoffs(
    relevantExperienceTradeoffs,
    calibrationData.experienceTradeoffs
  );
  const roleSpecificTradeoffsProcessed = processTradeoffs(
    roleSpecificTradeoffs.scenarios,
    calibrationData.experienceTradeoffs
  );

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      jobId,
    },
    basicJobInfo: {
      title: basicJobData.title,
      description: basicJobData.description,
      positionType: basicJobData.positionType,
      department: basicJobData.department,
      locationType: basicJobData.locationType,
      experienceRange: {
        min: basicJobData.experienceRange.min,
        max: basicJobData.experienceRange.max,
      },
    },
    roleAnalysis,
    calibrationSummary: {
      skills: {
        mustHave: {
          instruction: skillRealityCheck.instruction,
          ...processSkills(
            skillRealityCheck.mustHaveSkills,
            calibrationData.mustHaveSkills,
            "custom_musthave_"
          ),
        },
        goodToHave: processSkills(
          skillRealityCheck.goodToHaveSkills,
          calibrationData.goodToHaveSkills,
          "custom_goodtohave_"
        ),
      },
      assessmentPriorities: processPriorityOptions(
        pipelineCalibration.assessmentPriorities,
        calibrationData.pipelineCalibration?.assessmentPriorities || []
      ),
      problemTypes: processPriorityOptions(
        pipelineCalibration.problemTypes,
        calibrationData.pipelineCalibration?.problemTypes || []
      ),
      tradeoffs: {
        experience: {
          items: experienceTradeoffsProcessed.items.filter(item => item.answered),
          stats: {
            total: experienceTradeoffsProcessed.stats.total,
            answered: experienceTradeoffsProcessed.stats.answered,
          },
        },
        roleSpecific: {
          instruction: roleSpecificTradeoffs.instruction,
          items: roleSpecificTradeoffsProcessed.items.filter(item => item.answered),
          stats: {
            total: roleSpecificTradeoffsProcessed.stats.total,
            answered: roleSpecificTradeoffsProcessed.stats.answered,
          },
        },
      },
      redFlags: {
        rejectionBehaviors: processRedFlags(
          redFlags.rejectionBehaviors,
          calibrationData.redFlags?.rejectionBehaviors || []
        ),
        trainableGaps: processRedFlags(
          redFlags.trainableGaps,
          calibrationData.redFlags?.trainableGaps || []
        ),
        nonTrainableGaps: processRedFlags(
          redFlags.nonTrainableGaps,
          calibrationData.redFlags?.nonTrainableGaps || []
        ),
      },
      trajectory: {
        items: trajectoryItems,
        selectedId: calibrationData.pipelineCalibration?.trajectory || "",
      },
      challenges: processStringOptions(
        honestAssessment.challengeOptions,
        calibrationData.honestAssessment?.challenges || []
      ),
      day60Milestones: {
        instruction: day60Expectations.instruction,
        ...processStringOptions(
          day60Expectations.milestones,
          calibrationData.day60Expectations || []
        ),
      },
      roleContext: {
        roleOpenReason: {
          id: calibrationData.roleContext?.roleOpenReason || "",
          label: roleOpenReasonLabel || "",
        },
        autonomyLevel: {
          id: calibrationData.roleContext?.autonomyLevel || "",
          label: autonomyLevelLabel || "",
        },
      },
    },
  };
}
