"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Job, BasicJobData } from "@/types";
import { EvaluationFramework } from "@/types/evaluationFramework";
import { getJobById } from "@/lib/jobs";
import { jobsAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import JobCalibration from "@/components/calibration";
import EvaluationFrameworkView from "@/components/calibration/EvaluationFrameworkView";
import { ArrowLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";

function transformJobToBasicJobData(job: Job): BasicJobData {
  return {
    title: job.title,
    description: job.description,
    positionType: job.position_type,
    department: job.department,
    locationType: job.location_type,
    experienceRange: {
      min: job.min_experience_years,
      max: job.max_experience_years,
    },
  };
}

export default function CalibratePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingFramework, setExistingFramework] =
    useState<EvaluationFramework | null>(null);
  const [showRecalibrate, setShowRecalibrate] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return;

      try {
        setIsLoading(true);
        const jobData = await getJobById(jobId);
        if (!jobData) {
          setError("Job not found");
          return;
        }
        setJob(jobData);

        // If job is calibrated, fetch the existing framework
        if (jobData.calibrated_at) {
          try {
            const calibration = await jobsAPI.getCalibration(jobId);
            if (calibration.evaluation_framework) {
              setExistingFramework(
                calibration.evaluation_framework as EvaluationFramework
              );
            }
          } catch (err) {
            console.error("Failed to load calibration:", err);
          }
        }
      } catch (err) {
        console.error("Failed to load job:", err);
        if (
          err instanceof Error &&
          err.message.includes("Authentication required")
        ) {
          router.push("/sign-in");
          return;
        }
        setError("Failed to load job. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId, router]);

  const handleBack = () => {
    router.push(`/jobs/${jobId}`);
  };

  const handleComplete = (completedJobId: string) => {
    router.push(`/jobs/${completedJobId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-semibold text-gray-900">
          {error || "Job not found"}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The job posting you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
        <div className="mt-6">
          <Link href="/jobs">
            <Button>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // If job is calibrated and we have the framework, show it
  if (job.calibrated_at && existingFramework && !showRecalibrate) {
    return (
      <div>
        {/* Re-calibrate banner */}
        <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800">
              This job was calibrated on{" "}
              {new Date(job.calibrated_at).toLocaleDateString()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecalibrate(true)}
          >
            Re-calibrate
          </Button>
        </div>
        <EvaluationFrameworkView
          framework={existingFramework}
          onBack={handleBack}
          onDone={handleBack}
        />
      </div>
    );
  }

  const basicJobData = transformJobToBasicJobData(job);

  return (
    <JobCalibration
      jobId={jobId}
      basicJobData={basicJobData}
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
}
