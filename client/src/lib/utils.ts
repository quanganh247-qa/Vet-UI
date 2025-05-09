import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistance } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAppointmentTime = (date: Date | string): string => {
  const appointmentDate = typeof date === "string" ? new Date(date) : date;
  return format(appointmentDate, "h:mm a");
};

export const formatFullDate = (date: Date | string): string => {
  const appointmentDate = typeof date === "string" ? new Date(date) : date;
  return format(appointmentDate, "MMM d, yyyy");
};

export const formatTimeRange = (startTime: Date | string, endTime: Date | string): string => {
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;
  return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
};

export const getRelativeTime = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  
  // If date is in the future
  if (parsedDate > now) {
    return format(parsedDate, "h:mm a");
  }
  
  return formatDistance(parsedDate, now, { addSuffix: true });
};

export const getStatusColor = (status: string): { 
  bgColor: string, 
  textColor: string,
  dotColor: string 
} => {
  switch (status) {
    case "completed":
    case "Completed":
      return { bgColor: "bg-green-100", textColor: "text-green-700", dotColor: "bg-green-500" };
    case "in_progress":
    case "In Progress":
      return { bgColor: "bg-yellow-100", textColor: "text-yellow-700", dotColor: "bg-yellow-500" };
    case "scheduled":
    case "Scheduled":
      return { bgColor: "bg-blue-100", textColor: "text-blue-700", dotColor: "bg-blue-500" };
    case "canceled":
    case "Canceled":
      return { bgColor: "bg-red-100", textColor: "text-red-700", dotColor: "bg-red-500" };
    default:
      return { bgColor: "bg-gray-100", textColor: "text-gray-700", dotColor: "bg-gray-500" };
  }
};

export const getFormattedStatus = (status: string): string => {
  return status.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Creates a debounced function that delays invoking func until after wait
 * milliseconds have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
