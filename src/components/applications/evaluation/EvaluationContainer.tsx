"use client";

import { Loader2, Clock, AlertCircle, XCircle } from "lucide-react";
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
}

/**
 * Skeleton component for loading state
 */
function EvaluationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Score skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-20 bg-gray-200 rounded" />
        <div className="h-8 w-28 bg-gray-200 rounded-full" />
        <div className="ml-auto h-6 w-24 bg-gray-200 rounded-full" />
      </div>

      {/* Radar chart skeleton */}
      <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="w-48 h-48 bg-gray-200 rounded-full opacity-50" />
      </div>

      {/* Skills skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded-full" />
            <div className="h-8 w-24 bg-gray-200 rounded-full" />
            <div className="h-8 w-16 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded-full" />
            <div className="h-8 w-18 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pending state component
 */
function PendingEvaluationState() {
  return (
    <div className="py-12 px-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
        <Clock className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Evaluation Pending
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        AI evaluation will appear here once the job is calibrated and the resume
        has been processed.
      </p>
    </div>
  );
}

/**
 * Processing state component
 */
function ProcessingEvaluationState() {
  return (
    <div className="py-12 px-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Evaluating Resume
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        AI is analyzing the resume against the job requirements. This usually
        takes 15-30 seconds.
      </p>
    </div>
  );
}

/**
 * Failed state component
 */
function FailedEvaluationState() {
  return (
    <div className="py-12 px-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Evaluation Failed
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        There was an error processing this resume. Please try again or contact
        support if the issue persists.
      </p>
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
 */
export function EvaluationContainer({
  application,
  jobFramework,
}: EvaluationContainerProps) {
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

  // Handle various states
  if (!application) {
    return <EvaluationSkeleton />;
  }

  if (isFailed) {
    return <FailedEvaluationState />;
  }

  if (isProcessing) {
    return <ProcessingEvaluationState />;
  }

  if (isPending || !isEvaluated) {
    return <PendingEvaluationState />;
  }

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
    <div className="space-y-8">
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
      <div className="p-4 bg-white rounded-lg border border-gray-100">
        <DimensionRadarChart
          data={radarChartData}
          dimensionAssessments={dimensionAssessments}
        />
      </div>

      {/* Skills Grid */}
      <div>
        <h3 className="font-medium text-gray-900 mb-4">Technical Skills</h3>
        <SkillsGrid
          skills={techStackItems}
          skillAnalysis={analysis?.skill_analysis}
        />
      </div>

      {/* Requirements Checklist */}
      {evaluationDetails?.constraint_results &&
        evaluationDetails.constraint_results.length > 0 && (
          <div className="p-4 bg-white rounded-lg border border-gray-100">
            <RequirementsChecklist
              constraintResults={evaluationDetails.constraint_results}
              constraintAnalysis={analysis?.constraint_analysis}
              frameworkConstraints={frameworkConstraints}
            />
          </div>
        )}

      {/* Experience Timeline */}
      <div className="p-4 bg-white rounded-lg border border-gray-100">
        <ExperienceTimeline
          entries={experienceTimeline.entries}
          summary={analysis?.experience_summary}
          requiredMin={experienceTimeline.requiredMin}
          requiredMax={experienceTimeline.requiredMax}
        />
      </div>

      {/* Red Flags */}
      {redFlags && (
        <div className="p-4 bg-white rounded-lg border border-gray-100">
          <RedFlagsSection flags={redFlags.flags} summary={redFlags.summary} />
        </div>
      )}

      {/* Assessment Summary */}
      {summary && (
        <div className="p-4 bg-white rounded-lg border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-4">
            Candidate Assessment
          </h3>
          <AssessmentSummary
            strengths={summary.strengths}
            concerns={summary.concerns}
            interviewQuestions={summary.interview_questions}
          />
        </div>
      )}
    </div>
  );
}
