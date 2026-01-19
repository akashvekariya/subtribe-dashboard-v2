/**
 * Status Update Configuration
 * High-signal detection, messaging, and suggested reasons for status updates
 */

import { ApplicationStatus } from "@/types";
import { AI_SCORE } from "./constants";

export type StatusUpdateScenario =
  | "rejection"
  | "ai_mismatch_reject"
  | "ai_mismatch_hire"
  | null;

export interface HighSignalResult {
  isHighSignal: boolean;
  scenario: StatusUpdateScenario;
}

export interface StatusUpdateMessaging {
  title: string;
  subtitle: string;
  quickPicksLabel: string;
  tags: string[];
  hint: string;
}

/**
 * Detect if a status transition is high-signal (requires feedback)
 */
export function isHighSignalTransition(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus,
  aiScore: number
): HighSignalResult {
  // Any transition to rejected is high-signal
  if (newStatus === "rejected") {
    // Check if AI thought candidate was good
    if (aiScore >= AI_SCORE.HIGH_THRESHOLD) {
      return {
        isHighSignal: true,
        scenario: "ai_mismatch_reject",
      };
    }
    return {
      isHighSignal: true,
      scenario: "rejection",
    };
  }

  // Hiring/offering low-scoring candidates is high-signal
  if (
    (newStatus === "offer" || newStatus === "hired") &&
    aiScore < AI_SCORE.LOW_THRESHOLD
  ) {
    return {
      isHighSignal: true,
      scenario: "ai_mismatch_hire",
    };
  }

  // All other transitions are low-signal
  return {
    isHighSignal: false,
    scenario: null,
  };
}

/**
 * Get messaging and suggested tags based on scenario
 */
export function getStatusUpdateMessaging(
  scenario: StatusUpdateScenario
): StatusUpdateMessaging {
  const messagingMap: Record<
    Exclude<StatusUpdateScenario, null>,
    StatusUpdateMessaging
  > = {
    rejection: {
      title: "Why wasn't this a good fit?",
      subtitle:
        "Your feedback helps us find better candidates for your future openings",
      quickPicksLabel: "Quick picks:",
      tags: [
        "Skills gap",
        "Salary too high",
        "Culture fit",
        "Better options available",
      ],
      hint: "Helps us prioritize better matches next time",
    },
    ai_mismatch_reject: {
      title: "What was missing?",
      subtitle:
        "Help us learn your criteria so we surface the right candidates",
      quickPicksLabel: "Quick picks:",
      tags: [
        "Skills gap",
        "Experience level",
        "Culture fit",
        "Communication concerns",
      ],
      hint: "Trains the system to your hiring preferences",
    },
    ai_mismatch_hire: {
      title: "What stood out about this candidate?",
      subtitle: "We'll prioritize similar profiles that match your preferences",
      quickPicksLabel: "Quick picks:",
      tags: [
        "Great interview",
        "Culture fit",
        "Growth mindset",
        "Unique experience",
      ],
      hint: "Helps us find more candidates like this",
    },
  };

  if (!scenario) {
    return {
      title: "Update Status",
      subtitle: "",
      quickPicksLabel: "",
      tags: [],
      hint: "",
    };
  }

  return messagingMap[scenario];
}

/**
 * Combine selected tags and custom notes into final notes string
 */
export function combineTagsAndNotes(
  selectedTags: string[],
  customNotes?: string
): string | undefined {
  const parts: string[] = [];

  if (selectedTags.length > 0) {
    parts.push(selectedTags.join(", "));
  }

  if (customNotes?.trim()) {
    parts.push(customNotes.trim());
  }

  if (parts.length === 0) {
    return undefined;
  }

  // Separate tags and custom notes with a dash for clarity
  return parts.join(" - ");
}
