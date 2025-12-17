// Toast notification utilities
// Wrapper around react-hot-toast for consistent notifications

import React from "react";
import toast from "react-hot-toast";

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: "top-right",
      style: {
        background: "#10B981",
        color: "#fff",
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: "top-right",
      style: {
        background: "#EF4444",
        color: "#fff",
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: "top-right",
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Show a toast with an action button
   * Useful for prompting user actions after an event
   */
  withAction: (
    message: string,
    actionLabel: string,
    onAction: () => void,
    options?: { duration?: number }
  ) => {
    return toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm">{message}</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onAction();
            }}
            className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            {actionLabel}
          </button>
        </div>
      ),
      {
        duration: options?.duration ?? 8000,
        position: "bottom-right",
        style: {
          background: "#1F2937",
          color: "#fff",
          maxWidth: "400px",
        },
      }
    );
  },
};

// Also export individual functions for named imports
export const { success, error, loading, dismiss, withAction } = showToast;

// Export toast instance for custom usage
export { toast };

export default showToast;
