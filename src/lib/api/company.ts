/**
 * Company API
 * Handles company profile and onboarding operations
 */

import { Company } from "@/types";
import { apiFetch } from "./client";
import { OnboardingRequest, OnboardingResponse } from "./types";

export const companyAPI = {
  async getCompany(companyId: string): Promise<Company> {
    return apiFetch<Company>(`/api/v1/companies/${companyId}`, {
      method: "GET",
    });
  },

  async updateCompany(
    companyId: string,
    data: Partial<Omit<Company, "id" | "created_at" | "updated_at">>
  ): Promise<Company> {
    return apiFetch<Company>(`/api/v1/companies/${companyId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async completeOnboarding(
    data: OnboardingRequest
  ): Promise<OnboardingResponse> {
    return apiFetch<OnboardingResponse>("/api/v1/companies/onboarding", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
