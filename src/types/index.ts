// Enhanced type definitions matching backend API structure

// Enums for backend compatibility
export type PositionType =
  | "full_time"
  | "part_time"
  | "contract"
  | "temporary"
  | "other"
  | "volunteer"
  | "internship";
export type LocationType = "remote" | "hybrid" | "onsite";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "principal";
export type JobStatus = "draft" | "active" | "closed";
export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interviewing"
  | "offer"
  | "hired"
  | "rejected";
export type Currency = "USD" | "INR" | "EUR" | "GBP";

// Company interface for nested company data
export interface Company {
  id: string;
  name: string;
  slug: string;
  invite_code?: string;
  logo_url?: string;
  website_url?: string;
  tagline?: string;
  about?: string;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced User interface matching backend
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "recruiter" | "admin";
  email_verified: boolean;
  pending_onboarding: boolean; // True when user claimed org_creator invite, waiting to create org
  company?: Company | null; // Optional - null until invite is claimed
  created_at?: string;
  updated_at?: string;
}

// Screening question structure
export interface ScreeningQuestion {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox";
  question: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox types
}

// Job interface matching backend API exactly (see jobs.md)
export interface Job {
  id: string;
  company_id: string;
  created_by: string;
  title: string;
  slug: string;
  description: string;

  // Job type & level
  position_type: PositionType;
  experience_level?: ExperienceLevel; // "entry" | "mid" | "senior" | "lead" | "principal"
  department?: string;

  // Location
  location_type: LocationType;
  location_city?: string;
  location_state?: string;
  location_country?: string;

  // Salary
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;

  // Experience (years)
  min_experience_years?: number;
  max_experience_years?: number;

  // Skills
  required_skills: string[];
  preferred_skills: string[];

  // Screening
  screening_questions: ScreeningQuestion[];

  // Status & metadata
  status: JobStatus;
  views_count: number;
  applications_count?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;

  // Nested objects from backend
  creator?: {
    id: string;
    full_name: string;
  };
  company?: Company;
}

// Enhanced Application/Candidate interface matching backend
export interface Application {
  id: string;
  job_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  current_ctc?: number;
  expected_ctc?: number;
  notice_period_days?: number;
  screening_answers: Record<string, string>;
  status: ApplicationStatus;
  resume_filename?: string;
  resume_url?: string; // For frontend compatibility
  applied_at: string;
  created_at: string;
  updated_at: string;

  // AI evaluation fields (frontend-specific for now)
  ai_score?: number;
  ai_evaluation?: string;

  // Job reference for nested data
  job?: Partial<Job>;
}

// Backward compatibility - map Application to Candidate
export interface Candidate extends Application {
  jobId: string; // Maps to job_id
  fullName: string; // Computed from first_name + last_name
  linkedinUrl?: string; // Maps to linkedin_url
  githubUrl?: string; // Maps to github_url
  resumeUrl: string; // Maps to resume_url
  aiScore: number; // Maps to ai_score
  aiEvaluation: string; // Maps to ai_evaluation
  createdAt: Date; // Parsed from created_at
  updatedAt: Date; // Parsed from updated_at
}

// Keep old type for backward compatibility
export type CandidateStatus = ApplicationStatus;

// Application status history for tracking changes
export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  changed_by?: {
    id: string;
    full_name: string;
  };
  notes?: string;
  created_at: string;
}

// Scheduled email for tracking automated emails
export interface ScheduledEmail {
  id: string;
  template_type: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  scheduled_for: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  sent_at: string | null;
  provider_message_id: string | null;
  error_message: string | null;
  created_at: string;
}

// Email Template interface
export interface EmailTemplate {
  id: string;
  company_id: string;
  name: string;
  template_type: string;
  category: "system" | "custom";
  subject: string;
  body: string;
  wildcards: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Email Wildcard metadata
export interface EmailWildcard {
  name: string;
  description: string;
}

// Email sending request
export interface SendEmailRequest {
  template_id?: string;
  subject: string;
  body: string;
  send_immediately?: boolean;
  scheduled_for?: string;
}

// Bulk email sending request
export interface BulkEmailRequest {
  application_ids: string[];
  template_id?: string;
  subject: string;
  body: string;
  send_immediately?: boolean;
  scheduled_for?: string;
}

// Email send response
export interface SendEmailResponse {
  success: boolean;
  email_id: string;
  status: "sent" | "scheduled";
  scheduled_for?: string;
}

// Bulk email response
export interface BulkEmailResponse {
  success: boolean;
  emails_created: number;
  status: "sent" | "scheduled";
  scheduled_for?: string;
}

// Email preview response
export interface EmailPreviewResponse {
  subject: string;
  body: string;
}

// API response types
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

export interface ApiError {
  error: {
    type: string;
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Auth response types
export interface AuthResponse {
  access_token: string;
  token_type?: string;
  expires_at?: string;
  user: User;
}

// Form input types for better type safety (matches backend API)
export interface JobFormData {
  title: string;
  description: string;
  position_type: PositionType;
  experience_level?: ExperienceLevel;
  department?: string;
  location_type: LocationType;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  required_skills: string[];
  preferred_skills: string[];
  min_experience_years?: number;
  max_experience_years?: number;
  screening_questions: Omit<ScreeningQuestion, "id">[];
}

export interface ApplicationFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  current_ctc?: number;
  expected_ctc?: number;
  notice_period_days?: number;
  screening_answers: Record<string, string>;
  resume: File;
}

// Dashboard statistics interface
export interface DashboardStats {
  jobs: {
    total: number;
    active: number;
    draft: number;
    closed: number;
  };
  applications: {
    total: number;
    today: number;
    this_week: number;
    this_month: number;
    by_status: {
      applied: number;
      screening: number;
      interviewing: number;
      offer: number;
      hired: number;
      rejected: number;
    };
  };
  pipeline?: {
    conversion_rate: number;
    avg_time_to_hire_days: number;
  };
  activity?: {
    views_today: number;
    views_this_week: number;
  };
  generated_at: string;
}

// Job-specific statistics interface
export interface JobStats {
  applications: {
    total: number;
    today: number;
    this_week: number;
    this_month: number;
    by_status: {
      applied: number;
      screening: number;
      interviewing: number;
      offer: number;
      hired: number;
      rejected: number;
    };
  };
  views: {
    total: number;
  };
  quality: {
    application_rate: number;
    screening_rate: number;
    interview_rate: number;
    offer_rate: number;
    hire_rate: number;
  };
  activity: {
    latest_application_at: string | null;
    days_since_last_application: number | null;
    days_since_published: number;
    is_recently_active: boolean;
  };
  pipeline: {
    conversion_rate: number;
    avg_time_to_hire_days: number | null;
  };
  generated_at: string;
}
