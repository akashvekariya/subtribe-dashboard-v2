import { cn } from "@/lib/utils";
import { spinner } from "@/lib/styles";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

/**
 * LoadingSpinner Component
 * Centralized loading state display with consistent styling
 */
export function LoadingSpinner({
  size = "md",
  className,
  message,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={spinner({ size })} />
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
