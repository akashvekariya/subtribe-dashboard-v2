import React, { memo } from "react";
import type { ManipulationCheck } from "./types";
import "./styles.css";

interface ManipulationAlertProps {
  manipulationCheck: ManipulationCheck;
}

// Warning icon for manipulation alert
const WarningIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const ManipulationAlert = memo<ManipulationAlertProps>(
  ({ manipulationCheck }) => {
    // Only show when manipulation is detected
    if (!manipulationCheck.detected) {
      return null;
    }

    return (
      <div className="manipulation-alert">
        <div className="manipulation-alert-header">
          <WarningIcon />
          <span className="manipulation-alert-title">
            Manipulation Attempt Detected
          </span>
        </div>
        {manipulationCheck.details && (
          <p className="manipulation-alert-details">
            {manipulationCheck.details}
          </p>
        )}
      </div>
    );
  }
);

ManipulationAlert.displayName = "ManipulationAlert";

export default ManipulationAlert;
