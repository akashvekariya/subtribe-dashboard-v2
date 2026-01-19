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
import { emailAPI } from "./email";
import { invitesAPI } from "./invites";
import { aiAPI } from "./ai";
import { aiResumeEvalAPI } from "./ai-resume-eval";

// Unified API object (same structure as before)
export const api = {
  auth: authAPI,
  company: companyAPI,
  jobs: jobsAPI,
  applications: applicationsAPI,
  dashboard: dashboardAPI,
  email: emailAPI,
  invites: invitesAPI,
  ai: aiAPI,
  aiResumeEval: aiResumeEvalAPI,
  checkAuth,
};

export default api;

// Re-export individual APIs for direct imports
export { authAPI, checkAuth } from "./auth";
export { companyAPI } from "./company";
export { jobsAPI } from "./jobs";
export { applicationsAPI } from "./applications";
export { dashboardAPI } from "./dashboard";
export { emailAPI } from "./email";
export { invitesAPI } from "./invites";
export { aiAPI } from "./ai";
export { aiResumeEvalAPI } from "./ai-resume-eval";
