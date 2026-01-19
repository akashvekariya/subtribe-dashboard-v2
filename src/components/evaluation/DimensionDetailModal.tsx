import React, { memo, useCallback, useEffect } from "react";
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from "./Icons";
import { getColor } from "./colors";
import type { DimensionDetail, DimensionLevel } from "./types";
import "./styles.css";

// Level badge config
const levelConfig: Record<
  DimensionLevel,
  { label: string; bg: string; text: string }
> = {
  strong: { label: "Strong", bg: "#d1fae5", text: "#059669" },
  good: { label: "Good", bg: "#dbeafe", text: "#2563eb" },
  moderate: { label: "Moderate", bg: "#fef3c7", text: "#d97706" },
  weak: { label: "Weak", bg: "#ffedd5", text: "#ea580c" },
  poor: { label: "Poor", bg: "#fee2e2", text: "#dc2626" },
};

interface DimensionDetailModalProps {
  dimensions: DimensionDetail[];
  currentIndex: number;
  totalScore: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const DimensionDetailModal = memo<DimensionDetailModalProps>(
  ({ dimensions, currentIndex, totalScore, onClose, onNavigate }) => {
    const dimension = dimensions[currentIndex];
    const colors = getColor(dimension.color);
    const levelInfo = levelConfig[dimension.level];

    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        } else if (e.key === "ArrowLeft") {
          const prev =
            currentIndex > 0 ? currentIndex - 1 : dimensions.length - 1;
          onNavigate(prev);
        } else if (e.key === "ArrowRight") {
          const next =
            currentIndex < dimensions.length - 1 ? currentIndex + 1 : 0;
          onNavigate(next);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, dimensions.length, onClose, onNavigate]);

    const handlePrev = useCallback(() => {
      const prev = currentIndex > 0 ? currentIndex - 1 : dimensions.length - 1;
      onNavigate(prev);
    }, [currentIndex, dimensions.length, onNavigate]);

    const handleNext = useCallback(() => {
      const next = currentIndex < dimensions.length - 1 ? currentIndex + 1 : 0;
      onNavigate(next);
    }, [currentIndex, dimensions.length, onNavigate]);

    return (
      <div className="dimension-modal-overlay" onClick={onClose}>
        <div
          className="dimension-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dimension-modal-title"
        >
          {/* Header */}
          <div className="dimension-modal-header">
            <div className="dimension-modal-header-left">
              <span className="dimension-modal-overall">
                {totalScore.toFixed(1)}/10 Overall
              </span>
              <span className="dimension-modal-nav-indicator">
                {currentIndex + 1} of {dimensions.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="dimension-modal-close"
              aria-label="Close modal"
            >
              <CloseIcon strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className="dimension-modal-content">
            {/* Dimension Title & Score */}
            <div className="dimension-modal-title-row">
              <div className="dimension-modal-title-left">
                <div
                  className="dimension-modal-color-dot"
                  style={{ backgroundColor: colors.filled }}
                />
                <h2
                  id="dimension-modal-title"
                  className="dimension-modal-title"
                >
                  {dimension.label}
                </h2>
              </div>
              <div className="dimension-modal-score-group">
                <span
                  className="dimension-modal-score"
                  style={{ color: colors.filled }}
                >
                  {dimension.score}/10
                </span>
                <span
                  className="dimension-modal-level"
                  style={{
                    backgroundColor: levelInfo.bg,
                    color: levelInfo.text,
                  }}
                >
                  {levelInfo.label}
                </span>
              </div>
            </div>

            {/* Weight indicator */}
            <div className="dimension-modal-weight">
              Accounts for {dimension.weight}% of overall score
            </div>

            {/* Reasoning */}
            <div className="dimension-modal-reasoning">
              <p>{dimension.reasoning}</p>
            </div>

            {/* Signals - like Key Insights layout */}
            <div className="dimension-modal-signals">
              {/* Positive Signals */}
              <div className="dimension-modal-signal-column">
                <div className="dimension-modal-signal-header dimension-modal-signal-positive">
                  <svg
                    className="dimension-modal-signal-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2 2 4-4" />
                  </svg>
                  <span>Positive Signals</span>
                  <span className="dimension-modal-signal-count">
                    {dimension.positive_signals.length}
                  </span>
                </div>
                <ul className="dimension-modal-signal-list">
                  {dimension.positive_signals.map((signal, i) => (
                    <li key={i} className="dimension-modal-signal-item">
                      <span className="dimension-modal-bullet dimension-modal-bullet-positive" />
                      <span>{signal}</span>
                    </li>
                  ))}
                  {dimension.positive_signals.length === 0 && (
                    <li className="dimension-modal-signal-empty">
                      No positive signals identified
                    </li>
                  )}
                </ul>
              </div>

              {/* Divider */}
              <div className="dimension-modal-signal-divider" />

              {/* Negative Signals */}
              <div className="dimension-modal-signal-column">
                <div className="dimension-modal-signal-header dimension-modal-signal-negative">
                  <svg
                    className="dimension-modal-signal-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>Areas of Concern</span>
                  <span className="dimension-modal-signal-count">
                    {dimension.negative_signals.length}
                  </span>
                </div>
                <ul className="dimension-modal-signal-list">
                  {dimension.negative_signals.map((signal, i) => (
                    <li key={i} className="dimension-modal-signal-item">
                      <span className="dimension-modal-bullet dimension-modal-bullet-negative" />
                      <span>{signal}</span>
                    </li>
                  ))}
                  {dimension.negative_signals.length === 0 && (
                    <li className="dimension-modal-signal-empty">
                      No concerns identified
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="dimension-modal-footer">
            <button
              onClick={handlePrev}
              className="dimension-modal-nav-btn"
              aria-label="Previous dimension"
            >
              <ChevronLeftIcon strokeWidth={2} />
              <span>Previous</span>
            </button>

            {/* Dimension dots */}
            <div className="dimension-modal-dots">
              {dimensions.map((dim, i) => (
                <button
                  key={dim.id}
                  className={`dimension-modal-dot ${i === currentIndex ? "active" : ""}`}
                  style={{
                    backgroundColor:
                      i === currentIndex
                        ? getColor(dim.color).filled
                        : undefined,
                  }}
                  onClick={() => onNavigate(i)}
                  aria-label={`Go to ${dim.label}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="dimension-modal-nav-btn"
              aria-label="Next dimension"
            >
              <span>Next</span>
              <ChevronRightIcon strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default DimensionDetailModal;
