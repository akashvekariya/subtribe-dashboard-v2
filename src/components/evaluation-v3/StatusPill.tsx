import React, { memo } from 'react';
import { CircleCheckIcon, HourglassIcon, CircleXIcon } from './icons';
import { pillVariantStyles, eligibilityConfig } from './config';
import type { PillVariant, EligibilityStatus } from './types';
import './styles.css';

// Re-export icons for convenience
export { PillIcons, PillIconsBold } from './icons';

// Re-export types
export type { PillVariant, EligibilityStatus };

// Icon mapping for eligibility status
const eligibilityIcons: Record<string, React.FC<{ strokeWidth?: number }>> = {
  true: CircleCheckIcon,
  review: HourglassIcon,
  false: CircleXIcon,
};

// StatusPill component
export interface StatusPillProps {
  variant: PillVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  bold?: boolean;
}

export const StatusPill = memo<StatusPillProps>(({ variant, children, icon, bold = false }) => (
  <span className={`eval-pill ${bold ? 'eval-pill-bold' : ''} ${pillVariantStyles[variant]}`}>
    {icon && <span className="eval-pill-icon">{icon}</span>}
    {children}
  </span>
));

// EligibilityPill component
export interface EligibilityPillProps {
  eligible: EligibilityStatus;
  showLabel?: boolean;
  bold?: boolean;
}

export const EligibilityPill = memo<EligibilityPillProps>(({ eligible, showLabel = true, bold = false }) => {
  const config = eligibilityConfig[String(eligible)];
  const Icon = eligibilityIcons[String(eligible)];
  const strokeWidth = bold ? 2.5 : 2;

  return (
    <span className={`eval-pill ${bold ? 'eval-pill-bold' : ''} ${config.style}`}>
      <span className="eval-pill-icon">
        <Icon strokeWidth={strokeWidth} />
      </span>
      {showLabel && config.label}
    </span>
  );
});

// EligibilityIcon component (compact circular version)
export const EligibilityIcon = memo<{ eligible: EligibilityStatus }>(({ eligible }) => {
  const config = eligibilityConfig[String(eligible)];
  const Icon = eligibilityIcons[String(eligible)];

  return (
    <span className={`eval-eligibility-icon ${config.style}`}>
      <span className="eval-pill-icon">
        <Icon strokeWidth={2} />
      </span>
    </span>
  );
});

export default StatusPill;
