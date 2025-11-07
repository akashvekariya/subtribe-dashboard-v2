"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { jobSchema, type JobInput } from "@/lib/validations";
import { getJobById, updateJob } from "@/lib/jobs";
import { type Job, type PositionType, type LocationType } from "@/types";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/shared/FormField";
import { Label } from "@/components/ui/Label";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { ScreeningQuestionsBuilder } from "@/components/ui/ScreeningQuestionsBuilder";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import showToast from "@/lib/toast";

const COMMON_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "C#",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Next.js",
  "Vue.js",
  "Angular",
  "Express.js",
  "FastAPI",
  "Django",
  "Flask",
  "Spring Boot",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Git",
  "CI/CD",
  "GraphQL",
  "REST APIs",
  "Microservices",
  "System Design",
  "Data Structures",
  "Algorithms",
  "Machine Learning",
  "Data Science",
  "DevOps",
  "Testing",
];

const POSITION_TYPES: { value: PositionType; label: string }[] = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "other", label: "Other" },
  { value: "volunteer", label: "Volunteer" },
  { value: "internship", label: "Internship" },
];

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "INR", label: "Indian Rupee", symbol: "₹" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
];

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JobInput>({
    resolver: zodResolver(jobSchema) as Resolver<JobInput>,
    defaultValues: {
      position_type: "full_time" as const,
      location_type: "remote" as const,
      salary_currency: "INR",
      required_skills: [],
      preferred_skills: [],
      screening_questions: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = form;

  const watchedValues = watch();
  const selectedCurrency = CURRENCIES.find(
    (c) => c.value === watchedValues.salary_currency
  );
  const locationType = watchedValues.location_type;
  const showLocationFields =
    locationType === "hybrid" || locationType === "onsite";

  useEffect(() => {
    const loadJob = async () => {
      if (jobId) {
        try {
          const jobData = await getJobById(jobId);
          if (jobData) {
            setJob(jobData);

            // Populate form with existing data
            reset({
              title: jobData.title,
              description: jobData.description,
              position_type: jobData.position_type,
              department: jobData.department || undefined,
              location_type: jobData.location_type,
              location_city: jobData.location_city || undefined,
              location_state: jobData.location_state || undefined,
              location_country: jobData.location_country || undefined,
              // Use ?? instead of || to handle 0 values correctly
              salary_min: jobData.salary_min ?? undefined,
              salary_max: jobData.salary_max ?? undefined,
              salary_currency: jobData.salary_currency || "INR",
              required_skills: jobData.required_skills || [],
              preferred_skills: jobData.preferred_skills || [],
              // Use ?? instead of || to handle 0 values correctly
              min_experience_years: jobData.min_experience_years ?? undefined,
              max_experience_years: jobData.max_experience_years ?? undefined,
              screening_questions: jobData.screening_questions || [],
            });
          }
        } catch {
          showToast.error("Failed to load job details");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadJob();
  }, [jobId, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (!job) return;

    try {
      setIsSubmitting(true);

      // Build update data matching backend API
      const jobData: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        position_type: data.position_type,
        location_type: data.location_type,
        salary_currency: data.salary_currency,
        required_skills: data.required_skills || [],
        preferred_skills: data.preferred_skills || [],
        screening_questions: (data.screening_questions || []).map(
          (q, index: number) => ({
            id: `q${index + 1}`,
            type: q.type,
            question: q.question,
            required: q.required,
            options: q.options || undefined,
          })
        ),
      };

      // Optional fields
      if (data.department) jobData.department = data.department;
      if (data.location_city) jobData.location_city = data.location_city;
      if (data.location_state) jobData.location_state = data.location_state;
      if (data.location_country)
        jobData.location_country = data.location_country;

      if (
        data.salary_min !== undefined &&
        data.salary_min !== null &&
        !isNaN(data.salary_min)
      ) {
        jobData.salary_min = data.salary_min;
      }
      if (
        data.salary_max !== undefined &&
        data.salary_max !== null &&
        !isNaN(data.salary_max)
      ) {
        jobData.salary_max = data.salary_max;
      }
      if (
        data.min_experience_years !== undefined &&
        data.min_experience_years !== null &&
        !isNaN(data.min_experience_years)
      ) {
        jobData.min_experience_years = data.min_experience_years;
      }
      if (
        data.max_experience_years !== undefined &&
        data.max_experience_years !== null &&
        !isNaN(data.max_experience_years)
      ) {
        jobData.max_experience_years = data.max_experience_years;
      }

      const updatedJob = await updateJob(job.id, jobData as Partial<Job>);

      if (updatedJob) {
        showToast.success("Job updated successfully!");
        router.push(`/jobs/${job.id}`);
      }
    } catch {
      showToast.error("Failed to update job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-semibold text-gray-900">Job not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The job posting you&apos;re trying to edit doesn&apos;t exist or has
          been deleted.
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/jobs/${job.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Job
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900">
            Edit Job Posting
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update your job posting details
          </p>
        </div>
      </div>

      {/* Status Management */}
      {job && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Job Status
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Status</p>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  job.status === "active"
                    ? "bg-green-100 text-green-800"
                    : job.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {job.status === "active"
                  ? "Active"
                  : job.status === "draft"
                    ? "Draft"
                    : "Closed"}
              </span>
            </div>
            <div className="flex space-x-2">
              {job.status === "draft" && (
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      const updatedJob = await updateJob(job.id, {
                        status: "active",
                      });
                      if (updatedJob) {
                        setJob(updatedJob);
                        showToast.success("Job published successfully!");
                      }
                    } catch {
                      showToast.error("Failed to publish job");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Publish Job
                </Button>
              )}
              {job.status === "active" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      const updatedJob = await updateJob(job.id, {
                        status: "closed",
                      });
                      if (updatedJob) {
                        setJob(updatedJob);
                        showToast.success("Job closed successfully!");
                      }
                    } catch {
                      showToast.error("Failed to close job");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Close Job
                </Button>
              )}
            </div>
          </div>
          {job.status === "draft" && (
            <p className="mt-4 text-sm text-gray-500">
              This job is in draft mode. Publish it to make it visible to
              candidates.
            </p>
          )}
          {job.status === "active" && (
            <p className="mt-4 text-sm text-gray-500">
              This job is active and visible to candidates.
            </p>
          )}
          {job.status === "closed" && (
            <p className="mt-4 text-sm text-gray-500">
              This job is closed and no longer accepting applications.
            </p>
          )}
        </div>
      )}

      {/* Form - Same as create, just with pre-filled values */}
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="space-y-6">
            <FormField
              id="title"
              label="Job Title"
              placeholder="e.g. Senior Backend Engineer"
              required
              error={errors.title?.message}
              {...register("title")}
            />

            <div className="space-y-2">
              <Label htmlFor="description">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <div className="text-xs text-gray-500 mb-2">
                Supports: <strong>**bold**</strong>, <em>*italic*</em>, bullet
                lists (- item), and numbered lists (1. item)
              </div>
              <textarea
                id="description"
                rows={12}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Provide a detailed job description..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}

              {/* Live Preview */}
              {watchedValues.description &&
                watchedValues.description.trim() !== "" && (
                  <div className="mt-4 border border-gray-300 rounded-md p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold text-gray-700">
                        Live Preview
                      </Label>
                      <span className="text-xs text-gray-500">
                        How it will appear to candidates
                      </span>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <MarkdownRenderer
                        content={watchedValues.description}
                        className="text-sm text-gray-700"
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Job Type & Department */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Job Type & Department
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="position_type">
                Position Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="position_type"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("position_type")}
              >
                {POSITION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.position_type && (
                <p className="text-sm text-red-500">
                  {errors.position_type.message}
                </p>
              )}
            </div>

            <FormField
              id="department"
              label="Department"
              placeholder="e.g. Engineering, Product, Sales"
              error={errors.department?.message}
              {...register("department")}
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Location</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location_type">
                Location Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="location_type"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("location_type")}
              >
                {LOCATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.location_type && (
                <p className="text-sm text-red-500">
                  {errors.location_type.message}
                </p>
              )}
              {locationType === "remote" && (
                <p className="text-sm text-gray-500">
                  This position is fully remote - no specific location required.
                </p>
              )}
            </div>

            {/* Show location fields only for hybrid/onsite */}
            {showLocationFields && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="location_city"
                    placeholder="e.g. Bangalore"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register("location_city")}
                  />
                  {errors.location_city && (
                    <p className="text-sm text-red-500">
                      {errors.location_city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_state">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="location_state"
                    placeholder="e.g. Karnataka"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register("location_state")}
                  />
                  {errors.location_state && (
                    <p className="text-sm text-red-500">
                      {errors.location_state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_country">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="location_country"
                    placeholder="e.g. India"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register("location_country")}
                  />
                  {errors.location_country && (
                    <p className="text-sm text-red-500">
                      {errors.location_country.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Salary & Compensation */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Salary & Compensation
          </h2>
          <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md mb-4">
            💡 Salary information is for internal use only and won&apos;t be
            displayed to candidates on the public job page.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="salary_currency">Currency</Label>
              <select
                id="salary_currency"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("salary_currency")}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_min">Minimum Salary</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {selectedCurrency?.symbol}
                  </span>
                  <input
                    id="salary_min"
                    type="number"
                    step="10000"
                    placeholder="1000000"
                    className="flex w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register("salary_min", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                  />
                </div>
                {errors.salary_min && (
                  <p className="text-sm text-red-500">
                    {errors.salary_min.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_max">Maximum Salary</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {selectedCurrency?.symbol}
                  </span>
                  <input
                    id="salary_max"
                    type="number"
                    step="10000"
                    placeholder="2000000"
                    className="flex w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register("salary_max", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                  />
                </div>
                {errors.salary_max && (
                  <p className="text-sm text-red-500">
                    {errors.salary_max.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Experience Requirements */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Experience Requirements
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Specify years of experience required (separate from experience level
            above)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_experience_years">
                Minimum Experience (Years)
              </Label>
              <input
                id="min_experience_years"
                type="number"
                min="0"
                max="50"
                placeholder="e.g. 5"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("min_experience_years", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
              {errors.min_experience_years && (
                <p className="text-sm text-red-500">
                  {errors.min_experience_years.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_experience_years">
                Maximum Experience (Years)
              </Label>
              <input
                id="max_experience_years"
                type="number"
                min="0"
                max="50"
                placeholder="e.g. 10"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("max_experience_years", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
              {errors.max_experience_years && (
                <p className="text-sm text-red-500">
                  {errors.max_experience_years.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Skills & Requirements
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <Controller
                name="required_skills"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={COMMON_SKILLS}
                    placeholder="Select or type required skills..."
                    allowCustom={true}
                  />
                )}
              />
              {errors.required_skills && (
                <p className="text-sm text-red-500">
                  {errors.required_skills.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Preferred Skills</Label>
              <Controller
                name="preferred_skills"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    value={field.value || []}
                    onChange={field.onChange}
                    options={COMMON_SKILLS}
                    placeholder="Select or type preferred skills..."
                    allowCustom={true}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Screening Questions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Screening Questions
          </h2>

          <Controller
            name="screening_questions"
            control={control}
            render={({ field }) => (
              <ScreeningQuestionsBuilder
                questions={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <p className="text-xs text-gray-500 mt-2">
            Add custom questions to help filter candidates before they apply
          </p>
        </div>

        {/* Form Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-end space-x-3">
            <Link href={`/jobs/${job.id}`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
