/**
 * Dashboard API
 * Handles dashboard statistics and overview data
 */

import { DashboardStats } from "@/types";
import { apiFetch } from "./client";

export const dashboardAPI = {
  async getStats(params?: {
    from?: string;
    to?: string;
  }): Promise<DashboardStats> {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.append("from", params.from);
    if (params?.to) searchParams.append("to", params.to);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/dashboard/stats?${queryString}`
      : "/dashboard/stats";

    return apiFetch<DashboardStats>(endpoint, {
      method: "GET",
    });
  },
};
