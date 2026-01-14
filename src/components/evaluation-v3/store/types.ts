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
} from '../types';

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
    dimension_scores: Record<string, number>;
    dimension_weights: Record<string, number>;
  };
  red_flags: {
    flags: RedFlag[];
    summary: {
      total_flags: number;
      by_severity: Record<string, number>;
    };
  };
  analysis: {
    skill_analysis: {
      matched_count: number;
      total_skills: number;
      missing_skills: MissingSkill[];
    };
    constraint_analysis: {
      passed_count: number;
      deferred_count: number;
      total_assessed: number;
    };
  };
  evaluation: {
    skill_matches: SkillMatch[];
    constraint_results: Array<{
      evidence: string;
      status: 'pass' | 'fail' | 'deferred';
      constraint_text: string;
    }>;
    summary: {
      strengths: string[];
      concerns: string[];
    };
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
  };
  fetchedAt: number;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface CandidateState {
  currentCandidateId: string | null;
  loadingState: LoadingState;
  error: string | null;
}
