"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  body: string;
  recipientName?: string;
  recipientEmail?: string;
}

export function EmailPreviewModal({
  isOpen,
  onClose,
  subject,
  body,
  recipientName,
  recipientEmail,
}: EmailPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
          <DialogDescription>
            This is how the email will appear to the recipient after wildcard replacement.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Recipient Info */}
          {(recipientName || recipientEmail) && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <span className="text-gray-500">To: </span>
              <span className="font-medium text-gray-900">
                {recipientName && recipientEmail
                  ? `${recipientName} <${recipientEmail}>`
                  : recipientEmail || recipientName}
              </span>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </label>
            <div className="bg-gray-50 rounded-lg p-3 text-sm font-medium text-gray-900">
              {subject}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Message
            </label>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {body}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
