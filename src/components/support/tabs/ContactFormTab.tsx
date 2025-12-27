"use client";

import { useState } from "react";
import { supportAPI } from "@/lib/api-client";
import toast from "react-hot-toast";

type Priority = "low" | "medium" | "high" | "urgent";

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-700" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
];

export function ContactFormTab() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (subject.trim().length < 5) {
      toast.error("Subject must be at least 5 characters");
      return;
    }

    if (description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await supportAPI.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        priority,
      });

      setSubmitted(true);
      toast.success("Support ticket created successfully!");
    } catch {
      toast.error("Failed to create support ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubject("");
    setDescription("");
    setPriority("medium");
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Ticket Submitted!
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We&apos;ve received your support request and will get back to you
          soon. You can track your ticket in the &quot;My Tickets&quot; tab.
        </p>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-blue-50 rounded-lg transition-colors"
        >
          Submit Another Ticket
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {/* Subject */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "var(--color-text-primary)" }}
        >
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief description of your issue"
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          style={{ borderColor: "var(--color-border)" }}
          maxLength={255}
        />
        <p className="mt-1 text-xs text-gray-500">
          {subject.length}/255 characters
        </p>
      </div>

      {/* Priority */}
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: "var(--color-text-primary)" }}
        >
          Priority
        </label>
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPriority(option.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                priority === option.value
                  ? option.color + " ring-2 ring-offset-1 ring-gray-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "var(--color-text-primary)" }}
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe your issue in detail. Include any relevant information that might help us assist you."
          rows={5}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none"
          style={{ borderColor: "var(--color-border)" }}
          maxLength={5000}
        />
        <p className="mt-1 text-xs text-gray-500">
          {description.length}/5000 characters
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !subject.trim() || !description.trim()}
        className="w-full py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Submitting...
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Submit Ticket
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        Your ticket will be routed to our support team on Discord for faster
        resolution.
      </p>
    </form>
  );
}
