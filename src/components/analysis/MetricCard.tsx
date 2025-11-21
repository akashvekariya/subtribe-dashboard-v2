/**
 * MetricCard Component
 *
 * A specialized card for displaying metrics and statistics.
 * Supports various display modes and premium feature indicators.
 * Follows single responsibility principle - only displays metric data.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/Card";
import {
  LockClosedIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const metricVariants = cva("metric-card", {
  variants: {
    variant: {
      default: "",
      success: "metric-card--success",
      warning: "metric-card--warning",
      danger: "metric-card--danger",
      info: "metric-card--info",
    },
    size: {
      sm: "metric-card--sm",
      md: "metric-card--md",
      lg: "metric-card--lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

const metricColorClasses = {
  default: {
    value: "text-gray-900",
    label: "text-gray-600",
    border: "border-gray-200",
    bg: "bg-gray-50",
  },
  success: {
    value: "text-green-700",
    label: "text-green-600",
    border: "border-green-200",
    bg: "bg-green-50",
  },
  warning: {
    value: "text-yellow-700",
    label: "text-yellow-600",
    border: "border-yellow-200",
    bg: "bg-yellow-50",
  },
  danger: {
    value: "text-red-700",
    label: "text-red-600",
    border: "border-red-200",
    bg: "bg-red-50",
  },
  info: {
    value: "text-blue-700",
    label: "text-blue-600",
    border: "border-blue-200",
    bg: "bg-blue-50",
  },
};

export interface MetricCardProps extends VariantProps<typeof metricVariants> {
  /** The main metric value to display */
  value: string | number;
  /** Label for the metric */
  label: string;
  /** Optional subtitle/description */
  description?: string;
  /** Icon component to display */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional trend indicator (+5%, -2%, etc.) */
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  /** Whether this is a premium feature */
  isPremium?: boolean;
  /** Whether user has access to this feature */
  hasAccess?: boolean;
  /** Callback when locked feature is clicked */
  onUpgradeClick?: () => void;
  /** Optional helper tooltip */
  helpText?: string;
  /** Optional suffix for the value (%, $, etc.) */
  suffix?: string;
  /** Optional prefix for the value ($, etc.) */
  prefix?: string;
  /** Custom className */
  className?: string;
  /** Show as compact version */
  compact?: boolean;
}

/**
 * MetricCard Component
 *
 * Displays a single metric with optional premium access control
 */
export function MetricCard({
  value,
  label,
  description,
  icon: Icon,
  trend,
  isPremium = false,
  hasAccess = true,
  onUpgradeClick,
  helpText,
  suffix,
  prefix,
  variant = "default",
  size = "md",
  className,
  compact = false,
}: MetricCardProps) {
  const colors =
    metricColorClasses[variant as keyof typeof metricColorClasses] ||
    metricColorClasses.default;
  const isLocked = isPremium && !hasAccess;

  const [showHelp, setShowHelp] = React.useState(false);

  const sizeClasses = {
    sm: {
      value: "text-2xl",
      padding: "p-4",
    },
    md: {
      value: "text-3xl",
      padding: "p-5",
    },
    lg: {
      value: "text-4xl",
      padding: "p-6",
    },
  };

  const currentSize =
    sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;

  return (
    <Card
      className={cn(
        metricVariants({ variant, size }),
        colors.border,
        colors.bg,
        "relative overflow-hidden transition-all",
        compact && "p-4",
        !compact && currentSize.padding,
        isLocked && "cursor-pointer hover:shadow-md",
        className
      )}
      padding="none"
      onClick={isLocked ? onUpgradeClick : undefined}
    >
      {/* Premium Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="bg-white rounded-full p-3 shadow-lg">
            <LockClosedIcon className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      )}

      <div className="relative">
        {/* Header Row: Icon/Label/Help */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <div
                className={cn("metric-card__icon rounded-lg p-2", colors.bg)}
              >
                <Icon className={cn("h-5 w-5", colors.value)} />
              </div>
            )}
            <div className="metric-card__label-wrapper">
              <span
                className={cn(
                  "metric-card__label text-sm font-medium",
                  colors.label
                )}
              >
                {label}
              </span>
              {isPremium && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Premium
                </span>
              )}
            </div>
          </div>

          {/* Help Icon */}
          {helpText && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHelp(!showHelp);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <InformationCircleIcon className="h-5 w-5" />
              </button>
              {showHelp && (
                <div className="absolute right-0 top-6 z-20 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                  {helpText}
                  <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 transform rotate-45" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Value Display */}
        <div className="metric-card__value-wrapper flex items-baseline gap-1 mb-1">
          {prefix && (
            <span className={cn("text-xl font-semibold", colors.value)}>
              {prefix}
            </span>
          )}
          <span
            className={cn(
              "metric-card__value font-bold",
              currentSize.value,
              colors.value,
              isLocked && "blur-sm"
            )}
          >
            {isLocked ? "••••" : value}
          </span>
          {suffix && (
            <span className={cn("text-xl font-semibold", colors.value)}>
              {suffix}
            </span>
          )}
          {trend && !isLocked && (
            <span
              className={cn(
                "metric-card__trend ml-2 text-sm font-medium",
                trend.direction === "up" && "text-green-600",
                trend.direction === "down" && "text-red-600",
                trend.direction === "neutral" && "text-gray-600"
              )}
            >
              {trend.direction === "up" && "↑"}
              {trend.direction === "down" && "↓"}
              {trend.value}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="metric-card__description text-xs text-gray-500 mt-1">
            {description}
          </p>
        )}

        {/* Upgrade CTA */}
        {isLocked && (
          <button
            onClick={onUpgradeClick}
            className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Unlock with Premium →
          </button>
        )}
      </div>
    </Card>
  );
}

/**
 * MetricCardSkeleton
 * Loading state for MetricCard
 */
export function MetricCardSkeleton({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-24",
    md: "h-32",
    lg: "h-40",
  };

  return (
    <Card className={cn("animate-pulse", sizeClasses[size])}>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
          <div className="h-8 w-2/3 bg-gray-200 rounded" />
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * MetricGrid
 * Container for arranging multiple MetricCards
 */
export interface MetricGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
}

export function MetricGrid({
  columns = 3,
  className,
  children,
  ...props
}: MetricGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn("metric-grid grid gap-4", gridCols[columns], className)}
      {...props}
    >
      {children}
    </div>
  );
}
