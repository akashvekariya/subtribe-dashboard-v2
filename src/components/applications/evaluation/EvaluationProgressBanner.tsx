"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { api, JobEvaluationStatus } from "@/lib/api-client";

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
 * EvaluationProgressBanner - Shows evaluation status
 *
 * Features:
 * - Shows "Evaluating" message during processing
 * - Shows "Complete" message when done
 * - Shows neutral message on failure
 * - Auto-refreshes while processing
 * - No manual controls (evaluations are automatic)
 */
export function EvaluationProgressBanner({
  jobId,
  isCalibrated,
  onEvaluationComplete,
}: EvaluationProgressBannerProps) {
  const [state, setState] = useState<BannerState>("loading");
  const [status, setStatus] = useState<JobEvaluationStatus | null>(null);

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

  // Don't show banner if not calibrated, loading, or no evaluation
  // Evaluations are automatic, so only show during processing/completed/failed
  if (
    state === "not_calibrated" ||
    state === "loading" ||
    state === "no_evaluation"
  ) {
    return null;
  }

  // Processing state - show simple evaluating message
  if (state === "processing" || state === "pending") {
    return (
      <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-100">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              Evaluating Applications
            </h3>
            <p className="text-sm text-gray-600">
              Subtribe is analyzing resumes. Results will appear automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Completed state
  if (state === "completed") {
    return (
      <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Evaluation Complete</h3>
            <p className="text-sm text-gray-600">
              All applications have been evaluated
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (state === "failed") {
    return (
      <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-200">
            <AlertTriangle className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Evaluation Issues</h3>
            <p className="text-sm text-gray-600">
              Some evaluations couldn&apos;t be completed. This doesn&apos;t
              affect applications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
