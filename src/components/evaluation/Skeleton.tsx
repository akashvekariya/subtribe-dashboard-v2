// Skeleton loading components for evaluation UI
// Lightweight shimmer animations for legacy computer compatibility

import React, { memo } from "react";
import { EvaluationTabs } from "./EvaluationTabs";
import "./styles.css";

// Base skeleton block with shimmer animation
const SkeletonBlock = memo<{
  className?: string;
  style?: React.CSSProperties;
}>(({ className = "", style }) => (
  <div className={`skeleton-shimmer ${className}`} style={style} />
));

// Skeleton pill
const SkeletonPill = memo<{ width?: number }>(({ width = 80 }) => (
  <SkeletonBlock className="skeleton-pill" style={{ width }} />
));

// Score Ring Skeleton
export const ScoreRingSkeleton = memo(() => (
  <div className="skeleton-ring-container">
    <div className="skeleton-ring">
      <div className="skeleton-ring-inner" />
    </div>
  </div>
));

// Score Summary Panel Skeleton
export const ScoreSummaryPanelSkeleton = memo(() => (
  <div className="score-panel">
    <div className="score-panel-left">
      <SkeletonPill width={100} />
      <div className="score-panel-personal">
        <SkeletonBlock className="skeleton-title" style={{ width: "70%" }} />
        <div className="score-panel-contact">
          <SkeletonBlock className="skeleton-text" style={{ width: "60%" }} />
          <SkeletonBlock className="skeleton-text" style={{ width: "50%" }} />
          <SkeletonBlock className="skeleton-text" style={{ width: "55%" }} />
        </div>
      </div>
    </div>
    <div className="score-panel-right">
      <ScoreRingSkeleton />
    </div>
    <div className="score-panel-stats">
      <SkeletonBlock className="skeleton-stat-card" />
      <SkeletonBlock className="skeleton-stat-card" />
      <SkeletonBlock className="skeleton-stat-card" />
    </div>
  </div>
));

// Insights Card Skeleton
export const InsightsCardSkeleton = memo(() => (
  <div className="insights-card">
    <div className="insights-header">
      <SkeletonBlock className="skeleton-title" style={{ width: 120 }} />
    </div>
    <div className="insights-content">
      <div className="insights-column">
        <SkeletonBlock
          className="skeleton-text"
          style={{ width: "40%", marginBottom: 12 }}
        />
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock
            key={i}
            className="skeleton-text"
            style={{ width: `${70 + Math.random() * 20}%`, marginBottom: 8 }}
          />
        ))}
      </div>
      <div className="insights-divider" />
      <div className="insights-column">
        <SkeletonBlock
          className="skeleton-text"
          style={{ width: "40%", marginBottom: 12 }}
        />
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock
            key={i}
            className="skeleton-text"
            style={{ width: `${65 + Math.random() * 25}%`, marginBottom: 8 }}
          />
        ))}
      </div>
    </div>
  </div>
));

// Skills Grid Skeleton
export const SkillsGridSkeleton = memo(() => (
  <div className="eval-skills-container">
    <div className="eval-skills-header">
      <SkeletonBlock className="skeleton-title" style={{ width: 60 }} />
      <SkeletonBlock className="skeleton-text" style={{ width: 80 }} />
    </div>
    <div className="eval-skills-grid">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <SkeletonPill key={i} width={60 + Math.random() * 60} />
      ))}
    </div>
  </div>
));

// Candidate List Skeleton
export const CandidateListSkeleton = memo<{ itemCount?: number }>(
  ({ itemCount = 3 }) => (
    <div className="candidate-list">
      <div className="candidate-list-header">
        <SkeletonBlock className="skeleton-title" style={{ width: 100 }} />
        <SkeletonBlock
          className="skeleton-pill"
          style={{ width: 32, height: 24 }}
        />
      </div>
      <div className="candidate-list-items">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="candidate-card candidate-card-skeleton">
            <SkeletonBlock className="candidate-avatar" />
            <div className="candidate-content">
              <div className="candidate-header">
                <SkeletonBlock
                  className="skeleton-text"
                  style={{ width: `${50 + Math.random() * 30}%` }}
                />
                <SkeletonBlock
                  className="skeleton-text"
                  style={{ width: 32 }}
                />
              </div>
              <SkeletonBlock
                style={{ height: 4, marginTop: 4, marginBottom: 4 }}
              />
              <div className="candidate-meta">
                <SkeletonBlock
                  className="skeleton-text"
                  style={{ width: 50, height: 14 }}
                />
                <SkeletonBlock
                  className="skeleton-text"
                  style={{ width: 60, height: 14 }}
                />
              </div>
            </div>
            <div className="candidate-actions" style={{ opacity: 1 }}>
              <SkeletonBlock
                style={{ width: 28, height: 28, borderRadius: 6 }}
              />
              <SkeletonBlock
                style={{ width: 28, height: 28, borderRadius: 6 }}
              />
              <SkeletonBlock
                style={{ width: 28, height: 28, borderRadius: 6 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
);

// Accordion Skeleton (for Constraints and Red Flags)
export const AccordionSkeleton = memo<{ itemCount?: number; title?: string }>(
  ({ itemCount = 4, title = "Loading..." }) => (
    <div className="eval-accordion">
      <div className="eval-accordion-header">
        <SkeletonBlock className="skeleton-title" style={{ width: 100 }} />
        <div className="eval-accordion-counts">
          <SkeletonBlock className="skeleton-text" style={{ width: 50 }} />
        </div>
      </div>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="eval-accordion-item">
          <div className="eval-accordion-trigger" style={{ cursor: "default" }}>
            <SkeletonBlock
              className="skeleton-text"
              style={{ width: `${60 + Math.random() * 30}%` }}
            />
            <SkeletonPill width={32} />
          </div>
        </div>
      ))}
    </div>
  )
);

// Full page skeleton
export const EvaluationPageSkeleton = memo(() => (
  <div className="eval-tabs-container">
    <EvaluationTabs activeTab="ai" onTabChange={() => {}} />
    <div className="eval-tabs-content">
      <div className="mb-4 sm:mb-6">
        <ScoreSummaryPanelSkeleton />
      </div>
      <div className="mb-4 sm:mb-6">
        <InsightsCardSkeleton />
      </div>
      <div className="mt-4 sm:mt-6">
        <SkillsGridSkeleton />
      </div>
      <div className="mt-4 sm:mt-6">
        <AccordionSkeleton itemCount={5} />
      </div>
      <div className="mt-4 sm:mt-6">
        <AccordionSkeleton itemCount={3} />
      </div>
    </div>
  </div>
));

export default EvaluationPageSkeleton;
