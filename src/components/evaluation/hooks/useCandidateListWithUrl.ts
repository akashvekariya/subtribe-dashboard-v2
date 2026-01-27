import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import type { ApplicationStatus, Tier, CandidateSortOption } from "../types";
import type { CandidateListItem } from "../CandidateList";
import { mapBackendTierToUI } from "../utils";
import { PAGINATION } from "@/lib/constants";
import type { UseCandidateListReturn } from "./useCandidateList";

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
): {
  sort_by: "ai_score" | "applied_at" | "name";
  sort_dir: "asc" | "desc";
} => {
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

// Parse URL params
const parseTiersFromUrl = (param: string | null): Tier[] => {
  if (!param) return [];
  const validTiers: Tier[] = [
    "excellent_match",
    "good_match",
    "average_match",
    "poor_match",
    "mismatch",
  ];
  return param
    .split(",")
    .filter((t) => validTiers.includes(t as Tier)) as Tier[];
};

const parseStatusesFromUrl = (param: string | null): ApplicationStatus[] => {
  if (!param) return [];
  const validStatuses: ApplicationStatus[] = [
    "applied",
    "screening",
    "interviewing",
    "offer",
    "hired",
    "rejected",
  ];
  return param
    .split(",")
    .filter((s) =>
      validStatuses.includes(s as ApplicationStatus)
    ) as ApplicationStatus[];
};

const parseSortFromUrl = (param: string | null): CandidateSortOption => {
  const validSorts: CandidateSortOption[] = [
    "score_desc",
    "score_asc",
    "date_desc",
    "date_asc",
    "name_asc",
    "name_desc",
  ];
  if (param && validSorts.includes(param as CandidateSortOption)) {
    return param as CandidateSortOption;
  }
  return "score_desc";
};

const parsePageFromUrl = (param: string | null): number => {
  const page = parseInt(param || "1", 10);
  return isNaN(page) || page < 1 ? 1 : page;
};

/**
 * Hook that syncs candidate list state with URL params
 */
export function useCandidateListWithUrl(jobId: string): UseCandidateListReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse initial state from URL
  const initialTiers = parseTiersFromUrl(searchParams.get("tier"));
  const initialStatuses = parseStatusesFromUrl(searchParams.get("status"));
  const initialSort = parseSortFromUrl(searchParams.get("sort"));
  const initialPage = parsePageFromUrl(searchParams.get("page"));

  // Candidates data state
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state - initialized from URL
  const [selectedStatuses, setSelectedStatusesState] =
    useState<ApplicationStatus[]>(initialStatuses);
  const [selectedTiers, setSelectedTiersState] = useState<Tier[]>(initialTiers);

  // Sort state - initialized from URL
  const [sortOption, setSortOptionState] =
    useState<CandidateSortOption>(initialSort);

  // Pagination state - initialized from URL
  const [currentPage, setCurrentPageState] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);

  // Status update state
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Update URL when filters/sort/page change
  const updateUrl = useCallback(
    (params: {
      tiers?: Tier[];
      statuses?: ApplicationStatus[];
      sort?: CandidateSortOption;
      page?: number;
    }) => {
      const newParams = new URLSearchParams(searchParams.toString());

      if (params.tiers !== undefined) {
        if (params.tiers.length > 0) {
          newParams.set("tier", params.tiers.join(","));
        } else {
          newParams.delete("tier");
        }
      }

      if (params.statuses !== undefined) {
        if (params.statuses.length > 0) {
          newParams.set("status", params.statuses.join(","));
        } else {
          newParams.delete("status");
        }
      }

      if (params.sort !== undefined) {
        if (params.sort !== "score_desc") {
          newParams.set("sort", params.sort);
        } else {
          newParams.delete("sort");
        }
      }

      if (params.page !== undefined) {
        if (params.page > 1) {
          newParams.set("page", params.page.toString());
        } else {
          newParams.delete("page");
        }
      }

      const queryString = newParams.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Wrapped setters that also update URL
  const setSelectedTiers = useCallback(
    (tiers: Tier[]) => {
      setSelectedTiersState(tiers);
      setCurrentPageState(1);
      updateUrl({ tiers, page: 1 });
    },
    [updateUrl]
  );

  const setSelectedStatuses = useCallback(
    (statuses: ApplicationStatus[]) => {
      setSelectedStatusesState(statuses);
      setCurrentPageState(1);
      updateUrl({ statuses, page: 1 });
    },
    [updateUrl]
  );

  const setSortOption = useCallback(
    (sort: CandidateSortOption) => {
      setSortOptionState(sort);
      setCurrentPageState(1);
      updateUrl({ sort, page: 1 });
    },
    [updateUrl]
  );

  const setCurrentPage = useCallback(
    (page: number) => {
      setCurrentPageState(page);
      updateUrl({ page });
    },
    [updateUrl]
  );

  // Fetch candidates from API
  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { sort_by, sort_dir } = mapSortToAPI(sortOption);

      // API supports comma-separated statuses and tiers
      const statusFilter =
        selectedStatuses.length > 0 ? selectedStatuses.join(",") : undefined;
      const tierFilter =
        selectedTiers.length > 0
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
      const items: CandidateListItem[] = (
        response.data as ApplicationListItem[]
      ).map((app) => ({
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

  // Fetch candidates on mount and when dependencies change
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Handle status change - call API to update
  const updateStatus = useCallback(
    async (candidateId: string, status: ApplicationStatus, notes?: string) => {
      setUpdatingStatusId(candidateId);
      try {
        await api.applications.updateApplicationStatus(
          candidateId,
          status,
          notes
        );
        // Update local state after success
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId ? { ...c, applicationStatus: status } : c
          )
        );
      } catch (err) {
        console.error("Failed to update status:", err);
      } finally {
        setUpdatingStatusId(null);
      }
    },
    []
  );

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
