"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Job } from "@/types";
import { getJobById } from "@/lib/jobs";
import { CandidateList } from "@/components/evaluation/CandidateList";
import { CandidateListProvider } from "@/components/evaluation/context/CandidateListContext";
import { useCandidateListWithUrl } from "@/components/evaluation/hooks/useCandidateListWithUrl";
import { JobDetailHeader } from "@/components/jobs/JobDetailHeader";
import { BulkUploadModal } from "@/components/jobs/BulkUploadModal";
import { SparklesIcon } from "@heroicons/react/24/outline";
import "@/components/evaluation/styles.css";

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = params.jobId as string;
  const applicationId = params.applicationId as string | undefined;

  // Job data state
  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);

  // Refresh state
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bulk upload state
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Use the URL-synced candidate list hook
  const candidateList = useCandidateListWithUrl(jobId);
  const { error: listError, refresh: refreshCandidates } = candidateList;

  // Fetch job data
  useEffect(() => {
    const loadJob = async () => {
      try {
        const jobData = await getJobById(jobId);
        setJob(jobData);
        setLastRefreshedAt(new Date());
      } catch (error) {
        console.error("Failed to load job:", error);
      } finally {
        setIsLoadingJob(false);
      }
    };
    loadJob();
  }, [jobId]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshCandidates();
    setLastRefreshedAt(new Date());
    setIsRefreshing(false);
  }, [refreshCandidates]);

  // Handle bulk upload
  const handleBulkUploadOpen = useCallback(() => {
    setIsBulkUploadOpen(true);
  }, []);

  const handleBulkUploadClose = useCallback(() => {
    setIsBulkUploadOpen(false);
  }, []);

  const handleBulkUploadComplete = useCallback(() => {
    // Refresh the candidate list after bulk upload completes
    handleRefresh();
  }, [handleRefresh]);

  // Track mobile detail panel state
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(!!applicationId);

  // Update mobile state when applicationId changes
  useEffect(() => {
    setIsMobileDetailOpen(!!applicationId);
  }, [applicationId]);

  // Handle candidate selection - navigate to evaluation view
  const handleSelectCandidate = useCallback(
    (id: string) => {
      const currentParams = new URLSearchParams(searchParams.toString());
      router.push(
        `/jobs/${jobId}/applications/${id}/evaluation?${currentParams.toString()}`
      );
    },
    [jobId, router, searchParams]
  );

  // Handle email click
  const handleEmailClick = useCallback(
    (candidate: { personalInfo: { email?: string } }) => {
      if (candidate.personalInfo.email) {
        window.open(`mailto:${candidate.personalInfo.email}`, "_blank");
      }
    },
    []
  );

  // Handle phone click
  const handlePhoneClick = useCallback(
    (candidate: { personalInfo: { phone?: string } }) => {
      if (candidate.personalInfo.phone) {
        window.open(`tel:${candidate.personalInfo.phone}`, "_blank");
      }
    },
    []
  );

  // Handle resume click - navigate to resume view
  const handleResumeClick = useCallback(
    (candidate: { id: string }) => {
      const currentParams = new URLSearchParams(searchParams.toString());
      router.push(
        `/jobs/${jobId}/applications/${candidate.id}/resume?${currentParams.toString()}`
      );
    },
    [jobId, router, searchParams]
  );

  // Loading state
  if (isLoadingJob) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-semibold text-gray-900">Job not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The job posting you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <JobDetailHeader
        job={job}
        activeTab="applications"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastRefreshedAt={lastRefreshedAt}
        onBulkUpload={handleBulkUploadOpen}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        jobId={jobId}
        isOpen={isBulkUploadOpen}
        onClose={handleBulkUploadClose}
        onComplete={handleBulkUploadComplete}
      />

      {/* Calibration Warning Banner */}
      {!job.calibrated_at && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                AI candidate analysis unavailable
              </p>
              <p className="text-xs text-amber-600">
                Calibrate this job to enable AI-powered candidate scoring and
                analysis
              </p>
            </div>
          </div>
          <Link href={`/jobs/${job.id}/calibrate`}>
            <button className="px-3 py-1.5 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
              Calibrate Now
            </button>
          </Link>
        </div>
      )}

      {/* Applications Panel */}
      <div className="eval-panel-inline">
        <div className="eval-layout-container">
          {/* Left Sidebar - Candidate List */}
          <div className="eval-layout-sidebar">
            {listError ? (
              <div className="p-4 text-center">
                <p className="text-red-500 text-sm">{listError}</p>
                <button
                  onClick={refreshCandidates}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <CandidateListProvider value={candidateList}>
                <CandidateList
                  selectedId={applicationId || null}
                  onSelect={handleSelectCandidate}
                  onEmailClick={handleEmailClick}
                  onPhoneClick={handlePhoneClick}
                  onResumeClick={handleResumeClick}
                  title="Candidates"
                />
              </CandidateListProvider>
            )}
          </div>

          {/* Main Content - Children (evaluation or resume page) */}
          <div
            className={`eval-layout-main ${isMobileDetailOpen ? "mobile-detail-open" : ""}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
