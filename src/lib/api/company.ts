/**
 * Company API
 * Handles company profile and onboarding operations
 */

import { Company } from "@/types";
import { apiFetch } from "./client";
import { OnboardingRequest, OnboardingResponse } from "./types";

export const companyAPI = {
  async getCompany(): Promise<Company> {
    return apiFetch<Company>("/companies/me", {
      method: "GET",
    });
  },

  async updateCompany(
    data: Partial<Omit<Company, "id" | "created_at" | "updated_at">>
  ): Promise<Company> {
    return apiFetch<Company>("/companies/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async completeOnboarding(
    data: OnboardingRequest
  ): Promise<OnboardingResponse> {
    return apiFetch<OnboardingResponse>("/companies/onboarding", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
