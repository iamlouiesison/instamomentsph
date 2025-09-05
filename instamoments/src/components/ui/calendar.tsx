'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div className={cn('p-3', className)}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .rdp {
            --rdp-cell-size: 2.25rem;
            --rdp-accent-color: hsl(var(--primary));
            --rdp-background-color: hsl(var(--background));
            margin: 0;
          }
          
          .rdp-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          
          .rdp-head_row {
            display: table-row !important;
          }
          
          .rdp-head_cell {
            width: var(--rdp-cell-size) !important;
            height: var(--rdp-cell-size) !important;
            display: table-cell !important;
            text-align: center !important;
            vertical-align: middle !important;
            font-size: 0.8rem !important;
            font-weight: 500 !important;
            color: hsl(var(--muted-foreground)) !important;
            padding: 0 !important;
            border: none !important;
          }
          
          .rdp-row {
            display: table-row !important;
          }
          
          .rdp-cell {
            width: var(--rdp-cell-size) !important;
            height: var(--rdp-cell-size) !important;
            position: relative !important;
            display: table-cell !important;
            text-align: center !important;
            vertical-align: middle !important;
            padding: 0 !important;
            border: none !important;
          }
          
          .rdp-day {
            width: var(--rdp-cell-size) !important;
            height: var(--rdp-cell-size) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 0.375rem !important;
            font-size: 0.875rem !important;
            font-weight: 400 !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
            margin: 0 !important;
            border: none !important;
            background: transparent !important;
          }
          
          .rdp-day:hover {
            background-color: hsl(var(--accent)) !important;
            color: hsl(var(--accent-foreground)) !important;
          }
          
          .rdp-day_selected {
            background-color: hsl(var(--primary)) !important;
            color: hsl(var(--primary-foreground)) !important;
          }
          
          .rdp-day_today {
            background-color: hsl(var(--accent)) !important;
            color: hsl(var(--accent-foreground)) !important;
          }
          
          .rdp-day_outside {
            color: hsl(var(--muted-foreground)) !important;
            opacity: 0.5 !important;
          }
          
          .rdp-day_disabled {
            color: hsl(var(--muted-foreground)) !important;
            opacity: 0.5 !important;
            cursor: not-allowed !important;
          }
          
          .rdp-months {
            display: flex !important;
            flex-direction: column !important;
          }
          
          .rdp-month {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          .rdp-caption {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            position: relative !important;
            padding-top: 0.25rem !important;
          }
          
          .rdp-caption_label {
            font-size: 0.875rem !important;
            font-weight: 500 !important;
            color: hsl(var(--foreground)) !important;
          }
          
          .rdp-nav {
            display: flex !important;
            align-items: center !important;
            gap: 0.25rem !important;
          }
          
          .rdp-nav_button {
            height: 1.75rem !important;
            width: 1.75rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 0.375rem !important;
            border: 1px solid hsl(var(--border)) !important;
            background: transparent !important;
            opacity: 0.5 !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
          }
          
          .rdp-nav_button:hover {
            opacity: 1 !important;
          }
          
          .rdp-nav_button_previous {
            position: absolute !important;
            left: 0.25rem !important;
          }
          
          .rdp-nav_button_next {
            position: absolute !important;
            right: 0.25rem !important;
          }
        `
      }} />
      <DayPicker
        showOutsideDays={showOutsideDays}
        className="rdp"
        classNames={{
          months: 'rdp-months',
          month: 'rdp-month',
          caption: 'rdp-caption',
          caption_label: 'rdp-caption_label',
          nav: 'rdp-nav',
          nav_button: 'rdp-nav_button',
          nav_button_previous: 'rdp-nav_button_previous',
          nav_button_next: 'rdp-nav_button_next',
          table: 'rdp-table',
          head_row: 'rdp-head_row',
          head_cell: 'rdp-head_cell',
          row: 'rdp-row',
          cell: 'rdp-cell',
          day: 'rdp-day',
          day_range_end: 'day-range-end',
          day_selected: 'rdp-day_selected',
          day_today: 'rdp-day_today',
          day_outside: 'rdp-day_outside',
          day_disabled: 'rdp-day_disabled',
          day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
          day_hidden: 'invisible',
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };