import React, { memo, useState, useCallback, useMemo } from "react";
import { EligibilityPill, EligibilityIcon } from "./StatusPill";
import { AnimatedPill } from "./shared";
import { ChevronDownIcon } from "./Icons";
import type { Constraint, EligibilityStatus } from "./types";
import "./styles.css";

// Re-export types
export type { Constraint };

// Single constraint item
const ConstraintItem = memo<{
  constraint: Constraint;
  isOpen: boolean;
  onToggle: () => void;
}>(({ constraint, isOpen, onToggle }) => (
  <div className="eval-accordion-item">
    <button onClick={onToggle} className="eval-accordion-trigger">
      <span className={`eval-chevron ${isOpen ? "open" : ""}`}>
        <ChevronDownIcon strokeWidth={2} />
      </span>
      <span className="eval-accordion-question">{constraint.question}</span>
      <AnimatedPill
        collapsed={<EligibilityIcon eligible={constraint.eligible} />}
        expanded={
          <EligibilityPill eligible={constraint.eligible} showLabel={true} />
        }
        isExpanded={isOpen}
      />
    </button>
    <div className={`eval-accordion-content ${isOpen ? "open" : ""}`}>
      <div className="eval-accordion-content-inner">
        <p className="eval-accordion-answer">{constraint.answer}</p>
      </div>
    </div>
  </div>
));

// Main accordion component
export interface ConstraintAccordionProps {
  constraints: Constraint[];
  title?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const ConstraintAccordion = memo<ConstraintAccordionProps>(
  ({
    constraints,
    title = "Constraints",
    allowMultiple = false,
    className = "",
  }) => {
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
        constraints.reduce(
          (acc, c) => {
            if (c.eligible === true) acc.pass++;
            else if (c.eligible === "review") acc.review++;
            else acc.fail++;
            return acc;
          },
          { pass: 0, review: 0, fail: 0 }
        ),
      [constraints]
    );

    return (
      <div className={`eval-accordion ${className}`}>
        <div className="eval-accordion-header">
          <h3 className="eval-accordion-title">{title}</h3>
          {constraints.length > 0 && (
            <div className="eval-accordion-counts">
              {counts.pass > 0 && (
                <span className="eval-accordion-count eval-color-success">
                  {counts.pass} pass
                </span>
              )}
              {counts.review > 0 && (
                <span className="eval-accordion-count eval-color-warning">
                  {counts.review} review
                </span>
              )}
              {counts.fail > 0 && (
                <span className="eval-accordion-count eval-color-error">
                  {counts.fail} fail
                </span>
              )}
            </div>
          )}
        </div>

        {constraints.length > 0 ? (
          <div>
            {constraints.map((constraint) => (
              <ConstraintItem
                key={constraint.id}
                constraint={constraint}
                isOpen={openIds.has(constraint.id)}
                onToggle={() => handleToggle(constraint.id)}
              />
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="eval-text-sm" style={{ color: "#a1a1aa" }}>
              No constraints defined
            </p>
          </div>
        )}
      </div>
    );
  }
);

export default ConstraintAccordion;
