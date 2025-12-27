"use client";

import { useState, useEffect } from "react";
import { supportAPI } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  message_count: number;
}

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const priorityColors: Record<string, string> = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  urgent: "text-red-600",
};

export function TicketsTab() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await supportAPI.getTickets({ limit: 50 });
      setTickets(response.data);
    } catch {
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "all") return true;
    if (filter === "open")
      return ticket.status === "open" || ticket.status === "in_progress";
    if (filter === "closed")
      return ticket.status === "resolved" || ticket.status === "closed";
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-[var(--color-primary)]"
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
          <p className="text-sm text-gray-500">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600 mb-3">{error}</p>
        <button
          onClick={loadTickets}
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "open", "closed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
              filter === f
                ? "bg-[var(--color-primary)] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {f === "all" ? "All" : f === "open" ? "Active" : "Closed"}
            {f === "all" && (
              <span className="ml-1 opacity-75">({tickets.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            {filter === "all"
              ? "No support tickets yet"
              : filter === "open"
                ? "No active tickets"
                : "No closed tickets"}
          </p>
          <p className="text-xs text-gray-500">
            {filter === "all"
              ? "Create a ticket using the Contact tab"
              : "Switch to another filter to see more"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4
                  className="text-sm font-medium line-clamp-1"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {ticket.subject}
                </h4>
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap",
                    statusColors[ticket.status]
                  )}
                >
                  {statusLabels[ticket.status]}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className={priorityColors[ticket.priority]}>
                  {ticket.priority.charAt(0).toUpperCase() +
                    ticket.priority.slice(1)}{" "}
                  priority
                </span>
                <span>•</span>
                <span>{formatDate(ticket.created_at)}</span>
                {ticket.message_count > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {ticket.message_count}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={loadTickets}
        className="w-full mt-4 py-2 text-xs text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh
      </button>
    </div>
  );
}
