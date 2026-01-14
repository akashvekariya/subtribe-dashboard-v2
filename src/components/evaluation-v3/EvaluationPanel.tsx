"use client";

import React, { memo, useState, useCallback, useEffect } from "react";
import { ChevronLeftIcon } from "./icons";
import { EvaluationTabs, type TabId } from "./EvaluationTabs";
import { CandidateList, type CandidateListItem } from "./CandidateList";
import { mapBackendTierToUI } from "./utils";
import { api } from "@/lib/api-client";
import type { ApplicationStatus, Tier, CandidateSortOption } from "./types";
import "./styles.css";

interface EvaluationPanelProps {
  jobId: string;
}

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

const EvaluationPanel = memo(({ jobId }: EvaluationPanelProps) => {
  const [currentCandidateId, setCurrentCandidateId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<TabId>("ai");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Candidates list state
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Filter/sort state (controlled from here, passed to CandidateList)
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>(
    []
  );
  const [selectedTiers, setSelectedTiers] = useState<Tier[]>([]);
  const [sortOption, setSortOption] =
    useState<CandidateSortOption>("score_desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Set theme-color meta tag for mobile browsers
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", "#ffffff");
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = "#ffffff";
      document.head.appendChild(meta);
    }
  }, []);

  // Fetch candidates from API
  const fetchCandidates = useCallback(
    async (
      statuses: ApplicationStatus[],
      tiers: Tier[],
      sort: CandidateSortOption,
      page: number
    ) => {
      setIsListLoading(true);
      setListError(null);

      try {
        const { sort_by, sort_dir } = mapSortToAPI(sort);

        // API supports comma-separated statuses and tiers
        const statusFilter =
          statuses.length > 0 ? statuses.join(",") : undefined;
        const tierFilter =
          tiers.length > 0
            ? tiers.map(mapUITierToBackend).join(",")
            : undefined;

        const response = await api.applications.getJobApplications(jobId, {
          status: statusFilter,
          tier: tierFilter,
          sort_by,
          sort_dir,
          page,
          limit: 20,
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
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
        setListError("Failed to load candidates");
      } finally {
        setIsListLoading(false);
      }
    },
    [jobId]
  );

  // Reset page to 1 when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatuses, selectedTiers, sortOption]);

  // Fetch candidates on mount and when filters/sort/page change
  useEffect(() => {
    fetchCandidates(selectedStatuses, selectedTiers, sortOption, currentPage);
  }, [
    fetchCandidates,
    selectedStatuses,
    selectedTiers,
    sortOption,
    currentPage,
  ]);

  // Handle status change - call API to update
  const handleStatusChange = useCallback(
    async (candidateId: string, status: ApplicationStatus) => {
      setUpdatingStatusId(candidateId);
      try {
        await api.applications.updateApplicationStatus(candidateId, status);
        // Update local state after success
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId ? { ...c, applicationStatus: status } : c
          )
        );
      } catch (error) {
        console.error("Failed to update status:", error);
      } finally {
        setUpdatingStatusId(null);
      }
    },
    []
  );

  // Close mobile detail panel
  const closeMobileDetail = useCallback(() => {
    setIsMobileDetailOpen(false);
  }, []);

  // Select a candidate (details not implemented yet)
  const selectCandidate = useCallback((id: string) => {
    setIsMobileDetailOpen(true);
    setActiveTab("ai");
    setCurrentCandidateId(id);
  }, []);

  // Find selected candidate for email/phone actions
  const selectedCandidate = candidates.find((c) => c.id === currentCandidateId);

  return (
    <div className="eval-panel-inline">
      {/* Two Column Layout */}
      <div className="eval-layout-container">
        {/* Left Sidebar - Candidate List */}
        <div className="eval-layout-sidebar">
          {listError ? (
            <div className="p-4 text-center">
              <p className="text-red-500 text-sm">{listError}</p>
              <button
                onClick={() =>
                  fetchCandidates(
                    selectedStatuses,
                    selectedTiers,
                    sortOption,
                    currentPage
                  )
                }
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <CandidateList
              candidates={candidates}
              selectedId={currentCandidateId}
              onSelect={selectCandidate}
              onEmailClick={(c) => {
                if (c.personalInfo.email) {
                  window.open(`mailto:${c.personalInfo.email}`, "_blank");
                }
              }}
              onPhoneClick={(c) => {
                if (c.personalInfo.phone) {
                  window.open(`tel:${c.personalInfo.phone}`, "_blank");
                }
              }}
              onResumeClick={(c) => {
                selectCandidate(c.id);
                setActiveTab("resume");
              }}
              onStatusChange={handleStatusChange}
              updatingStatusId={updatingStatusId}
              isLoading={isListLoading}
              title="Candidates"
              // Controlled filter/sort props
              selectedTiers={selectedTiers}
              onTiersChange={setSelectedTiers}
              selectedStatuses={selectedStatuses}
              onStatusesChange={setSelectedStatuses}
              sortOption={sortOption}
              onSortChange={setSortOption}
              // Controlled pagination props
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
            />
          )}
        </div>

        {/* Main Content */}
        <div
          className={`eval-layout-main ${isMobileDetailOpen ? "mobile-detail-open" : ""}`}
        >
          {/* Mobile header with back button and tabs */}
          <div className="eval-mobile-header">
            <button className="eval-mobile-back" onClick={closeMobileDetail}>
              <ChevronLeftIcon strokeWidth={2} />
            </button>
            <div className="eval-mobile-tabs">
              <button
                className={`eval-mobile-tab ${activeTab === "ai" ? "eval-mobile-tab-active" : ""}`}
                onClick={() => setActiveTab("ai")}
              >
                AI Evaluation
              </button>
              <button
                className={`eval-mobile-tab ${activeTab === "resume" ? "eval-mobile-tab-active" : ""}`}
                onClick={() => setActiveTab("resume")}
              >
                Resume
              </button>
            </div>
          </div>

          {/* Placeholder - candidate details not implemented yet */}
          <div className="eval-tabs-container">
            <EvaluationTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="eval-tabs-content">
              <div className="text-center py-20">
                {currentCandidateId ? (
                  <>
                    <p className="text-zinc-600 text-lg font-medium">
                      {selectedCandidate?.personalInfo.full_name || "Candidate"}
                    </p>
                    <p className="text-zinc-400 text-sm mt-2">
                      Detailed evaluation view coming soon
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-zinc-400 text-lg">
                      Select a candidate to view details
                    </p>
                    <p className="text-zinc-400 text-sm mt-2">
                      Click on a candidate from the list
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

EvaluationPanel.displayName = "EvaluationPanel";

export default EvaluationPanel;
