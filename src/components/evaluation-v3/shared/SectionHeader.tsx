import React, { memo } from 'react';

/**
 * SectionHeader - Shared header component for accordion and card sections
 * Provides consistent header styling across all evaluation components
 */
export interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  /** Additional content to render on the right side (e.g., counts) */
  trailing?: React.ReactNode;
  className?: string;
}

export const SectionHeader = memo<SectionHeaderProps>(({
  title,
  icon,
  trailing,
  className = '',
}) => (
  <div className={`eval-section-header ${className}`}>
    <div className="eval-section-header-left">
      {icon && <span className="eval-section-header-icon">{icon}</span>}
      <h3 className="eval-section-header-title">{title}</h3>
    </div>
    {trailing && <div className="eval-section-header-right">{trailing}</div>}
  </div>
));

export default SectionHeader;
