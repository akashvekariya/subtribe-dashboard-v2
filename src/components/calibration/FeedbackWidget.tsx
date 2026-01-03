import React, { useState, useRef, useEffect } from "react";
import { Icons } from "../Icons";
import { SectionFeedback } from "../../types";

interface FeedbackWidgetProps {
  sectionId: string;
  existingFeedback?: SectionFeedback;
  onFeedback: (feedback: SectionFeedback) => void;
}

export default function FeedbackWidget({
  sectionId,
  existingFeedback,
  onFeedback,
}: FeedbackWidgetProps) {
  const [rating, setRating] = useState<"positive" | "negative" | null>(
    existingFeedback?.rating || null
  );
  const [comment, setComment] = useState(existingFeedback?.comment || "");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingFeedback?.rating);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCommentInput &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // Don't close, just let them click elsewhere - they can use Skip to dismiss
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCommentInput]);

  const handleRating = (newRating: "positive" | "negative") => {
    setRating(newRating);

    if (newRating === "negative") {
      setShowCommentInput(true);
    } else {
      // Positive feedback - submit immediately
      setShowCommentInput(false);
      setSubmitted(true);
      onFeedback({
        sectionId,
        rating: newRating,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleSubmitComment = () => {
    if (rating) {
      setSubmitted(true);
      setShowCommentInput(false);
      onFeedback({
        sectionId,
        rating,
        comment: comment.trim() || undefined,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleSkipComment = () => {
    if (rating) {
      setSubmitted(true);
      setShowCommentInput(false);
      onFeedback({
        sectionId,
        rating,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Submitted state - show thank you (no change option - using PostHog for tracking)
  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Icons.Check className="w-3.5 h-3.5 text-green-500" />
        <span>Thanks for the feedback</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Rating buttons */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-400">Was this section helpful?</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleRating("positive")}
            className={`
              p-1.5 rounded-md transition-all duration-200
              ${
                rating === "positive"
                  ? "bg-green-100 text-green-600"
                  : "text-zinc-400 hover:text-green-600 hover:bg-green-50"
              }
            `}
            title="Yes, helpful"
          >
            <Icons.ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleRating("negative")}
            className={`
              p-1.5 rounded-md transition-all duration-200
              ${
                rating === "negative"
                  ? "bg-red-100 text-red-600"
                  : "text-zinc-400 hover:text-red-600 hover:bg-red-50"
              }
            `}
            title="Could be better"
          >
            <Icons.ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating popover - positioned absolute to scroll with content */}
      {showCommentInput && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="w-72 p-4 bg-white rounded-xl border border-zinc-200 shadow-lg">
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              What could we improve? (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-300"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={handleSkipComment}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitComment}
                className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
              >
                <Icons.Send className="w-3.5 h-3.5" />
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
