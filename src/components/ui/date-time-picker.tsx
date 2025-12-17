"use client";

import * as React from "react";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/Input";

interface DateTimePickerProps {
  /** The selected date-time value as ISO string (UTC) */
  value?: string;
  /** Called when the date-time changes with ISO string (UTC) */
  onChange?: (value: string) => void;
  /** Minimum date-time allowed */
  minDate?: Date;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  minDate,
  placeholder = "Select date and time",
  disabled = false,
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse value into separate date and time for display
  const parsedDate = React.useMemo(() => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }, [value]);

  // Format for display in local time
  const displayDate = React.useMemo(() => {
    if (!parsedDate) return "";
    return parsedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [parsedDate]);

  const displayTime = React.useMemo(() => {
    if (!parsedDate) return "";
    return parsedDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, [parsedDate]);

  // Get time input value (HH:mm format for input type="time")
  const timeInputValue = React.useMemo(() => {
    if (!parsedDate) return "09:00";
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }, [parsedDate]);

  // Handle date selection from calendar
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate || !onChange) return;

    // Preserve existing time or use 9:00 AM default
    const hours = parsedDate?.getHours() ?? 9;
    const minutes = parsedDate?.getMinutes() ?? 0;

    const combined = new Date(selectedDate);
    combined.setHours(hours, minutes, 0, 0);

    onChange(combined.toISOString());
  };

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;

    const [hours, minutes] = e.target.value.split(":").map(Number);

    // Use existing date or today
    const baseDate = parsedDate ? new Date(parsedDate) : new Date();
    baseDate.setHours(hours, minutes, 0, 0);

    onChange(baseDate.toISOString());
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !parsedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
          {parsedDate ? (
            <span className="text-gray-900">
              {displayDate} at {displayTime}
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <Calendar
            mode="single"
            selected={parsedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              if (minDate) {
                const minDateOnly = new Date(minDate);
                minDateOnly.setHours(0, 0, 0, 0);
                const dateOnly = new Date(date);
                dateOnly.setHours(0, 0, 0, 0);
                return dateOnly < minDateOnly;
              }
              return false;
            }}
            initialFocus
          />
        </div>
        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <label className="text-sm text-gray-600">Time:</label>
            <Input
              type="time"
              value={timeInputValue}
              onChange={handleTimeChange}
              className="w-auto h-8 text-sm"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
