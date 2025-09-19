/**
 * Date formatting utilities
 */

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)} days ago`;
  } else {
    return formatDate(d);
  }
};

export const isValidDateString = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Duration and experience date utilities
 */
export const parseDateRange = (dateString: string): { start?: Date; end?: Date; current: boolean } => {
  const parts = dateString.toLowerCase().split(/[-–—]/).map(s => s.trim());
  
  const current = parts.some(part => 
    part.includes('present') || 
    part.includes('current') || 
    part.includes('now')
  );
  
  let start: Date | undefined;
  let end: Date | undefined;
  
  // Try to parse first part as start date
  if (parts[0]) {
    const startStr = parts[0].replace(/[^\w\s]/g, '').trim();
    if (startStr && !startStr.includes('present')) {
      start = parseFlexibleDate(startStr);
    }
  }
  
  // Try to parse second part as end date
  if (parts[1] && !current) {
    const endStr = parts[1].replace(/[^\w\s]/g, '').trim();
    if (endStr && !endStr.includes('present')) {
      end = parseFlexibleDate(endStr);
    }
  }
  
  return { start, end, current };
};

export const parseFlexibleDate = (dateString: string): Date | undefined => {
  // Try various date formats
  const formats = [
    // Full date formats
    /^(\w+)\s+(\d{4})$/i, // "March 2024"
    /^(\d{1,2})\/(\d{4})$/i, // "03/2024"
    /^(\d{4})$/i, // "2024"
    
    // With day
    /^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/i, // "March 15, 2024"
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/i, // "03/15/2024"
  ];
  
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      if (format === formats[0]) { // "March 2024"
        const monthIndex = monthNames.findIndex(m => 
          m.startsWith(match[1].toLowerCase())
        );
        if (monthIndex !== -1) {
          return new Date(parseInt(match[2]), monthIndex);
        }
      } else if (format === formats[1]) { // "03/2024"
        return new Date(parseInt(match[2]), parseInt(match[1]) - 1);
      } else if (format === formats[2]) { // "2024"
        return new Date(parseInt(match[1]), 0);
      }
    }
  }
  
  // Fallback to native Date parsing
  const fallback = new Date(dateString);
  return isNaN(fallback.getTime()) ? undefined : fallback;
};

export const calculateDuration = (start: Date, end?: Date): string => {
  const endDate = end || new Date();
  const diffInMonths = (endDate.getFullYear() - start.getFullYear()) * 12 + 
                      (endDate.getMonth() - start.getMonth());
  
  if (diffInMonths < 1) {
    return 'Less than 1 month';
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffInMonths / 12);
    const months = diffInMonths % 12;
    
    let result = `${years} year${years !== 1 ? 's' : ''}`;
    if (months > 0) {
      result += `, ${months} month${months !== 1 ? 's' : ''}`;
    }
    
    return result;
  }
};
