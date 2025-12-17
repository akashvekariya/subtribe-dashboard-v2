"use client";

import React, { useState } from "react";
import { Application } from "@/types";
import { emailAPI } from "@/lib/api-client";
import { EmailComposeForm, EmailFormData } from "./EmailComposeForm";
import { toast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EnvelopeIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidates: Application[];
  onSuccess?: () => void;
}

export function BulkEmailModal({
  isOpen,
  onClose,
  selectedCandidates,
  onSuccess,
}: BulkEmailModalProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSendBulkEmail = async (formData: EmailFormData) => {
    if (selectedCandidates.length === 0) {
      toast.error("No candidates selected");
      return;
    }

    setIsSending(true);
    try {
      const response = await emailAPI.sendBulkEmail({
        application_ids: selectedCandidates.map((c) => c.id),
        template_id: formData.templateId,
        subject: formData.subject,
        body: formData.body,
        send_immediately: formData.sendImmediately,
        scheduled_for: formData.scheduledFor,
      });

      if (response.status === "scheduled") {
        toast.success(
          `${response.emails_created} emails scheduled successfully`
        );
      } else {
        toast.success(`${response.emails_created} emails sent successfully`);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to send bulk emails:", error);
      toast.error("Failed to send emails");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EnvelopeIcon className="h-5 w-5" />
            Send Bulk Email
          </DialogTitle>
          <DialogDescription>
            Send an email to {selectedCandidates.length} selected candidate
            {selectedCandidates.length !== 1 ? "s" : ""}. Wildcards will be
            personalized for each recipient.
          </DialogDescription>
        </DialogHeader>

        {/* Selected Recipients Preview */}
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <UserGroupIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Recipients ({selectedCandidates.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {selectedCandidates.slice(0, 10).map((candidate) => (
              <span
                key={candidate.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700"
              >
                {candidate.first_name} {candidate.last_name}
              </span>
            ))}
            {selectedCandidates.length > 10 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                +{selectedCandidates.length - 10} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <EmailComposeForm
            onSubmit={handleSendBulkEmail}
            isSubmitting={isSending}
            submitLabel={
              isSending
                ? "Sending..."
                : `Send to ${selectedCandidates.length} recipient${selectedCandidates.length !== 1 ? "s" : ""}`
            }
            showScheduleOption={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
