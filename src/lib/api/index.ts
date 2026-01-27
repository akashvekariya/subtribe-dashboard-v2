/**
 * API Client for Subtribe Backend
 * Organized by domain with unified exports
 */

// Re-export base client utilities
export { APIError, apiFetch } from "./client";

// Re-export all types
export * from "./types";

// Import domain APIs
import { authAPI, checkAuth } from "./auth";
import { companyAPI } from "./company";
import { jobsAPI } from "./jobs";
import { applicationsAPI } from "./applications";
import { dashboardAPI } from "./dashboard";
import { invitesAPI } from "./invites";
import { aiAPI } from "./ai";
import { aiResumeEvalAPI } from "./ai-resume-eval";
import { bulkUploadAPI } from "./bulk-upload";

// Unified API object (same structure as before)
export const api = {
  auth: authAPI,
  company: companyAPI,
  jobs: jobsAPI,
  applications: applicationsAPI,
  dashboard: dashboardAPI,
  invites: invitesAPI,
  ai: aiAPI,
  aiResumeEval: aiResumeEvalAPI,
  bulkUpload: bulkUploadAPI,
  checkAuth,
};

export default api;

// Re-export individual APIs for direct imports
export { authAPI, checkAuth } from "./auth";
export { companyAPI } from "./company";
export { jobsAPI } from "./jobs";
export { applicationsAPI } from "./applications";
export { dashboardAPI } from "./dashboard";
export { invitesAPI } from "./invites";
export { aiAPI } from "./ai";
export { aiResumeEvalAPI } from "./ai-resume-eval";
export { bulkUploadAPI } from "./bulk-upload";
