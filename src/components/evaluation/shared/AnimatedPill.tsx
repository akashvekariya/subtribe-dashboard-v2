import React, { memo, useState, useLayoutEffect, useRef } from "react";

/**
 * AnimatedPill - Shared animated container for status pills
 * Smoothly transitions between collapsed (icon-only) and expanded (full pill) states
 */
export interface AnimatedPillProps {
  /** Element to show when collapsed (typically an icon) */
  collapsed: React.ReactNode;
  /** Element to show when expanded (typically a full pill) */
  expanded: React.ReactNode;
  /** Whether the pill is currently expanded */
  isExpanded: boolean;
}

export const AnimatedPill = memo<AnimatedPillProps>(
  ({ collapsed, expanded, isExpanded }) => {
    const expandedRef = useRef<HTMLDivElement>(null);
    const [expandedWidth, setExpandedWidth] = useState(0);

    useLayoutEffect(() => {
      if (expandedRef.current) {
        setExpandedWidth(expandedRef.current.offsetWidth);
      }
    }, [expanded]);

    return (
      <div
        className="eval-animated-pill"
        style={{
          width:
            isExpanded && expandedWidth > 0
              ? expandedWidth
              : "var(--eval-pill-icon-size)",
        }}
      >
        {/* Collapsed state */}
        <div
          className="absolute right-0 top-0"
          style={{
            opacity: isExpanded ? 0 : 1,
            transform: isExpanded ? "scale(0.8)" : "scale(1)",
            transition: "var(--eval-transition)",
          }}
        >
          {collapsed}
        </div>

        {/* Expanded state */}
        <div
          ref={expandedRef}
          className="absolute right-0 top-1/2"
          style={{
            transform: `translateY(-50%) scale(${isExpanded ? 1 : 0.8})`,
            opacity: isExpanded ? 1 : 0,
            transition: "var(--eval-transition)",
          }}
        >
          {expanded}
        </div>
      </div>
    );
  }
);

export default AnimatedPill;
