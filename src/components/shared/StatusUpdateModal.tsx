import React, { useState, useEffect } from "react";
import { Application, ApplicationStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  isHighSignalTransition,
  getStatusUpdateMessaging,
  combineTagsAndNotes,
} from "@/lib/status-update-config";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface StatusUpdateModalProps {
  application: Application;
  newStatus: ApplicationStatus;
  onSubmit: (status: ApplicationStatus, notes?: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function StatusUpdateModal({
  application,
  newStatus,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: StatusUpdateModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState("");

  const highSignalResult = isHighSignalTransition(
    application.status,
    newStatus,
    application.ai_score || 0
  );

  const messaging = getStatusUpdateMessaging(highSignalResult.scenario);

  useEffect(() => {
    // Reset form when modal opens
    setSelectedTags([]);
    setCustomNotes("");
  }, [newStatus]);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const finalNotes = combineTagsAndNotes(selectedTags, customNotes);
    onSubmit(newStatus, finalNotes);
  };

  return (
    <>
      {/* Overlay - Translucent */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {messaging.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {application.first_name} {application.last_name}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {/* Subtitle */}
            {messaging.subtitle && (
              <p className="text-sm text-gray-600 mb-4">{messaging.subtitle}</p>
            )}

            {/* Tags */}
            {highSignalResult.isHighSignal && messaging.tags.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  {messaging.quickPicksLabel}
                </p>
                <div className="flex flex-wrap gap-2">
                  {messaging.tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2.5 border"
                placeholder="Add additional context..."
              />
            </div>

            {/* Hint */}
            {messaging.hint && (
              <p className="text-xs text-gray-500 mt-3 flex items-start">
                <span className="mr-1">💡</span>
                <span>{messaging.hint}</span>
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
