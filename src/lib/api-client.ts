/**
 * API Client for Subtribe Backend
 * Handles authentication, requests, and error management
 */

import {
  AuthResponse,
  User,
  ApiError,
  Job,
  Application,
  DashboardStats,
  Company,
  JobStats,
  EmailTemplate,
  EmailWildcard,
  SendEmailRequest,
  SendEmailResponse,
  BulkEmailRequest,
  BulkEmailResponse,
  EmailPreviewResponse,
  JobCalibrationInput,
  ParseJobResponse,
  EvaluateCandidateRequest,
  EvaluateCandidateResponse,
} from "@/types";
import { FrameworkAPIResponse } from "@/types/evaluationFramework";
import { CalibrationSummaryJSON } from "@/lib/calibrationSummary";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    `Missing required environment variable: NEXT_PUBLIC_API_URL\n` +
      `Please ensure .env.development file exists with:\n` +
      `NEXT_PUBLIC_API_URL=your_value\n` +
      `If the file exists, try restarting the dev server.`
  );
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "APIError";
  }
}

export interface ClaimInviteResponse {
  success: boolean;
  invite_type: "org_creator" | "team_member";
  company: Company | null; // Only for team_member invites
  redirect_to: string; // '/onboarding' or '/'
  message?: string;
  access_token: string; // New JWT with updated company_id
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    // Handle 204 No Content or empty responses
    const contentLength = response.headers.get("content-length");
    if (response.status === 204 || contentLength === "0") {
      return {} as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      // Check if body is empty before parsing
      const text = await response.text();
      if (!text || text.trim() === "") {
        return {} as T;
      }
      return JSON.parse(text);
    }
    return {} as T;
  }

  let errorData: ApiError | null = null;
  try {
    errorData = await response.json();
  } catch {
    // JSON parsing failed
  }

  const message =
    errorData?.error?.message || response.statusText || "An error occurred";
  const code = errorData?.error?.code;
  const details = errorData?.error?.details;

  throw new APIError(message, response.status, code, details);
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Authentication is handled via HTTP-only cookies (credentials: "include")
  // No need to send Authorization header - cookies are more secure against XSS
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Sends HTTP-only auth cookie automatically
  };

  try {
    const response = await fetch(url, config);
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : "Network error occurred",
      0
    );
  }
}

export const authAPI = {
  /**
   * Login with email and password
   * Sets HTTP-only cookie on success
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Register new user (no org created - user enters invite code after email verification)
   * Sets HTTP-only cookie on success
   */
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Verify email with token
   */
  async verifyEmail(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(
      "/auth/verify-email",
      {
        method: "POST",
        body: JSON.stringify({ token }),
      }
    );
  },

  /**
   * Resend verification email
   */
  async resendVerification(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(
      "/auth/resend-verification",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  },

  /**
   * Get current authenticated user
   * Validates token from HTTP-only cookie
   */
  async me(): Promise<User> {
    return apiFetch<User>("/auth/me", {
      method: "GET",
    });
  },

  /**
   * Logout user
   * Calls backend to properly clear HTTP-only cookie with correct attributes
   */
  async logout(): Promise<void> {
    await apiFetch<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },

  /**
   * Claim an invite code to join or create an organization
   * Called after email verification
   */
  async claimInvite(code: string): Promise<ClaimInviteResponse> {
    return apiFetch<ClaimInviteResponse>("/auth/claim-invite", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  /**
   * Request password reset email
   * Always returns success to prevent email enumeration
   */
  async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token,
        password,
        confirm_password: confirmPassword,
      }),
    });
  },

  /**
   * Validate a password reset token
   * Returns whether token is valid and masked email
   */
  async validateResetToken(
    token: string
  ): Promise<{ valid: boolean; email?: string; message?: string }> {
    return apiFetch("/auth/validate-reset-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },
};

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

export const companyAPI = {
  async getCompany(): Promise<Company> {
    return apiFetch<Company>("/companies/me", {
      method: "GET",
    });
  },

  async updateCompany(
    data: Partial<Omit<Company, "id" | "created_at" | "updated_at">>
  ): Promise<Company> {
    return apiFetch<Company>("/companies/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async completeOnboarding(
    data: OnboardingRequest
  ): Promise<OnboardingResponse> {
    return apiFetch<OnboardingResponse>("/companies/onboarding", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_more: boolean;
  };
}

export const jobsAPI = {
  async createJob(
    data: Omit<
      Job,
      | "id"
      | "slug"
      | "created_at"
      | "updated_at"
      | "views_count"
      | "applications_count"
      | "published_at"
      | "company_id"
      | "created_by"
    >
  ): Promise<Job> {
    return apiFetch<Job>("/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getJobs(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Job>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/jobs?${queryString}` : "/jobs";

    return apiFetch<PaginatedResponse<Job>>(endpoint, {
      method: "GET",
    });
  },

  async getJobById(id: string): Promise<Job> {
    return apiFetch<Job>(`/jobs/${id}`, {
      method: "GET",
    });
  },

  async updateJob(id: string, data: Partial<Job>): Promise<Job> {
    return apiFetch<Job>(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async closeJob(
    id: string
  ): Promise<{ id: string; status: string; closed_at: string }> {
    return apiFetch(`/jobs/${id}/close`, {
      method: "PATCH",
    });
  },

  async getPublicJob(slug: string): Promise<Job> {
    return apiFetch<Job>(`/public/jobs/${slug}`, {
      method: "GET",
    });
  },

  async getJobStats(jobId: string): Promise<JobStats> {
    return apiFetch<JobStats>(`/jobs/${jobId}/stats`, {
      method: "GET",
    });
  },

  async saveCalibration(
    jobId: string,
    data: {
      calibration_summary: object;
      evaluation_framework: object;
    }
  ): Promise<{
    id: string;
    calibration_summary: object | null;
    evaluation_framework: object | null;
    calibrated_at: string | null;
    message: string;
  }> {
    return apiFetch(`/jobs/${jobId}/calibration`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async getCalibration(jobId: string): Promise<{
    id: string;
    calibration_summary: object | null;
    evaluation_framework: object | null;
    calibrated_at: string | null;
    message: string;
  }> {
    return apiFetch(`/jobs/${jobId}/calibration`, {
      method: "GET",
    });
  },
};

export const applicationsAPI = {
  async submitApplication(
    slug: string,
    formData: FormData
  ): Promise<{ id: string; message: string }> {
    const url = `${API_BASE_URL}/public/jobs/${slug}/apply`;

    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    return handleResponse(response);
  },

  async getJobApplications(
    jobId: string,
    params?: {
      status?: string;
      search?: string;
      sort_by?: "applied_at" | "name" | "status" | "ai_score";
      sort_dir?: "asc" | "desc";
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Application>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.sort_by) searchParams.append("sort_by", params.sort_by);
    if (params?.sort_dir) searchParams.append("sort_dir", params.sort_dir);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/jobs/${jobId}/applications?${queryString}`
      : `/jobs/${jobId}/applications`;

    return apiFetch<PaginatedResponse<Application>>(endpoint, {
      method: "GET",
    });
  },

  async getApplicationById(id: string): Promise<Application> {
    return apiFetch<Application>(`/applications/${id}`, {
      method: "GET",
    });
  },

  async updateApplicationStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<Application> {
    const body: { status: string; notes?: string } = { status };

    // Only include notes if provided (don't pollute database with empty notes)
    if (notes && notes.trim()) {
      body.notes = notes.trim();
    }

    return apiFetch<Application>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async getResumeViewUrl(
    id: string
  ): Promise<{ url: string; filename: string; expires_at: string }> {
    return apiFetch(`/applications/${id}/resume/view`, {
      method: "GET",
    });
  },

  async getResumeDownloadUrl(
    id: string
  ): Promise<{ url: string; filename: string; expires_at: string }> {
    return apiFetch(`/applications/${id}/resume/download`, {
      method: "GET",
    });
  },

  async getApplicationHistory(id: string): Promise<{
    data: Array<{
      id: string;
      from_status: string | null;
      to_status: string;
      changed_by: { id: string; full_name: string } | null;
      notes: string | null;
      created_at: string;
    }>;
  }> {
    return apiFetch(`/applications/${id}/history`, {
      method: "GET",
    });
  },

  async getScheduledEmails(id: string): Promise<{
    data: Array<{
      id: string;
      template_type: "interview_invite" | "rejection";
      recipient_email: string;
      recipient_name: string;
      subject: string;
      scheduled_for: string;
      status: "pending" | "sent" | "failed" | "cancelled";
      sent_at: string | null;
      provider_message_id: string | null;
      error_message: string | null;
      created_at: string;
    }>;
  }> {
    return apiFetch(`/applications/${id}/scheduled-emails`, {
      method: "GET",
    });
  },
};

export const dashboardAPI = {
  async getStats(params?: {
    from?: string;
    to?: string;
  }): Promise<DashboardStats> {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.append("from", params.from);
    if (params?.to) searchParams.append("to", params.to);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/dashboard/stats?${queryString}`
      : "/dashboard/stats";

    return apiFetch<DashboardStats>(endpoint, {
      method: "GET",
    });
  },
};

// Backend response types
interface WildcardsAPIResponse {
  success: boolean;
  message: string;
  wildcards: EmailWildcard[];
}

interface TemplatesAPIResponse {
  success: boolean;
  message: string;
  templates: EmailTemplate[];
}

export const emailAPI = {
  // Get available wildcards for templates
  async getWildcards(): Promise<{ data: EmailWildcard[] }> {
    const response = await apiFetch<WildcardsAPIResponse>("/emails/wildcards", {
      method: "GET",
    });
    return { data: response.wildcards };
  },

  // Get all email templates for the company
  async getTemplates(): Promise<{ data: EmailTemplate[] }> {
    const response = await apiFetch<TemplatesAPIResponse>("/emails/templates", {
      method: "GET",
    });
    return { data: response.templates };
  },

  // Get a single template by ID
  async getTemplate(id: string): Promise<EmailTemplate> {
    return apiFetch(`/emails/templates/${id}`, {
      method: "GET",
    });
  },

  // Create a new email template
  async createTemplate(data: {
    name: string;
    category?: string;
    subject: string;
    body: string;
  }): Promise<EmailTemplate> {
    return apiFetch("/emails/templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update an existing template
  async updateTemplate(
    id: string,
    data: {
      name?: string;
      category?: string;
      subject?: string;
      body?: string;
    }
  ): Promise<EmailTemplate> {
    return apiFetch(`/emails/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Delete a template
  async deleteTemplate(id: string): Promise<void> {
    return apiFetch(`/emails/templates/${id}`, {
      method: "DELETE",
    });
  },

  // Send email to a single application
  async sendEmail(
    applicationId: string,
    data: SendEmailRequest
  ): Promise<SendEmailResponse> {
    return apiFetch(`/emails/applications/${applicationId}/send-email`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Send bulk emails to multiple applications
  async sendBulkEmail(data: BulkEmailRequest): Promise<BulkEmailResponse> {
    return apiFetch("/emails/bulk-send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Preview email with replaced wildcards
  async previewEmail(
    applicationId: string,
    data: { subject: string; body: string }
  ): Promise<EmailPreviewResponse> {
    return apiFetch(`/emails/applications/${applicationId}/preview-email`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Cancel a scheduled email
  async cancelScheduledEmail(
    emailId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch(`/emails/scheduled/${emailId}/cancel`, {
      method: "POST",
    });
  },
};

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

export const invitesAPI = {
  /**
   * Validate an invite code (public endpoint)
   */
  async validate(code: string): Promise<InviteValidationResponse> {
    return apiFetch<InviteValidationResponse>(`/invites/validate/${code}`, {
      method: "GET",
    });
  },

  /**
   * List all invites for the company
   */
  async list(): Promise<InviteListResponse> {
    return apiFetch<InviteListResponse>("/invites", {
      method: "GET",
    });
  },

  /**
   * Create and send a new invite
   */
  async create(data: InviteCreateRequest): Promise<InviteSendResponse> {
    return apiFetch<InviteSendResponse>("/invites", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get invite details
   */
  async get(id: string): Promise<Invite> {
    return apiFetch<Invite>(`/invites/${id}`, {
      method: "GET",
    });
  },

  /**
   * Update invite (deactivate or change max_uses)
   */
  async update(
    id: string,
    data: { is_active?: boolean; max_uses?: number }
  ): Promise<Invite> {
    return apiFetch<Invite>(`/invites/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Deactivate an invite
   */
  async delete(id: string): Promise<void> {
    return apiFetch<void>(`/invites/${id}`, {
      method: "DELETE",
    });
  },
};

export async function checkAuth(): Promise<User | null> {
  try {
    const user = await authAPI.me();
    return user;
  } catch (error) {
    if (error instanceof APIError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

// AI Calibration API endpoints
export const aiAPI = {
  /**
   * Parse a job description and generate calibration questions
   */
  async parseJob(data: JobCalibrationInput): Promise<ParseJobResponse> {
    return apiFetch<ParseJobResponse>("/api/ai/jobs/parse", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Create an evaluation framework from calibration decisions
   */
  async createFramework(
    calibrationData: CalibrationSummaryJSON
  ): Promise<FrameworkAPIResponse> {
    return apiFetch<FrameworkAPIResponse>("/api/ai/jobs/create-framework", {
      method: "POST",
      body: JSON.stringify(calibrationData),
    });
  },

  /**
   * Extract facts from a resume
   */
  async extractFacts(
    resumeText: string,
    skillIds?: string[]
  ): Promise<{
    experience: Record<string, unknown>;
    education: Array<Record<string, unknown>>;
    certifications: Array<Record<string, unknown>>;
    skill_keywords: string[];
    timing?: Record<string, number>;
  }> {
    return apiFetch("/api/ai/facts/extract", {
      method: "POST",
      body: JSON.stringify({
        resume_text: resumeText,
        skill_ids: skillIds,
      }),
    });
  },

  /**
   * Parse a markdown resume into structured JSON
   */
  async parseResume(
    resumeMarkdown: string,
    linkMappings?: Array<{ display_text: string; url: string }>
  ): Promise<{
    personal_info: Record<string, unknown>;
    experience: Array<Record<string, unknown>>;
    education: Array<Record<string, unknown>>;
    skills: Record<string, unknown>;
    projects?: Array<Record<string, unknown>>;
    certifications?: Array<Record<string, unknown>>;
    computed: Record<string, unknown>;
    timing?: Record<string, number>;
  }> {
    return apiFetch("/api/ai/resume/parse", {
      method: "POST",
      body: JSON.stringify({
        resume_markdown: resumeMarkdown,
        link_mappings: linkMappings,
      }),
    });
  },

  /**
   * Evaluate a candidate resume against an evaluation framework
   */
  async evaluateCandidate(
    request: EvaluateCandidateRequest
  ): Promise<EvaluateCandidateResponse> {
    return apiFetch<EvaluateCandidateResponse>("/api/ai/candidates/evaluate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
};

export const api = {
  auth: authAPI,
  company: companyAPI,
  jobs: jobsAPI,
  applications: applicationsAPI,
  dashboard: dashboardAPI,
  email: emailAPI,
  invites: invitesAPI,
  ai: aiAPI,
  checkAuth,
};

export default api;
