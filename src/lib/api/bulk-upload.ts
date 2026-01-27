/**
 * Bulk Upload API client
 */

import type { BulkUploadBatch, BulkUploadHistoryItem } from "@/types";
import { apiFetch, API_BASE_URL } from "./client";

export interface BulkUploadResponse {
  id: string;
  job_id: string;
  status: string;
  original_filename: string;
  created_at: string;
  message: string;
}

export type BulkUploadStatusResponse = BulkUploadBatch;

export interface BulkUploadHistoryResponse {
  data: BulkUploadHistoryItem[];
}

export const bulkUploadAPI = {
  /**
   * Upload a ZIP file containing PDF resumes for bulk processing
   */
  async upload(jobId: string, file: File): Promise<BulkUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/bulk-uploads/jobs/${jobId}/upload`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail || "Failed to upload file");
    }

    return response.json();
  },

  /**
   * Get the status of a bulk upload batch
   */
  async getStatus(batchId: string): Promise<BulkUploadStatusResponse> {
    return apiFetch<BulkUploadStatusResponse>(
      `/api/v1/bulk-uploads/${batchId}`
    );
  },

  /**
   * Get recent bulk upload history for a job
   */
  async getHistory(jobId: string): Promise<BulkUploadHistoryResponse> {
    return apiFetch<BulkUploadHistoryResponse>(
      `/api/v1/bulk-uploads/jobs/${jobId}/history`
    );
  },
};
