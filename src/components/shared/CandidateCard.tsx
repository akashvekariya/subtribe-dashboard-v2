import React, { useState } from "react";
import { Application, ApplicationStatus } from "@/types";
import { updateCandidateStatus } from "@/lib/candidates";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "./StatusBadge";
import { StatusUpdateModal } from "./StatusUpdateModal";
import showToast from "@/lib/toast";
import { isHighSignalTransition } from "@/lib/status-update-config";
import { getErrorMessage } from "@/lib/error";
import { STATUS_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import {
  UserCircleIcon,
  StarIcon,
  LinkIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

interface CandidateCardProps {
  candidate: Application;
  onStatusChange?: (candidateId: string, newStatus: ApplicationStatus) => void;
  onClick?: () => void;
}

/**
 * CandidateCard Component
 * Displays candidate information with status management
 */
export function CandidateCard({
  candidate,
  onStatusChange,
  onClick,
}: CandidateCardProps) {
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(
    null
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  const renderStars = (score: number) => {
    const stars = Math.round(score / 20);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) =>
          i < stars ? (
            <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={i} className="h-4 w-4 text-gray-300" />
          )
        )}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {candidate.ai_score || 0}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <UserCircleIcon className="h-10 w-10 text-gray-400 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-gray-900 truncate">
                {candidate.first_name} {candidate.last_name}
              </h3>
              <p className="text-sm text-gray-600">{candidate.email}</p>
              {candidate.phone && (
                <p className="text-sm text-gray-500">{candidate.phone}</p>
              )}

              <div className="mt-2">{renderStars(candidate.ai_score || 0)}</div>

              <div className="mt-2 flex items-center flex-wrap gap-x-3 gap-y-1 text-xs">
                {candidate.linkedin_url && (
                  <a
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <LinkIcon className="h-3.5 w-3.5 mr-1" />
                    LinkedIn
                  </a>
                )}
                <div className="flex items-center text-gray-500">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                  Applied{" "}
                  {formatDate(candidate.applied_at || candidate.created_at)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StatusBadge status={candidate.status} type="application" />

            <select
              value={candidate.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as ApplicationStatus)
              }
              className="h-7 text-xs border border-gray-300 rounded-md px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <div className="flex gap-1 mt-1">
              <Button
                variant="ghost"
                size="xs"
                onClick={handleViewResume}
                disabled={isLoadingResume}
              >
                {isLoadingResume ? "Loading..." : "View Resume"}
              </Button>

              <Button variant="ghost" size="xs" onClick={onClick}>
                View Details
              </Button>
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
