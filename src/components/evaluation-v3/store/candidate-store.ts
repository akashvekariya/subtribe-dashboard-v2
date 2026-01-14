// Zustand store for candidate data with LRU caching
// Keeps RAM usage low by caching max 7 candidates

import { create } from "zustand";
import { LRUCache } from "./lru-cache";
import type {
  CandidateData,
  CandidateOverview,
  CandidateEvaluation,
  LoadingState,
  Tier,
} from "./types";
import type { CategoryScore } from "../ScoreRing";
import type { Constraint } from "../ConstraintAccordion";
import type { QuickStats, PersonalInfo } from "../ScoreSummaryPanel";

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

// Transform raw API data to component-ready format
function transformToCategories(
  evaluation: CandidateEvaluation
): CategoryScore[] {
  const { dimension_scores, dimension_weights } = evaluation.scores;

  return Object.entries(dimension_scores).map(([key, score]) => ({
    id: key,
    name: dimensionNames[key] || key,
    weight: Math.round((dimension_weights[key] || 0) * 100),
    score: score,
    maxScore: 10,
    color: dimensionColors[key] || "emerald",
  }));
}

function transformToConstraints(evaluation: CandidateEvaluation): Constraint[] {
  return evaluation.evaluation.constraint_results.map((c, i) => ({
    id: String(i + 1),
    question: c.constraint_text,
    answer: c.evidence,
    eligible:
      c.status === "pass" ? true : c.status === "fail" ? false : "review",
  }));
}

function computeStats(evaluation: CandidateEvaluation): QuickStats {
  const { skill_analysis, constraint_analysis } = evaluation.analysis;
  const { red_flags } = evaluation;

  return {
    skillsMatched: skill_analysis.matched_count,
    skillsTotal: skill_analysis.total_skills,
    constraintsPassed: constraint_analysis.passed_count,
    constraintsReview: constraint_analysis.deferred_count,
    constraintsTotal: constraint_analysis.total_assessed,
    redFlagsCount: red_flags.summary.total_flags,
    redFlagsSeverity:
      red_flags.summary.total_flags > 0
        ? `${red_flags.summary.by_severity.investigate || 0} investigate`
        : undefined,
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
  fetchCandidate: (
    id: string,
    overviewUrl: string,
    evaluationUrl: string
  ) => Promise<void>;
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
  fetchCandidate: async (
    id: string,
    overviewUrl: string,
    evaluationUrl: string
  ) => {
    // Check cache first
    const cached = cache.get(id);
    if (cached) {
      set({ currentCandidateId: id, loadingState: "success", error: null });
      return;
    }

    // Fetch from backend
    set({ loadingState: "loading", error: null });

    try {
      const [overviewRes, evaluationRes] = await Promise.all([
        fetch(overviewUrl),
        fetch(evaluationUrl),
      ]);

      if (!overviewRes.ok || !evaluationRes.ok) {
        throw new Error("Failed to fetch candidate data");
      }

      const overview: CandidateOverview = await overviewRes.json();
      const evaluation: CandidateEvaluation = await evaluationRes.json();

      // Transform and cache
      const candidateData: CandidateData = {
        id,
        overview,
        evaluation,
        computed: {
          categories: transformToCategories(evaluation),
          constraints: transformToConstraints(evaluation),
          stats: computeStats(evaluation),
          personalInfo: overview.personal_info,
        },
        fetchedAt: Date.now(),
      };

      cache.set(id, candidateData);
      set({ currentCandidateId: id, loadingState: "success", error: null });
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
