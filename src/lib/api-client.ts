/**
 * API Client for Subtribe ATS Backend
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
} from "@/types";

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
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

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("subtribe-token")
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
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
   * Register new user with company code
   * Sets HTTP-only cookie on success
   */
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    company_code: string;
  }): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
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
   * Note: Currently handled client-side by clearing cookies
   * Backend endpoint can be added if needed
   */
  async logout(): Promise<void> {
    // Clear the auth cookie by setting it to expire
    if (typeof document !== "undefined") {
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
  },
};

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
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<PaginatedResponse<Application>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
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

export const api = {
  auth: authAPI,
  company: companyAPI,
  jobs: jobsAPI,
  applications: applicationsAPI,
  dashboard: dashboardAPI,
  email: emailAPI,
  checkAuth,
};

export default api;
