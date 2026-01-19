/**
 * API-specific Type Definitions
 * Types used by various API endpoints
 */

import { Company } from "@/types";

// ============================================================================
// Auth Types
// ============================================================================

export interface ClaimInviteResponse {
  success: boolean;
  invite_type: "org_creator" | "team_member";
  company: Company | null; // Only for team_member invites
  redirect_to: string; // '/onboarding' or '/'
  message?: string;
  access_token: string; // New JWT with updated company_id
}

// ============================================================================
// Company / Onboarding Types
// ============================================================================

export interface OnboardingRequest {
  name: string;
  slug: string;
  logo_url?: string;
  tagline?: string;
  about?: string;
}

export interface OnboardingResponse {
  success: boolean;
  company: Company;
  message: string;
  access_token?: string; // New JWT with updated company_id
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_more: boolean;
  };
}

// ============================================================================
// Resume Display Types (from /applications/{id}/resume endpoint)
// ============================================================================

export interface ResumeOtherLink {
  url: string;
  label: string | null;
}

export interface ResumePersonalInfo {
  full_name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  other_links: ResumeOtherLink[];
}

export interface ResumeExperienceSummary {
  total_months: number;
  by_category: Record<string, number>;
  has_overlaps: boolean;
  has_significant_gaps: boolean;
}

export interface ResumeExperienceEntry {
  title: string;
  company: string;
  location: string | null;
  category: string | null;
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
  duration_months: number | null;
  content: string[];
  skills: string[];
}

export interface ResumeExperience {
  summary: ResumeExperienceSummary;
  entries: ResumeExperienceEntry[];
}

export interface ResumeEducationSummary {
  highest_level: string | null;
  months_since_graduation: number | null;
}

export interface ResumeEducationEntry {
  degree: string;
  institution: string;
  field_of_study: string | null;
  level: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  score_value: string | null;
  relevant_coursework: string[];
}

export interface ResumeEducation {
  summary: ResumeEducationSummary;
  entries: ResumeEducationEntry[];
}

export interface ResumeProjectEntry {
  name: string;
  category: string | null;
  content: string[];
  skills: string[];
  start_date: string | null;
  end_date: string | null;
  source_url: string | null;
  live_url: string | null;
}

export interface ResumeProjects {
  entries: ResumeProjectEntry[];
}

export interface ResumeSkills {
  technical: string[];
  soft: string[];
  languages: string[];
}

export interface ResumeCertification {
  name: string;
  issuer: string | null;
  date: string | null;
}

export interface ResumeDisplayData {
  personal_info: ResumePersonalInfo;
  professional_summary: string | string[] | null;
  skills: ResumeSkills;
  experience: ResumeExperience;
  education: ResumeEducation;
  projects: ResumeProjects;
  certifications: ResumeCertification[];
}

export interface ResumeDisplayMeta {
  application_id: string;
  candidate_name: string;
  job_id: string;
  job_title: string;
  resume_filename: string | null;
  resume_url: string | null;
  resume_url_expires_at: string | null;
  has_cover_letter: boolean;
  cover_letter: string | null;
  applied_at: string | null;
}

export interface ResumeDisplayResponse {
  data: ResumeDisplayData | null;
  meta: ResumeDisplayMeta;
}

// ============================================================================
// Email Types (internal API response types)
// ============================================================================

export interface WildcardsAPIResponse {
  success: boolean;
  message: string;
  wildcards: any[];
}

export interface TemplatesAPIResponse {
  success: boolean;
  message: string;
  templates: any[];
}

// ============================================================================
// Invite Types
// ============================================================================

export interface InviteValidationResponse {
  valid: boolean;
  error?: string;
  invite_type?: "team_member" | "org_creator"; // Type of invite
  company_name?: string; // Only for team_member invites
  company_logo?: string; // Only for team_member invites
  inviter_name?: string;
  role?: string;
}

export interface Invite {
  id: string;
  code: string;
  email: string;
  role: string;
  invite_type: "team_member" | "org_creator";
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  creator?: {
    id: string;
    full_name: string;
  } | null;
}

export interface InviteListResponse {
  invites: Invite[];
  total: number;
}

export interface InviteCreateRequest {
  email: string;
  max_uses?: number;
  invite_type?: "team_member" | "org_creator";
  // Note: role is always "admin" in V1 - no role selection
  // Note: expiration is always 7 days - set by backend
}

export interface InviteSendResponse {
  success: boolean;
  invite: Invite;
  message: string;
}

// ============================================================================
// AI Resume Evaluation Types
// ============================================================================

export interface EvaluationBatchProgress {
  total: number;
  pending: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  skipped: number;
}

export interface EvaluationBatchTiming {
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  estimated_completion_at: string | null;
  duration_seconds: number | null;
}

export interface EvaluationBatchStatus {
  batch_id: string;
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress: EvaluationBatchProgress;
  timing: EvaluationBatchTiming;
  created_at: string;
}

export interface JobEvaluationStatus {
  job_id: string;
  has_evaluation: boolean;
  latest_batch: EvaluationBatchStatus | null;
}

export interface StartEvaluationResponse {
  batch_id: string;
  job_id: string;
  total_count: number;
  estimated_seconds: number | null;
  estimated_completion_at: string | null;
  status: string;
  message: string;
}

// Types for application evaluation response
export interface ApplicationEvaluationMeta {
  application_id: string;
  candidate_name: string;
  job_id: string;
  job_title: string;
  evaluated_at: string | null;
  status:
    | "pending"
    | "queued"
    | "processing"
    | "completed"
    | "failed"
    | "skipped";
}

// Dimension assessment structure (same for all 5 dimensions)
export interface DimensionAssessment {
  score: number;
  weight: number;
  level: "strong" | "good" | "moderate" | "weak" | "poor";
  label: string;
  reasoning: string;
  positive_signals: string[];
  negative_signals: string[];
}

// Skill match from backend
export interface SkillMatchData {
  skill_name: string;
  source_type:
    | "experience"
    | "project"
    | "education"
    | "inferred"
    | "keyword_only";
  source_reference: string;
  evidence: string;
  signal_strength:
    | "strong"
    | "demonstrated"
    | "contextual"
    | "academic"
    | "listed";
  is_dealbreaker: boolean;
}

// Missing skill from backend
export interface MissingSkillData {
  skill_name: string;
  category: string;
  is_dealbreaker: boolean;
}

// Constraint result from backend
export interface ConstraintResultData {
  constraint_text: string;
  status: "pass" | "fail" | "deferred";
  evidence: string;
}

// Red flag from backend
export interface RedFlagData {
  flag_type:
    | "short_tenure"
    | "employment_gap"
    | "title_experience_mismatch"
    | "vague_contributions"
    | "unverifiable_claims";
  severity: "info" | "investigate" | "concern";
  details: string;
  context?: string | null;
  interview_probe: string;
}

// Interview question from backend
export interface InterviewQuestionData {
  question: string;
  gap_addressed: string;
  resume_reference: string;
}

// New schema structure matching evaluation_response_schema.json
export interface ApplicationEvaluationData {
  // Top-level scoring summary
  scores: {
    final_score: number;
    tier:
      | "strong_match"
      | "good_match"
      | "moderate_match"
      | "weak_match"
      | "mismatch";
    is_dealbreaker: boolean;
    is_flagged: boolean;
    can_proceed: boolean;
    verification_confidence: "high" | "medium" | "low";
  };

  // High-level candidate summary (root level)
  summary: {
    strengths: string[];
    concerns: string[];
    interview_questions: InterviewQuestionData[];
  };

  // Dimension assessments (root level object with 5 dimensions)
  dimensions: {
    technical_fit: DimensionAssessment;
    experience_fit: DimensionAssessment;
    trajectory_fit: DimensionAssessment;
    culture_fit: DimensionAssessment;
    problem_solving_fit: DimensionAssessment;
  };

  // Skills section with summary, matches, and missing
  skills: {
    summary: {
      total: number;
      matched: number;
      coverage: number;
      source_breakdown: {
        experience: number;
        project: number;
        education: number;
        inferred: number;
        keyword_only: number;
      };
      keyword_stuffing_flag: boolean;
    };
    matches: SkillMatchData[];
    missing: MissingSkillData[];
  };

  // Constraints section with summary and results
  constraints: {
    summary: {
      passed: number;
      failed: number;
      deferred: number;
      total: number;
    };
    results: ConstraintResultData[];
  };

  // Red flags section
  red_flags: {
    summary: {
      total_flags: number;
      by_severity: {
        info: number;
        investigate: number;
        concern: number;
      };
      by_type: Record<string, number>;
      summary: string;
      verification_confidence: "high" | "medium" | "low";
    };
    flags: RedFlagData[];
  };

  // Manipulation check
  manipulation_check: {
    detected: boolean;
    details?: string | null;
  };

  // Timing info
  timing: {
    evaluation_seconds: number;
    total_seconds: number;
  };

  // Tradeoffs analysis
  tradeoffs: {
    signals: Array<{
      tradeoff_title: string;
      direction: "option_a" | "option_b" | "balanced";
      evidence: string;
    }>;
    summary: {
      total: number;
      aligned: number;
      misaligned: number;
    };
  };

  // Blockers array (optional - only present if there are blockers)
  blockers?: Array<{
    type:
      | "manipulation_attempt"
      | "dealbreaker_skill"
      | "dealbreaker_constraint";
    description?: string;
    skill_id?: string;
    reason?: string;
    details?: string;
    evidence?: string;
  }>;

  // Warnings array (optional)
  warnings?: Array<{
    type: string;
    severity: "info" | "medium" | "critical";
    message: string;
  }>;
}
