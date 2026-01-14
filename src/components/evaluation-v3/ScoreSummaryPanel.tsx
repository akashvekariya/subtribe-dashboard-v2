import React, { memo, useMemo } from 'react';
import { ScoreRing } from './ScoreRing';
import { PersonalInfoDisplay } from './shared';
import { tierConfig } from './config';
import {
  ChartFilledIcon,
  ShieldFilledIcon,
  FlagFilledIcon,
} from './icons';
import type { PersonalInfo, QuickStats, CategoryScore, Tier } from './types';
import './styles.css';

// Re-export types
export type { QuickStats, PersonalInfo };

export interface ScoreSummaryPanelProps {
  categories: CategoryScore[];
  totalScore: number;
  maxTotalScore: number;
  tier: Tier;
  stats: QuickStats;
  personalInfo: PersonalInfo;
  className?: string;
}

// Stat Card component
const StatCard = memo<{
  Icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
  color: string;
}>(({ Icon, label, value, subValue, color }) => (
  <div className="score-panel-stat">
    <div className={`score-panel-stat-icon ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="score-panel-stat-content">
      <span className="score-panel-stat-label">{label}</span>
      <div className="score-panel-stat-value">
        {value}
        {subValue && <span className="score-panel-stat-sub">{subValue}</span>}
      </div>
    </div>
  </div>
));

// Main Component
export const ScoreSummaryPanel = memo<ScoreSummaryPanelProps>(({
  categories, totalScore, maxTotalScore, tier, stats, personalInfo, className = '',
}) => {
  const tierInfo = tierConfig[tier];
  const skillPercent = useMemo(
    () => Math.round((stats.skillsMatched / stats.skillsTotal) * 100),
    [stats.skillsMatched, stats.skillsTotal]
  );

  return (
    <div className={`score-panel ${className}`}>
      <div className="score-panel-left">
        <span className={`eval-pill eval-pill-bold ${tierInfo.pillClass}`}>{tierInfo.label}</span>
        <div className="score-panel-personal">
          <PersonalInfoDisplay info={personalInfo} variant="panel" showName={true} />
        </div>
      </div>

      <div className="score-panel-right">
        <div className="score-panel-ring-container">
          <ScoreRing categories={categories} totalScore={totalScore} maxTotalScore={maxTotalScore} />
        </div>
      </div>

      <div className="score-panel-stats">
        <StatCard
          Icon={ChartFilledIcon}
          label="Skills"
          value={`${stats.skillsMatched}/${stats.skillsTotal}`}
          subValue={`${skillPercent}%`}
          color="text-blue-600"
        />
        <StatCard
          Icon={ShieldFilledIcon}
          label="Constraints"
          value={`${stats.constraintsPassed} pass`}
          subValue={stats.constraintsReview > 0 ? `${stats.constraintsReview} review` : undefined}
          color="text-emerald-600"
        />
        <StatCard
          Icon={FlagFilledIcon}
          label="Flags"
          value={`${stats.redFlagsCount}`}
          subValue={stats.redFlagsSeverity}
          color={stats.redFlagsCount > 0 ? "text-orange-600" : "text-zinc-400"}
        />
      </div>
    </div>
  );
});

export default ScoreSummaryPanel;
