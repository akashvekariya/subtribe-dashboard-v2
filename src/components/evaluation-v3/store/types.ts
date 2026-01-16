// Candidate evaluation data types
// These mirror the JSON structure from the backend

import type {
  CategoryScore,
  Constraint,
  RedFlag,
  SkillMatch,
  MissingSkill,
  PersonalInfo,
  QuickStats,
  Tier,
  InterviewQuestion,
} from "../types";

// Re-export Tier for convenience
export type { Tier };

export interface CandidateOverview {
  personal_info: PersonalInfo;
  professional_summary?: string;
  skills: {
    soft: string[];
    technical: string[];
  };
}

export interface CandidateEvaluation {
  scores: {
    final_score: number;
    tier: Tier;
    is_flagged: boolean;
    is_dealbreaker: boolean;
    can_proceed: boolean;
    verification_confidence: "high" | "medium" | "low";
  };
  red_flags: {
    flags: RedFlag[];
    summary: {
      total_flags: number;
      by_severity: Record<string, number>;
    };
  };
  skills: {
    matches: SkillMatch[];
    missing: MissingSkill[];
  };
  summary: {
    strengths: string[];
    concerns: string[];
    interview_questions: InterviewQuestion[];
  };
}

// Combined candidate data for UI
export interface CandidateData {
  id: string;
  overview: CandidateOverview;
  evaluation: CandidateEvaluation;
  // Pre-computed for components
  computed: {
    categories: CategoryScore[];
    constraints: Constraint[];
    stats: QuickStats;
    personalInfo: PersonalInfo;
    interviewQuestions: InterviewQuestion[];
    strengths: string[];
    concerns: string[];
  };
  fetchedAt: number;
}

// Loading states
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface CandidateState {
  currentCandidateId: string | null;
  loadingState: LoadingState;
  error: string | null;
}
