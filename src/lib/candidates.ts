/**
 * Candidate/Application data management with backend API integration
 */

import { Application, ApplicationStatus } from "@/types";
import { api } from "./api-client";

export async function getCandidates(): Promise<Application[]> {
  try {
    const jobs = await api.jobs.getJobs();
    const allApplications: Application[] = [];

    for (const job of jobs.data) {
      const response = await api.applications.getJobApplications(job.id);
      allApplications.push(...response.data);
    }

    return allApplications;
  } catch {
    return [];
  }
}

export async function getCandidatesByJobId(
  jobId: string,
  params?: {
    status?: string;
    search?: string;
    sort_by?: "applied_at" | "name" | "status" | "ai_score";
    sort_dir?: "asc" | "desc";
    page?: number;
    limit?: number;
  }
) {
  try {
    return await api.applications.getJobApplications(jobId, params);
  } catch {
    // Return empty result on any error
    return {
      data: [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: 0,
        total_pages: 0,
        has_more: false,
      },
    };
  }
}

export async function getCandidateById(
  id: string
): Promise<Application | null> {
  try {
    return await api.applications.getApplicationById(id);
  } catch {
    return null;
  }
}

export async function updateCandidateStatus(
  id: string,
  status: ApplicationStatus,
  notes?: string
): Promise<Application> {
  return api.applications.updateApplicationStatus(id, status, notes);
}
