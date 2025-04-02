import { useState, useEffect } from 'react';
import { format, subDays, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export type TimeRange = 'week' | 'last-week' | 'month' | 'last-month' | 'custom';

export const useDateRange = (initialRange: TimeRange = 'week') => {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const today = new Date();
    let start: Date;
    let end: Date;

    switch (timeRange) {
      case 'week':
        start = startOfDay(subDays(today, 7));
        end = endOfDay(today);
        break;
      case 'last-week':
        start = startOfDay(subDays(today, 14));
        end = endOfDay(subDays(today, 7));
        break;
      case 'month':
        start = startOfDay(subMonths(today, 1));
        end = endOfDay(today);
        break;
      case 'last-month':
        start = startOfDay(subMonths(today, 2));
        end = endOfDay(subMonths(today, 1));
        break;
      case 'custom':
        // For custom dates, we'll use the current dateRange
        return;
      default:
        start = startOfDay(subDays(today, 7));
        end = endOfDay(today);
    }

    setDateRange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    });
  }, [timeRange]);

  return {
    timeRange,
    setTimeRange,
    dateRange,
  };
}; 