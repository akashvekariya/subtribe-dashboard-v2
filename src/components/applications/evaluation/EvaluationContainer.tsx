"use client";

import { useEffect, useState } from "react";
import { Loader2, Clock } from "lucide-react";
import { ScoreHeader } from "./score/ScoreHeader";
import { DimensionRadarChart } from "./dimensions/DimensionRadarChart";
import { SkillsGrid } from "./skills/SkillsGrid";
import { RequirementsChecklist } from "./requirements/RequirementsChecklist";
import { ExperienceTimeline } from "./experience/ExperienceTimeline";
import { RedFlagsSection } from "./flags/RedFlagsSection";
import { AssessmentSummary } from "./summary/AssessmentSummary";
import { useEvaluationData } from "./useEvaluationData";
import type { Application } from "@/types";

interface EvaluationContainerProps {
  application: Application | null;
  jobFramework?: Record<string, unknown> | null;
  onApplicationUpdate?: (application: Application) => void;
}

/**
 * Skeleton component for loading state
 */
function EvaluationSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Score skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
        <div className="ml-auto h-5 w-20 bg-gray-200 rounded-full" />
      </div>

      {/* Radar chart skeleton */}
      <div className="h-[250px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="w-40 h-40 bg-gray-200 rounded-full opacity-50" />
      </div>

      {/* Skills skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="flex gap-1.5">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-6 w-14 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="flex gap-1.5">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact status banner for pending evaluation (non-blocking)
 */
function PendingStatusBanner() {
  return (
    <div className="p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
      <div className="flex-shrink-0">
        <Clock className="w-4 h-4 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-blue-800">Evaluation Pending</p>
        <p className="text-[10px] text-blue-600">
          AI evaluation will start once the job is calibrated.
        </p>
      </div>
    </div>
  );
}

/**
 * Compact status banner for processing evaluation (non-blocking)
 */
function ProcessingStatusBanner() {
  return (
    <div className="p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
      <div className="flex-shrink-0">
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-blue-800">Evaluating Resume</p>
        <p className="text-[10px] text-blue-600">
          AI is analyzing the resume. Results will appear automatically.
        </p>
      </div>
    </div>
  );
}

/**
 * Failed state component - Neutral, non-alarming design
 */
function FailedEvaluationState() {
  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-gray-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-medium text-gray-900 mb-0.5">
            Evaluation Not Available
          </h3>
          <p className="text-[10px] text-gray-600">
            The AI evaluation couldn&apos;t be completed. This doesn&apos;t
            affect the application.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * EvaluationContainer - Main orchestrator component
 *
 * Displays all evaluation sections:
 * - Score header with tier and confidence
 * - Interactive radar chart
 * - Skills grid with evidence tooltips
 * - Requirements checklist
 * - Experience timeline
 * - Red flags section
 * - Assessment summary with interview questions
 *
 * Non-blocking: Shows status banners for pending/processing states
 * and automatically polls for updates when evaluation is in progress.
 */
export function EvaluationContainer({
  application: initialApplication,
  jobFramework,
  onApplicationUpdate,
}: EvaluationContainerProps) {
  // Local state for application data (allows polling updates)
  const [application, setApplication] = useState<Application | null>(
    initialApplication
  );

  // Update local state when prop changes
  useEffect(() => {
    setApplication(initialApplication);
  }, [initialApplication]);

  const {
    isEvaluated,
    isPending,
    isProcessing,
    isFailed,
    scores,
    redFlags,
    blockers,
    canProceed,
    analysis,
    evaluationDetails,
    dimensionAssessments,
    summary,
    radarChartData,
    techStackItems,
    experienceTimeline,
  } = useEvaluationData(application, jobFramework);

  // Handle no application
  if (!application) {
    return <EvaluationSkeleton />;
  }

  // Handle failed state - show neutral message
  if (isFailed) {
    return <FailedEvaluationState />;
  }

  // Determine if we should show skeleton content (no evaluation data yet)
  const showSkeletonContent = !isEvaluated && (isPending || isProcessing);

  // Extract framework data for components that need it
  const frameworkSkills = (
    jobFramework?.skill_criteria as {
      skills?: Array<{
        skill_id: string;
        name: string;
        is_required: boolean;
        is_dealbreaker: boolean;
      }>;
    }
  )?.skills;
  const frameworkConstraints =
    (jobFramework?.hard_constraints as Array<{
      constraint_type: string;
      description: string;
      severity: string;
      original_text?: string;
    }>) || [];

  return (
    <div className="space-y-4">
      {/* Status Banner - Non-blocking indication of evaluation state */}
      {isProcessing && <ProcessingStatusBanner />}
      {isPending && !isProcessing && <PendingStatusBanner />}

      {/* Show skeleton content when no evaluation data yet */}
      {showSkeletonContent ? (
        <EvaluationSkeleton />
      ) : (
        <>
          {/* Score Header */}
          {scores && (
            <ScoreHeader
              finalScore={scores.final_score}
              tier={scores.tier}
              verificationConfidence={scores.verification_confidence}
              canProceed={canProceed}
              blockers={blockers}
              redFlagsSummary={redFlags?.summary}
            />
          )}

          {/* Radar Chart - Interactive Dimensions */}
          <div className="p-3 bg-white rounded-lg border border-gray-100">
            <DimensionRadarChart
              data={radarChartData}
              dimensionAssessments={dimensionAssessments}
            />
          </div>

          {/* Skills Grid */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2 text-sm">
              Technical Skills
            </h3>
            <SkillsGrid
              skills={techStackItems}
              skillAnalysis={analysis?.skill_analysis}
            />
          </div>

          {/* Requirements Checklist */}
          {evaluationDetails?.constraint_results &&
            evaluationDetails.constraint_results.length > 0 && (
              <div className="p-3 bg-white rounded-lg border border-gray-100">
                <RequirementsChecklist
                  constraintResults={evaluationDetails.constraint_results}
                  constraintAnalysis={analysis?.constraint_analysis}
                  frameworkConstraints={frameworkConstraints}
                />
              </div>
            )}

          {/* Experience Timeline */}
          <div className="p-3 bg-white rounded-lg border border-gray-100">
            <ExperienceTimeline
              entries={experienceTimeline.entries}
              summary={analysis?.experience_summary}
              requiredMin={experienceTimeline.requiredMin}
              requiredMax={experienceTimeline.requiredMax}
            />
          </div>

          {/* Red Flags */}
          {redFlags && (
            <div className="p-3 bg-white rounded-lg border border-gray-100">
              <RedFlagsSection
                flags={redFlags.flags}
                summary={redFlags.summary}
              />
            </div>
          )}

          {/* Assessment Summary */}
          {summary && (
            <div className="p-3 bg-white rounded-lg border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3 text-sm">
                Candidate Assessment
              </h3>
              <AssessmentSummary
                strengths={summary.strengths}
                concerns={summary.concerns}
                interviewQuestions={summary.interview_questions}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
