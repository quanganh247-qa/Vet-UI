import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  memo,
  Suspense,
} from "react";
import { useLocation } from "wouter";
import { LowStockNotification } from "@/types";
import {
  Bell,
  Calendar,
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  LayoutGrid,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { toast as reactToastify, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";
import {
  useAppointmentData,
  useConfirmAppointment,
  useMarkMessageDelivered,
} from "@/hooks/use-appointment";
import { useNotificationsContext } from "@/context/notifications-context";
import { cn } from "@/lib/utils";
import { useSendNotification } from "@/hooks/use-noti";

// Define Notification interface based on database schema
interface Notification {
  id: number;
  username: string;
  title: string;
  content?: string;
  is_read: boolean;
  related_id?: number;
  related_type?: string;
  created_at: string;
  notify_type?: string;
  state?: number;

  // Additional computed/mapped properties used in the UI
  message: string; // Maps to content
  appointmentId: number; // Maps to related_id when related_type is 'appointment'
  date: string; // Formatted from datetime
  timeSlot?: {
    startTime: string;
    endTime: string;
  };
  pet?: {
    petName: string;
    petId: number;
  };
  doctor?: {
    doctorName: string;
    doctorId: number;
  };
  owner?: {
    owner_id: number;
  };
  reason?: string;
  serviceName?: string;
  appointmentDetails?: any; // Chi tiết cuộc hẹn từ API
}

// Pagination configuration
const ITEMS_PER_PAGE = 5;

// Create a memoized notification item component to prevent unnecessary re-renders
const NotificationItem = memo(
  ({
    notification,
    onClick,
  }: {
    notification: Notification;
    onClick: (notification: Notification) => void;
  }) => {
    // Memoize formatted date strings to avoid recalculations
    const formattedTime = useMemo(() => {
      return new Date(notification.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }, [notification.created_at]);

    return (
      <div
        className={cn(
          "px-6 py-4 hover:bg-[#F9FAFB]/50 cursor-pointer transition-colors",
          !notification.is_read && "bg-[#F9FAFB]/30 border-l-4 border-[#2C78E4]"
        )}
        onClick={() => onClick(notification)}
      >
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center rounded-full mr-3 flex-shrink-0",
                !notification.is_read ? "text-[#2C78E4]" : "text-[#4B5563]"
              )}
            >
              {notification.notify_type === "appointment" ? (
                <Calendar className="h-5 w-5" />
              ) : (
                <MessageSquare className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center">
                <span
                  className={cn(
                    "text-sm",
                    !notification.is_read
                      ? "font-semibold text-[#111827]"
                      : "font-medium text-[#4B5563]"
                  )}
                >
                  {notification.title}
                  {!notification.is_read && (
                    <span className="ml-2 inline-flex items-center">
                      <span className="h-2 w-2 rounded-full bg-[#2C78E4]"></span>
                    </span>
                  )}
                </span>
                <span className="text-[#2C78E4] mx-2">•</span>
                <span className="text-sm text-[#2C78E4]">{formattedTime}</span>
              </div>
              <p
                className={cn(
                  "text-sm mt-1",
                  !notification.is_read ? "text-[#111827]" : "text-[#4B5563]"
                )}
              >
                {notification.content}
              </p>
            </div>
          </div>

          <Badge
            className={cn(
              "ml-4 mt-1 rounded-full",
              !notification.is_read
                ? "bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20 font-medium"
                : "bg-gray-100 text-[#4B5563] border-gray-200"
            )}
          >
            {notification.serviceName}
          </Badge>
        </div>
      </div>
    );
  }
);

NotificationItem.displayName = "NotificationItem";

// Create a memoized notification list component
const NotificationsList = memo(
  ({
    notifications,
    onItemClick,
  }: {
    notifications: Notification[];
    onItemClick: (notification: Notification) => void;
  }) => {
    return (
      <div className="divide-y divide-[#F9FAFB]">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={onItemClick}
          />
        ))}
      </div>
    );
  }
);

NotificationsList.displayName = "NotificationsList";

const NotificationsPage = () => {
  const [, navigate] = useLocation();
  const {
    notifications: rawNotifications,
    markAsRead,
    clearAll,
    isLoading: isNotificationsLoading,
  } = useNotificationsContext();

  const previousNotificationsCount = useRef(0);

  // Track if this is the first load
  const isFirstLoad = useRef(true);

  // Remove the extra notifications state - use rawNotifications directly from context
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("unread-first");
  const [selectedNotificationID, setSelectedNotificationID] =
    useState<number>();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Cache notifications mapping for better performance
  const processedNotifications = useMemo(() => {
    if (
      !rawNotifications ||
      !Array.isArray(rawNotifications) ||
      rawNotifications.length === 0
    )
      return [];

    console.log(
      "Processing raw notifications, count:",
      rawNotifications.length
    );
    // console.log("Raw notifications IDs:", rawNotifications.map(n => n.id));

    // Map database fields to UI fields - this is a heavy operation that we should memoize
    const processed = rawNotifications
      .filter((notification) => {
        // Ensure we only process valid notifications
        // Check for required fields and valid state (state = 1 or undefined)
        return (
          notification &&
          notification.id &&
          (notification.state === undefined || notification.state === 1)
        );
      })
      .map((notification: any) => {
        try {
          // console.log("Processing notification with ID:", notification.id, "Type:", typeof notification.id);
          
          let appointmentId = notification.related_id;
          let date = notification.datetime
            ? new Date(notification.datetime)
            : new Date();

          // Default values that will be overridden if data is available
          let petInfo = { petName: "Unknown", petId: 0 };
          let doctorInfo = { doctorName: "Unassigned", doctorId: 0 };
          let reason = "General Checkup";
          let serviceName = "Consultation";
          let timeSlot = {
            startTime: date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            endTime: "",
          };
          let owner = undefined;

          // Process content efficiently based on type
          if (notification.content) {
            if (
              typeof notification.content === "string" &&
              notification.content.trim().startsWith("{")
            ) {
              try {
                // Parse JSON only once
                const contentObj = JSON.parse(notification.content);

                // Extract all needed data in a single pass
                if (contentObj.timeSlot) timeSlot = contentObj.timeSlot;

                if (contentObj.pet) {
                  petInfo = contentObj.pet;
                } else if (contentObj.pet_name) {
                  petInfo = {
                    petName: contentObj.pet_name,
                    petId: contentObj.pet_id || 0,
                  };
                }

                if (contentObj.doctor) {
                  doctorInfo = contentObj.doctor;
                } else if (contentObj.doctor_name) {
                  doctorInfo = {
                    doctorName: contentObj.doctor_name,
                    doctorId: contentObj.doctor_id || 0,
                  };
                }

                if (contentObj.reason) reason = contentObj.reason;

                if (contentObj.service_name) {
                  serviceName = contentObj.service_name;
                } else if (contentObj.serviceName) {
                  serviceName = contentObj.serviceName;
                }

                if (contentObj.owner) {
                  owner = contentObj.owner;
                }
              } catch (e) {
                // If JSON parsing fails, don't attempt text extraction if not necessary
                console.warn(
                  "Failed to parse notification content as JSON:",
                  e
                );
              }
            } else if (typeof notification.content === "object") {
              // Content is already an object - directly use properties
              const contentObj = notification.content;

              if (contentObj.timeSlot) timeSlot = contentObj.timeSlot;

              if (contentObj.pet) {
                petInfo = contentObj.pet;
              } else if (contentObj.pet_name) {
                petInfo = {
                  petName: contentObj.pet_name,
                  petId: contentObj.pet_id || 0,
                };
              }

              if (contentObj.doctor) {
                doctorInfo = contentObj.doctor;
              } else if (contentObj.doctor_name) {
                doctorInfo = {
                  doctorName: contentObj.doctor_name,
                  doctorId: contentObj.doctor_id || 0,
                };
              }

              if (contentObj.reason) reason = contentObj.reason;

              if (contentObj.service_name) {
                serviceName = contentObj.service_name;
              } else if (contentObj.serviceName) {
                serviceName = contentObj.serviceName;
              }

              if (contentObj.owner) {
                owner = contentObj.owner;
              }
            }
          }

          // Create formatted date string once
          const formattedDate = date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          const processedNotification = {
            ...notification,
            message: notification.content || "",
            appointmentId,
            date: formattedDate,
            timeSlot,
            pet: petInfo.petName ? petInfo : undefined,
            doctor:
              doctorInfo.doctorName !== "Unassigned" ? doctorInfo : undefined,
            reason,
            serviceName,
            owner,
          };
          
          // console.log("Processed notification ID:", processedNotification.id, "Type:", typeof processedNotification.id);
          return processedNotification;
        } catch (error) {
          // Handle any unexpected errors to prevent breaking the entire notification list
          console.error(
            "Error processing notification:",
            notification.id,
            error
          );
          return {
            ...notification,
            message: notification.content || "",
            appointmentId: notification.related_id,
            date: new Date(
              notification.datetime || new Date()
            ).toLocaleDateString(),
            pet: undefined,
            doctor: undefined,
            reason: "General Checkup",
            serviceName: "Consultation",
          };
        }
      });

    console.log("Processed notifications IDs:", processed.map(n => n.id));

    // More robust deduplication - check by ID, title, content, and created_at
    const seenNotifications = new Map();
    const seenAppointments = new Map();
    const deduplicatedNotifications = processed.filter((notification) => {
      // Normalize ID to string for consistent comparison
      const normalizedId = String(notification.id);
      
      // Create a unique key based on multiple fields to catch different types of duplicates
      const uniqueKey = `${normalizedId}-${notification.title}-${notification.content}-${notification.created_at}`;
      
      // Check for appointment-based duplicates
      if (notification.related_id && notification.related_type === "appointment") {
        const appointmentKey = `${notification.related_id}-${notification.title}`;
        if (seenAppointments.has(appointmentKey)) {
          // console.log("Removing duplicate appointment notification:", appointmentKey, "ID:", notification.id);
          return false;
        }
        seenAppointments.set(appointmentKey, notification);
      }
      
      if (seenNotifications.has(normalizedId)) {
        // console.log("Removing duplicate notification with normalized ID:", normalizedId, "Original ID:", notification.id, "Title:", notification.title);
        return false;
      }
      
      if (seenNotifications.has(uniqueKey)) {
        // console.log("Removing duplicate notification with unique key:", uniqueKey);
        return false;
      }
      
      seenNotifications.set(normalizedId, notification);
      seenNotifications.set(uniqueKey, notification);
      return true;
    });

    console.log("After deduplication, count:", deduplicatedNotifications.length);
    // console.log("Final notification IDs:", deduplicatedNotifications.map(n => n.id));
    return deduplicatedNotifications;
  }, [rawNotifications]);

  const { mutateAsync: sendNotificationAsync } = useSendNotification();

  // Selected notification for detail view
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  // Lưu trữ ID của cuộc hẹn liên quan
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>();

  // Sử dụng hook useAppointmentData
  const { data: appointmentData, isLoading: isAppointmentLoading } =
    useAppointmentData(selectedAppointmentId);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [lowStockNotifications, setLowStockNotifications] = useState<
    LowStockNotification[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sắp xếp thông báo dựa trên trạng thái đã đọc/chưa đọc và thời gian
  const sortedNotifications = useMemo(() => {
    if (!processedNotifications || processedNotifications.length === 0) return [];

    const notificationsCopy = [...processedNotifications];

    switch (sortOrder) {
      case "unread-first":
        return notificationsCopy.sort((a, b) => {
          // Ưu tiên sắp xếp theo trạng thái đọc/chưa đọc
          if (a.is_read !== b.is_read) {
            return a.is_read ? 1 : -1; // Thông báo chưa đọc lên đầu
          }
          // Nếu cùng trạng thái thì sắp xếp theo thời gian (mới nhất lên đầu)
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

      case "newest-first":
        return notificationsCopy.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      case "oldest-first":
        return notificationsCopy.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

      default:
        return notificationsCopy;
    }
  }, [processedNotifications, sortOrder]);

  // Filter notifications using the transformed and sorted notifications
  const filteredNotifications = useMemo(() => {
    if (!sortedNotifications || sortedNotifications.length === 0) {
      return [];
    }

      // console.log(
      //   "Filtering notifications, count before filter:",
      //   sortedNotifications.length
      // );
      // console.log("Sorted notifications IDs:", sortedNotifications.map(n => n.id));

    const filtered = sortedNotifications.filter(
      (notification: Notification) => {
        // Make sure we have a valid notification object
        if (!notification || !notification.id) {
          return false;
        }

        // Apply text search - lowercase done only once
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch =
          searchTerm === "" ||
          (notification.title &&
            notification.title.toLowerCase().includes(searchTermLower)) ||
          (notification.message &&
            notification.message.toLowerCase().includes(searchTermLower));

        // Apply status filter - to be implemented based on your status requirements
        const matchesStatus =
          filterStatus.length === 0 ||
          (notification.notify_type &&
            filterStatus.includes(notification.notify_type.toLowerCase()));

        // Only show notifications with state = 1
        // Skip this filter if state is undefined to avoid filtering out valid notifications
        const stateFilter =
          notification.state === undefined || notification.state === 1;

        const shouldInclude = matchesSearch && matchesStatus && stateFilter;
        return shouldInclude;
      }
    );

    // console.log("After filtering, count:", filtered.length);
    // console.log("Filtered notifications IDs:", filtered.map(n => n.id));
    return filtered;
  }, [sortedNotifications, searchTerm, filterStatus]);

  // Paginate notifications - use useMemo to avoid recalculating on every render
  const totalPages = useMemo(
    () => Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE),
    [filteredNotifications.length]
  );

  const paginatedNotifications = useMemo(() => {
    return filteredNotifications.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredNotifications, currentPage]);

  const handleViewAppointment = async (notification: Notification) => {
    setSelectedNotification(notification);
    setSelectedNotificationID(notification.id);

    // If notification has related_id and related_type is appointment, fetch appointment details
    if (
      notification.related_id &&
      notification.related_type === "appointment"
    ) {
      try {
        // Store appointment ID for useAppointmentData hook to fetch data
        setSelectedAppointmentId(notification.related_id.toString());
      } catch (error) {
        toast({
          title: "Error",
          description: "Error fetching appointment details",
          variant: "destructive",
          duration: 5000,
        });
      }
    } else if (notification.appointmentId) {
      // Fallback to appointmentId if related_id is not available
      setSelectedAppointmentId(notification.appointmentId.toString());
    } else {
      // If not an appointment-related notification, reset appointmentId
      setSelectedAppointmentId(undefined);
    }

    setIsSheetOpen(true);

    // Mark notification as read when opened
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);

        // Update UI immediately to show notification as read
        // setNotifications((prev) =>
        //   prev.map((item) =>
        //     item.id === notification.id ? { ...item, is_read: true } : item
        //   )
        // );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  // Update selectedNotification with appointmentData without causing infinite updates
  useEffect(() => {
    if (appointmentData && selectedNotification) {
      // Only update the selectedNotification.appointmentDetails property
      // without triggering a state update
      selectedNotification.appointmentDetails = appointmentData;
    }
  }, [appointmentData, selectedNotification]);

  const navigateToAppointment = (appointmentId: number) => {
    setIsSheetOpen(false);
    navigate(`/appointment/${appointmentId}`);
  };

  const { mutateAsync: confirmAppointmentAsync } = useConfirmAppointment();

  const handleConfirmAppointment = async () => {
    if (!selectedNotification) return;

    setIsConfirming(true);

    try {
      // Use appointmentData.id if available, otherwise fall back to related_id or appointmentId from the notification
      const appointmentId =
        appointmentData?.id ||
        selectedNotification.related_id ||
        selectedNotification.appointmentId;

      if (!appointmentId) {
        throw new Error("No appointment ID found for confirmation");
      }

      const result = await confirmAppointmentAsync(appointmentId);

      if (result && result.code !== "E") {
        // Mark the notification as read if not already
        if (selectedNotificationID && !selectedNotification.is_read) {
          await markAsRead(selectedNotificationID);
        }

        // Get pet name and appointment details for notification
        const petName =
          appointmentData?.pet?.pet_name ||
          selectedNotification.pet?.petName ||
          "Unknown Pet";
        const appointmentDate =
          appointmentData?.date || selectedNotification.date;
        const appointmentTime =
          appointmentData?.time_slot?.time ||
          selectedNotification.timeSlot?.startTime ||
          "scheduled time";

        // Send notification about confirmation
        try {
          // Get owner_id preferably from appointmentData first
          const ownerId =
            appointmentData?.owner?.owner_id ||
            selectedNotification?.owner?.owner_id ||
            8; // Fallback to a default ID (use a valid user ID from your system)

          await sendNotificationAsync({
            user_id: ownerId,
            title: "✅ Appointment Confirmed",
            body: `Your appointment for ${petName} on ${appointmentDate} at ${appointmentTime} has been confirmed. We look forward to seeing you!`,
          });
          console.log("Confirmation notification sent successfully");
        } catch (error) {
          // Just log the error but don't block the main confirmation flow
          console.error("Error sending notification:", error);
        }

        toast({
          title: "Appointment confirmed",
          description: `Appointment with ${petName} has been confirmed.`,
          className: "bg-[#2C78E4] text-white",
          duration: 5000,
        });

        // Close the sheet after successful confirmation
        setIsSheetOpen(false);
      } else {
        // Show error message from API
        const errorMessage =
          result?.message ||
          "An error occurred while confirming the appointment.";

        toast({
          title: "Confirmation failed",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });

        // Get pet name for notification
        const petName =
          appointmentData?.pet?.pet_name ||
          selectedNotification.pet?.petName ||
          "Unknown Pet";

        // Send notification about the booking error
        try {
          // Get owner_id preferably from appointmentData first
          const ownerId =
            appointmentData?.owner?.owner_id ||
            selectedNotification?.owner?.owner_id ||
            8; // Fallback to a default ID (use a valid user ID from your system)

          await sendNotificationAsync({
            user_id: ownerId.toString(),
            title: "⚠️ Appointment Booking Issue",
            body: `There was a problem confirming your appointment for ${petName}: ${errorMessage} Please contact the clinic for assistance.`,
          });
          console.log("Error notification sent successfully");
        } catch (notifyError) {
          console.error(
            "Error sending notification about booking issue:",
            notifyError
          );
        }
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);

      // Get error message
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      toast({
        title: "Confirmation failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });

      // Get pet name for notification
      const petName =
        appointmentData?.pet?.pet_name ||
        selectedNotification?.pet?.petName ||
        "Unknown Pet";

      // Send notification about the booking error
      try {
        // Get owner_id preferably from appointmentData first
        const ownerId =
          appointmentData?.owner?.owner_id ||
          selectedNotification?.owner?.owner_id ||
          8; // Fallback to a default ID (use a valid user ID from your system)

        await sendNotificationAsync({
          user_id: ownerId,
          title: "⚠️ Appointment Booking Issue",
          body: `There was a problem confirming your appointment for ${petName}: ${errorMessage} Please contact the clinic for assistance.`,
        });
        console.log("Error notification sent successfully");
      } catch (notifyError) {
        console.error(
          "Error sending notification about booking issue:",
          notifyError
        );
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDeclineAppointment = async () => {
    if (!selectedNotification) return;

    setIsConfirming(true);

    try {
      // Use appointmentData.id if available, otherwise fall back to related_id or appointmentId
      const appointmentId =
        appointmentData?.id ||
        selectedNotification.related_id ||
        selectedNotification.appointmentId;

      if (!appointmentId) {
        throw new Error("No appointment ID found for declining");
      }

      // Here you would call an API to decline the appointment
      // For now, we'll simulate it with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mark the notification as read if not already
      if (selectedNotificationID && !selectedNotification.is_read) {
        await markAsRead(selectedNotificationID);
      }

      // Get pet name and appointment details for notification
      const petName =
        appointmentData?.pet?.pet_name ||
        selectedNotification.pet?.petName ||
        "Unknown Pet";
      const appointmentDate =
        appointmentData?.date || selectedNotification.date;
      const appointmentTime =
        appointmentData?.time_slot?.time ||
        selectedNotification.timeSlot?.startTime ||
        "scheduled time";

      // Send notification about declination
      try {
        // Get owner_id preferably from appointmentData first
        const ownerId =
          appointmentData?.owner?.owner_id ||
          selectedNotification?.owner?.owner_id ||
          8; // Fallback to a default ID (use a valid user ID from your system)

        await sendNotificationAsync({
          user_id: ownerId,
          title: "❌ Appointment Declined",
          body: `Your appointment for ${petName} on ${appointmentDate} at ${appointmentTime} has been declined. Please contact us at (123) 456-7890 to reschedule.`,
        });
        console.log("Declination notification sent successfully");
      } catch (error) {
        // Just log the error but don't block the main declination flow
        console.error("Error sending notification:", error);
      }

      toast({
        title: "Appointment declined",
        description: `Appointment with ${petName} has been declined.`,
        variant: "destructive",
        duration: 5000,
      });

      // Close the sheet after confirmation
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Error declining appointment:", error);
      toast({
        title: "Operation failed",
        description: "Cannot decline appointment. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClearAll = () => {
    clearAll();
    setLowStockNotifications([]);
  };

  // Handle pagination
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Show loading state immediately when the page loads
  useEffect(() => {
    // Set default loading state to true initially
    const timer = setTimeout(() => {
      // If we still don't have data after 5 seconds, show a loading indicator
      if (isNotificationsLoading && processedNotifications.length === 0) {
        setIsLoading(true);
      }
    }, 500);

    // If we have data or loading has finished, hide loading state
    if (!isNotificationsLoading || processedNotifications.length > 0) {
      clearTimeout(timer);
      setIsLoading(false);
    }

    return () => clearTimeout(timer);
  }, [isNotificationsLoading, processedNotifications]);

  return (
    <div className="space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Header with status indicator showing if polling is active */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Notifications</h1>
            <p className="text-white/90 text-sm">
              View and manage all your notifications
            </p>
          </div>
          <div className="flex items-center">
            <span className="flex items-center text-sm">
              <span
                className={`h-2 w-2 rounded-full mr-2 ${
                  isNotificationsLoading
                    ? "bg-yellow-300 animate-pulse"
                    : "bg-green-300"
                }`}
              ></span>
              {isNotificationsLoading
                ? "Checking for notifications..."
                : "Real-time updates active"}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="bg-white rounded-2xl border border-[#F9FAFB] shadow-sm p-6 mb-6">
          {/* Search and filter bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
              <Input
                placeholder="Search notifications..."
                className="pl-10 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#2C78E4]/20 text-[#2C78E4] rounded-2xl"
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Sort
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuItem
                    className={cn(
                      sortOrder === "unread-first" &&
                        "bg-[#F9FAFB] font-medium text-[#2C78E4]"
                    )}
                    onClick={() => setSortOrder("unread-first")}
                  >
                    Unread first
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(
                      sortOrder === "newest-first" &&
                        "bg-[#F9FAFB] font-medium text-[#2C78E4]"
                    )}
                    onClick={() => setSortOrder("newest-first")}
                  >
                    Newest first
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(
                      sortOrder === "oldest-first" &&
                        "bg-[#F9FAFB] font-medium text-[#2C78E4]"
                    )}
                    onClick={() => setSortOrder("oldest-first")}
                  >
                    Oldest first
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {(processedNotifications.length > 0 ||
                lowStockNotifications.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-2xl"
                  onClick={handleClearAll}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <Card className="border border-[#F9FAFB] rounded-2xl">
            <CardHeader className="pb-3 border-b border-[#F9FAFB]">
              <CardTitle className="text-lg text-[#111827] flex items-center justify-between">
                <div className="flex items-center">
                  All notifications
                  {/* Show unread notification count */}
                  {processedNotifications.filter((n: Notification) => !n.is_read).length > 0 && (
                    <Badge className="ml-3 bg-red-100 text-red-700 border-red-200 rounded-full">
                      {processedNotifications.filter((n: Notification) => !n.is_read).length} unread
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-4 border-t-[#2C78E4] border-[#F9FAFB] rounded-full animate-spin"></div>
                </div>
              ) : filteredNotifications.length === 0 &&
                lowStockNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-[#F9FAFB] p-4 rounded-full mb-4">
                    <Bell className="h-8 w-8 text-[#2C78E4]" />
                  </div>
                  <p className="text-[#111827] font-medium text-lg mb-1">
                    No notifications found
                  </p>
                  <p className="text-[#4B5563] text-sm text-center max-w-md">
                    No notifications match your criteria or you have no
                    notifications
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] min-h-[400px] max-h-[70vh] w-full overflow-y-auto">
                  <NotificationsList
                    notifications={paginatedNotifications}
                    onItemClick={handleViewAppointment}
                  />
                </ScrollArea>
              )}
            </CardContent>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <CardFooter className="flex justify-between items-center px-6 py-3 border-t border-[#F9FAFB]">
                <div className="text-sm text-[#4B5563]">
                  Page {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="rounded-2xl border-[#2C78E4]/20"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="rounded-2xl border-[#2C78E4]/20"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
      {/* Appointment Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetOverlay className="bg-gray-400/30" />
        <SheetContent className="sm:max-w-md bg-white p-0 flex flex-col rounded-l-2xl">
          <div className="px-6 py-4 border-b border-[#F9FAFB]">
            <h2 className="text-lg font-semibold text-[#111827]">
              Appointment Details
            </h2>
            <p className="text-xs text-[#4B5563] mt-1">
              Review and manage appointment
            </p>
          </div>

          {selectedNotification && (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isAppointmentLoading && selectedAppointmentId ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-t-[#2C78E4] border-[#F9FAFB] rounded-full animate-spin mb-4"></div>
                  <p className="text-[#4B5563]">
                    Loading appointment details...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-[#F9FAFB]">
                    <h3 className="font-semibold text-[#111827] mb-4 text-base">
                      Appointment for{" "}
                      {appointmentData?.pet?.pet_name ||
                        selectedNotification.pet?.petName ||
                        "Unknown Pet"}{" "}
                      - #
                      {appointmentData?.id ||
                        selectedNotification.appointmentId ||
                        selectedNotification.related_id ||
                        "Unknown"}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <User className="h-4 w-4 text-[#2C78E4] mr-2 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-[#111827]">
                            Pet
                          </div>
                          <div className="text-sm text-[#4B5563]">
                            {appointmentData?.pet?.pet_name ||
                              selectedNotification.pet?.petName ||
                              "Unknown"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <User className="h-4 w-4 text-[#2C78E4] mr-2 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-[#111827]">
                            Doctor
                          </div>
                          <div className="text-sm text-[#4B5563]">
                            {appointmentData?.doctor?.doctor_name ||
                              selectedNotification.doctor?.doctorName ||
                              "Unassigned"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 text-[#2C78E4] mr-2 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-[#111827]">
                            Time
                          </div>
                          <div className="text-sm text-[#4B5563]">
                            {appointmentData?.date || selectedNotification.date}{" "}
                            at{" "}
                            {appointmentData?.time_slot?.time ||
                              selectedNotification.timeSlot?.startTime ||
                              "Unspecified time"}
                            {selectedNotification.timeSlot?.endTime &&
                              ` - ${selectedNotification.timeSlot.endTime}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-[#2C78E4] mr-2 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-[#111827]">
                            Reason
                          </div>
                          <div className="text-sm text-[#4B5563]">
                            {appointmentData?.appointment_reason ||
                              selectedNotification.reason ||
                              "Unspecified"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-[#2C78E4] mr-2 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-[#111827]">
                            Status
                          </div>
                          <div className="text-sm text-[#4B5563]">
                            {appointmentData?.state || "Pending"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-[#2C78E4] mr-2 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-[#111827]">
                            Service
                          </div>
                          <div className="text-sm text-[#4B5563]">
                            {appointmentData?.service?.service_name ||
                              selectedNotification.serviceName ||
                              "General Service"}
                          </div>
                        </div>
                      </div>

                      {appointmentData?.notes && (
                        <div className="flex items-start">
                          <MessageSquare className="h-4 w-4 text-[#2C78E4] mr-2 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-[#111827]">
                              Notes
                            </div>
                            <div className="text-sm text-[#4B5563]">
                              {appointmentData.notes}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4 pb-4">
                      <Button
                        onClick={() => handleConfirmAppointment()}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl"
                        disabled={
                          isConfirming || appointmentData?.state === "Confirmed"
                        }
                      >
                        {isConfirming ? "Processing..." : "Confirm"}
                        {!isConfirming && <Check className="ml-2 h-4 w-4" />}
                      </Button>

                      <Button
                        onClick={handleDeclineAppointment}
                        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl"
                        disabled={
                          isConfirming || appointmentData?.state === "Declined"
                        }
                      >
                        {isConfirming ? "Processing..." : "Decline"}
                        {!isConfirming && <X className="ml-2 h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NotificationsPage;
