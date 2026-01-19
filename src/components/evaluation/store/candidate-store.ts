// Zustand store for candidate data with LRU caching
// Keeps RAM usage low by caching max 7 candidates

import { create } from "zustand";
import { LRUCache } from "./lru-cache";
import type {
  CandidateData,
  CandidateOverview,
  CandidateEvaluation,
  LoadingState,
} from "./types";
import type {
  CategoryScore,
  DimensionDetail,
  InterviewQuestion,
  SignalStrength,
  SkillMatch,
  RedFlag,
  Tradeoff,
} from "../types";
import type { Constraint } from "../ConstraintAccordion";
import type { QuickStats } from "../ScoreSummaryPanel";
import {
  api,
  type ApplicationEvaluationData,
  type ApplicationEvaluationMeta,
} from "@/lib/api-client";
import { mapBackendTierToUI } from "../utils";

// LRU Cache instance (max 7 candidates)
const cache = new LRUCache<CandidateData>(7);

// Dimension color mapping
const dimensionColors: Record<string, string> = {
  technical_fit: "emerald",
  problem_solving_fit: "orange",
  experience_fit: "blue",
  trajectory_fit: "violet",
  culture_fit: "red",
};

const dimensionNames: Record<string, string> = {
  technical_fit: "Technical Fit",
  problem_solving_fit: "Problem Solving",
  experience_fit: "Experience Fit",
  trajectory_fit: "Trajectory Fit",
  culture_fit: "Culture Fit",
};

// Map backend signal strength to frontend SignalStrength type
function mapSignalStrength(backendSignal: string): SignalStrength {
  const signalMap: Record<string, SignalStrength> = {
    strong: "strong",
    demonstrated: "strong",
    academic: "academic",
    contextual: "moderate",
    listed: "listed",
    missing: "missing",
  };
  return signalMap[backendSignal] || "listed";
}

// Transform dimensions from API to component-ready CategoryScore format
// Sort by weight descending so largest segment starts at 12 o'clock
function transformToCategories(
  dimensions: ApplicationEvaluationData["dimensions"]
): CategoryScore[] {
  return Object.entries(dimensions)
    .map(([key, dim]) => ({
      id: key,
      name: dim.label || dimensionNames[key] || key,
      weight: Math.round(dim.weight * 100),
      score: dim.score,
      maxScore: 10,
      color: dimensionColors[key] || "emerald",
    }))
    .sort((a, b) => b.weight - a.weight); // Largest weight first
}

// Transform dimensions from API to full DimensionDetail format for modal
// Sort by weight descending to match categories order
function transformToDimensions(
  dimensions: ApplicationEvaluationData["dimensions"]
): DimensionDetail[] {
  return Object.entries(dimensions)
    .map(([key, dim]) => ({
      id: key,
      label: dim.label || dimensionNames[key] || key,
      score: dim.score,
      weight: Math.round(dim.weight * 100),
      level: dim.level,
      reasoning: dim.reasoning,
      // Backend may omit these arrays when empty, so default to []
      positive_signals: dim.positive_signals ?? [],
      negative_signals: dim.negative_signals ?? [],
      color: dimensionColors[key] || "emerald",
    }))
    .sort((a, b) => b.weight - a.weight); // Largest weight first
}

function transformToConstraints(
  constraintResults: ApplicationEvaluationData["constraints"]["results"]
): Constraint[] {
  return constraintResults.map((c, i) => ({
    id: String(i + 1),
    question: c.constraint_text,
    answer: c.evidence,
    eligible:
      c.status === "pass" ? true : c.status === "fail" ? false : "review",
  }));
}

function computeStats(data: ApplicationEvaluationData): QuickStats {
  const { skills, constraints, red_flags } = data;

  return {
    skillsMatched: skills.summary.matched,
    skillsTotal: skills.summary.total,
    constraintsPassed: constraints.summary.passed,
    constraintsReview: constraints.summary.deferred,
    constraintsTotal: constraints.summary.total,
    redFlagsCount: red_flags.summary.total_flags,
    redFlagsSeverity:
      red_flags.summary.total_flags > 0
        ? `${red_flags.summary.by_severity.investigate || 0} investigate`
        : undefined,
  };
}

// Transform backend skill matches to frontend format
function transformSkillMatches(
  backendSkills: ApplicationEvaluationData["skills"]["matches"]
): SkillMatch[] {
  return backendSkills.map((skill) => ({
    skill_name: skill.skill_name,
    signal_strength: mapSignalStrength(skill.signal_strength),
    source_type: skill.source_type,
    source_reference: skill.source_reference || "",
    evidence: skill.evidence || "No evidence provided",
    is_dealbreaker: skill.is_dealbreaker ?? false,
  }));
}

// Transform backend red flags to frontend format
function transformRedFlags(
  backendFlags: ApplicationEvaluationData["red_flags"]["flags"]
): RedFlag[] {
  return backendFlags.map((flag, i) => ({
    id: String(i + 1),
    flag_type: flag.flag_type,
    severity: flag.severity,
    details: flag.details,
    context: flag.context || undefined,
    interview_probe: flag.interview_probe,
  }));
}

// Parse tradeoff title into option_a and option_b (format: "Option A vs. Option B")
function parseTradeoffTitle(title: string): {
  optionA: string;
  optionB: string;
} {
  const parts = title.split(" vs. ");
  if (parts.length === 2) {
    return { optionA: parts[0].trim(), optionB: parts[1].trim() };
  }
  // Fallback if format is different
  return { optionA: title, optionB: "" };
}

// Transform backend tradeoffs to frontend format
function transformTradeoffs(
  backendTradeoffs: ApplicationEvaluationData["tradeoffs"]["signals"]
): Tradeoff[] {
  return backendTradeoffs.map((t, i) => {
    const { optionA, optionB } = parseTradeoffTitle(t.tradeoff_title);
    return {
      id: String(i + 1),
      title: t.tradeoff_title,
      optionA,
      optionB,
      direction: t.direction,
      evidence: t.evidence,
    };
  });
}

// Transform backend interview questions to frontend format
function transformInterviewQuestions(
  backendQuestions: ApplicationEvaluationData["summary"]["interview_questions"]
): InterviewQuestion[] {
  return backendQuestions.map((q, i) => ({
    id: String(i + 1),
    question: q.question,
    gap_addressed: q.gap_addressed,
    resume_reference: q.resume_reference,
  }));
}

// Transform full backend response to internal CandidateEvaluation format
function transformBackendToEvaluation(
  data: ApplicationEvaluationData
): CandidateEvaluation {
  const tier = mapBackendTierToUI(data.scores.tier);

  return {
    scores: {
      final_score: data.scores.final_score,
      tier,
      is_flagged: data.scores.is_flagged,
      is_dealbreaker: data.scores.is_dealbreaker,
      can_proceed: data.scores.can_proceed,
      verification_confidence: data.scores.verification_confidence,
    },
    red_flags: {
      flags: transformRedFlags(data.red_flags.flags),
      summary: {
        total_flags: data.red_flags.summary.total_flags,
        by_severity: data.red_flags.summary.by_severity,
      },
    },
    skills: {
      matches: transformSkillMatches(data.skills.matches),
      missing: data.skills.missing,
    },
    summary: {
      strengths: data.summary.strengths,
      concerns: data.summary.concerns,
      interview_questions: transformInterviewQuestions(
        data.summary.interview_questions
      ),
    },
  };
}

// Create mock overview since we don't have the endpoint yet
// TODO: Remove when overview endpoint is implemented
function createMockOverview(
  meta: ApplicationEvaluationMeta
): CandidateOverview {
  return {
    personal_info: {
      full_name: meta.candidate_name,
      // Mock data - these fields should come from real API later
      email: "MOCK_EMAIL_NOT_FROM_API",
      phone: "MOCK_PHONE_NOT_FROM_API",
      location: "MOCK_LOCATION_NOT_FROM_API",
    },
    professional_summary: undefined,
    skills: {
      soft: [],
      technical: [],
    },
  };
}

// Store interface
interface CandidateStore {
  // State
  currentCandidateId: string | null;
  loadingState: LoadingState;
  error: string | null;

  // Actions
  setCurrentCandidate: (id: string) => void;
  fetchCandidate: (applicationId: string) => Promise<void>;
  getCachedCandidate: (id: string) => CandidateData | undefined;
  clearCache: () => void;

  // Selectors (computed from cache)
  getCurrentCandidate: () => CandidateData | undefined;
  getCacheSize: () => number;
  getCachedIds: () => string[];
}

export const useCandidateStore = create<CandidateStore>((set, get) => ({
  // Initial state
  currentCandidateId: null,
  loadingState: "idle",
  error: null,

  // Set current candidate (triggers UI update)
  setCurrentCandidate: (id: string) => {
    set({ currentCandidateId: id });
  },

  // Fetch candidate data (checks cache first)
  fetchCandidate: async (applicationId: string) => {
    // Check cache first
    const cached = cache.get(applicationId);
    if (cached) {
      set({
        currentCandidateId: applicationId,
        loadingState: "success",
        error: null,
      });
      return;
    }

    // Fetch from backend
    set({
      loadingState: "loading",
      error: null,
      currentCandidateId: applicationId,
    });

    try {
      // Fetch evaluation data from API
      const response =
        await api.aiResumeEval.getApplicationEvaluation(applicationId);

      // Handle case where evaluation is not yet available
      if (!response.data) {
        throw new Error(
          `Evaluation not available. Status: ${response.meta.status}`
        );
      }

      // Get API data for transformations
      const apiData = response.data;

      // Transform backend response to internal format
      const evaluation = transformBackendToEvaluation(apiData);

      // Create mock overview (until overview endpoint is ready)
      const overview = createMockOverview(response.meta);

      // Build candidate data with computed values
      // Pass API data directly to transform functions for accurate mapping
      const candidateData: CandidateData = {
        id: applicationId,
        overview,
        evaluation,
        computed: {
          categories: transformToCategories(apiData.dimensions),
          dimensions: transformToDimensions(apiData.dimensions),
          constraints: transformToConstraints(apiData.constraints.results),
          stats: computeStats(apiData),
          personalInfo: overview.personal_info,
          interviewQuestions: evaluation.summary.interview_questions,
          strengths: evaluation.summary.strengths,
          concerns: evaluation.summary.concerns,
          tradeoffs: transformTradeoffs(apiData.tradeoffs?.signals ?? []),
          tradeoffsSummary: apiData.tradeoffs?.summary ?? {
            total: 0,
            aligned: 0,
            misaligned: 0,
          },
          manipulationCheck: {
            detected: apiData.manipulation_check?.detected ?? false,
            details: apiData.manipulation_check?.details ?? null,
          },
        },
        fetchedAt: Date.now(),
      };

      cache.set(applicationId, candidateData);
      set({
        currentCandidateId: applicationId,
        loadingState: "success",
        error: null,
      });
    } catch (err) {
      set({
        loadingState: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  // Get cached candidate without fetching
  getCachedCandidate: (id: string) => cache.get(id),

  // Clear entire cache
  clearCache: () => {
    cache.clear();
    set({ loadingState: "idle", currentCandidateId: null });
  },

  // Get current candidate data
  getCurrentCandidate: () => {
    const { currentCandidateId } = get();
    if (!currentCandidateId) return undefined;
    return cache.get(currentCandidateId);
  },

  // Cache stats
  getCacheSize: () => cache.size,
  getCachedIds: () => cache.keys(),
}));

// Convenience hooks for components
export const useCurrentCandidate = () => {
  const store = useCandidateStore();
  return store.getCurrentCandidate();
};

export const useLoadingState = () =>
  useCandidateStore((state) => state.loadingState);
export const useError = () => useCandidateStore((state) => state.error);
