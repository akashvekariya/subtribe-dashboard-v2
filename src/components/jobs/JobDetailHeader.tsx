"use client";

import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Job } from "@/types";
import {
  ArrowLeftIcon,
  PencilIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { RefreshIcon } from "@/components/evaluation/Icons";
import { formatTimeAgo } from "@/components/evaluation/utils";

type TabType = "overview" | "applications";

interface JobDetailHeaderProps {
  job: Job;
  activeTab: TabType;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  lastRefreshedAt?: Date | null;
  onBulkUpload?: () => void;
}

export function JobDetailHeader({
  job,
  activeTab,
  onRefresh,
  isRefreshing = false,
  lastRefreshedAt,
  onBulkUpload,
}: JobDetailHeaderProps) {
  const router = useRouter();

  // Time tracking for refresh indicator (triggers re-render every 10 seconds)
  const [, setTimeTick] = useState(0);
  useEffect(() => {
    if (!lastRefreshedAt || activeTab !== "applications") return;
    const interval = setInterval(() => {
      setTimeTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, [lastRefreshedAt, activeTab]);

  const handleTabClick = useCallback(
    (tab: TabType) => {
      if (tab === "overview") {
        router.push(`/jobs/${job.id}`);
      } else {
        router.push(`/jobs/${job.id}/applications`);
      }
    },
    [job.id, router]
  );

  return (
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

        {/* Right side: Refresh + Tabs + Edit button */}
        <div className="flex items-center gap-2">
          {/* Bulk Upload + Refresh - only shown on Applications tab */}
          {activeTab === "applications" && (
            <div className="flex items-center gap-1.5 mr-1">
              {onBulkUpload && (
                <button
                  type="button"
                  onClick={onBulkUpload}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Bulk upload resumes"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  <span>Bulk Upload</span>
                </button>
              )}
              {onRefresh && (
                <>
                  <span className="text-xs text-gray-400">
                    {formatTimeAgo(lastRefreshedAt ?? null)}
                  </span>
                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
                      isRefreshing
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    }`}
                    aria-label="Refresh candidates"
                  >
                    <RefreshIcon
                      strokeWidth={2}
                      className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => handleTabClick("overview")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === "overview"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabClick("applications")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === "applications"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Applications
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
  );
}
