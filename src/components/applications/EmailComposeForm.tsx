"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { EmailTemplate } from "@/types";
import { emailAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { WildcardHelper } from "@/components/shared/WildcardHelper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/switch";
import { EyeIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export interface EmailFormData {
  templateId?: string;
  subject: string;
  body: string;
  sendImmediately: boolean;
  scheduledFor?: string;
}

interface EmailComposeFormProps {
  /** Application ID for single email send (used for preview) */
  applicationId?: string;
  /** Initial form data */
  initialData?: Partial<EmailFormData>;
  /** Called when the form is submitted */
  onSubmit: (data: EmailFormData) => Promise<void>;
  /** Called when preview is requested */
  onPreview?: (data: { subject: string; body: string }) => Promise<void>;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Label for the submit button */
  submitLabel?: string;
  /** Show schedule option */
  showScheduleOption?: boolean;
  /** Class name for the form container */
  className?: string;
}

export function EmailComposeForm({
  applicationId,
  initialData,
  onSubmit,
  onPreview,
  isSubmitting = false,
  submitLabel = "Send Email",
  showScheduleOption = true,
  className = "",
}: EmailComposeFormProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialData?.templateId || ""
  );
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [sendImmediately, setSendImmediately] = useState(
    initialData?.sendImmediately ?? true
  );
  const [scheduledFor, setScheduledFor] = useState(
    initialData?.scheduledFor || ""
  );
  const [isPreviewing, setIsPreviewing] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Load templates on mount
  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await emailAPI.getTemplates();
        setTemplates(response.data);
      } catch (error) {
        console.error("Failed to load templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    }

    loadTemplates();
  }, []);

  // Handle template selection
  const handleTemplateSelect = useCallback(
    (templateId: string) => {
      setSelectedTemplateId(templateId);

      if (templateId === "none") {
        // Clear the form
        setSubject("");
        setBody("");
        return;
      }

      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSubject(template.subject);
        setBody(template.body);
      }
    },
    [templates]
  );

  // Insert wildcard at cursor position
  const insertWildcard = useCallback((wildcard: string) => {
    const textarea = bodyRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setBody(
        (prev) => prev.substring(0, start) + wildcard + prev.substring(end)
      );
      // Focus and set cursor position after the inserted wildcard
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + wildcard.length,
          start + wildcard.length
        );
      }, 0);
    } else {
      setBody((prev) => prev + wildcard);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: EmailFormData = {
      templateId:
        selectedTemplateId && selectedTemplateId !== "none"
          ? selectedTemplateId
          : undefined,
      subject: subject.trim(),
      body: body.trim(),
      sendImmediately,
      scheduledFor: sendImmediately ? undefined : scheduledFor,
    };

    await onSubmit(formData);
  };

  // Handle preview
  const handlePreview = async () => {
    if (!onPreview) return;

    setIsPreviewing(true);
    try {
      await onPreview({ subject: subject.trim(), body: body.trim() });
    } finally {
      setIsPreviewing(false);
    }
  };

  const isFormValid =
    subject.trim() && body.trim() && (sendImmediately || scheduledFor);

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Template Selection */}
      <div className="space-y-2">
        <Label htmlFor="template-select">Email Template</Label>
        <Select
          value={selectedTemplateId || "none"}
          onValueChange={handleTemplateSelect}
          disabled={isLoadingTemplates}
        >
          <SelectTrigger id="template-select">
            <SelectValue
              placeholder={
                isLoadingTemplates
                  ? "Loading templates..."
                  : "Select a template"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Start from scratch</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="email-subject">Subject *</Label>
        <Input
          id="email-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter email subject..."
          required
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-body">Message *</Label>
          <WildcardHelper onInsert={insertWildcard} />
        </div>
        <Textarea
          ref={bodyRef}
          id="email-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email message here..."
          rows={8}
          className="font-mono text-sm"
          required
        />
        <p className="text-xs text-gray-500">
          Use wildcards like {"{candidate_name}"}, {"{job_title}"} to
          personalize the email.
        </p>
      </div>

      {/* Schedule Option */}
      {showScheduleOption && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="send-immediately">Send Immediately</Label>
              <p className="text-xs text-gray-500">
                {sendImmediately
                  ? "Email will be sent right away"
                  : "Choose when to send"}
              </p>
            </div>
            <Switch
              id="send-immediately"
              checked={sendImmediately}
              onCheckedChange={setSendImmediately}
            />
          </div>

          {!sendImmediately && (
            <div className="space-y-2">
              <Label htmlFor="scheduled-for">Schedule For *</Label>
              <DateTimePicker
                value={scheduledFor}
                onChange={setScheduledFor}
                minDate={new Date()}
                placeholder="Select date and time"
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        {onPreview && applicationId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={
              !subject.trim() || !body.trim() || isPreviewing || isSubmitting
            }
          >
            <EyeIcon className="h-4 w-4 mr-1.5" />
            Preview
          </Button>
        )}
        <Button type="submit" size="sm" disabled={!isFormValid || isSubmitting}>
          <PaperAirplaneIcon className="h-4 w-4 mr-1.5" />
          {isSubmitting ? "Sending..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
