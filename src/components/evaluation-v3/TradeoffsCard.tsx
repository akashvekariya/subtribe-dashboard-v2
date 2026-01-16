import React, { memo, useState, useCallback } from "react";
import { ChevronDownIcon } from "./icons";
import type { Tradeoff, TradeoffsSummary } from "./types";
import "./styles.css";

interface TradeoffsCardProps {
  tradeoffs: Tradeoff[];
  summary: TradeoffsSummary;
}

// Direction indicator component
const DirectionIndicator = memo<{
  direction: Tradeoff["direction"];
  optionA: string;
  optionB: string;
}>(({ direction, optionA, optionB }) => {
  const isBalanced = direction === "balanced";
  return (
    <div className="tradeoff-indicator">
      <span
        className={`tradeoff-option tradeoff-option-a ${direction === "option_a" || isBalanced ? "active" : ""}`}
      >
        {optionA}
      </span>
      <div className="tradeoff-scale">
        <div className="tradeoff-scale-track">
          <div
            className={`tradeoff-scale-marker ${
              direction === "option_a"
                ? "position-a"
                : direction === "option_b"
                  ? "position-b"
                  : "position-balanced"
            }`}
          />
        </div>
      </div>
      <span
        className={`tradeoff-option tradeoff-option-b ${direction === "option_b" || isBalanced ? "active" : ""}`}
      >
        {optionB}
      </span>
    </div>
  );
});

// Single tradeoff item
const TradeoffItem = memo<{ tradeoff: Tradeoff }>(({ tradeoff }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className="tradeoff-item">
      <button
        className="tradeoff-item-header"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
      >
        <DirectionIndicator
          direction={tradeoff.direction}
          optionA={tradeoff.optionA}
          optionB={tradeoff.optionB}
        />
        <ChevronDownIcon
          className={`tradeoff-chevron ${isExpanded ? "open" : ""}`}
          strokeWidth={2}
        />
      </button>
      <div className={`tradeoff-content ${isExpanded ? "open" : ""}`}>
        <div className="tradeoff-content-inner">
          <p className="tradeoff-evidence">{tradeoff.evidence}</p>
        </div>
      </div>
    </div>
  );
});

export const TradeoffsCard = memo<TradeoffsCardProps>(
  ({ tradeoffs, summary }) => {
    if (tradeoffs.length === 0) {
      return null;
    }

    return (
      <div className="tradeoffs-card">
        <div className="tradeoffs-header">
          <h3 className="eval-accordion-title">Candidate Profile</h3>
          <span className="tradeoffs-summary-text">
            <span className="tradeoffs-aligned-text">
              {summary.aligned} aligned
            </span>
            {summary.misaligned > 0 && (
              <span className="tradeoffs-misaligned-text">
                {" "}
                / {summary.misaligned} misaligned
              </span>
            )}
          </span>
        </div>
        <div className="tradeoffs-list">
          {tradeoffs.map((tradeoff) => (
            <TradeoffItem key={tradeoff.id} tradeoff={tradeoff} />
          ))}
        </div>
      </div>
    );
  }
);

export default TradeoffsCard;
