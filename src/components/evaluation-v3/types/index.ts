/**
 * Evaluation V3 - Centralized Type Definitions
 * All shared types for the evaluation component system
 */

// Status Types
export type EligibilityStatus = true | false | 'review';
export type FlagSeverity = 'concern' | 'investigate' | 'info';
export type SignalStrength = 'strong' | 'moderate' | 'academic' | 'listed' | 'missing';
export type SourceType = 'experience' | 'education' | 'project' | 'keyword_only' | 'inferred';
export type TabId = 'ai' | 'resume';
export type Tier = 'excellent_match' | 'good_match' | 'average_match' | 'poor_match' | 'mismatch';
export type PillVariant = 'success' | 'warning' | 'error' | 'info' | 'purple' | 'neutral';
export type ApplicationStatus = 'applied' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected';
export type CandidateSortOption = 'score_desc' | 'score_asc' | 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';

// Personal Information (unified across components)
export interface PersonalInfo {
  full_name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  resume_url?: string;
}

// Score & Category Types
export interface CategoryScore {
  id: string;
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  color: string;
}

// Constraint Types
export interface Constraint {
  id: string;
  question: string;
  answer: string;
  eligible: EligibilityStatus;
}

// Red Flag Types
export interface RedFlag {
  id: string;
  flag_type: string;
  severity: FlagSeverity;
  details: string;
  context?: string;
  interview_probe?: string;
}

// Interview Question Types
export interface InterviewQuestion {
  id: string;
  question: string;
  gap_addressed: string;
  resume_reference?: string;
}

// Skill Types
export interface SkillMatch {
  skill_name: string;
  signal_strength: SignalStrength;
  source_type: SourceType;
  source_reference: string;
  evidence: string;
  is_dealbreaker: boolean;
}

export interface MissingSkill {
  skill_name: string;
  category: string;
  is_dealbreaker: boolean;
}

// Stats Types
export interface QuickStats {
  skillsMatched: number;
  skillsTotal: number;
  constraintsPassed: number;
  constraintsReview: number;
  constraintsTotal: number;
  redFlagsCount: number;
  redFlagsSeverity?: string;
}

// Resume Types
export interface ResumeExperience {
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_ongoing?: boolean;
  content: string[];
  skills?: string[];
  category?: string;
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  score_value?: string;
  relevant_coursework?: string[];
}

export interface ResumeProject {
  name: string;
  category?: string;
  category_raw?: string;
  content: string[];
  skills?: string[];
  start_date?: string;
  end_date?: string;
  live_url?: string;
  source_url?: string;
}

export interface ResumeSkills {
  technical?: string[];
  soft?: string[];
  languages?: string[];
}

export interface ResumeCertification {
  name: string;
  issuer?: string;
  date?: string;
}

export interface ResumeData {
  personal_info?: PersonalInfo;
  professional_summary?: string | string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: ResumeSkills;
  certifications?: ResumeCertification[];
}
