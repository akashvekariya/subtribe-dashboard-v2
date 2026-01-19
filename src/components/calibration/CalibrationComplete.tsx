import React, { useMemo } from "react";
import { Icons } from "../Icons";
import {
  BasicJobData,
  CalibrationData,
  CalibrationQuestionsPayload,
  RoleAnalysis,
} from "../../types";
import { generateCalibrationSummaryJSON } from "../../lib/calibration-summary";

interface CalibrationCompleteProps {
  jobId: string;
  basicJobData: BasicJobData;
  roleAnalysis: RoleAnalysis;
  calibrationQuestions: CalibrationQuestionsPayload;
  calibrationData: CalibrationData;
  onBack: () => void;
  onDone: () => void;
  isGenerating?: boolean;
}

export default function CalibrationComplete({
  jobId,
  basicJobData,
  roleAnalysis,
  calibrationQuestions,
  calibrationData,
  onBack,
  onDone,
  isGenerating = false,
}: CalibrationCompleteProps) {
  // Generate the summary JSON (still needed for stats calculation)
  const summaryJSON = useMemo(() => {
    return generateCalibrationSummaryJSON(
      jobId,
      basicJobData,
      roleAnalysis,
      calibrationQuestions,
      calibrationData
    );
  }, [
    jobId,
    basicJobData,
    roleAnalysis,
    calibrationQuestions,
    calibrationData,
  ]);

  // Calculate stats for the summary header
  const stats = useMemo(() => {
    const s = summaryJSON.calibrationSummary;
    return {
      totalSkills:
        s.skills.mustHave.stats.total + s.skills.goodToHave.stats.total,
      selectedSkills:
        s.skills.mustHave.stats.selected + s.skills.goodToHave.stats.selected,
      customSkills:
        s.skills.mustHave.stats.custom + s.skills.goodToHave.stats.custom,
      tradeoffsAnswered:
        s.tradeoffs.experience.stats.answered +
        s.tradeoffs.roleSpecific.stats.answered,
      tradeoffsTotal:
        s.tradeoffs.experience.stats.total +
        s.tradeoffs.roleSpecific.stats.total,
      challengesSelected: s.challenges.stats.selected,
      milestonesSelected: s.day60Milestones.stats.selected,
    };
  }, [summaryJSON]);

  return (
    <div className="min-h-full p-8 lg:p-12">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium"
          >
            <Icons.ArrowLeft className="w-4 h-4" /> Back to Calibration
          </button>
          <button
            onClick={onDone}
            disabled={isGenerating}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isGenerating
                ? "bg-purple-400 text-white cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {isGenerating ? (
              <>
                <Icons.Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Icons.Brain className="w-4 h-4" /> Generate Framework
              </>
            )}
          </button>
        </div>

        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <Icons.CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-green-900 mb-1">
                Calibration Complete
              </h2>
              <p className="text-green-700 text-sm">
                {
                  'Your job calibration has been saved. Click "Generate Framework" to create the AI evaluation framework for scoring candidates.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="text-2xl font-bold text-zinc-900">
              {stats.selectedSkills}
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">
              Skills Selected
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              of {stats.totalSkills} ({stats.customSkills} custom)
            </div>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="text-2xl font-bold text-zinc-900">
              {stats.tradeoffsAnswered}
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">
              Trade-offs Set
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              of {stats.tradeoffsTotal}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="text-2xl font-bold text-zinc-900">
              {stats.challengesSelected}
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">
              Challenges
            </div>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="text-2xl font-bold text-zinc-900">
              {stats.milestonesSelected}
            </div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">
              Day 60 Goals
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
