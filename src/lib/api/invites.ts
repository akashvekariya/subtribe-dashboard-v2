/**
 * Invites API
 * Handles organization and team member invitations
 */

import { apiFetch } from "./client";
import {
  InviteValidationResponse,
  Invite,
  InviteListResponse,
  InviteCreateRequest,
  InviteSendResponse,
} from "./types";

export const invitesAPI = {
  /**
   * Validate an invite code (public endpoint)
   */
  async validate(code: string): Promise<InviteValidationResponse> {
    return apiFetch<InviteValidationResponse>(`/invites/validate/${code}`, {
      method: "GET",
    });
  },

  /**
   * List all invites for the company
   */
  async list(): Promise<InviteListResponse> {
    return apiFetch<InviteListResponse>("/invites", {
      method: "GET",
    });
  },

  /**
   * Create and send a new invite
   */
  async create(data: InviteCreateRequest): Promise<InviteSendResponse> {
    return apiFetch<InviteSendResponse>("/invites", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get invite details
   */
  async get(id: string): Promise<Invite> {
    return apiFetch<Invite>(`/invites/${id}`, {
      method: "GET",
    });
  },

  /**
   * Update invite (deactivate or change max_uses)
   */
  async update(
    id: string,
    data: { is_active?: boolean; max_uses?: number }
  ): Promise<Invite> {
    return apiFetch<Invite>(`/invites/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Deactivate an invite
   */
  async delete(id: string): Promise<void> {
    return apiFetch<void>(`/invites/${id}`, {
      method: "DELETE",
    });
  },
};
