"use client";

import React, { useState, useEffect } from "react";
import { Application, ApplicationStatus } from "@/types";
import { getCandidateById, updateCandidateStatus } from "@/lib/candidates";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import showToast from "@/lib/toast";
import {
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
import { SkillsAnalysis } from "./SkillsAnalysis";

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

interface ApplicationDetailsDrawerProps {
  applicationId: string;
  onStatusChange?: (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => void;
}

export function ApplicationDetailsDrawer({
  applicationId,
  onStatusChange,
}: ApplicationDetailsDrawerProps) {
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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(
    null
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState("");

  useEffect(() => {
    const loadApplication = async () => {
      if (applicationId) {
        try {
          console.log("Loading application:", applicationId);
          const data = await getCandidateById(applicationId);
          console.log("Application data:", data);
          if (data) {
            setApplication(data);
          }
        } catch (error) {
          console.error("Error loading application:", error);
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

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (!application || newStatus === application.status) return;

    const highSignalResult = isHighSignalTransition(
      application.status,
      newStatus,
      application.ai_score || 0
    );

    if (highSignalResult.isHighSignal) {
      // Show modal for high-signal transitions
      setPendingStatus(newStatus);
      setShowStatusModal(true);
    } else {
      // Update immediately for regular transitions
      handleStatusUpdate(newStatus);
    }
  };

  const handleStatusUpdate = async (
    newStatus: ApplicationStatus,
    notes?: string
  ) => {
    if (!application) return;

    try {
      setIsUpdatingStatus(true);

      await updateCandidateStatus(application.id, newStatus, notes);

      setApplication({
        ...application,
        status: newStatus,
        updated_at: new Date().toISOString(),
      });

      setSelectedTags([]);
      setCustomNotes("");
      setShowStatusModal(false);
      setPendingStatus(null);

      showToast.success("Status updated successfully!");

      if (onStatusChange) {
        onStatusChange(application.id, newStatus);
      }

      const response = await api.applications.getApplicationHistory(
        application.id
      );
      setStatusHistory(response.data || []);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update status";
      showToast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleModalSubmit = async () => {
    if (!pendingStatus) return;

    const finalNotes = combineTagsAndNotes(selectedTags, customNotes);
    await handleStatusUpdate(pendingStatus, finalNotes);
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
      <div className="flex items-center justify-center py-12">
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
          Unable to load application details.
        </p>
      </div>
    );
  }

  const currentStatus = APPLICATION_STATUSES.find(
    (s) => s.value === application.status
  );
  const candidateName = `${application.first_name} ${application.last_name}`;

  const highSignalResult = pendingStatus
    ? isHighSignalTransition(
        application.status,
        pendingStatus,
        application.ai_score || 0
      )
    : null;
  const statusUpdateConfig = highSignalResult
    ? getStatusUpdateMessaging(highSignalResult.scenario)
    : null;

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 pr-20 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{candidateName}</h2>
            <p className="text-sm text-gray-500">
              Applied{" "}
              {new Date(
                application.applied_at || application.created_at
              ).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${currentStatus?.color || "bg-gray-100 text-gray-800"} mr-2`}
          >
            {currentStatus?.label || application.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="bg-gray-100 w-full">
            <TabsTrigger
              value="analysis"
              className="flex-1 data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-[var(--color-primary)]"
            >
              Analysis
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="flex-1 data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-[var(--color-primary)]"
            >
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="mt-6 space-y-6">
            <SkillsAnalysis />
          </TabsContent>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Row 1: Contact Information + Professional Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <dt className="text-xs font-medium text-gray-500">
                        Email
                      </dt>
                      <dd className="text-sm text-gray-900">
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
                        <dt className="text-xs font-medium text-gray-500">
                          Phone
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {application.phone}
                        </dd>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Links */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Professional Links
                </h3>
                {application.linkedin_url ||
                application.github_url ||
                application.portfolio_url ? (
                  <div className="space-y-3">
                    {application.linkedin_url && (
                      <div>
                        <Label className="text-xs">LinkedIn</Label>
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
                        <Label className="text-xs">GitHub</Label>
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
                        <Label className="text-xs">Portfolio</Label>
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
                ) : (
                  <p className="text-sm text-gray-500">No links provided</p>
                )}
              </div>
            </div>

            {/* Row 2: Compensation & Availability + Resume */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Compensation & Availability */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Compensation & Availability
                </h3>
                <dl className="grid grid-cols-1 gap-3">
                  {application.current_ctc && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500">
                        Current CTC
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        ₹{application.current_ctc.toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {application.expected_ctc && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500">
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
                        <dt className="text-xs font-medium text-gray-500">
                          Notice Period
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {application.notice_period_days} days
                        </dd>
                      </div>
                    )}
                </dl>
              </div>

              {/* Resume Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Resume
                </h3>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleViewResume}
                    disabled={isLoadingResume}
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Open Resume in New Tab
                  </Button>
                  <Button
                    onClick={handleDownloadResume}
                    disabled={isLoadingResume}
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
                {application.resume_filename && (
                  <p className="text-xs text-gray-500 mt-2">
                    {application.resume_filename}
                  </p>
                )}
              </div>
            </div>

            {/* Screening Answers */}
            {application.screening_answers &&
              Object.keys(application.screening_answers).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
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
              )}

            {/* Status Update */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">
                  Application Status
                </h3>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Change Status
                </Label>
                <select
                  value={application.status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as ApplicationStatus)
                  }
                  disabled={isUpdatingStatus}
                  className="mt-2 w-full px-4 py-3 text-base font-medium border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {APPLICATION_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-600 italic">
                  Changing status may trigger additional questions to help
                  improve candidate matching
                </p>
              </div>
            </div>

            {/* Status History */}
            {statusHistory.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-60">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Status History
                </h3>
                <div className="space-y-2">
                  {statusHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start space-x-2 pb-2 border-b border-gray-200 last:border-0"
                    >
                      <ClockIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700">
                          Changed to{" "}
                          <span className="font-medium">
                            {
                              APPLICATION_STATUSES.find(
                                (s) => s.value === entry.to_status
                              )?.label
                            }
                          </span>
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.notes}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(entry.created_at).toLocaleString()}
                          {entry.changed_by &&
                            ` by ${entry.changed_by.full_name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && statusUpdateConfig && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => {
            setShowStatusModal(false);
            setPendingStatus(null);
            setSelectedTags([]);
            setCustomNotes("");
          }}
        >
          <div
            className="w-full max-w-md bg-white rounded-lg p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {statusUpdateConfig.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {statusUpdateConfig.subtitle}
            </p>

            {/* Quick Pick Tags */}
            {statusUpdateConfig.tags && statusUpdateConfig.tags.length > 0 && (
              <div className="mb-4">
                <Label className="text-xs mb-2">
                  {statusUpdateConfig.quickPicksLabel}
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {statusUpdateConfig.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Notes */}
            <div className="mb-4">
              <Label className="text-xs mb-2">
                Additional Notes (Optional)
              </Label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Add any additional context..."
                className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusModal(false);
                  setPendingStatus(null);
                  setSelectedTags([]);
                  setCustomNotes("");
                }}
                className="flex-1"
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                onClick={handleModalSubmit}
                disabled={isUpdatingStatus}
                className="flex-1"
              >
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </div>

            {statusUpdateConfig.hint && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                {statusUpdateConfig.hint}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
