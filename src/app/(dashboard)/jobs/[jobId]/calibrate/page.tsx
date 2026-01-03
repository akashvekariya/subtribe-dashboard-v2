"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Job, BasicJobData } from "@/types";
import { getJobById } from "@/lib/jobs";
import { Button } from "@/components/ui/Button";
import JobCalibration from "@/components/calibration";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

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

  const basicJobData = transformJobToBasicJobData(job);

  return (
    <JobCalibration
      basicJobData={basicJobData}
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
}
