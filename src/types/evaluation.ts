/**
 * TypeScript interfaces for AI Resume Evaluation data
 * Maps to backend evaluation_json structure from subtribe_ai
 */

// ============================================================================
// Core Enums
// ============================================================================

export type EvaluationTier =
  | "strong_match"
  | "good_match"
  | "moderate_match"
  | "weak_match"
  | "mismatch"
  | "strong_match_blocked"
  | "good_match_blocked"
  | "moderate_match_blocked"
  | "weak_match_blocked"
  | "mismatch_blocked"
  | "strong_match_flagged"
  | "good_match_flagged"
  | "moderate_match_flagged"
  | "weak_match_flagged"
  | "mismatch_flagged";

export type VerificationConfidence = "high" | "medium" | "low";

export type EvidenceQuality =
  | "strong_evidence"
  | "weak_evidence"
  | "keyword_only";

export type SkillDepth = "strong" | "moderate" | "basic" | "unclear";

export type ConstraintStatus = "pass" | "fail" | "deferred";

export type RedFlagSeverity = "info" | "investigate" | "concern";

export type RedFlagType =
  | "short_tenure"
  | "employment_gap"
  | "title_experience_mismatch"
  | "vague_contributions"
  | "unverifiable_claims";

export type DimensionLevel = "strong" | "good" | "moderate" | "weak" | "poor";

export type CandidateDirection =
  | "option_a"
  | "option_b"
  | "balanced"
  | "unclear";

export type ExperienceType =
  | "full_time"
  | "internship"
  | "contract"
  | "freelance"
  | "part_time"
  | "research"
  | "teaching"
  | "founder"
  | "volunteer"
  | "other";

// ============================================================================
// Dimension Scores
// ============================================================================

export interface DimensionScores {
  technical_fit: number;
  experience_fit: number;
  trajectory_fit: number;
  culture_fit: number;
  problem_solving_fit: number;
}

// ============================================================================
// Scores Section
// ============================================================================

export interface EvaluationScores {
  final_score: number;
  tier: EvaluationTier;
  dimension_scores: DimensionScores;
  verification_confidence: VerificationConfidence;
}

// ============================================================================
// Red Flags
// ============================================================================

export interface RedFlag {
  flag_type: RedFlagType;
  severity: RedFlagSeverity;
  details: string;
  context: string | null;
  interview_probe: string;
}

export interface RedFlagsSummary {
  total_flags: number;
  by_severity: {
    info: number;
    investigate: number;
    concern: number;
  };
  by_type: Record<string, number>;
  verification_confidence: VerificationConfidence;
  summary: string;
}

export interface RedFlagsSection {
  flags: RedFlag[];
  summary: RedFlagsSummary;
}

// ============================================================================
// Blockers
// ============================================================================

export interface Blocker {
  type: "dealbreaker_skill" | "dealbreaker_constraint" | "manipulation_attempt";
  skill_id?: string;
  description?: string;
  evidence?: string;
  reason?: string;
  details?: string;
}

// ============================================================================
// Skill Analysis
// ============================================================================

export interface SkillMatch {
  skill_id: string;
  source_reference: string;
  evidence: string;
  evidence_quality: EvidenceQuality;
  depth: SkillDepth;
  _reconciled?: boolean;
}

export interface SkillAnalysis {
  technical_fit_score: number;
  skill_coverage: number;
  category_scores: Record<string, number>;
  dealbreaker_failures: string[];
  matched_count: number;
  total_skills: number;
}

// ============================================================================
// Constraint Analysis
// ============================================================================

export interface ConstraintResult {
  constraint_idx: number;
  evidence: string;
  status: ConstraintStatus;
}

export interface FailedConstraint {
  idx: number;
  type: string;
  description: string;
  evidence: string;
  severity: string;
}

export interface ConstraintAnalysis {
  penalty_factor: number;
  has_dealbreaker_failure: boolean;
  failed_constraints: FailedConstraint[];
  passed_count: number;
  deferred_count: number;
  total_assessed: number;
}

// ============================================================================
// Tradeoff Analysis
// ============================================================================

export interface TradeoffAlignment {
  tradeoff_id: string;
  candidate_direction: CandidateDirection;
  recruiter_direction: string;
  aligned: boolean;
  alignment_score: number;
}

export interface TradeoffSignal {
  tradeoff_id: string;
  evidence: string;
  direction: CandidateDirection;
}

export interface TradeoffAnalysis {
  alignment_score: number;
  alignments: TradeoffAlignment[];
  aligned_count: number;
  misaligned_count: number;
  total_tradeoffs: number;
}

// ============================================================================
// Experience
// ============================================================================

export interface ExperienceEntry {
  company: string;
  title: string;
  experience_type: ExperienceType | string;
  start_date: string;
  end_date: string;
  duration_months: number;
  is_current: boolean;
  key_contributions: string[];
  skills_demonstrated: string[];
}

export interface ExperienceSummary {
  total_months: number;
  total_years: number;
  by_type: Record<string, { count: number; months: number }>;
  entries_count: number;
  has_current_role: boolean;
}

// ============================================================================
// Dimension Assessments
// ============================================================================

export interface DimensionAssessment {
  dimension: string;
  reasoning: string;
  raw_level: DimensionLevel;
  positive_signals: string[];
  negative_signals: string[];
}

// ============================================================================
// Interview Questions
// ============================================================================

export interface InterviewQuestion {
  resume_reference: string;
  gap_addressed: string;
  question: string;
}

// ============================================================================
// Evaluation Summary
// ============================================================================

export interface EvaluationSummary {
  strengths: string[];
  concerns: string[];
  interview_questions: InterviewQuestion[];
}

// ============================================================================
// Manipulation Check
// ============================================================================

export interface ManipulationCheck {
  detected: boolean;
  details: string | null;
}

// ============================================================================
// Evidence Quality Summary
// ============================================================================

export interface EvidenceQualitySummary {
  counts: {
    strong_evidence: number;
    weak_evidence: number;
    keyword_only: number;
  };
  total_skills_matched: number;
  keyword_only_ratio: number;
  keyword_stuffing_flag: boolean;
}

// ============================================================================
// Analysis Section
// ============================================================================

export interface EvaluationAnalysis {
  skill_analysis: SkillAnalysis;
  constraint_analysis: ConstraintAnalysis;
  tradeoff_analysis: TradeoffAnalysis;
  experience_summary: ExperienceSummary;
  evidence_quality?: EvidenceQualitySummary;
}

// ============================================================================
// Evaluation Section (Raw LLM Output)
// ============================================================================

export interface EvaluationDetails {
  experience_entries: ExperienceEntry[];
  skill_matches: SkillMatch[];
  constraint_results: ConstraintResult[];
  tradeoff_signals?: TradeoffSignal[];
  dimension_assessments: DimensionAssessment[];
  summary: EvaluationSummary;
}

// ============================================================================
// Computed Facts
// ============================================================================

export interface ComputedFacts {
  experience: {
    total_years: number;
    by_type?: Record<string, number>;
  };
}

// ============================================================================
// Metadata
// ============================================================================

export interface EvaluationMetadata {
  dimension_weights_used: Record<string, number>;
  penalty_applied: number;
  enum_normalization?: { normalized_count: number };
  manipulation_penalty_applied?: boolean;
  skill_reconciliation?: {
    added_count: number;
    skills_added: string[];
    total_demonstrated: number;
    total_matched_after: number;
  };
}

// ============================================================================
// Warning
// ============================================================================

export interface EvaluationWarning {
  type: string;
  severity: "info" | "medium" | "critical";
  message: string;
  skills_added?: string[];
}

// ============================================================================
// Complete Evaluation JSON Structure
// ============================================================================

export interface EvaluationJSON {
  scores: EvaluationScores;
  manipulation_check: ManipulationCheck;
  red_flags: RedFlagsSection;
  blockers: Blocker[];
  can_proceed: boolean;
  analysis: EvaluationAnalysis;
  evaluation: EvaluationDetails;
  computed_facts: ComputedFacts;
  metadata?: EvaluationMetadata;
  warnings?: EvaluationWarning[];
  timing?: {
    phase1_seconds: number;
    phase2_seconds: number;
    total_seconds: number;
  };
}

// ============================================================================
// UI Display Types (Transformed for Frontend)
// ============================================================================

export interface RadarChartData {
  focus: string;
  score: number;
  dimension: keyof DimensionScores;
}

export interface TechStackItem {
  id: string;
  name: string;
  icon: string;
  status: "present" | "uncertain" | "missing";
  evidence?: SkillMatch;
}

export interface ExperienceTimelineData {
  totalYears: number;
  requiredMin?: number;
  requiredMax?: number;
  entries: ExperienceEntry[];
  hasCurrentRole: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface EvaluationContainerProps {
  evaluationJson: EvaluationJSON | null;
  jobFramework?: Record<string, unknown> | null;
  isLoading?: boolean;
}

export interface ScoreHeaderProps {
  finalScore: number;
  tier: EvaluationTier;
  verificationConfidence: VerificationConfidence;
  canProceed: boolean;
  blockers: Blocker[];
}

export interface VerificationBadgeProps {
  confidence: VerificationConfidence;
  redFlagsSummary?: RedFlagsSummary;
}

export interface SkillsGridProps {
  skillMatches: SkillMatch[];
  frameworkSkills?: Array<{
    skill_id: string;
    name: string;
    is_required: boolean;
    is_dealbreaker: boolean;
  }>;
  skillAnalysis: SkillAnalysis;
}

export interface RequirementsChecklistProps {
  constraintResults: ConstraintResult[];
  frameworkConstraints?: Array<{
    constraint_type: string;
    description: string;
    severity: string;
  }>;
  constraintAnalysis: ConstraintAnalysis;
}

export interface ExperienceTimelineProps {
  entries: ExperienceEntry[];
  summary: ExperienceSummary;
  requiredMin?: number;
  requiredMax?: number;
}

export interface RedFlagsSectionProps {
  flags: RedFlag[];
  summary: RedFlagsSummary;
}

export interface DimensionRadarChartProps {
  dimensionScores: DimensionScores;
  dimensionAssessments: DimensionAssessment[];
}

export interface AssessmentSummaryProps {
  strengths: string[];
  concerns: string[];
  interviewQuestions: InterviewQuestion[];
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getTierLabel(tier: EvaluationTier): string {
  const baseTier = tier.replace(/_blocked$/, "").replace(/_flagged$/, "");
  const labels: Record<string, string> = {
    strong_match: "Strong Match",
    good_match: "Good Match",
    moderate_match: "Moderate Match",
    weak_match: "Weak Match",
    mismatch: "Mismatch",
  };
  return labels[baseTier] || tier;
}

export function getTierColor(tier: EvaluationTier): string {
  const baseTier = tier.replace(/_blocked$/, "").replace(/_flagged$/, "");
  const colors: Record<string, string> = {
    strong_match: "bg-emerald-100 text-emerald-800 border-emerald-200",
    good_match: "bg-blue-100 text-blue-800 border-blue-200",
    moderate_match: "bg-amber-100 text-amber-800 border-amber-200",
    weak_match: "bg-orange-100 text-orange-800 border-orange-200",
    mismatch: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[baseTier] || "bg-gray-100 text-gray-800 border-gray-200";
}

export function getConfidenceColor(confidence: VerificationConfidence): string {
  const colors: Record<VerificationConfidence, string> = {
    high: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-red-50 text-red-700 border-red-200",
  };
  return colors[confidence];
}

export function getSeverityColor(severity: RedFlagSeverity): string {
  const colors: Record<RedFlagSeverity, string> = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    investigate: "bg-amber-50 text-amber-700 border-amber-200",
    concern: "bg-red-50 text-red-700 border-red-200",
  };
  return colors[severity];
}

export function getConstraintStatusColor(status: ConstraintStatus): string {
  const colors: Record<ConstraintStatus, string> = {
    pass: "border-l-green-500 bg-green-50/50",
    fail: "border-l-red-500 bg-red-50/50",
    deferred: "border-l-amber-500 bg-amber-50/50",
  };
  return colors[status];
}

export function getDepthPercentage(depth: SkillDepth): number {
  const percentages: Record<SkillDepth, number> = {
    strong: 100,
    moderate: 70,
    basic: 40,
    unclear: 20,
  };
  return percentages[depth];
}

export function getEvidenceQualityPercentage(quality: EvidenceQuality): number {
  const percentages: Record<EvidenceQuality, number> = {
    strong_evidence: 100,
    weak_evidence: 60,
    keyword_only: 25,
  };
  return percentages[quality];
}

export function formatDimensionName(dimension: string): string {
  const names: Record<string, string> = {
    technical_fit: "Technical Fit",
    experience_fit: "Experience",
    trajectory_fit: "Growth Trajectory",
    culture_fit: "Culture Fit",
    problem_solving_fit: "Problem Solving",
  };
  return (
    names[dimension] ||
    dimension.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function isBlockedTier(tier: EvaluationTier): boolean {
  return tier.endsWith("_blocked");
}

export function isFlaggedTier(tier: EvaluationTier): boolean {
  return tier.endsWith("_flagged");
}
