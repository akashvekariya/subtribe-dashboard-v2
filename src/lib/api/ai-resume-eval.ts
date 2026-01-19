/**
 * AI Resume Evaluation API
 * Handles batch resume evaluation operations and status tracking
 */

import { apiFetch } from "./client";
import {
  JobEvaluationStatus,
  StartEvaluationResponse,
  EvaluationBatchStatus,
  ApplicationEvaluationData,
  ApplicationEvaluationMeta,
} from "./types";

export const aiResumeEvalAPI = {
  /**
   * Get evaluation status for a job
   */
  async getJobEvaluationStatus(jobId: string): Promise<JobEvaluationStatus> {
    return apiFetch<JobEvaluationStatus>(
      `/api/ai-resume-eval/jobs/${jobId}/status`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Start AI resume evaluation for a job
   */
  async startJobEvaluation(
    jobId: string,
    applicationIds?: string[]
  ): Promise<StartEvaluationResponse> {
    const body = applicationIds ? { application_ids: applicationIds } : {};
    return apiFetch<StartEvaluationResponse>(
      `/api/ai-resume-eval/jobs/${jobId}/start`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  },

  /**
   * Get batch status and progress
   */
  async getBatchStatus(batchId: string): Promise<EvaluationBatchStatus> {
    return apiFetch<EvaluationBatchStatus>(
      `/api/ai-resume-eval/batches/${batchId}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Cancel a pending or processing batch
   */
  async cancelBatch(
    batchId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch(`/api/ai-resume-eval/batches/${batchId}/cancel`, {
      method: "POST",
    });
  },

  /**
   * Retry failed tasks in a batch
   */
  async retryFailedTasks(batchId: string): Promise<{
    success: boolean;
    retried_count: number;
    message: string;
  }> {
    return apiFetch(`/api/ai-resume-eval/batches/${batchId}/retry-failed`, {
      method: "POST",
    });
  },

  /**
   * Get evaluation detail for a specific application
   * Returns full evaluation data including scores, skills, constraints, red flags, etc.
   */
  async getApplicationEvaluation(applicationId: string): Promise<{
    data: ApplicationEvaluationData | null;
    meta: ApplicationEvaluationMeta;
  }> {
    return apiFetch(`/api/ai-resume-eval/applications/${applicationId}`, {
      method: "GET",
    });
  },
};
