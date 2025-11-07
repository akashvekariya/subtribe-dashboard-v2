/**
 * Job data management with backend API integration
 */

import { Job } from "@/types";
import { api } from "./api-client";

export async function getJobs(): Promise<Job[]> {
  const response = await api.jobs.getJobs({ limit: 100 });

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

export async function closeJob(id: string): Promise<boolean> {
  try {
    await api.jobs.closeJob(id);
    return true;
  } catch {
    return false;
  }
}

export async function getPublicJob(slug: string): Promise<Job | null> {
  try {
    return await api.jobs.getPublicJob(slug);
  } catch {
    return null;
  }
}

export async function getJobApplicationCount(jobId: string): Promise<number> {
  try {
    const response = await api.applications.getJobApplications(jobId, {
      limit: 1,
    });
    return response.pagination.total;
  } catch {
    return 0;
  }
}
