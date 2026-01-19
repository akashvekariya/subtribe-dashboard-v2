import React, { memo } from "react";
import { AlertTriangleFilledIcon } from "../Icons";
import type { ManipulationCheck } from "../types";
import "../styles.css";

interface ManipulationCardProps {
  manipulationCheck: ManipulationCheck;
}

export const ManipulationCard = memo<ManipulationCardProps>(
  ({ manipulationCheck }) => {
    // Only show if manipulation is detected
    if (!manipulationCheck.detected) {
      return null;
    }

    return (
      <div className="manipulation-card">
        <div className="manipulation-header">
          <AlertTriangleFilledIcon className="manipulation-icon" />
          <h3 className="manipulation-title">Manipulation Detected</h3>
        </div>
        {manipulationCheck.details && (
          <p className="manipulation-details">{manipulationCheck.details}</p>
        )}
      </div>
    );
  }
);

ManipulationCard.displayName = "ManipulationCard";

export default ManipulationCard;
