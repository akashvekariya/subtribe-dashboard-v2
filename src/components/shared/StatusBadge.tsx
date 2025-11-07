import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { STATUS_OPTIONS, JOB_STATUS_LABELS } from "@/lib/constants";
import { ApplicationStatus, JobStatus } from "@/types";

/**
 * Badge variants using CVA for type-safe styling
 */
const badgeVariants = cva(
  "inline-flex px-2 py-1 text-xs font-medium rounded-full",
  {
    variants: {
      status: {
        // Application statuses
        applied: "bg-blue-100 text-blue-800",
        screening: "bg-yellow-100 text-yellow-800",
        interviewing: "bg-purple-100 text-purple-800",
        offer: "bg-green-100 text-green-800",
        hired: "bg-green-200 text-green-900",
        rejected: "bg-red-100 text-red-800",
        // Job statuses
        active: "bg-green-100 text-green-800",
        draft: "bg-yellow-100 text-yellow-800",
        closed: "bg-gray-100 text-gray-800",
      },
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  status: ApplicationStatus | JobStatus;
  type?: "application" | "job";
  className?: string;
}

/**
 * StatusBadge Component
 * Industry-standard badge using CVA variants
 */
export function StatusBadge({
  status,
  type = "application",
  className,
}: StatusBadgeProps) {
  const label =
    type === "application"
      ? STATUS_OPTIONS.find((s) => s.value === status)?.label || status
      : JOB_STATUS_LABELS[status as JobStatus] || status;

  return (
    <span className={cn(badgeVariants({ status }), className)}>{label}</span>
  );
}
