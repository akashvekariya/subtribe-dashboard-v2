"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Application, ScheduledEmail } from "@/types";
import { emailAPI, api } from "@/lib/api-client";
import { EmailComposeForm, EmailFormData } from "./EmailComposeForm";
import { EmailPreviewModal } from "./EmailPreviewModal";
import { toast } from "@/lib/toast";
import { formatDateTime } from "@/lib/format";
import {
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface CommunicationTabProps {
  application: Application;
}

const EMAIL_STATUS_STYLES: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  pending: { icon: ClockIcon, color: "text-yellow-500 bg-yellow-50" },
  sent: { icon: CheckCircleIcon, color: "text-green-500 bg-green-50" },
  failed: { icon: XCircleIcon, color: "text-red-500 bg-red-50" },
  cancelled: { icon: ExclamationCircleIcon, color: "text-gray-500 bg-gray-50" },
};

export function CommunicationTab({ application }: CommunicationTabProps) {
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [previewData, setPreviewData] = useState<{
    subject: string;
    body: string;
  } | null>(null);
  const [cancellingEmailId, setCancellingEmailId] = useState<string | null>(
    null
  );

  const candidateName = `${application.first_name} ${application.last_name}`;

  // Load scheduled emails
  const loadScheduledEmails = useCallback(async () => {
    try {
      const response = await api.applications.getScheduledEmails(
        application.id
      );
      setScheduledEmails(response.data);
    } catch (error) {
      console.error("Failed to load scheduled emails:", error);
    } finally {
      setIsLoadingEmails(false);
    }
  }, [application.id]);

  useEffect(() => {
    loadScheduledEmails();
  }, [loadScheduledEmails]);

  // Handle email submission
  const handleSendEmail = async (formData: EmailFormData) => {
    setIsSending(true);
    try {
      const response = await emailAPI.sendEmail(application.id, {
        template_id: formData.templateId,
        subject: formData.subject,
        body: formData.body,
        send_immediately: formData.sendImmediately,
        scheduled_for: formData.scheduledFor,
      });

      if (response.status === "scheduled") {
        toast.success("Email scheduled successfully");
      } else {
        toast.success("Email sent successfully");
      }

      // Reload scheduled emails to show the new one
      loadScheduledEmails();
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  // Handle preview
  const handlePreview = async (data: { subject: string; body: string }) => {
    try {
      const response = await emailAPI.previewEmail(application.id, data);
      setPreviewData(response);
    } catch (error) {
      console.error("Failed to preview email:", error);
      toast.error("Failed to generate preview");
    }
  };

  // Handle cancel scheduled email
  const handleCancelEmail = async (emailId: string) => {
    setCancellingEmailId(emailId);
    try {
      await emailAPI.cancelScheduledEmail(emailId);
      toast.success("Email cancelled");
      loadScheduledEmails();
    } catch (error) {
      console.error("Failed to cancel email:", error);
      toast.error("Failed to cancel email");
    } finally {
      setCancellingEmailId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Compose Email Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <EnvelopeIcon className="h-5 w-5 text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900">Compose</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          To: {candidateName} ({application.email})
        </p>

        <EmailComposeForm
          applicationId={application.id}
          onSubmit={handleSendEmail}
          onPreview={handlePreview}
          isSubmitting={isSending}
          submitLabel={isSending ? "Sending..." : "Send"}
        />
      </div>

      {/* Email History Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <ClockIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">History</h3>
        </div>

        {isLoadingEmails ? (
          <div className="py-4 text-center text-xs text-gray-500">
            Loading...
          </div>
        ) : scheduledEmails.length === 0 ? (
          <div className="py-4 text-center">
            <EnvelopeIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No emails sent yet</p>
          </div>
        ) : (
          <div className="flow-root max-h-60 overflow-y-auto">
            <ul className="divide-y divide-gray-100">
              {scheduledEmails.map((email) => {
                const statusStyle =
                  EMAIL_STATUS_STYLES[email.status] ||
                  EMAIL_STATUS_STYLES.pending;
                const StatusIcon = statusStyle.icon;

                return (
                  <li key={email.id} className="py-2">
                    <div className="flex items-start space-x-2">
                      <div
                        className={`flex-shrink-0 p-1 rounded-full ${statusStyle.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {email.subject}
                        </p>
                        <p className="text-xs text-gray-500">
                          {email.status === "sent" && email.sent_at
                            ? `Sent ${formatDateTime(email.sent_at)}`
                            : email.status === "pending"
                              ? `Scheduled for ${formatDateTime(email.scheduled_for)}`
                              : email.status === "failed"
                                ? `Failed`
                                : email.status === "cancelled"
                                  ? `Cancelled`
                                  : email.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium capitalize ${
                            email.status === "sent"
                              ? "bg-green-100 text-green-700"
                              : email.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : email.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {email.status}
                        </span>
                        {email.status === "pending" && (
                          <button
                            onClick={() => handleCancelEmail(email.id)}
                            disabled={cancellingEmailId === email.id}
                            className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <XMarkIcon className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <EmailPreviewModal
        isOpen={!!previewData}
        onClose={() => setPreviewData(null)}
        subject={previewData?.subject || ""}
        body={previewData?.body || ""}
        recipientName={candidateName}
        recipientEmail={application.email}
      />
    </div>
  );
}
