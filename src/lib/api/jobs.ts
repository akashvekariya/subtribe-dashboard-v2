/**
 * Jobs API
 * Handles job posting operations and job calibration
 */

import { Job, JobStats } from "@/types";
import { apiFetch } from "./client";
import { PaginatedResponse } from "./types";

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
