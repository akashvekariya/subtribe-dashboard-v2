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

export function generateMockAIEvaluation(data: {
  first_name?: string;
  last_name?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  current_ctc?: number;
  expected_ctc?: number;
}): { score: number; evaluation: string } {
  let score = 40;
  let evaluation = "AI-Powered Candidate Assessment:\n\n";

  if (data.linkedin_url) {
    score += 12;
    evaluation += "✓ LinkedIn profile: Professional online presence\n";
  }

  if (data.github_url) {
    score += 18;
    evaluation += "✓ GitHub profile: Technical portfolio available\n";
  }

  if (data.portfolio_url) {
    score += 15;
    evaluation += "✓ Personal portfolio: Demonstrates work quality\n";
  }

  if (data.current_ctc && data.expected_ctc) {
    const growthExpectation =
      ((data.expected_ctc - data.current_ctc) / data.current_ctc) * 100;
    if (growthExpectation <= 30) {
      score += 10;
      evaluation += `✓ Realistic salary expectations: ${growthExpectation.toFixed(0)}% growth\n`;
    } else if (growthExpectation <= 50) {
      score += 5;
      evaluation += `◐ Moderate salary expectations: ${growthExpectation.toFixed(0)}% growth\n`;
    }
  }

  const randomBoost = Math.floor(Math.random() * 20) - 5;
  score += randomBoost;
  score = Math.max(0, Math.min(100, score));

  evaluation += "\n";
  if (score >= 85) {
    evaluation += "🌟 Exceptional candidate - Priority review recommended";
  } else if (score >= 70) {
    evaluation += "🎯 Strong candidate - High potential for success";
  } else if (score >= 55) {
    evaluation += "👍 Good candidate - Worth considering for interview";
  } else {
    evaluation += "📋 Standard candidate - Review based on role requirements";
  }

  return { score, evaluation };
}

export function processResumeFile(file: File): Promise<string> {
  return Promise.resolve(URL.createObjectURL(file));
}
