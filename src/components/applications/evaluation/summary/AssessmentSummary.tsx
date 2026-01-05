"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import type { InterviewQuestion } from "../types";

interface AssessmentSummaryProps {
  strengths: string[];
  concerns: string[];
  interviewQuestions?: InterviewQuestion[];
}

/**
 * InterviewQuestionCard - Individual question with copy functionality
 */
function InterviewQuestionCard({ question }: { question: InterviewQuestion }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(question.question);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm text-gray-700 leading-relaxed">
            {question.question}
          </p>
          {question.gap_addressed && (
            <p className="mt-2 text-xs text-gray-500">
              <span className="font-medium">Gap addressed: </span>
              {question.gap_addressed}
            </p>
          )}
          {question.resume_reference && (
            <p className="mt-1 text-xs text-gray-400">
              <span className="font-medium">Reference: </span>
              {question.resume_reference}
            </p>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          title="Copy question"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * AssessmentSummary - Strengths, concerns, and interview questions
 *
 * Features:
 * - Two-column layout for strengths/concerns
 * - Expandable interview questions section
 * - Copy-to-clipboard for questions
 */
export function AssessmentSummary({
  strengths,
  concerns,
  interviewQuestions,
}: AssessmentSummaryProps) {
  const [showQuestions, setShowQuestions] = useState(false);
  const hasQuestions = interviewQuestions && interviewQuestions.length > 0;

  return (
    <div className="space-y-6">
      {/* Strengths & Concerns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Strengths
          </h4>
          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((strength, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No specific strengths highlighted.
            </p>
          )}
        </div>

        {/* Concerns */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Areas of Concern
          </h4>
          {concerns.length > 0 ? (
            <ul className="space-y-2">
              {concerns.map((concern, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="text-amber-500 mt-1">•</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No specific concerns identified.
            </p>
          )}
        </div>
      </div>

      {/* Interview Questions Section */}
      {hasQuestions && (
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => setShowQuestions(!showQuestions)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Suggested Interview Questions
              </span>
              <span className="text-xs text-gray-400">
                ({interviewQuestions.length})
              </span>
            </div>
            {showQuestions ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showQuestions && (
            <div className="mt-3 space-y-2">
              {interviewQuestions.map((question, idx) => (
                <InterviewQuestionCard key={idx} question={question} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
