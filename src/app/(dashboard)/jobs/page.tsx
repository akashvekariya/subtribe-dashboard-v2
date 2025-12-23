"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Job, JobStatus, PositionType, LocationType } from "@/types";
import { getJobs } from "@/lib/jobs";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, pluralize } from "@/lib/format";
import {
  POSITION_TYPE_LABELS,
  LOCATION_TYPE_LABELS,
  JOB_STATUS_LABELS,
} from "@/lib/constants";
import {
  PlusIcon,
  BriefcaseIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("");
  const [positionTypeFilter, setPositionTypeFilter] = useState<
    PositionType | ""
  >("");
  const [locationTypeFilter, setLocationTypeFilter] = useState<
    LocationType | ""
  >("");

  useEffect(() => {
    async function loadJobs() {
      try {
        const allJobs = await getJobs();
        setJobs(allJobs || []);
      } catch {
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadJobs();
  }, []);

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search filter (title)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!job.title.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter && job.status !== statusFilter) {
        return false;
      }

      // Position type filter
      if (positionTypeFilter && job.position_type !== positionTypeFilter) {
        return false;
      }

      // Location type filter
      if (locationTypeFilter && job.location_type !== locationTypeFilter) {
        return false;
      }

      return true;
    });
  }, [jobs, searchQuery, statusFilter, positionTypeFilter, locationTypeFilter]);

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery || statusFilter || positionTypeFilter || locationTypeFilter;

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setPositionTypeFilter("");
    setLocationTypeFilter("");
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading jobs..." className="min-h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900">
            Job Postings
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your job postings and track applications
          </p>
        </div>
        <Link href="/jobs/create">
          <Button className="inline-flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center text-sm text-gray-500">
            <FunnelIcon className="h-4 w-4 mr-1" />
            Filters:
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as JobStatus | "")}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">All Statuses</option>
            {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Position Type Filter */}
          <select
            value={positionTypeFilter}
            onChange={(e) =>
              setPositionTypeFilter(e.target.value as PositionType | "")
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">All Position Types</option>
            {Object.entries(POSITION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Location Type Filter */}
          <select
            value={locationTypeFilter}
            onChange={(e) =>
              setLocationTypeFilter(e.target.value as LocationType | "")
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">All Location Types</option>
            {Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Results count */}
        {hasActiveFilters && (
          <div className="text-sm text-gray-500">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        )}
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseIcon}
          title={hasActiveFilters ? "No matching jobs" : "No job postings"}
          description={
            hasActiveFilters
              ? "Try adjusting your search or filters."
              : "Get started by creating your first job posting."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Link href="/jobs/create">
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Job
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="bg-white border border-gray-200 overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredJobs.map((job) => {
              const applicationCount = job.applications_count || 0;

              return (
                <li key={job.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {job.title}
                            </h3>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <BriefcaseIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              {POSITION_TYPE_LABELS[job.position_type]}
                              <span className="mx-2">•</span>
                              {LOCATION_TYPE_LABELS[job.location_type]}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {applicationCount}{" "}
                            {pluralize("application", applicationCount)}
                          </div>
                          <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {job.views_count || 0}{" "}
                            {pluralize("view", job.views_count || 0)}
                          </div>
                          <StatusBadge status={job.status} type="job" />
                          <span>•</span>
                          <span>Created {formatDate(job.created_at)}</span>
                        </div>
                      </div>

                      <div className="ml-4 flex space-x-2">
                        <Link href={`/jobs/${job.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center"
                          >
                            View
                            <ArrowRightIcon className="ml-1 h-3 w-3" />
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
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
