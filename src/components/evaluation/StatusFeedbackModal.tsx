import React, { useState, useCallback, useEffect, useRef } from "react";
import { CloseIcon } from "./Icons";
import type { ApplicationStatus } from "./types";
import {
  isHighSignalTransition,
  getStatusUpdateMessaging,
  combineTagsAndNotes,
} from "@/lib/status-update-config";
import "./styles.css";

export interface StatusFeedbackModalProps {
  candidateName: string;
  currentStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  aiScore: number;
  onSubmit: (notes?: string) => void;
  onCancel: () => void;
}

export const StatusFeedbackModal: React.FC<StatusFeedbackModalProps> = ({
  candidateName,
  currentStatus,
  newStatus,
  aiScore,
  onSubmit,
  onCancel,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Get messaging based on transition
  const highSignalResult = isHighSignalTransition(
    currentStatus,
    newStatus,
    aiScore
  );
  const messaging = getStatusUpdateMessaging(highSignalResult.scenario);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  // Handle click outside
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onCancel();
      }
    },
    [onCancel]
  );

  // Toggle tag selection
  const handleTagClick = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Handle submit
  const handleSubmit = useCallback(() => {
    const notes = combineTagsAndNotes(selectedTags, customNotes);
    onSubmit(notes);
  }, [selectedTags, customNotes, onSubmit]);

  return (
    <div className="status-feedback-modal-overlay" onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className="status-feedback-modal"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="status-feedback-modal-header">
          <div className="status-feedback-modal-header-left">
            <span className="status-feedback-modal-candidate">
              {candidateName}
            </span>
          </div>
          <button
            type="button"
            className="status-feedback-modal-close"
            onClick={onCancel}
            aria-label="Close modal"
          >
            <CloseIcon strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="status-feedback-modal-content">
          {/* Title */}
          <h2 className="status-feedback-modal-title">{messaging.title}</h2>

          {/* Subtitle */}
          {messaging.subtitle && (
            <p className="status-feedback-modal-subtitle">
              {messaging.subtitle}
            </p>
          )}

          {/* Tags */}
          {messaging.tags.length > 0 && (
            <div className="status-feedback-modal-tags-section">
              <p className="status-feedback-modal-tags-label">
                {messaging.quickPicksLabel}
              </p>
              <div className="status-feedback-modal-tags">
                {messaging.tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`status-feedback-modal-tag ${isSelected ? "selected" : ""}`}
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="status-feedback-modal-notes-section">
            <label className="status-feedback-modal-notes-label">
              Notes (optional)
            </label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={3}
              className="status-feedback-modal-textarea"
              placeholder="Add additional context..."
            />
          </div>

          {/* Hint */}
          {messaging.hint && (
            <p className="status-feedback-modal-hint">
              <span className="status-feedback-modal-hint-icon">*</span>
              <span>{messaging.hint}</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="status-feedback-modal-footer">
          <button
            type="button"
            className="status-feedback-modal-btn status-feedback-modal-btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="status-feedback-modal-btn status-feedback-modal-btn-submit"
            onClick={handleSubmit}
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusFeedbackModal;
