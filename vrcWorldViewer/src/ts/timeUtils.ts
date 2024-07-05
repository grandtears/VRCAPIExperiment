// timeUtils.ts

/**
 * Calculates the time difference between two dates and formats it as a string.
 * @param startDate The start date in "YYYY.MM.DD HH:mm:ss" format.
 * @param endDate The end date in "YYYY.MM.DD HH:mm:ss" format.
 * @returns A string representing the time difference in hours and minutes.
 */
export function calculateVisitTime(startDate: string, endDate: string): string {
    const formatDate = (date: string) => date.replace(/\./g, '-');
  
    const startTime = new Date(formatDate(startDate));
    const endTime = new Date(formatDate(endDate));
  
    const diffTime = endTime.getTime() - startTime.getTime();
    const diffHour = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMin = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
    return `${diffHour}時間${diffMin}分`;
  }
  
  /**
   * Formats a date string by replacing dots with hyphens.
   * @param date The date string to format in "YYYY.MM.DD HH:mm:ss" format.
   * @returns The formatted date string in "YYYY-MM-DD HH:mm:ss" format.
   */
  export function formatDate(date: string): string {
    return date.replace(/\./g, '-');
  }