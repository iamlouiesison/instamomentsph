'use client';

import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'muted' | 'primary' | 'destructive';
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

const variantClasses = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  destructive: 'text-destructive',
};

export function CalendarIcon({ 
  size = 'sm', 
  className, 
  variant = 'default' 
}: CalendarIconProps) {
  return (
    <Calendar 
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        className
      )} 
    />
  );
}
