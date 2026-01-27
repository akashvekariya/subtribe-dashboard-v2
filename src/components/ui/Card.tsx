/**
 * Card Component
 *
 * A flexible card component following BEM naming conventions.
 * Provides consistent styling across the application.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "card rounded-lg border border-gray-200 bg-white transition-shadow",
  {
    variants: {
      variant: {
        default: "shadow",
        elevated: "shadow-md hover:shadow-lg",
        outline: "shadow-none",
        ghost: "border-transparent shadow-none",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/**
 * Card Root Component
 */
export function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  );
}

/**
 * Card Header
 * Contains title and optional actions
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

export function CardHeader({
  className,
  children,
  action,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "card__header flex items-center justify-between pb-4",
        className
      )}
      {...props}
    >
      <div className="card__header-content flex-1">{children}</div>
      {action && <div className="card__header-action">{action}</div>}
    </div>
  );
}

/**
 * Card Title
 */
export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({
  className,
  as: Component = "h3",
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        "card__title text-lg font-semibold leading-6 text-gray-900",
        className
      )}
      {...props}
    />
  );
}

/**
 * Card Description
 */
export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("card__description mt-1 text-sm text-gray-500", className)}
      {...props}
    />
  );
}

/**
 * Card Content
 */
export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card__content", className)} {...props} />;
}

/**
 * Card Footer
 */
export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "card__footer flex items-center justify-end gap-2 pt-4 border-t border-gray-100",
        className
      )}
      {...props}
    />
  );
}

/**
 * Card Section
 * For dividing card content into sections
 */
export function CardSection({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "card__section py-4 first:pt-0 last:pb-0 border-b border-gray-100 last:border-0",
        className
      )}
      {...props}
    />
  );
}
