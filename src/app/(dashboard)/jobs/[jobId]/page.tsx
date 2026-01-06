"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Job, Application, JobStats } from "@/types";
import { getJobById } from "@/lib/jobs";
import { getCandidatesByJobId, updateCandidateStatus } from "@/lib/candidates";
import { CandidateCard } from "@/components/shared/CandidateCard";
import { Button } from "@/components/ui/Button";
import { ApplicationDetailsDrawer } from "@/components/applications/ApplicationDetailsDrawer";
import { EvaluationProgressBanner } from "@/components/applications/evaluation";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { BulkEmailModal } from "@/components/applications/BulkEmailModal";
import showToast from "@/lib/toast";
import { api } from "@/lib/api-client";
import { getPublicJobUrl } from "@/lib/env";
import {
  ArrowLeftIcon,
  PencilIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type TabType = "overview" | "applications";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [stats, setStats] = useState<JobStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showMetricsInfo, setShowMetricsInfo] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Search and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "applied_at" | "name" | "status" | "ai_score"
  >("applied_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Multi-select for bulk email
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(
    new Set()
  );
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const loadData = async () => {
      if (jobId) {
        try {
          const jobData = await getJobById(jobId);
          setJob(jobData);
          // Load stats automatically
          loadStats();
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Authentication required")
          ) {
            window.location.href = "/sign-in";
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [jobId]);

  // Reset and load first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setCandidates([]);
    setHasMore(true);
  }, [debouncedSearch, statusFilter, sortBy, sortDir]);

  // Load candidates (initial load and infinite scroll)
  const loadCandidates = useCallback(
    async (page: number, append: boolean = false) => {
      if (!jobId) return;

      if (append) {
        setIsLoadingMore(true);
      }

      try {
        const params: {
          status?: string;
          search?: string;
          sort_by?: "applied_at" | "name" | "status" | "ai_score";
          sort_dir?: "asc" | "desc";
          page?: number;
          limit?: number;
        } = {
          page,
          limit: 20,
          sort_by: sortBy,
          sort_dir: sortDir,
        };
        if (statusFilter) {
          params.status = statusFilter;
        }
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const response = await getCandidatesByJobId(jobId, params);

        if (append) {
          setCandidates((prev) => [...prev, ...(response.data || [])]);
        } else {
          setCandidates(response.data || []);
        }

        if (response.pagination) {
          setHasMore(response.pagination.has_more);
          setTotalCandidates(response.pagination.total);
        }
      } finally {
        setIsLoadingMore(false);
      }
    },
    [jobId, statusFilter, debouncedSearch, sortBy, sortDir]
  );

  // Initial load and filter changes
  useEffect(() => {
    if (jobId && currentPage === 1) {
      loadCandidates(1, false);
    }
  }, [jobId, currentPage, loadCandidates]);

  // Load more when page changes (for infinite scroll)
  useEffect(() => {
    if (currentPage > 1) {
      loadCandidates(currentPage, true);
    }
  }, [currentPage, loadCandidates]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  // Poll for new applicants and evaluation updates
  useEffect(() => {
    if (!jobId || activeTab !== "applications") return;

    const pollInterval = setInterval(async () => {
      try {
        // Only poll first page to check for new applicants and score updates
        const params: {
          status?: string;
          search?: string;
          sort_by?: "applied_at" | "name" | "status" | "ai_score";
          sort_dir?: "asc" | "desc";
          page?: number;
          limit?: number;
        } = {
          page: 1,
          limit: 20,
          sort_by: sortBy,
          sort_dir: sortDir,
        };
        if (statusFilter) {
          params.status = statusFilter;
        }
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const response = await getCandidatesByJobId(jobId, params);

        if (response.data && response.data.length > 0) {
          // Update candidates on first page (this includes new applicants and score updates)
          setCandidates((prev) => {
            // If we're on page 1, replace the first page data
            if (currentPage === 1) {
              return response.data || [];
            } else {
              // For other pages, merge smartly - update existing, prepend new
              const existingIds = new Set(prev.map((c) => c.id));
              const newCandidates = (response.data || []).filter(
                (c) => !existingIds.has(c.id)
              );

              // Update existing candidates with fresh data
              const updatedPrev = prev.map((candidate) => {
                const freshData = response.data?.find(
                  (c) => c.id === candidate.id
                );
                return freshData || candidate;
              });

              return [...newCandidates, ...updatedPrev];
            }
          });

          // Update total count
          if (response.pagination) {
            setTotalCandidates(response.pagination.total);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [
    jobId,
    activeTab,
    currentPage,
    statusFilter,
    debouncedSearch,
    sortBy,
    sortDir,
  ]);

  const handleCandidateStatusChange = async (
    candidateId: string,
    newStatus: Application["status"]
  ) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId
            ? {
                ...candidate,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : candidate
        )
      );
    } catch {
      showToast.error("Failed to update candidate status");
    }
  };

  const handleViewApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsDrawerOpen(true);
  };

  // Update candidate in list when application data changes (e.g., evaluation completes)
  const handleApplicationUpdate = (updatedApplication: Application) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === updatedApplication.id ? updatedApplication : candidate
      )
    );
  };

  const loadStats = async () => {
    if (!jobId || statsLoading) return;
    setStatsLoading(true);
    try {
      const statsData = await api.jobs.getJobStats(jobId);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load job stats:", error);
      showToast.error("Failed to load statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  // Auto-expand left sidebar when drawer closes
  useEffect(() => {
    if (!isDrawerOpen) {
      setIsLeftSidebarCollapsed(false);
    }
  }, [isDrawerOpen]);

  // Multi-select handlers
  const selectedCandidates = useMemo(
    () => candidates.filter((c) => selectedCandidateIds.has(c.id)),
    [candidates, selectedCandidateIds]
  );

  const handleToggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      // Clear selections when exiting select mode
      setSelectedCandidateIds(new Set());
    }
  };

  const handleToggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidateIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  const handleSelectAllCandidates = () => {
    if (selectedCandidateIds.size === candidates.length) {
      // Deselect all
      setSelectedCandidateIds(new Set());
    } else {
      // Select all
      setSelectedCandidateIds(new Set(candidates.map((c) => c.id)));
    }
  };

  const handleBulkEmailSuccess = () => {
    setSelectedCandidateIds(new Set());
    setIsSelectMode(false);
    setIsBulkEmailModalOpen(false);
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (newStatus: Application["status"]) => {
    if (selectedCandidateIds.size === 0) return;

    const selectedIds = Array.from(selectedCandidateIds);
    let successCount = 0;

    for (const candidateId of selectedIds) {
      try {
        await updateCandidateStatus(candidateId, newStatus);
        successCount++;
      } catch (error) {
        console.error(`Failed to update status for ${candidateId}:`, error);
      }
    }

    // Update local state
    setCandidates((prev) =>
      prev.map((candidate) =>
        selectedCandidateIds.has(candidate.id)
          ? {
              ...candidate,
              status: newStatus,
              updated_at: new Date().toISOString(),
            }
          : candidate
      )
    );

    if (successCount > 0) {
      // Show toast with action to send bulk email
      showToast.withAction(
        `Updated ${successCount} candidate${successCount > 1 ? "s" : ""} to ${newStatus}`,
        "Send Email",
        () => setIsBulkEmailModalOpen(true),
        { duration: 8000 }
      );
    }

    if (successCount < selectedIds.length) {
      showToast.error(
        `Failed to update ${selectedIds.length - successCount} candidate(s)`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-semibold text-gray-900">Job not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The job posting you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
        <div className="mt-6">
          <Link href="/jobs">
            <Button>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const publicUrl = getPublicJobUrl(job.slug);

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg shadow px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Left side: Back button + Title + Status */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Link href="/jobs">
              <button
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                title="Back to jobs"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </Link>

            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-base font-semibold text-gray-900 truncate">
                {job.title}
              </h1>
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                  job.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {job.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Right side: Tabs + Edit button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === "overview"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === "applications"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Applications ({candidates.length})
              </button>
            </div>

            <Link href={`/jobs/${job.id}/edit`}>
              <button
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                title="Edit job"
              >
                <PencilIcon className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : stats ? (
            <>
              {/* Applications Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Hero Card - Total Applications */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 lg:col-span-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Total applications
                    </span>
                  </div>
                  <div className="text-6xl font-semibold text-gray-900 mb-2">
                    {stats.applications.total}
                  </div>
                  <p className="text-sm text-gray-600">
                    All-time applications for this position
                  </p>
                </div>

                {/* Smaller Cards Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Today */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <span className="text-sm font-medium text-gray-700">
                      New today
                    </span>
                    <div className="text-4xl font-semibold text-gray-900 mt-3">
                      {stats.applications.today}
                    </div>
                  </div>

                  {/* This Week */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <span className="text-sm font-medium text-gray-700">
                      This week
                    </span>
                    <div className="text-4xl font-semibold text-gray-900 mt-3">
                      {stats.applications.this_week}
                    </div>
                  </div>

                  {/* This Month */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <span className="text-sm font-medium text-gray-700">
                      This month
                    </span>
                    <div className="text-4xl font-semibold text-gray-900 mt-3">
                      {stats.applications.this_month}
                    </div>
                  </div>

                  {/* Views */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <span className="text-sm font-medium text-gray-700">
                      Total views
                    </span>
                    <div className="text-4xl font-semibold text-blue-600 mt-3">
                      {stats.views.total}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hiring Funnel */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Hiring Funnel
                  </h3>
                  <button
                    onClick={() => setShowMetricsInfo(true)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="View metrics information"
                  >
                    <InformationCircleIcon className="h-5 w-5" />
                  </button>
                </div>

                {(() => {
                  // Calculate max value for y-axis scaling
                  const values = [
                    stats.views.total,
                    stats.applications.total,
                    stats.applications.by_status.screening,
                    stats.applications.by_status.interviewing,
                    stats.applications.by_status.offer,
                    stats.applications.by_status.hired,
                  ];
                  const maxValue = Math.max(...values, 1);
                  const chartHeight = 300; // Fixed chart height in pixels

                  const stages = [
                    {
                      label: "Views",
                      count: stats.views.total,
                      color: "bg-blue-100",
                      textColor: "text-gray-900",
                      percentage: 100.0,
                    },
                    {
                      label: "Applied",
                      count: stats.applications.total,
                      color: "bg-blue-200",
                      textColor: "text-gray-900",
                      percentage: stats.quality.application_rate,
                    },
                    {
                      label: "Screening",
                      count: stats.applications.by_status.screening,
                      color: "bg-blue-300",
                      textColor: "text-gray-900",
                      percentage: stats.quality.screening_rate,
                    },
                    {
                      label: "Interviewing",
                      count: stats.applications.by_status.interviewing,
                      color: "bg-blue-400",
                      textColor: "text-gray-900",
                      percentage: stats.quality.interview_rate,
                    },
                    {
                      label: "Offer",
                      count: stats.applications.by_status.offer,
                      color: "bg-blue-500",
                      textColor: "text-white",
                      percentage: stats.quality.offer_rate,
                    },
                    {
                      label: "Hired",
                      count: stats.applications.by_status.hired,
                      color: "bg-blue-600",
                      textColor: "text-white",
                      percentage: stats.quality.hire_rate,
                    },
                  ];

                  return (
                    <div className="space-y-6">
                      {/* Chart Area */}
                      <div
                        className="relative"
                        style={{ height: `${chartHeight + 60}px` }}
                      >
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-14 flex flex-col justify-between text-xs text-gray-500 pr-2">
                          {[
                            maxValue,
                            Math.ceil(maxValue * 0.75),
                            Math.ceil(maxValue * 0.5),
                            Math.ceil(maxValue * 0.25),
                            0,
                          ].map((val, idx) => (
                            <span key={idx}>{val}</span>
                          ))}
                        </div>

                        {/* Chart bars container */}
                        <div className="ml-12 h-full flex items-end justify-between gap-4 pr-4">
                          {stages.map((stage) => {
                            const barHeight =
                              (stage.count / maxValue) * chartHeight;
                            const minBarHeight =
                              stage.count > 0 ? Math.max(barHeight, 20) : 0;

                            return (
                              <div
                                key={stage.label}
                                className="flex-1 flex flex-col items-center group"
                              >
                                {/* Bar */}
                                <div
                                  className={`${stage.color} rounded-t-lg w-full transition-all hover:opacity-80 relative flex flex-col justify-end`}
                                  style={{
                                    height: `${minBarHeight}px`,
                                    minHeight: stage.count > 0 ? "20px" : "0px",
                                  }}
                                >
                                  {/* Count label on bar */}
                                  {stage.count > 0 && (
                                    <div
                                      className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${stage.textColor} text-sm font-semibold whitespace-nowrap`}
                                    >
                                      {stage.count}
                                    </div>
                                  )}
                                </div>

                                {/* X-axis label */}
                                <div className="mt-4 text-center">
                                  <div className="text-sm font-medium text-gray-700">
                                    {stage.label}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {stage.percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Summary Stats */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Conversion Rate
                      </div>
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.pipeline.conversion_rate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Avg Time to Hire
                      </div>
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.pipeline.avg_time_to_hire_days
                          ? `${Math.round(stats.pipeline.avg_time_to_hire_days)}d`
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Total Rejected
                      </div>
                      <div className="text-2xl font-semibold text-orange-600">
                        {stats.applications.by_status.rejected}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Success Rate
                      </div>
                      <div className="text-2xl font-semibold text-green-600">
                        {stats.applications.total > 0
                          ? (
                              (stats.applications.by_status.hired /
                                stats.applications.total) *
                              100
                            ).toFixed(1)
                          : "0.0"}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity & Pipeline Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Days Since Published */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <span className="text-sm font-medium text-gray-700">
                    Days since published
                  </span>
                  <div className="text-4xl font-semibold text-gray-900 mt-3">
                    {stats.activity.days_since_published}
                  </div>
                </div>

                {/* Days Since Last Application */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <span className="text-sm font-medium text-gray-700">
                    Days since last app
                  </span>
                  <div className="text-4xl font-semibold text-gray-900 mt-3">
                    {stats.activity.days_since_last_application ?? "—"}
                  </div>
                  {stats.activity.is_recently_active && (
                    <span className="inline-flex mt-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Recently Active
                    </span>
                  )}
                </div>

                {/* Conversion Rate */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <span className="text-sm font-medium text-gray-700">
                    Conversion rate
                  </span>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 my-4">
                    <div
                      className="h-1.5 rounded-full bg-green-600 transition-all"
                      style={{
                        width: `${Math.min(stats.pipeline.conversion_rate, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-3xl font-semibold text-gray-900">
                    {stats.pipeline.conversion_rate.toFixed(1)}%
                  </div>
                </div>

                {/* Avg Time to Hire */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <span className="text-sm font-medium text-gray-700">
                    Avg time to hire
                  </span>
                  <div className="text-4xl font-semibold text-gray-900 mt-3">
                    {stats.pipeline.avg_time_to_hire_days
                      ? `${Math.round(stats.pipeline.avg_time_to_hire_days)}d`
                      : "—"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-700">
                Failed to load statistics
              </p>
            </div>
          )}

          {/* Job Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Job Description */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Job Description
                  </h3>
                  {job.description ? (
                    <MarkdownRenderer
                      content={job.description}
                      className="prose max-w-none text-sm text-gray-700"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      No description provided
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Quick Stats
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Applications
                      </dt>
                      <dd className="mt-1 text-2xl font-semibold text-gray-900">
                        {candidates.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        New Today
                      </dt>
                      <dd className="mt-1 text-2xl font-semibold text-gray-900">
                        {
                          candidates.filter((c) => {
                            const createdDate = c.created_at || c.applied_at;
                            return (
                              createdDate &&
                              new Date(createdDate).toDateString() ===
                                new Date().toDateString()
                            );
                          }).length
                        }
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Status
                      </dt>
                      <dd className="mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            job.status === "active"
                              ? "bg-green-100 text-green-800"
                              : job.status === "draft"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {job.status === "active"
                            ? "Active"
                            : job.status === "draft"
                              ? "Draft"
                              : "Closed"}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Public Link */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Public Application Link
                  </h3>
                  <div className="space-y-3">
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 break-all">
                        {publicUrl}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(publicUrl);
                          showToast.success("Link copied to clipboard!");
                        }}
                      >
                        Copy Link
                      </Button>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          Preview
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Info Modal */}
      {showMetricsInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setShowMetricsInfo(false)}
        >
          <div
            className="w-full max-w-2xl rounded-lg p-6 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--color-bg-surface)",
              boxShadow: "var(--shadow-xl)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-xl font-semibold mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              Hiring Metrics Explained
            </h3>

            <div className="space-y-4">
              {/* Key Metrics */}
              <div>
                <h4
                  className="text-sm font-semibold mb-3"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Key Metrics
                </h4>
                <div className="space-y-3">
                  <div>
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Conversion Rate
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Percentage of applicants who were hired. Calculated as
                      (Hired / Total Applications) × 100. Higher is better.
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Average Time to Hire
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Average number of days from application to hire. Lower is
                      generally better for efficiency.
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Success Rate
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Percentage of applications that result in a hire.
                      Indicates the quality of your candidate pipeline.
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Total Rejected
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Total number of candidates who were rejected at any stage
                      of the hiring process.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stage Percentages */}
              <div
                className="pt-4 border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                <h4
                  className="text-sm font-semibold mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Stage Percentages
                </h4>
                <div
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <p>
                    Each funnel stage shows a percentage indicating the
                    conversion rate from the previous stage. These help identify
                    where candidates are dropping off in your hiring process.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowMetricsInfo(false)}
                className="flex-1"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "applications" && (
        <div className="space-y-4">
          {/* Evaluation Progress Banner */}
          <EvaluationProgressBanner
            jobId={jobId}
            isCalibrated={!!job.calibrated_at}
            onEvaluationComplete={() => {
              // Refresh the candidates list when evaluation completes
              loadCandidates(1, false);
            }}
          />

          <div className="flex gap-4 h-[calc(100vh-200px)]">
            {/* Applications List */}
            <div
              className={`bg-white shadow rounded-lg transition-all duration-300 h-full ${
                isLeftSidebarCollapsed
                  ? "w-12"
                  : isDrawerOpen
                    ? "w-[35%]"
                    : "w-1/2"
              }`}
            >
              {isLeftSidebarCollapsed ? (
                // Collapsed state - show expand button
                <div className="h-full flex items-center justify-center">
                  <button
                    onClick={() => setIsLeftSidebarCollapsed(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Expand sidebar"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="p-3 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isDrawerOpen && (
                        <button
                          onClick={() => setIsLeftSidebarCollapsed(true)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Collapse sidebar"
                        >
                          <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
                        </button>
                      )}
                      <h3 className="text-base font-semibold text-gray-900">
                        Applications
                        <span className="ml-1 text-sm font-normal text-gray-500">
                          ({totalCandidates})
                        </span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Filter Popover */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className={`relative h-8 px-3 text-sm font-medium rounded-md transition-colors inline-flex items-center gap-1.5 ${
                              debouncedSearch ||
                              statusFilter ||
                              sortBy !== "applied_at" ||
                              sortDir !== "desc"
                                ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            <FunnelIcon className="h-4 w-4" />
                            <span>Filter</span>
                            {(debouncedSearch ||
                              statusFilter ||
                              sortBy !== "applied_at" ||
                              sortDir !== "desc") && (
                              <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] font-bold bg-blue-600 text-white rounded-full flex items-center justify-center">
                                {
                                  [
                                    debouncedSearch,
                                    statusFilter,
                                    sortBy !== "applied_at" ||
                                      sortDir !== "desc",
                                  ].filter(Boolean).length
                                }
                              </span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-72 p-4">
                          <div className="space-y-4">
                            {/* Search */}
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Search
                              </label>
                              <div className="relative mt-1.5">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Name or email..."
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                  className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                              </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Status
                              </label>
                              <select
                                className="mt-1.5 w-full h-9 text-sm border border-gray-300 rounded-lg px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={statusFilter}
                                onChange={(e) =>
                                  setStatusFilter(e.target.value)
                                }
                              >
                                <option value="">All Statuses</option>
                                <option value="applied">Applied</option>
                                <option value="screening">Screening</option>
                                <option value="interviewing">
                                  Interviewing
                                </option>
                                <option value="offer">Offer</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>

                            {/* Sort */}
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Sort By
                              </label>
                              <select
                                className="mt-1.5 w-full h-9 text-sm border border-gray-300 rounded-lg px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={`${sortBy}-${sortDir}`}
                                onChange={(e) => {
                                  const [newSortBy, newSortDir] =
                                    e.target.value.split("-") as [
                                      (
                                        | "applied_at"
                                        | "name"
                                        | "status"
                                        | "ai_score"
                                      ),
                                      "asc" | "desc",
                                    ];
                                  setSortBy(newSortBy);
                                  setSortDir(newSortDir);
                                }}
                              >
                                <option value="applied_at-desc">
                                  Newest First
                                </option>
                                <option value="applied_at-asc">
                                  Oldest First
                                </option>
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="ai_score-desc">
                                  Score (High-Low)
                                </option>
                                <option value="ai_score-asc">
                                  Score (Low-High)
                                </option>
                                <option value="status-asc">Status (A-Z)</option>
                              </select>
                            </div>

                            {/* Clear Filters */}
                            {(debouncedSearch ||
                              statusFilter ||
                              sortBy !== "applied_at" ||
                              sortDir !== "desc") && (
                              <button
                                onClick={() => {
                                  setSearchQuery("");
                                  setStatusFilter("");
                                  setSortBy("applied_at");
                                  setSortDir("desc");
                                }}
                                className="w-full h-9 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                              >
                                <XMarkIcon className="h-4 w-4" />
                                Clear Filters
                              </button>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>

                      <button
                        onClick={handleToggleSelectMode}
                        className={`h-8 px-3 text-sm font-medium rounded-md transition-colors ${
                          isSelectMode
                            ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        {isSelectMode ? "Cancel" : "Select"}
                      </button>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(debouncedSearch || statusFilter) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {debouncedSearch && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                          Search: {debouncedSearch}
                          <button
                            onClick={() => setSearchQuery("")}
                            className="hover:bg-blue-100 rounded-full p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      {statusFilter && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full capitalize">
                          {statusFilter}
                          <button
                            onClick={() => setStatusFilter("")}
                            className="hover:bg-blue-100 rounded-full p-0.5"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bulk Action Bar */}
                  {isSelectMode && (
                    <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              selectedCandidateIds.size === candidates.length &&
                              candidates.length > 0
                            }
                            onChange={handleSelectAllCandidates}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            All
                          </span>
                        </label>
                        <span className="text-sm text-gray-500">
                          {selectedCandidateIds.size} selected
                        </span>
                      </div>
                      {selectedCandidateIds.size > 0 && (
                        <select
                          className="h-8 text-sm border border-gray-300 rounded-md px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleBulkStatusChange(
                                e.target.value as Application["status"]
                              );
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">Change Status</option>
                          <option value="screening">Screening</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offer">Offer</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      )}
                    </div>
                  )}

                  {candidates.length === 0 && !isLoadingMore ? (
                    <div className="text-center py-12">
                      <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h4 className="mt-2 text-sm font-semibold text-gray-900">
                        {debouncedSearch || statusFilter
                          ? "No matching applications"
                          : "No applications yet"}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {debouncedSearch || statusFilter
                          ? "Try adjusting your search or filters."
                          : "Applications will appear here once candidates start applying to this job."}
                      </p>
                      {!debouncedSearch && !statusFilter && (
                        <div className="mt-4">
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              Share Job Posting
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-3">
                      {candidates.map((candidate, index) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          rank={index + 1}
                          onStatusChange={handleCandidateStatusChange}
                          onClick={() => handleViewApplication(candidate.id)}
                          isSelected={selectedApplicationId === candidate.id}
                          isSelectMode={isSelectMode}
                          isChecked={selectedCandidateIds.has(candidate.id)}
                          onToggleSelect={() =>
                            handleToggleCandidateSelection(candidate.id)
                          }
                        />
                      ))}

                      {/* Infinite scroll trigger and loading indicator */}
                      <div ref={loadMoreRef} className="py-4">
                        {isLoadingMore && (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-500">
                              Loading more...
                            </span>
                          </div>
                        )}
                        {!hasMore && candidates.length > 0 && (
                          <p className="text-center text-sm text-gray-400">
                            All {totalCandidates} applications loaded
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Placeholder when no application is selected */}
            {!isDrawerOpen && !isLeftSidebarCollapsed && (
              <div className="w-1/2 h-full bg-white shadow rounded-lg flex items-center justify-center">
                <div className="text-center px-8">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Application Selected
                  </h3>
                  <p className="text-sm text-gray-500">
                    Click on &quot;View details&quot; on any candidate card to
                    see their full application details here
                  </p>
                </div>
              </div>
            )}

            {/* Application Details Panel */}
            {isDrawerOpen && selectedApplicationId && (
              <div
                className={`h-full bg-white shadow rounded-lg overflow-y-auto relative transition-all duration-300 ${
                  isLeftSidebarCollapsed
                    ? "w-[calc(100%-3rem-1rem)]"
                    : "w-[65%]"
                }`}
              >
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setSelectedApplicationId(null);
                    setIsLeftSidebarCollapsed(false);
                  }}
                  className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <ApplicationDetailsDrawer
                  applicationId={selectedApplicationId}
                  onStatusChange={handleCandidateStatusChange}
                  onApplicationUpdate={handleApplicationUpdate}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Email Modal */}
      <BulkEmailModal
        isOpen={isBulkEmailModalOpen}
        onClose={() => setIsBulkEmailModalOpen(false)}
        selectedCandidates={selectedCandidates}
        onSuccess={handleBulkEmailSuccess}
      />
    </div>
  );
}
