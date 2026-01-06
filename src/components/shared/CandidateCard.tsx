import React, { useState } from "react";
import { Application, ApplicationStatus } from "@/types";
import { updateCandidateStatus } from "@/lib/candidates";
import { api } from "@/lib/api-client";
import { StatusUpdateModal } from "./StatusUpdateModal";
import showToast from "@/lib/toast";
import { isHighSignalTransition } from "@/lib/status-update-config";
import { getErrorMessage } from "@/lib/error";
import { STATUS_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import {
  CalendarIcon,
  DocumentTextIcon,
  EyeIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

interface CandidateCardProps {
  candidate: Application;
  onStatusChange?: (candidateId: string, newStatus: ApplicationStatus) => void;
  onClick?: () => void;
  isSelected?: boolean;
  rank?: number;
  // Multi-select props
  isSelectMode?: boolean;
  isChecked?: boolean;
  onToggleSelect?: () => void;
}

/**
 * CandidateCard Component
 * Displays candidate information with status management
 */
export function CandidateCard({
  candidate,
  onStatusChange,
  onClick,
  isSelected = false,
  rank,
  isSelectMode = false,
  isChecked = false,
  onToggleSelect,
}: CandidateCardProps) {
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(
    null
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Get select styling based on current status
  const getSelectStyling = (status: ApplicationStatus) => {
    const colorMap: Record<ApplicationStatus, string> = {
      applied: "border-blue-300 bg-blue-50",
      screening: "border-yellow-300 bg-yellow-50",
      interviewing: "border-purple-300 bg-purple-50",
      offer: "border-green-300 bg-green-50",
      hired: "border-emerald-300 bg-emerald-50",
      rejected: "border-red-300 bg-red-50",
    };

    return colorMap[status] || "border-blue-300 bg-blue-50";
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    const highSignalResult = isHighSignalTransition(
      candidate.status,
      newStatus,
      candidate.ai_score || 0
    );

    if (highSignalResult.isHighSignal) {
      setPendingStatus(newStatus);
      setShowStatusModal(true);
    } else {
      try {
        await updateCandidateStatus(candidate.id, newStatus);
        onStatusChange?.(candidate.id, newStatus);
        showToast.success("Status updated successfully!");
      } catch (error) {
        showToast.error(getErrorMessage(error));
      }
    }
  };

  const handleModalSubmit = async (
    status: ApplicationStatus,
    notes?: string
  ) => {
    try {
      setIsUpdatingStatus(true);
      await updateCandidateStatus(candidate.id, status, notes);
      onStatusChange?.(candidate.id, status);
      showToast.success("Status updated successfully!");
      setShowStatusModal(false);
      setPendingStatus(null);
    } catch (error) {
      showToast.error(getErrorMessage(error));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleViewResume = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoadingResume(true);
      const response = await api.applications.getResumeViewUrl(candidate.id);
      window.open(response.url, "_blank");
    } catch {
      showToast.error("Failed to load resume");
    } finally {
      setIsLoadingResume(false);
    }
  };

  const renderProgressBar = (score: number) => {
    const normalizedScore = Math.min(Math.max(score, 0), 10); // Ensure score is between 0-10
    const percentage = (normalizedScore / 10) * 100;

    return (
      <div className="flex items-center gap-2.5">
        <div className="relative w-32 h-1.5 bg-gray-100 rounded-full">
          {/* Markers */}
          {[...Array(11)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2 bg-gray-200"
              style={{ left: `${(i / 10) * 100}%` }}
            />
          ))}
          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600 min-w-[2.25rem]">
          {Math.round(normalizedScore)}/10
        </span>
      </div>
    );
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.();
  };

  return (
    <div
      onClick={isSelectMode ? handleCheckboxClick : onClick}
      className={`rounded-lg transition-all cursor-pointer ${
        isChecked
          ? "bg-blue-50 border-2 border-blue-400"
          : isSelected
            ? "bg-blue-50 border-2 border-blue-200 shadow-lg"
            : "bg-white border-2 border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Select Checkbox or Rank Circle */}
            {isSelectMode ? (
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleSelect?.()}
                  onClick={(e) => e.stopPropagation()}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            ) : (
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${
                  rank === 1
                    ? "bg-yellow-50 border-yellow-300"
                    : rank === 2
                      ? "bg-gray-200 border-gray-400"
                      : rank === 3
                        ? "bg-orange-50 border-orange-300"
                        : "bg-gray-100 border-gray-300"
                }`}
              >
                <span
                  className={`text-sm font-semibold ${
                    rank === 1
                      ? "text-yellow-700"
                      : rank === 2
                        ? "text-gray-700"
                        : rank === 3
                          ? "text-orange-700"
                          : "text-gray-700"
                  }`}
                >
                  #{rank || "—"}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-gray-900 truncate">
                {candidate.first_name} {candidate.last_name}
              </h3>
              <p className="text-sm text-gray-600">{candidate.email}</p>

              {(candidate.evaluation_score != null ||
                candidate.ai_score != null) && (
                <div className="mt-2">
                  {renderProgressBar(
                    candidate.evaluation_score ?? candidate.ai_score ?? 0
                  )}
                </div>
              )}

              <div className="mt-2 flex items-center text-gray-500 text-xs">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                Applied{" "}
                {formatDate(candidate.applied_at || candidate.created_at)}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <select
              value={candidate.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as ApplicationStatus)
              }
              onClick={(e) => e.stopPropagation()}
              className={`h-8 text-sm font-medium border-2 rounded-md px-3 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm ${getSelectStyling(candidate.status)}`}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <div className="flex gap-1 mt-1">
              <a
                href={`mailto:${candidate.email}`}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                title="Send email"
              >
                <EnvelopeIcon className="h-3.5 w-3.5 text-gray-600" />
              </a>

              {candidate.phone && (
                <a
                  href={`tel:${candidate.phone}`}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                  title="Call phone"
                >
                  <PhoneIcon className="h-3.5 w-3.5 text-gray-600" />
                </a>
              )}

              <button
                onClick={handleViewResume}
                disabled={isLoadingResume}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={isLoadingResume ? "Loading..." : "View resume"}
              >
                <DocumentTextIcon className="h-3.5 w-3.5 text-gray-600" />
              </button>

              <button
                onClick={onClick}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                title="View details"
              >
                <EyeIcon className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showStatusModal && pendingStatus && (
        <StatusUpdateModal
          application={candidate}
          newStatus={pendingStatus}
          onSubmit={handleModalSubmit}
          onCancel={() => {
            setShowStatusModal(false);
            setPendingStatus(null);
          }}
          isSubmitting={isUpdatingStatus}
        />
      )}
    </div>
  );
}
