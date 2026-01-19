import React, { memo, useState, useCallback } from "react";
import type { TabId } from "./types";
import "./styles.css";

// Re-export TabId for convenience
export type { TabId };

export interface Tab {
  id: TabId;
  label: string;
}

export interface EvaluationTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  className?: string;
}

const tabs: Tab[] = [
  { id: "ai", label: "AI Evaluation" },
  { id: "resume", label: "Resume" },
];

export const EvaluationTabs = memo<EvaluationTabsProps>(
  ({ activeTab, onTabChange, className = "" }) => {
    const handleTabClick = useCallback(
      (tabId: TabId) => {
        onTabChange(tabId);
      },
      [onTabChange]
    );

    return (
      <div className={`eval-tabs ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`eval-tab ${activeTab === tab.id ? "eval-tab-active" : ""}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }
);

// Hook for managing tab state
export const useEvaluationTabs = (initialTab: TabId = "ai") => {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  return { activeTab, setActiveTab };
};

export default EvaluationTabs;
