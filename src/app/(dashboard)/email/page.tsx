"use client";

import React, { useState, useEffect, useCallback } from "react";
import { EmailTemplate } from "@/types";
import { emailAPI } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { WildcardHelper } from "@/components/shared/WildcardHelper";
import { formatDate } from "@/lib/format";
import {
  PlusIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type TabType = "templates";

const tabs: { id: TabType; name: string }[] = [
  { id: "templates", name: "Templates" },
];

interface TemplateFormData {
  name: string;
  subject: string;
  body: string;
}

const defaultFormData: TemplateFormData = {
  name: "",
  subject: "",
  body: "",
};

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState<TabType>("templates");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTemplates = useCallback(async () => {
    try {
      const response = await emailAPI.getTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error("Failed to load email templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleOpenCreate = () => {
    setSelectedTemplate(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTemplate(null);
    setFormData(defaultFormData);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      if (selectedTemplate) {
        await emailAPI.updateTemplate(selectedTemplate.id, {
          name: formData.name.trim(),
          subject: formData.subject.trim(),
          body: formData.body.trim(),
        });
        toast.success("Template updated successfully");
      } else {
        await emailAPI.createTemplate({
          name: formData.name.trim(),
          subject: formData.subject.trim(),
          body: formData.body.trim(),
        });
        toast.success("Template created successfully");
      }

      handleCloseDialog();
      loadTemplates();
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error(selectedTemplate ? "Failed to update template" : "Failed to create template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    setIsDeleting(true);
    try {
      await emailAPI.deleteTemplate(selectedTemplate.id);
      toast.success("Template deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  const insertWildcard = (wildcard: string) => {
    const textarea = document.getElementById("template-body") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = formData.body.substring(0, start) + wildcard + formData.body.substring(end);
      setFormData((prev) => ({ ...prev, body: newBody }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + wildcard.length, start + wildcard.length);
      }, 0);
    } else {
      setFormData((prev) => ({ ...prev, body: prev.body + wildcard }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900">Email</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage email templates and communication settings
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          {/* Templates Header */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Create and manage email templates for candidate communication
            </p>
            <Button size="sm" onClick={handleOpenCreate} title="Create Template">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Templates List */}
          {isLoading ? (
            <LoadingSpinner message="Loading templates..." className="min-h-64" />
          ) : templates.length === 0 ? (
            <EmptyState
              icon={EnvelopeIcon}
              title="No email templates"
              description="Create your first email template to streamline candidate communication."
              action={
                <Button onClick={handleOpenCreate}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              }
            />
          ) : (
            <div className="bg-white border border-gray-200 overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {templates.map((template) => (
                  <li key={template.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {template.name}
                            </h3>
                            {template.is_default && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                template.category === "system"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-green-100 text-green-800"
                              )}
                            >
                              {template.category === "system" ? "System" : "Custom"}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {template.subject}
                          </p>
                          <div className="mt-1 text-xs text-gray-400">
                            Updated {formatDate(template.updated_at)}
                          </div>
                        </div>

                        <div className="ml-4 flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(template)}
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          {template.category !== "system" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDelete(template)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? "Update your email template details below."
                : "Create a new email template for candidate communication."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Interview Invitation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Email Subject *</Label>
              <Input
                id="template-subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="e.g., Interview Invitation for {job_title} position"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="template-body">Email Body *</Label>
                <WildcardHelper onInsert={insertWildcard} />
              </div>
              <Textarea
                id="template-body"
                value={formData.body}
                onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Write your email content here. Use wildcards like {candidate_name} to personalize..."
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Use wildcards like {"{candidate_name}"}, {"{job_title}"}, {"{company_name}"}{" "}
                to personalize emails.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : selectedTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedTemplate?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
