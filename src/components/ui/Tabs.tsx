import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");

  const currentValue = value !== undefined ? value : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider
      value={{ value: currentValue, onValueChange: handleValueChange }}
    >
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center justify-center w-full",
        className
      )}
    >
      {children}
    </div>
  );
}

const tabTriggerVariants = cva(
  "flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 first:rounded-tl-lg last:rounded-tr-lg",
  {
    variants: {
      active: {
        true: "bg-[var(--color-primary)] text-[var(--color-text-on-accent)]",
        false: "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

interface TabsTriggerProps extends VariantProps<typeof tabTriggerVariants> {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;
  const contentId = `tabpanel-${value}`;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={contentId}
      tabIndex={isActive ? 0 : -1}
      onClick={() => context.onValueChange(value)}
      className={cn(tabTriggerVariants({ active: isActive }), className)}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.value !== value) return null;

  const contentId = `tabpanel-${value}`;

  return (
    <div
      id={contentId}
      role="tabpanel"
      tabIndex={0}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  );
}
