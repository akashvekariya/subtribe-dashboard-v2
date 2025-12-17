"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, APIError, Invite } from "@/lib/api-client";
import showToast from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/shared/FormField";

// Note: All users are admin in V1 - no role selection
// Note: Expiration is always 7 days - not user configurable
const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

function InviteStatusBadge({ invite }: { invite: Invite }) {
  const now = new Date();
  const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null;
  const isExpired = expiresAt && expiresAt < now;
  const isMaxedOut =
    invite.max_uses !== null && invite.uses_count >= invite.max_uses;

  if (!invite.is_active) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Revoked
      </span>
    );
  }

  if (isExpired) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Expired
      </span>
    );
  }

  if (isMaxedOut) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      Pending
    </span>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TeamPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  async function loadInvites() {
    try {
      const response = await api.invites.list();
      setInvites(response.invites);
    } catch (error) {
      if (error instanceof APIError) {
        showToast.error(error.message);
      } else {
        showToast.error("Failed to load invites");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInvites();
  }, []);

  async function onSubmit(data: InviteFormData) {
    const toastId = showToast.loading("Sending invite...");

    try {
      const response = await api.invites.create({
        email: data.email,
        // All users are admin in V1 - no role selection
        // Expiration is always 7 days (set by backend)
      });

      showToast.dismiss(toastId);
      showToast.success(response.message || "Invite sent successfully!");

      reset();
      loadInvites();
    } catch (error) {
      showToast.dismiss(toastId);
      if (error instanceof APIError) {
        showToast.error(error.message);
      } else {
        showToast.error("Failed to send invite");
      }
    }
  }

  async function handleRevoke(inviteId: string) {
    setIsRevoking(inviteId);

    try {
      await api.invites.delete(inviteId);
      showToast.success("Invite revoked");
      await loadInvites();
    } catch (error) {
      console.error("Revoke invite error:", error);
      if (error instanceof APIError) {
        showToast.error(error.message);
      } else if (error instanceof Error) {
        showToast.error(`Failed to revoke invite: ${error.message}`);
      } else {
        showToast.error("Failed to revoke invite");
      }
      // Reload invites anyway in case the delete actually succeeded
      await loadInvites();
    } finally {
      setIsRevoking(null);
    }
  }

  async function copyInviteLink(code: string) {
    const link = `${window.location.origin}/invite/${code}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast.success("Invite link copied to clipboard!");
    } catch {
      showToast.error("Failed to copy link");
    }
  }

  async function copyInviteCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      showToast.success("Invite code copied!");
    } catch {
      showToast.error("Failed to copy code");
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="mt-1 text-sm text-gray-600">
          Invite team members to join your organization
        </p>
      </div>

      {/* Invite form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Invite a team member
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <FormField
                id="email"
                label="Email address"
                type="email"
                placeholder="colleague@company.com"
                required
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
            <div className="sm:pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send invite"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Invite will expire in 7 days
          </p>
        </form>
      </div>

      {/* Invites list */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Invited</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Loading invites...</p>
          </div>
        ) : invites.length === 0 ? (
          <div className="p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM12.75 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No invites yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by inviting a team member above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invite Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invites.map((invite) => (
                  <tr key={invite.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invite.email}
                      </div>
                      {invite.creator && (
                        <div className="text-xs text-gray-500">
                          by {invite.creator.full_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => copyInviteCode(invite.code)}
                        className="text-sm font-mono text-gray-600 hover:text-blue-600 cursor-pointer"
                        title="Click to copy code"
                      >
                        {invite.code}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <InviteStatusBadge invite={invite} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invite.expires_at
                        ? formatDate(invite.expires_at)
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        {invite.is_active && (
                          <>
                            <button
                              onClick={() => copyInviteLink(invite.code)}
                              className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1"
                              title="Copy invite link"
                            >
                              Copy Link
                            </button>
                            <button
                              onClick={() => handleRevoke(invite.id)}
                              disabled={isRevoking === invite.id}
                              className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                            >
                              {isRevoking === invite.id
                                ? "Revoking..."
                                : "Revoke"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
