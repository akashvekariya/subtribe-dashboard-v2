import React, { memo, useState, useCallback, useMemo } from "react";
import {
  FlagIcon,
  WarningIcon,
  ChevronDownIcon,
  InfoCircleIcon,
  MessageIcon,
} from "./Icons";
import { AnimatedPill } from "./shared";
import { severityConfig, getFlagTypeLabel } from "./config";
import type { FlagSeverity, RedFlag } from "./types";
import "./styles.css";

// Re-export types
export type { FlagSeverity, RedFlag };

// Severity pill
const SeverityPill = memo<{ severity: FlagSeverity; showLabel?: boolean }>(
  ({ severity, showLabel = true }) => {
    const config = severityConfig[severity];
    return (
      <span className={`eval-pill ${config.bgClass} ${config.colorClass}`}>
        <span className="eval-pill-icon">
          {severity === "concern" ? (
            <FlagIcon strokeWidth={2} />
          ) : (
            <WarningIcon strokeWidth={2} />
          )}
        </span>
        {showLabel && config.label}
      </span>
    );
  }
);

// Severity icon (compact)
const SeverityIcon = memo<{ severity: FlagSeverity }>(({ severity }) => {
  const config = severityConfig[severity];
  return (
    <span
      className={`eval-eligibility-icon ${config.bgClass} ${config.colorClass}`}
    >
      <span className="eval-pill-icon">
        {severity === "concern" ? (
          <FlagIcon strokeWidth={2} />
        ) : (
          <WarningIcon strokeWidth={2} />
        )}
      </span>
    </span>
  );
});

// Single flag item
const RedFlagItem = memo<{
  flag: RedFlag;
  isOpen: boolean;
  onToggle: () => void;
}>(({ flag, isOpen, onToggle }) => {
  const typeLabel = getFlagTypeLabel(flag.flag_type);

  return (
    <div className="eval-accordion-item">
      <button onClick={onToggle} className="eval-accordion-trigger">
        <span className={`eval-chevron ${isOpen ? "open" : ""}`}>
          <ChevronDownIcon strokeWidth={2} />
        </span>
        <span className="eval-accordion-question">{typeLabel}</span>
        <AnimatedPill
          collapsed={<SeverityIcon severity={flag.severity} />}
          expanded={<SeverityPill severity={flag.severity} showLabel={true} />}
          isExpanded={isOpen}
        />
      </button>

      <div className={`eval-accordion-content ${isOpen ? "open" : ""}`}>
        <div className="eval-accordion-content-inner">
          <div className="eval-redflag-content">
            <p className="eval-redflag-details">{flag.details}</p>

            {flag.context && (
              <div className="eval-redflag-context">
                <span className="eval-redflag-context-icon">
                  <InfoCircleIcon className="eval-pill-icon" strokeWidth={2} />
                </span>
                <span>{flag.context}</span>
              </div>
            )}

            {flag.interview_probe && (
              <div className="eval-redflag-probe">
                <div className="eval-redflag-probe-label">
                  <span className="eval-redflag-probe-icon">
                    <MessageIcon className="eval-pill-icon" strokeWidth={2} />
                  </span>
                  <span>Interview Probe</span>
                </div>
                <p className="eval-redflag-probe-text">
                  {flag.interview_probe}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Main accordion component
export interface RedFlagsAccordionProps {
  flags: RedFlag[];
  title?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const RedFlagsAccordion = memo<RedFlagsAccordionProps>(
  ({ flags, title = "Red Flags", allowMultiple = false, className = "" }) => {
    const [openIds, setOpenIds] = useState<Set<string>>(new Set());

    const handleToggle = useCallback(
      (id: string) => {
        setOpenIds((prev) => {
          const next = new Set(allowMultiple ? prev : []);
          if (prev.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return next;
        });
      },
      [allowMultiple]
    );

    const counts = useMemo(
      () =>
        flags.reduce(
          (acc, f) => {
            if (f.severity === "concern") acc.concern++;
            else if (f.severity === "investigate") acc.investigate++;
            else acc.info++;
            return acc;
          },
          { concern: 0, investigate: 0, info: 0 }
        ),
      [flags]
    );

    return (
      <div className={`eval-accordion ${className}`}>
        <div className="eval-accordion-header">
          <h3 className="eval-accordion-title">{title}</h3>
          {flags.length > 0 && (
            <div className="eval-accordion-counts">
              {counts.concern > 0 && (
                <span className="eval-accordion-count eval-color-error">
                  {counts.concern} concern
                </span>
              )}
              {counts.investigate > 0 && (
                <span className="eval-accordion-count eval-color-warning">
                  {counts.investigate} investigate
                </span>
              )}
              {counts.info > 0 && (
                <span className="eval-accordion-count eval-color-info">
                  {counts.info} info
                </span>
              )}
            </div>
          )}
        </div>

        {flags.length > 0 ? (
          <div>
            {flags.map((flag) => (
              <RedFlagItem
                key={flag.id}
                flag={flag}
                isOpen={openIds.has(flag.id)}
                onToggle={() => handleToggle(flag.id)}
              />
            ))}
          </div>
        ) : (
          <div className="eval-redflag-empty">
            <span className="eval-redflag-empty-icon">
              <FlagIcon strokeWidth={1.5} />
            </span>
            <p>No red flags detected</p>
          </div>
        )}
      </div>
    );
  }
);

export default RedFlagsAccordion;
