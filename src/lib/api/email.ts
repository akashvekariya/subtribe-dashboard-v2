/**
 * Email API
 * Handles email templates, sending, and scheduling operations
 */

import {
  EmailTemplate,
  EmailWildcard,
  SendEmailRequest,
  SendEmailResponse,
  BulkEmailRequest,
  BulkEmailResponse,
  EmailPreviewResponse,
} from "@/types";
import { apiFetch } from "./client";
import { WildcardsAPIResponse, TemplatesAPIResponse } from "./types";

export const emailAPI = {
  // Get available wildcards for templates
  async getWildcards(): Promise<{ data: EmailWildcard[] }> {
    const response = await apiFetch<WildcardsAPIResponse>("/emails/wildcards", {
      method: "GET",
    });
    return { data: response.wildcards };
  },

  // Get all email templates for the company
  async getTemplates(): Promise<{ data: EmailTemplate[] }> {
    const response = await apiFetch<TemplatesAPIResponse>("/emails/templates", {
      method: "GET",
    });
    return { data: response.templates };
  },

  // Get a single template by ID
  async getTemplate(id: string): Promise<EmailTemplate> {
    return apiFetch(`/emails/templates/${id}`, {
      method: "GET",
    });
  },

  // Create a new email template
  async createTemplate(data: {
    name: string;
    category?: string;
    subject: string;
    body: string;
  }): Promise<EmailTemplate> {
    return apiFetch("/emails/templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update an existing template
  async updateTemplate(
    id: string,
    data: {
      name?: string;
      category?: string;
      subject?: string;
      body?: string;
    }
  ): Promise<EmailTemplate> {
    return apiFetch(`/emails/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Delete a template
  async deleteTemplate(id: string): Promise<void> {
    return apiFetch(`/emails/templates/${id}`, {
      method: "DELETE",
    });
  },

  // Send email to a single application
  async sendEmail(
    applicationId: string,
    data: SendEmailRequest
  ): Promise<SendEmailResponse> {
    return apiFetch(`/emails/applications/${applicationId}/send-email`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Send bulk emails to multiple applications
  async sendBulkEmail(data: BulkEmailRequest): Promise<BulkEmailResponse> {
    return apiFetch("/emails/bulk-send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Preview email with replaced wildcards
  async previewEmail(
    applicationId: string,
    data: { subject: string; body: string }
  ): Promise<EmailPreviewResponse> {
    return apiFetch(`/emails/applications/${applicationId}/preview-email`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Cancel a scheduled email
  async cancelScheduledEmail(
    emailId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiFetch(`/emails/scheduled/${emailId}/cancel`, {
      method: "POST",
    });
  },
};
