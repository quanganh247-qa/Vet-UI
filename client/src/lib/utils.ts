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
      return { bgColor: "bg-green-100", textColor: "text-green-700", dotColor: "bg-green-500" };
    case "in_progress":
      return { bgColor: "bg-yellow-100", textColor: "text-yellow-700", dotColor: "bg-yellow-500" };
    case "scheduled":
      return { bgColor: "bg-blue-100", textColor: "text-blue-700", dotColor: "bg-blue-500" };
    case "canceled":
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
