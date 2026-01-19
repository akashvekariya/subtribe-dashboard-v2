import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import type { ApplicationStatus, Tier, CandidateSortOption } from "../types";
import type { CandidateListItem } from "../CandidateList";
import { mapBackendTierToUI } from "../utils";
import { PAGINATION } from "@/lib/constants";

// API response type for applications list
interface ApplicationListItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: ApplicationStatus;
  applied_at: string;
  evaluation_score: number | null;
  evaluation_tier: string | null;
}

// Map frontend sort option to API params
const mapSortToAPI = (
  sortOption: CandidateSortOption
): { sort_by: "ai_score" | "applied_at" | "name"; sort_dir: "asc" | "desc" } => {
  switch (sortOption) {
    case "score_desc":
      return { sort_by: "ai_score", sort_dir: "desc" };
    case "score_asc":
      return { sort_by: "ai_score", sort_dir: "asc" };
    case "date_desc":
      return { sort_by: "applied_at", sort_dir: "desc" };
    case "date_asc":
      return { sort_by: "applied_at", sort_dir: "asc" };
    case "name_asc":
      return { sort_by: "name", sort_dir: "asc" };
    case "name_desc":
      return { sort_by: "name", sort_dir: "desc" };
    default:
      return { sort_by: "ai_score", sort_dir: "desc" };
  }
};

// Map UI tier to backend tier
const mapUITierToBackend = (uiTier: Tier): string => {
  switch (uiTier) {
    case "excellent_match":
      return "strong_match";
    case "good_match":
      return "good_match";
    case "average_match":
      return "moderate_match";
    case "poor_match":
      return "weak_match";
    case "mismatch":
      return "mismatch";
    default:
      return "";
  }
};

export interface UseCandidateListReturn {
  // Data
  candidates: CandidateListItem[];
  isLoading: boolean;
  error: string | null;

  // Filter state
  selectedTiers: Tier[];
  setSelectedTiers: (tiers: Tier[]) => void;
  selectedStatuses: ApplicationStatus[];
  setSelectedStatuses: (statuses: ApplicationStatus[]) => void;

  // Sort state
  sortOption: CandidateSortOption;
  setSortOption: (sort: CandidateSortOption) => void;

  // Pagination state
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalItems: number;
  pageSize: number;

  // Status update
  updatingStatusId: string | null;
  updateStatus: (candidateId: string, status: ApplicationStatus) => Promise<void>;

  // Actions
  refresh: () => void;
}

export function useCandidateList(jobId: string): UseCandidateListReturn {
  // Candidates data state
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<Tier[]>([]);

  // Sort state
  const [sortOption, setSortOption] = useState<CandidateSortOption>("score_desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Status update state
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Fetch candidates from API
  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { sort_by, sort_dir } = mapSortToAPI(sortOption);

      // API supports comma-separated statuses and tiers
      const statusFilter = selectedStatuses.length > 0 ? selectedStatuses.join(",") : undefined;
      const tierFilter = selectedTiers.length > 0
        ? selectedTiers.map(mapUITierToBackend).join(",")
        : undefined;

      const response = await api.applications.getJobApplications(jobId, {
        status: statusFilter,
        tier: tierFilter,
        sort_by,
        sort_dir,
        page: currentPage,
        limit: PAGINATION.DEFAULT_PAGE_SIZE,
      });

      // Transform API response to CandidateListItem format
      const items: CandidateListItem[] = (response.data as ApplicationListItem[]).map((app) => ({
        id: app.id,
        personalInfo: {
          full_name: `${app.first_name} ${app.last_name}`.trim(),
          email: app.email,
          phone: app.phone || undefined,
        },
        tier: mapBackendTierToUI(app.evaluation_tier),
        score: app.evaluation_score !== null ? app.evaluation_score * 10 : 0,
        appliedDate: app.applied_at,
        applicationStatus: app.status,
      }));

      setCandidates(items);
      setTotalItems(response.pagination?.total ?? items.length);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      setError("Failed to load candidates");
    } finally {
      setIsLoading(false);
    }
  }, [jobId, selectedStatuses, selectedTiers, sortOption, currentPage]);

  // Reset page to 1 when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatuses, selectedTiers, sortOption]);

  // Fetch candidates on mount and when dependencies change
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Handle status change - call API to update
  const updateStatus = useCallback(async (candidateId: string, status: ApplicationStatus) => {
    setUpdatingStatusId(candidateId);
    try {
      await api.applications.updateApplicationStatus(candidateId, status);
      // Update local state after success
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, applicationStatus: status } : c))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatusId(null);
    }
  }, []);

  return {
    // Data
    candidates,
    isLoading,
    error,

    // Filter state
    selectedTiers,
    setSelectedTiers,
    selectedStatuses,
    setSelectedStatuses,

    // Sort state
    sortOption,
    setSortOption,

    // Pagination state
    currentPage,
    setCurrentPage,
    totalItems,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,

    // Status update
    updatingStatusId,
    updateStatus,

    // Actions
    refresh: fetchCandidates,
  };
}
