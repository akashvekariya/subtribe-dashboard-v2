"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Application, ApplicationStatus } from "@/types";
import { getCandidateById, updateCandidateStatus } from "@/lib/candidates";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import showToast from "@/lib/toast";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  isHighSignalTransition,
  getStatusUpdateMessaging,
  combineTagsAndNotes,
} from "@/lib/status-update-config";

const APPLICATION_STATUSES = [
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
  {
    value: "screening",
    label: "Screening",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "interviewing",
    label: "Interviewing",
    color: "bg-purple-100 text-purple-800",
  },
  { value: "offer", label: "Offer", color: "bg-green-100 text-green-800" },
  { value: "hired", label: "Hired", color: "bg-emerald-100 text-emerald-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
];

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [statusHistory, setStatusHistory] = useState<
    Array<{
      id: string;
      from_status: string | null;
      to_status: string;
      changed_by: { id: string; full_name: string } | null;
      notes: string | null;
      created_at: string;
    }>
  >([]);

  // Status update form state
  const [selectedStatus, setSelectedStatus] =
    useState<ApplicationStatus | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState("");

  useEffect(() => {
    const loadApplication = async () => {
      if (applicationId) {
        try {
          const data = await getCandidateById(applicationId);
          setApplication(data);
        } catch {
          showToast.error("Failed to load application details");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadApplication();
  }, [applicationId]);

  useEffect(() => {
    const loadHistory = async () => {
      if (applicationId) {
        try {
          const response =
            await api.applications.getApplicationHistory(applicationId);
          setStatusHistory(response.data || []);
        } catch {
          // Silently fail - status history is not critical
        }
      }
    };

    loadHistory();
  }, [applicationId]);

  useEffect(() => {
    const loadResumeUrl = async () => {
      if (applicationId) {
        try {
          const response =
            await api.applications.getResumeViewUrl(applicationId);
          setResumeUrl(response.url);
        } catch {
          // Silently fail - resume preview is optional
        }
      }
    };

    loadResumeUrl();
  }, [applicationId]);

  useEffect(() => {
    // Initialize selectedStatus when application loads
    if (application) {
      setSelectedStatus(application.status);
    }
  }, [application]);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleStatusSubmit = async () => {
    if (!application || !selectedStatus) return;

    try {
      setIsUpdatingStatus(true);

      const finalNotes = combineTagsAndNotes(selectedTags, customNotes);

      // Update status via API
      await updateCandidateStatus(application.id, selectedStatus, finalNotes);

      // Update local state
      setApplication({
        ...application,
        status: selectedStatus,
        updated_at: new Date().toISOString(),
      });

      // Reset form state
      setSelectedTags([]);
      setCustomNotes("");

      showToast.success("Status updated successfully!");

      // Reload history after status change
      const response = await api.applications.getApplicationHistory(
        application.id
      );
      setStatusHistory(response.data || []);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update status";
      const errorCode = (error as { code?: string })?.code
        ? ` (${(error as { code?: string }).code})`
        : "";
      showToast.error(`${errorMessage}${errorCode}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleViewResume = async () => {
    if (!application) return;

    try {
      setIsLoadingResume(true);
      const response = await api.applications.getResumeViewUrl(application.id);
      window.open(response.url, "_blank");
    } catch {
      showToast.error("Failed to load resume");
    } finally {
      setIsLoadingResume(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!application) return;

    try {
      setIsLoadingResume(true);
      const response = await api.applications.getResumeViewUrl(application.id);
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = response.url;
      link.download =
        response.filename ||
        `${application.first_name}_${application.last_name}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      showToast.error("Failed to download resume");
    } finally {
      setIsLoadingResume(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <h3 className="text-sm font-semibold text-gray-900">
          Application not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The application you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
        <div className="mt-6">
          <Button onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentStatus = APPLICATION_STATUSES.find(
    (s) => s.value === application.status
  );
  const candidateName = `${application.first_name} ${application.last_name}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900">
              {candidateName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Applied{" "}
              {new Date(
                application.applied_at || application.created_at
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${currentStatus?.color || "bg-gray-100 text-gray-800"}`}
          >
            {currentStatus?.label || application.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Contact Information
              </h3>
              <dl className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a
                        href={`mailto:${application.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {application.email}
                      </a>
                    </dd>
                  </div>
                </div>
                {application.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Phone
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {application.phone}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Professional Links */}
          {(application.linkedin_url ||
            application.github_url ||
            application.portfolio_url) && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Professional Links
                </h3>
                <div className="space-y-3">
                  {application.linkedin_url && (
                    <div>
                      <Label>LinkedIn</Label>
                      <a
                        href={application.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:underline truncate"
                      >
                        {application.linkedin_url}
                      </a>
                    </div>
                  )}
                  {application.github_url && (
                    <div>
                      <Label>GitHub</Label>
                      <a
                        href={application.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:underline truncate"
                      >
                        {application.github_url}
                      </a>
                    </div>
                  )}
                  {application.portfolio_url && (
                    <div>
                      <Label>Portfolio</Label>
                      <a
                        href={application.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:underline truncate"
                      >
                        {application.portfolio_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Compensation & Notice Period */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Compensation & Availability
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {application.current_ctc && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Current CTC
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ₹{application.current_ctc.toLocaleString()}
                    </dd>
                  </div>
                )}
                {application.expected_ctc && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Expected CTC
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ₹{application.expected_ctc.toLocaleString()}
                    </dd>
                  </div>
                )}
                {application.notice_period_days !== undefined &&
                  application.notice_period_days !== null && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Notice Period
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {application.notice_period_days} days
                      </dd>
                    </div>
                  )}
              </dl>
            </div>
          </div>

          {/* Screening Answers */}
          {application.screening_answers &&
            Object.keys(application.screening_answers).length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Screening Questions
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(application.screening_answers).map(
                      ([questionId, answer]) => (
                        <div
                          key={questionId}
                          className="border-l-4 border-blue-500 pl-4"
                        >
                          <p className="text-sm font-medium text-gray-900 mb-2">
                            Question {questionId}
                          </p>
                          <p className="text-sm text-gray-700">{answer}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Resume Preview */}
          {resumeUrl && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Resume Preview
                  </h3>
                  <div className="flex items-center space-x-2">
                    {application.resume_filename && (
                      <span className="text-sm text-gray-600">
                        {application.resume_filename}
                      </span>
                    )}
                    <Button
                      onClick={handleViewResume}
                      disabled={isLoadingResume}
                      size="sm"
                      variant="outline"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      Open in New Tab
                    </Button>
                    <Button
                      onClick={handleDownloadResume}
                      disabled={isLoadingResume}
                      size="sm"
                      variant="outline"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <div
                  className="border border-gray-300 rounded-lg overflow-hidden"
                  style={{ height: "800px" }}
                >
                  <iframe
                    src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="w-full h-full"
                    title="Resume Preview"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Score */}
          {application.ai_score !== undefined &&
            application.ai_score !== null && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    AI Score
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">
                          {application.ai_score}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          / 100
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${application.ai_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Status Management */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Update Status
              </h3>

              {/* Status Dropdown */}
              <div className="mb-4">
                <Label htmlFor="status-select">Select New Status</Label>
                <select
                  id="status-select"
                  value={selectedStatus || application.status}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as ApplicationStatus);
                    // Reset form when status changes
                    setSelectedTags([]);
                    setCustomNotes("");
                  }}
                  disabled={isUpdatingStatus}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {APPLICATION_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional Feedback Section */}
              {selectedStatus &&
                selectedStatus !== application.status &&
                (() => {
                  const highSignalResult = isHighSignalTransition(
                    application.status,
                    selectedStatus,
                    application.ai_score || 0
                  );
                  const messaging = getStatusUpdateMessaging(
                    highSignalResult.scenario
                  );

                  return (
                    <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                      {/* Subtitle */}
                      {messaging.subtitle && (
                        <p className="text-sm text-gray-600 mb-4">
                          {messaging.subtitle}
                        </p>
                      )}

                      {/* Tags */}
                      {highSignalResult.isHighSignal &&
                        messaging.tags.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                              {messaging.quickPicksLabel}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {messaging.tags.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                                      isSelected
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                    }`}
                                  >
                                    {tag}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      {/* Notes Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (optional)
                        </label>
                        <textarea
                          value={customNotes}
                          onChange={(e) => setCustomNotes(e.target.value)}
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2.5 border"
                          placeholder="Add additional context..."
                        />
                      </div>

                      {/* Hint */}
                      {messaging.hint && (
                        <p className="text-xs text-gray-500 mt-3 flex items-start">
                          <span className="mr-1">💡</span>
                          <span>{messaging.hint}</span>
                        </p>
                      )}
                    </div>
                  );
                })()}

              {/* Submit Button */}
              <Button
                onClick={handleStatusSubmit}
                disabled={
                  isUpdatingStatus ||
                  !selectedStatus ||
                  selectedStatus === application.status
                }
                className="w-full"
              >
                {isUpdatingStatus ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          {/* Application Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Details
              </h3>
              <dl className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs text-gray-500">Applied</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Date(
                        application.applied_at || application.created_at
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs text-gray-500">Last Updated</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Date(application.updated_at).toLocaleDateString()}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Status History Timeline */}
      {statusHistory.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Status History
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {statusHistory.map((entry, index) => {
                  const isLast = index === statusHistory.length - 1;
                  const statusInfo = APPLICATION_STATUSES.find(
                    (s) => s.value === entry.to_status
                  );

                  return (
                    <li key={entry.id}>
                      <div className="relative pb-8">
                        {!isLast && (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                statusInfo?.color || "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <ClockIcon className="h-4 w-4" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-900">
                                Status changed to{" "}
                                <span className="font-medium">
                                  {statusInfo?.label || entry.to_status}
                                </span>
                                {entry.from_status && (
                                  <>
                                    {" "}
                                    from{" "}
                                    <span className="font-medium">
                                      {APPLICATION_STATUSES.find(
                                        (s) => s.value === entry.from_status
                                      )?.label || entry.from_status}
                                    </span>
                                  </>
                                )}
                              </p>
                              {entry.notes && (
                                <p className="mt-1 text-sm text-gray-600">
                                  {entry.notes}
                                </p>
                              )}
                              {entry.changed_by && (
                                <p className="mt-1 text-xs text-gray-500">
                                  by {entry.changed_by.full_name}
                                </p>
                              )}
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              <time dateTime={entry.created_at}>
                                {new Date(entry.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
