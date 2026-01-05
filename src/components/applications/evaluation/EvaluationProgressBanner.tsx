"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import {
  api,
  JobEvaluationStatus,
  EvaluationBatchStatus,
} from "@/lib/api-client";
import showToast from "@/lib/toast";

interface EvaluationProgressBannerProps {
  jobId: string;
  isCalibrated: boolean;
  onEvaluationComplete?: () => void;
}

type BannerState =
  | "not_calibrated"
  | "no_evaluation"
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "loading";

/**
 * EvaluationProgressBanner - Shows evaluation status and controls
 *
 * Features:
 * - Shows calibration required message if job not calibrated
 * - Start Evaluation button when no evaluation exists
 * - Progress bar during evaluation
 * - Retry button for failed evaluations
 * - Auto-refresh while processing
 */
export function EvaluationProgressBanner({
  jobId,
  isCalibrated,
  onEvaluationComplete,
}: EvaluationProgressBannerProps) {
  const [state, setState] = useState<BannerState>("loading");
  const [status, setStatus] = useState<JobEvaluationStatus | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!isCalibrated) {
      setState("not_calibrated");
      return;
    }

    try {
      const data = await api.aiResumeEval.getJobEvaluationStatus(jobId);
      setStatus(data);

      if (!data.has_evaluation || !data.latest_batch) {
        setState("no_evaluation");
      } else {
        const batchStatus = data.latest_batch.status;
        if (batchStatus === "completed") {
          setState("completed");
        } else if (batchStatus === "failed" || batchStatus === "cancelled") {
          setState("failed");
        } else if (batchStatus === "processing") {
          setState("processing");
        } else {
          setState("pending");
        }
      }
    } catch (error) {
      console.error("Failed to fetch evaluation status:", error);
      setState("no_evaluation");
    }
  }, [jobId, isCalibrated]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-refresh while processing
  useEffect(() => {
    if (state !== "processing" && state !== "pending") return;

    const interval = setInterval(async () => {
      await fetchStatus();

      // Check if just completed
      if (status?.latest_batch?.status === "completed") {
        onEvaluationComplete?.();
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [state, fetchStatus, status, onEvaluationComplete]);

  const handleStartEvaluation = async () => {
    setIsStarting(true);
    try {
      const result = await api.aiResumeEval.startJobEvaluation(jobId);
      showToast.success(result.message);
      setState("processing");
      await fetchStatus();
    } catch (error) {
      console.error("Failed to start evaluation:", error);
      showToast.error(
        error instanceof Error ? error.message : "Failed to start evaluation"
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handleRetryFailed = async () => {
    if (!status?.latest_batch?.batch_id) return;

    setIsRetrying(true);
    try {
      const result = await api.aiResumeEval.retryFailedTasks(
        status.latest_batch.batch_id
      );
      showToast.success(result.message);
      setState("processing");
      await fetchStatus();
    } catch (error) {
      console.error("Failed to retry:", error);
      showToast.error(
        error instanceof Error ? error.message : "Failed to retry failed tasks"
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancel = async () => {
    if (!status?.latest_batch?.batch_id) return;

    setIsCancelling(true);
    try {
      const result = await api.aiResumeEval.cancelBatch(
        status.latest_batch.batch_id
      );
      showToast.success(result.message);
      await fetchStatus();
    } catch (error) {
      console.error("Failed to cancel:", error);
      showToast.error(
        error instanceof Error ? error.message : "Failed to cancel evaluation"
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Not calibrated state
  if (state === "not_calibrated") {
    return (
      <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">
              Job Calibration Required
            </h3>
            <p className="text-sm text-amber-600 mt-0.5">
              Calibrate this job to enable AI resume evaluation. Go to the job
              settings and click &quot;Calibrate&quot;.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (state === "loading") {
    return (
      <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="text-sm text-gray-600">
            Loading evaluation status...
          </span>
        </div>
      </div>
    );
  }

  // No evaluation - show start button
  if (state === "no_evaluation") {
    return (
      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                AI Resume Evaluation
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                Run AI analysis on all applications to get detailed scores and
                insights.
              </p>
            </div>
          </div>
          <button
            onClick={handleStartEvaluation}
            disabled={isStarting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Evaluation
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Get batch details for progress states
  const batch = status?.latest_batch;
  const progress = batch?.progress;
  const completedCount = (progress?.completed || 0) + (progress?.skipped || 0);
  const totalCount = progress?.total || 0;
  const failedCount = progress?.failed || 0;
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Processing state - show progress
  if (state === "processing" || state === "pending") {
    return (
      <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Evaluating Applications
              </h3>
              <p className="text-sm text-gray-600">
                {completedCount} of {totalCount} completed
                {failedCount > 0 && (
                  <span className="text-amber-600 ml-2">
                    ({failedCount} failed)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-semibold text-blue-600">
                {Math.round(progressPercent)}%
              </span>
              {batch?.timing?.estimated_completion_at && (
                <p className="text-xs text-gray-500 mt-1">
                  ETA:{" "}
                  {new Date(
                    batch.timing.estimated_completion_at
                  ).toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              {isCancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Cancel
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
          {failedCount > 0 && (
            <div
              className="absolute h-full bg-red-400 rounded-full"
              style={{
                width: `${(failedCount / totalCount) * 100}%`,
                left: `${progressPercent}%`,
              }}
            />
          )}
        </div>

        {/* Status breakdown */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          {(progress?.queued || 0) > 0 && (
            <span>Queued: {progress?.queued}</span>
          )}
          {(progress?.processing || 0) > 0 && (
            <span>Processing: {progress?.processing}</span>
          )}
          {completedCount > 0 && (
            <span className="text-green-600">Completed: {completedCount}</span>
          )}
          {failedCount > 0 && (
            <span className="text-red-600">Failed: {failedCount}</span>
          )}
        </div>
      </div>
    );
  }

  // Completed state
  if (state === "completed") {
    return (
      <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Evaluation Complete</h3>
              <p className="text-sm text-gray-600">
                {completedCount} applications evaluated
                {failedCount > 0 && (
                  <span className="text-amber-600 ml-1">
                    ({failedCount} failed)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {failedCount > 0 && (
              <button
                onClick={handleRetryFailed}
                disabled={isRetrying}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
              >
                {isRetrying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Retry Failed
              </button>
            )}
            <button
              onClick={handleStartEvaluation}
              disabled={isStarting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isStarting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Re-evaluate All
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (state === "failed") {
    return (
      <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Evaluation Failed</h3>
              <p className="text-sm text-gray-600">
                {failedCount} of {totalCount} applications failed to evaluate.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRetryFailed}
              disabled={isRetrying}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isRetrying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Retry Failed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
