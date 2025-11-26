"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Application, ScheduledEmail } from "@/types";
import { emailAPI, api } from "@/lib/api-client";
import { EmailComposeForm, EmailFormData } from "./EmailComposeForm";
import { EmailPreviewModal } from "./EmailPreviewModal";
import { toast } from "@/lib/toast";
import { formatDate } from "@/lib/format";
import {
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

interface CommunicationTabProps {
  application: Application;
}

const EMAIL_STATUS_STYLES: Record<string, { icon: React.ElementType; color: string }> = {
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

  const candidateName = `${application.first_name} ${application.last_name}`;

  // Load scheduled emails
  const loadScheduledEmails = useCallback(async () => {
    try {
      const response = await api.applications.getScheduledEmails(application.id);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Compose Email Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Send Email
            </h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Compose and send an email to {candidateName} ({application.email})
          </p>

          <EmailComposeForm
            applicationId={application.id}
            onSubmit={handleSendEmail}
            onPreview={handlePreview}
            isSubmitting={isSending}
            submitLabel={isSending ? "Sending..." : "Send Email"}
          />
        </div>
      </div>

      {/* Email History Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Email History
            </h3>
          </div>

          {isLoadingEmails ? (
            <div className="py-8 text-center text-sm text-gray-500">
              Loading email history...
            </div>
          ) : scheduledEmails.length === 0 ? (
            <div className="py-8 text-center">
              <EnvelopeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No emails have been sent to this candidate yet.
              </p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-my-4 divide-y divide-gray-200">
                {scheduledEmails.map((email) => {
                  const statusStyle = EMAIL_STATUS_STYLES[email.status] || EMAIL_STATUS_STYLES.pending;
                  const StatusIcon = statusStyle.icon;

                  return (
                    <li key={email.id} className="py-4">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`flex-shrink-0 p-1.5 rounded-full ${statusStyle.color}`}
                        >
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {email.subject}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {email.template_type && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                                {email.template_type}
                              </span>
                            )}
                            {email.status === "sent" && email.sent_at
                              ? `Sent ${formatDate(email.sent_at)}`
                              : email.status === "pending"
                                ? `Scheduled for ${formatDate(email.scheduled_for)}`
                                : email.status === "failed"
                                  ? `Failed: ${email.error_message || "Unknown error"}`
                                  : `Status: ${email.status}`}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                              email.status === "sent"
                                ? "bg-green-100 text-green-800"
                                : email.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : email.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {email.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
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
