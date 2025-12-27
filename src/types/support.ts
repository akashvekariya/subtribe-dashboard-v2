/**
 * Support Widget Types
 */

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  discord_channel_id: string | null;
  discord_thread_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  user: SupportUser | null;
  messages?: SupportMessage[];
}

export interface SupportTicketListItem {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SupportUser {
  id: string;
  first_name: string;
  last_name: string;
}

export interface SupportMessage {
  id: string;
  content: string;
  source: "dashboard" | "discord";
  discord_message_id: string | null;
  created_at: string;
  user: SupportUser | null;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority?: "low" | "medium" | "high" | "urgent";
}

export interface UpdateTicketRequest {
  status?: "open" | "in_progress" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "urgent";
}

export interface CreateMessageRequest {
  content: string;
}

export interface SupportTicketListResponse {
  data: SupportTicketListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_more: boolean;
  };
}

export interface SupportMessagesResponse {
  data: SupportMessage[];
}

// FAQ Types
export interface FAQQuestion {
  question: string;
  answer: string;
}

export interface FAQCategory {
  category: string;
  questions: FAQQuestion[];
}
