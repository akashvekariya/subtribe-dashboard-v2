"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon } from "@/components/evaluation/Icons";
import { EvaluationTabs } from "@/components/evaluation/EvaluationTabs";
import { ResumeView } from "@/components/evaluation/ResumeView";
import {
  ScoreSummaryPanelSkeleton,
  AccordionSkeleton,
} from "@/components/evaluation/Skeleton";
import {
  api,
  type ResumeDisplayData,
  type ResumeDisplayMeta,
} from "@/lib/api-client";

export default function ResumePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = params.jobId as string;
  const applicationId = params.applicationId as string;

  // Resume data state
  const [resumeData, setResumeData] = useState<ResumeDisplayData | null>(null);
  const [resumeMeta, setResumeMeta] = useState<ResumeDisplayMeta | null>(null);
  const [loadingState, setLoadingState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  // Fetch resume data
  const fetchResume = useCallback(async () => {
    setLoadingState("loading");
    setError(null);

    try {
      const response =
        await api.applications.getApplicationResume(applicationId);
      setResumeData(response.data);
      setResumeMeta(response.meta);
      setLoadingState("success");
    } catch (err) {
      console.error("Failed to fetch resume:", err);
      setError(err instanceof Error ? err.message : "Failed to load resume");
      setLoadingState("error");
    }
  }, [applicationId]);

  // Fetch resume on mount
  useEffect(() => {
    if (applicationId && loadingState === "idle") {
      fetchResume();
    }
  }, [applicationId, loadingState, fetchResume]);

  // Handle tab change - navigate to evaluation
  const handleTabChange = useCallback(
    (tab: "ai" | "resume") => {
      if (tab === "ai") {
        const currentParams = new URLSearchParams(searchParams.toString());
        router.push(
          `/jobs/${jobId}/applications/${applicationId}/evaluation?${currentParams.toString()}`
        );
      }
    },
    [jobId, applicationId, router, searchParams]
  );

  // Mobile back button
  const handleMobileBack = useCallback(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    router.push(`/jobs/${jobId}/applications?${currentParams.toString()}`);
  }, [jobId, router, searchParams]);

  // Render content based on loading state
  const renderContent = () => {
    // Loading state
    if (loadingState === "loading") {
      return (
        <div className="eval-content-scroll">
          <ScoreSummaryPanelSkeleton />
          <AccordionSkeleton title="Experience" />
          <AccordionSkeleton title="Education" />
          <AccordionSkeleton title="Skills" />
        </div>
      );
    }

    // Error state
    if (loadingState === "error") {
      return (
        <div className="text-center py-20">
          <p className="text-red-500 text-lg font-medium">
            Failed to load resume
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            {error || "Unknown error occurred"}
          </p>
          <button
            onClick={fetchResume}
            className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-sm text-zinc-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    // No resume data available
    if (!resumeData || !resumeMeta) {
      return (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">Resume data not available</p>
          <p className="text-zinc-400 text-sm mt-2">
            This candidate&apos;s resume may not have been parsed yet
          </p>
        </div>
      );
    }

    // Render resume view
    return (
      <div className="eval-content-scroll">
        <ResumeView data={resumeData} meta={resumeMeta} />
      </div>
    );
  };

  return (
    <>
      {/* Mobile header with back button and tabs */}
      <div className="eval-mobile-header">
        <button className="eval-mobile-back" onClick={handleMobileBack}>
          <ChevronLeftIcon strokeWidth={2} />
        </button>
        <div className="eval-mobile-tabs">
          <button
            className="eval-mobile-tab"
            onClick={() => handleTabChange("ai")}
          >
            AI Evaluation
          </button>
          <button className="eval-mobile-tab eval-mobile-tab-active">
            Resume
          </button>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="eval-tabs-container">
        <EvaluationTabs activeTab="resume" onTabChange={handleTabChange} />
        <div className="eval-tabs-content">{renderContent()}</div>
      </div>
    </>
  );
}
