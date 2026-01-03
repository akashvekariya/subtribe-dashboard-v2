// Evaluation Framework Types
// Generated from framework_creator.baml output structure
// IMPORTANT: All field names use snake_case to match BAML output

import { RoleFamily, RoleComplexity, SkillCategory } from "./index";

// Enums - must match BAML output exactly (PascalCase)
export type TradeoffDirection = "OptionA" | "OptionB" | "Balanced";
export type PreferenceStrength = "Strong" | "Slight" | "Neutral";
export type ConstraintSeverity = "Critical" | "Important" | "Minor";
export type ConstraintType = "Dealbreaker" | "RequiredDay1" | "AcceptableGap";
export type SuspiciousConcernType =
  | "InappropriateContent"
  | "PromptInjection"
  | "UnrealisticExpectation";
export type SuspiciousActionTaken = "Sanitized" | "Excluded" | "Flagged";
export type AssessmentMethod = "Resume" | "Interview" | "Both";

// 1. Framework Reasoning
export interface FrameworkReasoning {
  calibration_insights: string;
  weighting_rationale: string;
  matching_strategy: string;
}

// 2. Success Criteria
export interface TrajectoryExpectation {
  id: string;
  label: string;
  hint: string;
  resume_signals: string[];
  mismatch_signals: string[];
}

export interface SuccessCriteria {
  expected_trajectory: TrajectoryExpectation;
  day_60_milestones: string[];
  key_challenges: string[];
  autonomy_expectation: string;
  readiness_signals: string[];
}

// 3. Matching Guidance
export interface MatchingGuidance {
  matching_approach: string;
  top_priorities: string[];
  differentiator_signals: string[];
  mismatch_signals: string[];
  strong_mismatch_criteria: string[];
  borderline_guidance: string;
}

// 4. Skill Criteria
export interface WeightedSkill {
  skill_id: string;
  name: string;
  category: SkillCategory;
  weight_rationale: string;
  weight: number; // 1-5
  is_required: boolean;
  is_dealbreaker: boolean;
}

export interface CategoryWeight {
  category: SkillCategory;
  weight_rationale: string;
  weight: number; // 0.0-1.0
  top_skills: string[];
}

export interface SkillCriteria {
  skill_matching_guidance: string;
  skills: WeightedSkill[];
  category_weights: CategoryWeight[];
  total_required_skills: number;
  total_preferred_skills: number;
}

// 5. Tradeoff Preferences
export interface CandidateSignal {
  signal: string;
  strength: string; // 'strong' | 'moderate'
}

export interface TradeoffPreference {
  tradeoff_id: string;
  title: string;
  recruiter_selected_value: number; // 1-5
  preferred_direction: TradeoffDirection;
  strength: PreferenceStrength;
  option_a_label: string;
  option_b_label: string;
  option_a_signals: CandidateSignal[];
  option_b_signals: CandidateSignal[];
  alignment_importance: string; // 'high' | 'medium' | 'low'
}

// 6. Hard Constraints
export interface HardConstraint {
  constraint_type: ConstraintType;
  original_text: string;
  description: string;
  resume_check: string;
  severity: ConstraintSeverity;
  assessment_method: AssessmentMethod;
}

// 7. Dimension Weights
export interface DimensionWeight {
  dimension: string;
  weight_rationale: string;
  weight: number; // 0.0-1.0
  description: string;
  selected_signals: string[];
  unselected_signals: string[];
}

// 8. Role Context
export interface ExperienceRange {
  min?: number;
  max?: number;
}

export interface RoleContextOutput {
  role_family: RoleFamily;
  complexity: RoleComplexity;
  role_type: string;
  key_conflicts: string[];
  domain_keywords: string[];
  experience_range: ExperienceRange;
}

// 9. Suspicious Items
export interface SuspiciousItem {
  original_text: string;
  sanitized_text?: string | null;
  concern_type: SuspiciousConcernType;
  action_taken: SuspiciousActionTaken;
  section_found: string;
}

// Main Evaluation Framework
export interface EvaluationFramework {
  reasoning: FrameworkReasoning;
  success_criteria: SuccessCriteria;
  matching_guidance: MatchingGuidance;
  skill_criteria: SkillCriteria;
  tradeoff_preferences: TradeoffPreference[];
  hard_constraints: HardConstraint[];
  dimension_weights: DimensionWeight[];
  role_context: RoleContextOutput;
  suspicious_items: SuspiciousItem[];
}

// Post-processing types
export interface PostProcessingError {
  stage: string;
  message: string;
}

export interface PostProcessingWarning {
  stage: string;
  message: string;
}

export interface PostProcessingMetadata {
  [key: string]: unknown;
}

export interface PostProcessingResult {
  errors: PostProcessingError[];
  warnings: PostProcessingWarning[];
  requires_human_review: boolean;
  metadata: PostProcessingMetadata;
}

// API Response with post-processing
export interface FrameworkAPIResponse {
  framework: EvaluationFramework;
  post_processing: PostProcessingResult;
}
