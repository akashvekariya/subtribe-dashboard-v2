/**
 * Resume Analysis Types
 *
 * This file contains all type definitions for resume analysis features.
 * Types are structured to support both free and premium features with paywall support.
 */

// Base types for analysis metrics
export type AnalysisScoreLevel = "excellent" | "good" | "average" | "poor";
export type SkillMatchLevel = "exact" | "close" | "partial" | "none";
export type ExperienceRelevance =
  | "highly_relevant"
  | "relevant"
  | "somewhat_relevant"
  | "not_relevant";

/**
 * Skill Match Analysis
 * Analyzes how well candidate skills match job requirements
 */
export interface SkillMatch {
  skill: string;
  match_level: SkillMatchLevel;
  years_of_experience?: number;
  is_required: boolean;
  confidence_score: number; // 0-100
}

/**
 * Experience Analysis
 * Detailed breakdown of candidate's work experience relevance
 */
export interface ExperienceAnalysis {
  company_name: string;
  role: string;
  duration_months: number;
  relevance: ExperienceRelevance;
  key_achievements: string[];
  skills_demonstrated: string[];
}

/**
 * Education Analysis
 * Educational background evaluation
 */
export interface EducationAnalysis {
  degree: string;
  institution: string;
  field_of_study: string;
  relevance_score: number; // 0-100
  is_relevant: boolean;
}

/**
 * Resume Quality Metrics
 * Measures the overall quality and presentation of the resume
 */
export interface ResumeQualityMetrics {
  overall_score: number; // 0-100
  formatting_score: number; // 0-100
  clarity_score: number; // 0-100
  completeness_score: number; // 0-100
  grammar_score: number; // 0-100
  length_appropriateness: AnalysisScoreLevel;
  has_contact_info: boolean;
  has_summary: boolean;
  has_quantified_achievements: boolean;
}

/**
 * Job Fit Analysis
 * Overall fit between candidate and job requirements
 */
export interface JobFitAnalysis {
  overall_fit_score: number; // 0-100
  skills_match_percentage: number; // 0-100
  experience_match_percentage: number; // 0-100
  education_match_percentage: number; // 0-100
  culture_fit_indicators: string[];
  red_flags: string[];
  green_flags: string[];
}

/**
 * Salary Insights (Premium Feature)
 * Compensation analysis based on market data
 */
export interface SalaryInsights {
  market_salary_min: number;
  market_salary_max: number;
  candidate_expectation: number;
  candidate_current: number;
  alignment_score: number; // 0-100
  is_within_budget: boolean;
  market_data_source: string;
  currency: string;
}

/**
 * Career Trajectory Analysis (Premium Feature)
 * Analyzes candidate's career progression and future potential
 */
export interface CareerTrajectory {
  career_progression_score: number; // 0-100
  years_of_experience: number;
  average_tenure_months: number;
  job_hopping_risk: "low" | "medium" | "high";
  growth_trajectory: "upward" | "lateral" | "varied";
  leadership_potential: number; // 0-100
  specialist_vs_generalist: "specialist" | "generalist" | "balanced";
}

/**
 * Interview Readiness Score (Premium Feature)
 * Predicts candidate's likelihood of performing well in interviews
 */
export interface InterviewReadiness {
  overall_readiness_score: number; // 0-100
  communication_indicators: number; // 0-100
  technical_depth_score: number; // 0-100
  problem_solving_indicators: number; // 0-100
  suggested_interview_focus_areas: string[];
  potential_interview_questions: string[];
}

/**
 * Diversity & Inclusion Insights (Premium Feature)
 * Provides insights for building diverse teams (anonymized and ethical)
 */
export interface DiversityInsights {
  university_diversity_score: number; // 0-100, based on institution variety
  industry_diversity_score: number; // 0-100, based on industry variety
  geographic_diversity: boolean;
  career_path_uniqueness: number; // 0-100
}

/**
 * Retention Risk Analysis (Premium Feature)
 * Predicts likelihood of candidate staying long-term
 */
export interface RetentionRisk {
  retention_risk_score: number; // 0-100, higher is better
  flight_risk_level: "low" | "medium" | "high";
  tenure_stability_score: number; // 0-100
  factors_increasing_risk: string[];
  factors_decreasing_risk: string[];
  recommended_retention_strategies: string[];
}

/**
 * Complete Resume Analysis
 * Main analysis object containing all analysis data
 */
export interface ResumeAnalysis {
  // Basic Info
  application_id: string;
  job_id: string;
  analyzed_at: string;
  analysis_version: string;

  // Free Tier Metrics
  overall_score: number; // 0-100
  job_fit: JobFitAnalysis;
  skills_analysis: {
    matched_skills: SkillMatch[];
    missing_required_skills: string[];
    additional_skills: string[];
    skills_summary: string;
  };
  experience_summary: {
    total_years: number;
    relevant_years: number;
    experiences: ExperienceAnalysis[];
  };
  education: {
    highest_degree: string;
    education_items: EducationAnalysis[];
  };
  resume_quality: ResumeQualityMetrics;

  // Summary & Recommendations
  executive_summary: string;
  top_strengths: string[];
  areas_of_concern: string[];
  interview_recommendations: string[];

  // Premium Features (null if not subscribed)
  salary_insights: SalaryInsights | null;
  career_trajectory: CareerTrajectory | null;
  interview_readiness: InterviewReadiness | null;
  diversity_insights: DiversityInsights | null;
  retention_risk: RetentionRisk | null;

  // Metadata
  is_premium_analysis: boolean;
  premium_features_available: string[];
}

/**
 * Analysis Loading State
 * Tracks the loading state of analysis data
 */
export interface AnalysisLoadingState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  progress?: number; // 0-100 for showing progress
}

/**
 * Feature Flag for Premium Features
 * Used to control access to premium analysis features
 */
export interface AnalysisFeatureFlags {
  has_premium_access: boolean;
  available_premium_features: Array<
    | "salary_insights"
    | "career_trajectory"
    | "interview_readiness"
    | "diversity_insights"
    | "retention_risk"
  >;
  subscription_tier: "free" | "pro" | "enterprise";
}

/**
 * Analysis API Response
 * Response structure from the analysis API
 */
export interface AnalysisApiResponse {
  success: boolean;
  data: ResumeAnalysis;
  message?: string;
}
