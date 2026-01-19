/**
 * AI Calibration API
 * Handles AI-powered job parsing, framework creation, and candidate evaluation
 */

import {
  JobCalibrationInput,
  ParseJobResponse,
  EvaluateCandidateRequest,
  EvaluateCandidateResponse,
} from "@/types";
import { FrameworkAPIResponse } from "@/types/evaluationFramework";
import { CalibrationSummaryJSON } from "@/lib/calibration-summary";
import { apiFetch } from "./client";

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
