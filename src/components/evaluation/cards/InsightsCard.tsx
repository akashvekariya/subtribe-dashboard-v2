import React, { memo } from "react";
import { CheckCircleFilledIcon, AlertTriangleFilledIcon } from "../Icons";
import "../styles.css";

export interface InsightsCardProps {
  strengths: string[];
  concerns: string[];
  className?: string;
}

// List item component
const InsightItem = memo<{ text: string; type: "strength" | "concern" }>(
  ({ text, type }) => (
    <li className={`insights-item insights-item-${type}`}>
      <span className={`insights-bullet insights-bullet-${type}`} />
      <span>{text}</span>
    </li>
  )
);

InsightItem.displayName = "InsightItem";

// Column component
const InsightsColumn = memo<{
  type: "strength" | "concern";
  items: string[];
  title: string;
  Icon: React.FC<{ className?: string }>;
}>(({ type, items, title, Icon }) => (
  <div className="insights-column">
    <div
      className={`insights-column-header insights-column-header-${type === "strength" ? "strengths" : "concerns"}`}
    >
      <Icon className="insights-icon" />
      <span>{title}</span>
      <span className="insights-count">{items.length}</span>
    </div>
    <ul className="insights-list">
      {items.map((item, index) => (
        <InsightItem key={index} text={item} type={type} />
      ))}
    </ul>
  </div>
));

InsightsColumn.displayName = "InsightsColumn";

export const InsightsCard = memo<InsightsCardProps>(
  ({ strengths, concerns, className = "" }) => (
    <div className={`insights-card ${className}`}>
      <div className="insights-header">
        <h3 className="eval-accordion-title">Key Insights</h3>
      </div>

      <div className="insights-content">
        <InsightsColumn
          type="strength"
          items={strengths}
          title="Strengths"
          Icon={CheckCircleFilledIcon}
        />
        <div className="insights-divider" />
        <InsightsColumn
          type="concern"
          items={concerns}
          title="Areas to Verify"
          Icon={AlertTriangleFilledIcon}
        />
      </div>
    </div>
  )
);

InsightsCard.displayName = "InsightsCard";

export default InsightsCard;
