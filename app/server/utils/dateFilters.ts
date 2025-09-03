import type { H3Event } from 'h3';

interface DateRange {
  startDate: Date;
  endDate: Date;
  isMonthlyView: boolean;
  year: number;
  month?: number;
}

export function getDateRangeFromQuery(event: H3Event): DateRange {
  const { month, year } = getQuery(event);
  const currentDate = new Date();
  
  // Set default values if not provided
  const filterYear = year ? parseInt(year as string) : currentDate.getFullYear();
  const filterMonth = month ? parseInt(month as string) : null;

  // Create date range for filtering
  let startDate: Date;
  let endDate: Date;

  if (filterMonth) {
    startDate = new Date(filterYear, filterMonth - 1, 1);
    endDate = new Date(filterYear, filterMonth, 1);
  } else {
    // If no month is selected, get the whole year
    startDate = new Date(filterYear, 0, 1);
    endDate = new Date(filterYear + 1, 0, 1);
  }

  return {
    startDate,
    endDate,
    isMonthlyView: !!filterMonth,
    year: filterYear,
    month: filterMonth || undefined
  };
}

export function generateDateLabels(range: DateRange): string[] {
  const { isMonthlyView, year, month } = range;
  
  if (isMonthlyView && month) {
    // Generate labels for each day of the month
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
  } else {
    // Generate labels for each month of the year
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ].slice(0, 12);
  }
}

export function fillMissingDataPoints<T extends { date: string; total: number }>(
  data: T[],
  range: DateRange
): T[] {
  const { isMonthlyView, year, month } = range;
  const result: T[] = [];
  
  // Create a map of date to data point for quick lookup
  const dataMap = new Map<string, T>();
  data.forEach(item => dataMap.set(item.date, item));
  
  if (isMonthlyView && month) {
    // Fill in missing days
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day).toISOString().split('T')[0];
      const existingData = dataMap.get(date);
      
      result.push(existingData || {
        date,
        total: 0,
        ...{} as Omit<T, 'date' | 'total'>
      });
    }
  } else {
    // Fill in missing months
    for (let m = 0; m < 12; m++) {
      const date = new Date(year, m, 1).toISOString().split('T')[0];
      const existingData = [...dataMap.values()].find(
        item => new Date(item.date).getMonth() === m
      );
      
      result.push(existingData || {
        date,
        total: 0,
        ...{} as Omit<T, 'date' | 'total'>
      });
    }
  }
  
  return result.sort((a, b) => a.date.localeCompare(b.date));
}

// Helper function to adjust date for "before 8 AM" logic
export function adjustDateForEarlyMorning(date: Date, hour: number): string {
  if (hour < 8) {
    // If before 8 AM, adjust to previous day
    const adjustedDate = new Date(date);
    adjustedDate.setDate(date.getDate() - 1);
    return adjustedDate.toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}
