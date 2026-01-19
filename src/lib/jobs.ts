/**
 * Job data management with backend API integration
 */

import { Job } from "@/types";
import { api } from "./api-client";
import { PAGINATION } from "./constants";

export async function getJobs(): Promise<Job[]> {
  const response = await api.jobs.getJobs({ limit: PAGINATION.JOBS_LIMIT });

  if (!response?.data || !Array.isArray(response.data)) {
    return [];
  }

  return response.data;
}

export async function getJobById(id: string): Promise<Job | null> {
  try {
    return await api.jobs.getJobById(id);
  } catch {
    return null;
  }
}

export async function createJob(
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
  return await api.jobs.createJob(data);
}

export async function updateJob(
  id: string,
  updates: Partial<Job>
): Promise<Job | null> {
  try {
    return await api.jobs.updateJob(id, updates);
  } catch {
    return null;
  }
}
