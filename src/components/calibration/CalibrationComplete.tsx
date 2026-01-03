import React, { useMemo, useState } from "react";
import { Icons } from "../Icons";
import {
  BasicJobData,
  CalibrationData,
  CalibrationQuestionsPayload,
  RoleAnalysis,
} from "../../types";
import { generateCalibrationSummaryJSON } from "../../lib/calibrationSummary";

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
  const [copied, setCopied] = useState(false);

  // Generate the summary JSON
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

  // Format JSON for display
  const formattedJSON = useMemo(() => {
    return JSON.stringify(summaryJSON, null, 2);
  }, [summaryJSON]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedJSON);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Download as JSON file
  const handleDownload = () => {
    const blob = new Blob([formattedJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calibration-${jobId}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
                Your job calibration has been saved. Below is the complete JSON
                output showing all LLM suggestions and your selections.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

        {/* JSON Output Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 border-b border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-200 rounded-lg flex items-center justify-center">
                <Icons.Code2 className="w-4 h-4 text-zinc-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">
                  Calibration Summary JSON
                </h3>
                <p className="text-xs text-zinc-500">
                  Complete output with LLM suggestions and user selections
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                  ${
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }
                `}
              >
                {copied ? (
                  <>
                    <Icons.Check className="w-4 h-4" /> Copied!
                  </>
                ) : (
                  <>
                    <Icons.Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <Icons.Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>

          {/* JSON Content */}
          <div className="p-6 max-h-[600px] overflow-auto bg-zinc-900">
            <pre className="text-sm text-zinc-100 font-mono whitespace-pre-wrap">
              <code>{formattedJSON}</code>
            </pre>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-zinc-50 rounded-xl border border-zinc-200 p-4">
          <h4 className="text-sm font-semibold text-zinc-700 mb-3">
            Understanding the JSON
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <code className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                {'"source": "llm"'}
              </code>
              <span className="text-zinc-600">
                Item suggested by AI based on job description
              </span>
            </div>
            <div className="flex items-start gap-2">
              <code className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                {'"source": "custom"'}
              </code>
              <span className="text-zinc-600">Item manually added by you</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                {'"selected": true'}
              </code>
              <span className="text-zinc-600">
                Item was confirmed/selected by you
              </span>
            </div>
            <div className="flex items-start gap-2">
              <code className="px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded text-xs">
                {'"selected": false'}
              </code>
              <span className="text-zinc-600">
                Item suggested but not selected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
