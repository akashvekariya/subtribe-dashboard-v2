"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Job } from "@/types";
import { getJobs } from "@/lib/jobs";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, pluralize } from "@/lib/format";
import { POSITION_TYPE_LABELS, LOCATION_TYPE_LABELS } from "@/lib/constants";
import {
  PlusIcon,
  BriefcaseIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseIcon}
          title="No job postings"
          description="Get started by creating your first job posting."
          action={
            <Link href="/jobs/create">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="bg-white border border-gray-200 overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {jobs.map((job) => {
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
