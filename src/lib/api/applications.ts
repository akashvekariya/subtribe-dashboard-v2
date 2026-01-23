/**
 * Applications API
 * Handles job application operations and resume management
 */

import { Application } from "@/types";
import { apiFetch, API_BASE_URL, handleResponse } from "./client";
import { PaginatedResponse, ResumeDisplayResponse } from "./types";

export const applicationsAPI = {
  async submitApplication(
    slug: string,
    formData: FormData
  ): Promise<{ id: string; message: string }> {
    const url = `${API_BASE_URL}/api/public/jobs/${slug}/apply`;

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
      tier?: string;
      search?: string;
      sort_by?: "applied_at" | "name" | "status" | "ai_score";
      sort_dir?: "asc" | "desc";
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Application>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.tier) searchParams.append("tier", params.tier);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.sort_by) searchParams.append("sort_by", params.sort_by);
    if (params?.sort_dir) searchParams.append("sort_dir", params.sort_dir);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/v1/jobs/${jobId}/applications?${queryString}`
      : `/api/v1/jobs/${jobId}/applications`;

    return apiFetch<PaginatedResponse<Application>>(endpoint, {
      method: "GET",
    });
  },

  async getApplicationById(id: string): Promise<Application> {
    return apiFetch<Application>(`/api/v1/applications/${id}`, {
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

    return apiFetch<Application>(`/api/v1/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async getResumeViewUrl(
    id: string
  ): Promise<{ url: string; filename: string; expires_at: string }> {
    return apiFetch(`/api/v1/applications/${id}/resume/view`, {
      method: "GET",
    });
  },

  async getResumeDownloadUrl(
    id: string
  ): Promise<{ url: string; filename: string; expires_at: string }> {
    return apiFetch(`/api/v1/applications/${id}/resume/download`, {
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
    return apiFetch(`/api/v1/applications/${id}/history`, {
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
    return apiFetch(`/api/v1/applications/${id}/scheduled-emails`, {
      method: "GET",
    });
  },

  /**
   * Get parsed resume data for display
   * Returns null data if resume hasn't been parsed yet
   */
  async getApplicationResume(id: string): Promise<ResumeDisplayResponse> {
    return apiFetch(`/api/v1/applications/${id}/resume`, {
      method: "GET",
    });
  },

  async getJobApplicationsStats(jobId: string): Promise<{
    total_candidates: number;
    by_status: Record<string, number>;
    by_tier: Record<string, number>;
  }> {
    return apiFetch(`/api/v1/jobs/${jobId}/applications/stats`, {
      method: "GET",
    });
  },
};
