/**
 * Reusable Style Variants
 * Industry-standard CVA patterns for truly reusable components
 */

import { cva } from "class-variance-authority";

/**
 * Card variants using CVA for type-safe, composable styling
 * Usage: <div className={card({ rounded: 'xl', hover: true })} />
 */
export const card = cva("bg-white border border-gray-200", {
  variants: {
    rounded: {
      md: "rounded-lg",
      lg: "rounded-xl",
    },
    hover: {
      true: "hover:border-gray-300 transition-colors",
      false: "",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
    },
  },
  defaultVariants: {
    rounded: "md",
    hover: false,
    padding: "none",
  },
});

/**
 * Loading spinner variants
 * Usage: <div className={spinner({ size: 'md' })} />
 */
export const spinner = cva(
  "animate-spin rounded-full border-b-2 border-gray-900",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

/**
 * Utility function to generate status badge classes
 * @param colorClasses - Tailwind color classes (e.g., "bg-blue-100 text-blue-800")
 * @returns Complete badge class string
 */
export function getStatusBadgeClasses(colorClasses: string): string {
  return `inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClasses}`;
}
