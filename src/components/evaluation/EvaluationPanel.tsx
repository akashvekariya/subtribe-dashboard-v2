"use client";

import React, { memo, useState, useCallback, useEffect } from "react";
import { ChevronLeftIcon } from "./icons";
import { EvaluationTabs, type TabId } from "./EvaluationTabs";
import { CandidateList } from "./CandidateList";
import { ScoreSummaryPanel } from "./ScoreSummaryPanel";
import { InsightsCard } from "./InsightsCard";
import { SkillsGrid } from "./SkillsGrid";
import { ConstraintAccordion } from "./ConstraintAccordion";
import { RedFlagsAccordion } from "./RedFlagsAccordion";
import { InterviewQuestionsAccordion } from "./InterviewQuestionsAccordion";
import { TradeoffsCard } from "./TradeoffsCard";
import { ManipulationAlert } from "./ManipulationAlert";
import { ResumeView } from "./ResumeView";
import {
  ScoreSummaryPanelSkeleton,
  InsightsCardSkeleton,
  SkillsGridSkeleton,
  AccordionSkeleton,
} from "./Skeleton";
import { DimensionDetailModal } from "./DimensionDetailModal";
import { useCandidateStore } from "./store";
import { useCandidateList } from "./hooks/useCandidateList";
import { CandidateListProvider } from "./context/CandidateListContext";
import {
  api,
  type ResumeDisplayData,
  type ResumeDisplayMeta,
} from "@/lib/api-client";
import "./styles.css";

interface EvaluationPanelProps {
  jobId: string;
}

const EvaluationPanel = memo(({ jobId }: EvaluationPanelProps) => {
  const [currentCandidateId, setCurrentCandidateId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<TabId>("ai");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Use the candidate list hook
  const candidateList = useCandidateList(jobId);
  const { isLoading: isListLoading, error: listError, refresh: refreshCandidates } = candidateList;

  // Dimension detail modal state
  const [isDimensionModalOpen, setIsDimensionModalOpen] = useState(false);
  const [dimensionIndex, setDimensionIndex] = useState(0);

  // Resume data state
  const [resumeData, setResumeData] = useState<ResumeDisplayData | null>(null);
  const [resumeMeta, setResumeMeta] = useState<ResumeDisplayMeta | null>(null);
  const [resumeLoadingState, setResumeLoadingState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [resumeError, setResumeError] = useState<string | null>(null);

  // Candidate store for evaluation data
  const {
    fetchCandidate,
    getCurrentCandidate,
    loadingState: evaluationLoadingState,
    error: evaluationError,
  } = useCandidateStore();

  // Get current candidate data from store
  const candidateData = getCurrentCandidate();

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

  // Close mobile detail panel
  const closeMobileDetail = useCallback(() => {
    setIsMobileDetailOpen(false);
  }, []);

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

  // Fetch resume data for a candidate
  const fetchResume = useCallback(async (applicationId: string) => {
    setResumeLoadingState("loading");
    setResumeError(null);

    try {
      const response =
        await api.applications.getApplicationResume(applicationId);
      setResumeData(response.data);
      setResumeMeta(response.meta);
      setResumeLoadingState("success");
    } catch (error) {
      console.error("Failed to fetch resume:", error);
      setResumeError(
        error instanceof Error ? error.message : "Failed to load resume"
      );
      setResumeLoadingState("error");
    }
  }, []);

  // Select a candidate and fetch their evaluation data
  const selectCandidate = useCallback(
    async (id: string) => {
      setIsMobileDetailOpen(true);
      setActiveTab("ai");
      setCurrentCandidateId(id);
      // Reset resume state for new candidate
      setResumeData(null);
      setResumeMeta(null);
      setResumeLoadingState("idle");
      setResumeError(null);
      // Fetch evaluation data (uses cache if available)
      await fetchCandidate(id);
    },
    [fetchCandidate]
  );

  // selectedCandidate can be used for additional actions if needed
  // const selectedCandidate = candidates.find((c) => c.id === currentCandidateId);

  // Fetch resume data when switching to resume tab
  useEffect(() => {
    if (
      activeTab === "resume" &&
      currentCandidateId &&
      resumeLoadingState === "idle"
    ) {
      fetchResume(currentCandidateId);
    }
  }, [activeTab, currentCandidateId, resumeLoadingState, fetchResume]);

  // Render AI Evaluation content
  const renderAIEvaluationContent = () => {
    // No candidate selected
    if (!currentCandidateId) {
      return (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">
            Select a candidate to view details
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            Click on a candidate from the list
          </p>
        </div>
      );
    }

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
            onClick={() => fetchCandidate(currentCandidateId)}
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

  // Render Resume tab content
  const renderResumeContent = () => {
    // No candidate selected
    if (!currentCandidateId) {
      return (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">
            Select a candidate to view resume
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            Click on a candidate from the list
          </p>
        </div>
      );
    }

    // Loading state
    if (resumeLoadingState === "loading") {
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
    if (resumeLoadingState === "error") {
      return (
        <div className="text-center py-20">
          <p className="text-red-500 text-lg font-medium">
            Failed to load resume
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            {resumeError || "Unknown error occurred"}
          </p>
          <button
            onClick={() => fetchResume(currentCandidateId)}
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
    <div className="eval-panel-inline">
      {/* Two Column Layout */}
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
                title="Candidates"
              />
            </CandidateListProvider>
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

          {/* Tabs and Content */}
          <div className="eval-tabs-container">
            <EvaluationTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="eval-tabs-content">
              {activeTab === "ai"
                ? renderAIEvaluationContent()
                : renderResumeContent()}
            </div>
          </div>
        </div>
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
    </div>
  );
});

EvaluationPanel.displayName = "EvaluationPanel";

export default EvaluationPanel;
