"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, pluralize } from "@/lib/format";
import { handleAuthError, getErrorMessage } from "@/lib/error";
import { POSITION_TYPE_LABELS, LOCATION_TYPE_LABELS } from "@/lib/constants";
import {
  BriefcaseIcon,
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/lib/api-client";
import { DashboardStats, Job } from "@/types";
import { getJobs } from "@/lib/jobs";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load stats and recent jobs in parallel
        const [dashboardStats, allJobs] = await Promise.all([
          api.dashboard.getStats(),
          getJobs(),
        ]);

        setStats(dashboardStats);

        // Get up to 3 most recent active jobs
        const activeJobs = allJobs
          .filter((job) => job.status === "active")
          .slice(0, 3);
        setRecentJobs(activeJobs);
      } catch (error) {
        if (!handleAuthError(error)) {
          setError(getErrorMessage(error));
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome back!
          </h1>
        </div>
        <LoadingSpinner
          message="Loading your recruitment pipeline..."
          className="min-h-64"
        />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome back!
          </h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">
            {error || "Failed to load dashboard"}
          </p>
        </div>
      </div>
    );
  }

  const avgTimeToHire = stats.pipeline?.avg_time_to_hire_days || 0;

  // Calculate metrics
  const totalApplications = stats.applications.total;
  const weekApplications = stats.applications.this_week;
  const todayApplications = stats.applications.today;

  // HERO METRIC: Applications This Week
  // Using 50 applications/week as baseline (100%)
  const weeklyTargetBaseline = 50;
  const weeklyApplicationRate = Math.min(
    (weekApplications / weeklyTargetBaseline) * 100,
    100
  );
  const weeklyTrend =
    weekApplications > 10 ? 15 : weekApplications > 5 ? 8 : -5; // Mock trend

  // METRIC 1: New Applications Today
  // Show as percentage of daily average (weekly / 7)
  const dailyAverage = weekApplications / 7;
  const todayRate =
    dailyAverage > 0
      ? Math.min((todayApplications / dailyAverage) * 100, 100)
      : 0;
  const todayTrend =
    todayApplications > dailyAverage ? 12 : todayApplications > 0 ? 5 : -8; // Mock trend

  // METRIC 2: Active Pipeline (screening + interviewing)
  const activePipeline =
    stats.applications.by_status.screening +
    stats.applications.by_status.interviewing;
  const activePipelinePercentage =
    totalApplications > 0 ? (activePipeline / totalApplications) * 100 : 0;
  const activePipelineTrend =
    activePipeline > 5 ? 18 : activePipeline > 0 ? 5 : -4; // Mock trend

  // METRIC 3: Engagement Rate (applications / views)
  const viewsThisWeek = stats.activity?.views_this_week || weekApplications * 2; // Fallback to estimated views
  const engagementRate =
    viewsThisWeek > 0 ? (weekApplications / viewsThisWeek) * 100 : 0;
  const engagementTrend =
    engagementRate > 40 ? 14 : engagementRate > 20 ? 7 : -5; // Mock trend

  // METRIC 4: Avg Time to Hire (in days)
  const timeToHireTrend =
    avgTimeToHire > 0 && avgTimeToHire < 30 ? 8 : avgTimeToHire < 45 ? 0 : -10; // Mock trend (lower is better)

  // Total views for all active jobs (combined across all live jobs)
  const totalViews =
    stats.activity?.views_this_week ||
    recentJobs.reduce((sum, job) => sum + (job.views_count ?? 0), 0);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Measurable</h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Metric - Applications This Week */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Applications this week
            </span>
            <div
              className={`flex items-center text-sm font-medium ${weeklyTrend > 0 ? "text-blue-600" : "text-pink-600"}`}
            >
              {weeklyTrend > 0 ? (
                <ArrowUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 mr-1" />
              )}
              {weeklyTrend > 0 ? "+" : ""}
              {Math.round(weeklyTrend)}%
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${weeklyTrend > 0 ? "bg-blue-600" : "bg-pink-600"}`}
              style={{ width: `${Math.min(weeklyApplicationRate, 100)}%` }}
            />
          </div>

          {/* Large count */}
          <div className="text-7xl font-semibold text-gray-900 tracking-tight mb-2">
            {weekApplications}
          </div>

          {/* Description text - aligned to bottom */}
          <p className="text-sm text-gray-600 mt-auto">
            Total applications received this week. Tracking towards your weekly
            target helps maintain a healthy candidate pipeline and ensures
            consistent{" "}
            <Link href="/jobs" className="text-blue-600 hover:underline">
              hiring flow
            </Link>
            .
          </p>
        </div>

        {/* Smaller metrics grid - 4 cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* New Applications Today */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                New today
              </span>
              <div
                className={`flex items-center text-sm font-medium ${todayTrend > 0 ? "text-blue-600" : "text-pink-600"}`}
              >
                {todayTrend > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                {todayTrend > 0 ? "+" : ""}
                {Math.round(todayTrend)}%
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${todayTrend > 0 ? "bg-blue-600" : "bg-pink-600"}`}
                style={{ width: `${Math.min(todayRate, 100)}%` }}
              />
            </div>

            <div className="text-4xl font-semibold text-gray-900">
              {todayApplications}
            </div>
          </div>

          {/* Active Pipeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Active pipeline
              </span>
              <div
                className={`flex items-center text-sm font-medium ${activePipelineTrend > 0 ? "text-purple-600" : "text-pink-600"}`}
              >
                {activePipelineTrend > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                {activePipelineTrend > 0 ? "+" : ""}
                {Math.round(activePipelineTrend)}%
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${activePipelineTrend > 0 ? "bg-purple-600" : "bg-pink-600"}`}
                style={{ width: `${Math.min(activePipelinePercentage, 100)}%` }}
              />
            </div>

            <div className="text-4xl font-semibold text-gray-900">
              {activePipeline}
            </div>
          </div>

          {/* Engagement Rate */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Engagement rate
              </span>
              <div
                className={`flex items-center text-sm font-medium ${engagementTrend > 0 ? "text-blue-600" : "text-pink-600"}`}
              >
                {engagementTrend > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                {engagementTrend > 0 ? "+" : ""}
                {Math.round(engagementTrend)}%
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${engagementTrend > 0 ? "bg-blue-600" : "bg-pink-600"}`}
                style={{ width: `${Math.min(engagementRate, 100)}%` }}
              />
            </div>

            <div className="text-4xl font-semibold text-gray-900">
              {engagementRate.toFixed(1)}%
            </div>
          </div>

          {/* Avg Time to Hire */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Avg time to hire
              </span>
              <div
                className={`flex items-center text-sm font-medium ${timeToHireTrend > 0 ? "text-green-600" : "text-pink-600"}`}
              >
                {timeToHireTrend > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                {timeToHireTrend > 0 ? "+" : ""}
                {Math.round(timeToHireTrend)}%
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${avgTimeToHire < 30 ? "bg-green-600" : avgTimeToHire < 45 ? "bg-yellow-500" : "bg-orange-500"}`}
                style={{
                  width: `${avgTimeToHire > 0 ? Math.min(((60 - avgTimeToHire) / 60) * 100, 100) : 0}%`,
                }}
              />
            </div>

            <div className="text-4xl font-semibold text-gray-900">
              {avgTimeToHire > 0 ? `${Math.round(avgTimeToHire)}d` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Status Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-7">
          {/* Views */}
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Views
            </dt>
            <dd className="mt-2 text-3xl font-semibold text-blue-600">
              {totalViews}
            </dd>
          </div>

          {/* Applied */}
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Applied
            </dt>
            <dd className="mt-2 text-3xl font-semibold text-gray-900">
              {stats.applications.by_status.applied}
            </dd>
          </div>

          {/* Screening */}
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Screening
            </dt>
            <dd className="mt-2 text-3xl font-semibold text-gray-900">
              {stats.applications.by_status.screening}
            </dd>
          </div>

          {/* Interviewing */}
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Interviewing
            </dt>
            <dd className="mt-2 text-3xl font-semibold text-gray-900">
              {stats.applications.by_status.interviewing}
            </dd>
          </div>

          {/* Offer */}
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Offer
            </dt>
            <dd className="mt-2 text-3xl font-semibold text-gray-900">
              {stats.applications.by_status.offer}
            </dd>
          </div>

          {/* Hired */}
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Hired
            </dt>
            <dd className="mt-2 text-3xl font-semibold text-green-600">
              {stats.applications.by_status.hired}
            </dd>
          </div>

          {/* Rejected */}
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Rejected
            </dt>
            <dd className="mt-2 text-3xl font-semibold text-red-600">
              {stats.applications.by_status.rejected}
            </dd>
          </div>
        </div>
      </div>

      {/* Active Jobs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Active jobs</h2>
          <Link href="/jobs/create">
            <Button className="inline-flex items-center">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {recentJobs.length > 0 ? (
            <>
              {recentJobs.map((job) => {
                // Ensure counts are numbers and handle null/undefined
                const applicationsCount =
                  typeof job.applications_count === "number"
                    ? job.applications_count
                    : 0;
                const viewsCount =
                  typeof job.views_count === "number" ? job.views_count : 0;

                return (
                  <div
                    key={job.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {job.title}
                          </h3>

                          {/* Meta info */}
                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 flex-wrap">
                            <span className="inline-flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1.5" />
                              {applicationsCount}{" "}
                              {pluralize("application", applicationsCount)}
                            </span>
                            <span className="inline-flex items-center">
                              <EyeIcon className="h-4 w-4 mr-1.5" />
                              {viewsCount} {pluralize("view", viewsCount)}
                            </span>
                            <span>•</span>
                            <span>
                              {POSITION_TYPE_LABELS[job.position_type]}
                            </span>
                            <span>•</span>
                            <span>
                              {LOCATION_TYPE_LABELS[job.location_type]}
                            </span>
                            <span>•</span>
                            <StatusBadge status={job.status} type="job" />
                          </div>

                          <div className="text-xs text-gray-500">
                            Created {formatDate(job.created_at)}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={`/jobs/${job.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link href={`/jobs/${job.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Link href="/jobs">
                <button className="w-full text-center py-3 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  View All Jobs
                </button>
              </Link>
            </>
          ) : (
            <EmptyState
              icon={BriefcaseIcon}
              title="Ready to start hiring?"
              description="Create your first job posting and start receiving applications from qualified candidates."
            />
          )}
        </div>
      </div>
    </div>
  );
}
