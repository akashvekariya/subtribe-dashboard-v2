import React, { memo, useState, useCallback } from "react";
import { MessageIcon, ChevronDownIcon, DocumentIcon } from "../Icons";
import type { InterviewQuestion } from "../types";
import "../styles.css";

// Single question item
const QuestionItem = memo<{
  question: InterviewQuestion;
  isOpen: boolean;
  onToggle: () => void;
}>(({ question, isOpen, onToggle }) => {
  return (
    <div className="eval-accordion-item">
      <button onClick={onToggle} className="eval-accordion-trigger">
        <span className={`eval-chevron ${isOpen ? "open" : ""}`}>
          <ChevronDownIcon strokeWidth={2} />
        </span>
        <span className="eval-accordion-question eval-interview-question-text">
          {question.question}
        </span>
      </button>

      <div className={`eval-accordion-content ${isOpen ? "open" : ""}`}>
        <div className="eval-accordion-content-inner">
          <div className="eval-interview-content">
            <div className="eval-interview-gap">
              <span className="eval-interview-gap-label">Gap Addressed</span>
              <p className="eval-interview-gap-text">
                {question.gap_addressed}
              </p>
            </div>

            {question.resume_reference && (
              <div className="eval-interview-reference">
                <span className="eval-interview-reference-icon">
                  <DocumentIcon className="eval-pill-icon" strokeWidth={2} />
                </span>
                <span className="eval-interview-reference-text">
                  {question.resume_reference}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

QuestionItem.displayName = "QuestionItem";

// Main accordion component
export interface InterviewQuestionsAccordionProps {
  questions: InterviewQuestion[];
  title?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const InterviewQuestionsAccordion =
  memo<InterviewQuestionsAccordionProps>(
    ({
      questions,
      title = "Interview Questions",
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

      return (
        <div className={`eval-accordion ${className}`}>
          <div className="eval-accordion-header">
            <h3 className="eval-accordion-title">{title}</h3>
            {questions.length > 0 && (
              <span className="eval-accordion-count eval-color-info">
                {questions.length} suggested
              </span>
            )}
          </div>

          {questions.length > 0 ? (
            <div>
              {questions.map((question) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  isOpen={openIds.has(question.id)}
                  onToggle={() => handleToggle(question.id)}
                />
              ))}
            </div>
          ) : (
            <div className="eval-interview-empty">
              <span className="eval-interview-empty-icon">
                <MessageIcon strokeWidth={1.5} />
              </span>
              <p>No interview questions suggested</p>
            </div>
          )}
        </div>
      );
    }
  );

InterviewQuestionsAccordion.displayName = "InterviewQuestionsAccordion";

export default InterviewQuestionsAccordion;
