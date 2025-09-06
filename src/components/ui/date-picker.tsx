"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  id,
  name,
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value,
  );
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    if (dateValue) {
      const newDate = new Date(dateValue);
      setSelectedDate(newDate);
      onChange?.(newDate);
      setIsOpen(false); // Close popover after selection
    } else {
      setSelectedDate(undefined);
      onChange?.(undefined);
    }
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  // Close popover when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  React.useEffect(() => {
    setSelectedDate(value);
  }, [value]);

  return (
    <div className="relative">
      {/* Styled button that triggers the date picker */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        className={cn(
          "flex h-11 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
          !selectedDate && "text-muted-foreground",
          className,
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {selectedDate ? formatDate(selectedDate) : <span>{placeholder}</span>}
      </button>

      {/* Calendar popover positioned below the button */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-full left-0 z-50 mt-2 w-full"
        >
          <div className="rounded-md border bg-popover p-3 shadow-lg">
            <Input
              type="date"
              value={
                selectedDate ? selectedDate.toISOString().split("T")[0] : ""
              }
              onChange={handleDateChange}
              onClick={handleInputClick}
              className="w-full h-11 text-base [color-scheme:light]"
              id={id}
              name={name}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}
