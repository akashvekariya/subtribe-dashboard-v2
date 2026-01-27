"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  XMarkIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/lib/api";

type UploadState = "initial" | "uploading" | "success" | "failed";

interface BulkUploadModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function BulkUploadModal({
  jobId,
  isOpen,
  onClose,
  onComplete,
}: BulkUploadModalProps) {
  const [state, setState] = useState<UploadState>("initial");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setState("initial");
      setFile(null);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".zip")) {
      setError("Please select a ZIP file");
      return;
    }
    setFile(selectedFile);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setState("uploading");
    setError(null);

    try {
      const response = await api.bulkUpload.upload(jobId, file);
      setState("success");
      setSuccessMessage(
        response.message ||
          "Upload complete. Processing will continue in the background."
      );
    } catch (err) {
      setState("failed");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }, [file, jobId]);

  const handleDone = useCallback(() => {
    onComplete();
    onClose();
  }, [onComplete, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Bulk Upload Resumes
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {state === "initial" && (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : file
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                  className="hidden"
                />

                {file ? (
                  <>
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      Choose different file
                    </button>
                  </>
                ) : (
                  <>
                    <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900">
                      Drop your ZIP file here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      or click to browse
                    </p>
                  </>
                )}
              </div>

              {/* Instructions */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Upload a ZIP file containing PDF resumes.</p>
                <p>
                  Non-PDF files will be skipped. Duplicates will be detected.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}

          {state === "uploading" && (
            <div className="text-center py-8">
              <ArrowPathIcon className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-sm font-medium text-gray-900">Uploading...</p>
              <p className="text-xs text-gray-500 mt-1">
                Uploading your ZIP file to the server
              </p>
            </div>
          )}

          {state === "success" && (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-900">
                Upload Complete
              </p>
              <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">
                {successMessage}
              </p>
            </div>
          )}

          {state === "failed" && (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-900">Upload Failed</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <button
                onClick={() => {
                  setState("initial");
                  setError(null);
                }}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          {state === "initial" && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  file
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Upload
              </button>
            </>
          )}

          {state === "uploading" && (
            <button
              disabled
              className="px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
            >
              Uploading...
            </button>
          )}

          {state === "success" && (
            <button
              onClick={handleDone}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          )}

          {state === "failed" && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
