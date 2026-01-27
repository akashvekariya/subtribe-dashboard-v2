"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon } from "@/components/evaluation/Icons";
import { EvaluationTabs } from "@/components/evaluation/EvaluationTabs";
import { ScoreSummaryPanel } from "@/components/evaluation/ScoreSummaryPanel";
import { SkillsGrid } from "@/components/evaluation/SkillsGrid";
import {
  ConstraintAccordion,
  RedFlagsAccordion,
  InterviewQuestionsAccordion,
} from "@/components/evaluation/accordions";
import {
  InsightsCard,
  TradeoffsCard,
  ManipulationAlert,
} from "@/components/evaluation/cards";
import {
  ScoreSummaryPanelSkeleton,
  InsightsCardSkeleton,
  SkillsGridSkeleton,
  AccordionSkeleton,
} from "@/components/evaluation/Skeleton";
import { DimensionDetailModal } from "@/components/evaluation/DimensionDetailModal";
import { useCandidateStore } from "@/components/evaluation/store";

export default function EvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = params.jobId as string;
  const applicationId = params.applicationId as string;

  // Dimension detail modal state
  const [isDimensionModalOpen, setIsDimensionModalOpen] = useState(false);
  const [dimensionIndex, setDimensionIndex] = useState(0);

  // Candidate store for evaluation data
  const {
    fetchCandidate,
    getCurrentCandidate,
    loadingState: evaluationLoadingState,
    error: evaluationError,
  } = useCandidateStore();

  // Get current candidate data from store
  const candidateData = getCurrentCandidate();

  // Fetch evaluation data on mount
  useEffect(() => {
    if (applicationId) {
      fetchCandidate(applicationId);
    }
  }, [applicationId, fetchCandidate]);

  // Handle tab change - navigate to resume
  const handleTabChange = useCallback(
    (tab: "ai" | "resume") => {
      if (tab === "resume") {
        const currentParams = new URLSearchParams(searchParams.toString());
        router.push(
          `/jobs/${jobId}/applications/${applicationId}/resume?${currentParams.toString()}`
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

  // Dimension modal handlers
  const openDimensionModal = useCallback(
    (categoryId?: string) => {
      if (categoryId && candidateData) {
        const idx = candidateData.computed.dimensions.findIndex(
          (d) => d.id === categoryId
        );
        setDimensionIndex(idx >= 0 ? idx : 0);
      } else {
        setDimensionIndex(0);
      }
      setIsDimensionModalOpen(true);
    },
    [candidateData]
  );

  const closeDimensionModal = useCallback(() => {
    setIsDimensionModalOpen(false);
  }, []);

  const navigateDimension = useCallback((index: number) => {
    setDimensionIndex(index);
  }, []);

  // Render content based on loading state
  const renderContent = () => {
    // Loading state
    if (evaluationLoadingState === "loading") {
      return (
        <div className="eval-content-scroll">
          <ScoreSummaryPanelSkeleton />
          <InsightsCardSkeleton />
          <SkillsGridSkeleton />
          <AccordionSkeleton title="Constraints" />
          <AccordionSkeleton title="Red Flags" />
          <AccordionSkeleton title="Interview Questions" />
        </div>
      );
    }

    // Error state
    if (evaluationLoadingState === "error") {
      return (
        <div className="text-center py-20">
          <p className="text-red-500 text-lg font-medium">
            Failed to load evaluation
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            {evaluationError || "Unknown error occurred"}
          </p>
          <button
            onClick={() => fetchCandidate(applicationId)}
            className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-sm text-zinc-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    // No data available
    if (!candidateData) {
      return (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">Evaluation data not available</p>
          <p className="text-zinc-400 text-sm mt-2">
            This candidate may not have been evaluated yet
          </p>
        </div>
      );
    }

    // Render full evaluation view
    const { computed, evaluation } = candidateData;

    return (
      <div className="eval-content-scroll">
        {/* Manipulation Alert - shown only when detected */}
        <ManipulationAlert manipulationCheck={computed.manipulationCheck} />

        {/* Score Summary Panel */}
        <ScoreSummaryPanel
          categories={computed.categories}
          totalScore={evaluation.scores.final_score}
          maxTotalScore={10}
          tier={evaluation.scores.tier}
          stats={computed.stats}
          personalInfo={computed.personalInfo}
          onRingClick={openDimensionModal}
        />

        {/* Key Insights */}
        <InsightsCard
          strengths={computed.strengths}
          concerns={computed.concerns}
        />

        {/* Candidate Profile / Tradeoffs */}
        {computed.tradeoffs.length > 0 && (
          <TradeoffsCard
            tradeoffs={computed.tradeoffs}
            summary={computed.tradeoffsSummary}
          />
        )}

        {/* Skills Grid */}
        <SkillsGrid
          skills={evaluation.skills.matches}
          matchedCount={computed.stats.skillsMatched}
          totalSkills={computed.stats.skillsTotal}
          missingSkills={evaluation.skills.missing}
        />

        {/* Constraints */}
        <ConstraintAccordion constraints={computed.constraints} />

        {/* Red Flags */}
        {evaluation.red_flags.flags.length > 0 && (
          <RedFlagsAccordion flags={evaluation.red_flags.flags} />
        )}

        {/* Interview Questions */}
        {computed.interviewQuestions.length > 0 && (
          <InterviewQuestionsAccordion
            questions={computed.interviewQuestions}
          />
        )}
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
          <button className="eval-mobile-tab eval-mobile-tab-active">
            AI Evaluation
          </button>
          <button
            className="eval-mobile-tab"
            onClick={() => handleTabChange("resume")}
          >
            Resume
          </button>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="eval-tabs-container">
        <EvaluationTabs activeTab="ai" onTabChange={handleTabChange} />
        <div className="eval-tabs-content">{renderContent()}</div>
      </div>

      {/* Dimension Detail Modal */}
      {isDimensionModalOpen && candidateData && (
        <DimensionDetailModal
          dimensions={candidateData.computed.dimensions}
          currentIndex={dimensionIndex}
          totalScore={candidateData.evaluation.scores.final_score}
          onClose={closeDimensionModal}
          onNavigate={navigateDimension}
        />
      )}
    </>
  );
}
