import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AppointmentRequest,
  confirmAppointment,
  ConfirmAppointmentResponse,
  createWalkInAppointment,
  getAllAppointments,
  getAppointmentAnalytics,
  getAppointmentById,
  getAppointmentByState,
  getAppointmentsQueue,
  getHistoryAppointments,
  getNotificationsFromDB,
  markAllNotificationsAsRead,
  markMessageDelivered,
  markNotificationAsRead,
  updateAppointmentById,
  waitForNotifications,
} from "@/services/appointment-services";
import { toast } from "@/components/ui/use-toast";
import { toast as reactToastify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useRef, useState, useCallback } from "react";

export const useAppointmentData = (id: string | undefined) => {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => getAppointmentById(parseInt(id!)),
    enabled: !!id,
  });
};

export const useListAppointments = (
  date: Date,
  option: string,
  page: number = 1,
  pageSize: number = 10
) => {
  return useQuery({
    queryKey: [
      "appointments",
      date.toISOString().split("T")[0],
      option,
      page,
      pageSize,
    ],
    queryFn: () => getAllAppointments(date, option, page, pageSize),
  });
};

export const useListAppointmentsQueue = () => {
  return useQuery({
    queryKey: ["appointmentsQueue"],
    queryFn: async () => {
      try {
        const data = await getAppointmentsQueue();
        return data;
      } catch (error) {
        console.error("Error in useListAppointmentsQueue:", error);
        return [];
      }
    },
    // refetchOnWindowFocus: false,
  });
};

export const useHistoryAppointments = (pet_id: number) => {
  return useQuery({
    queryKey: ["historyAppointments", pet_id],
    queryFn: () => getHistoryAppointments(pet_id),
    enabled: !!pet_id,
  });
};

export const useUpdateAppointmentStatus = (
  id: number,
  updateData: {
    payment_status?: string;
    state_id?: number;
    room_id?: number;
    notes?: string;
    appointment_reason?: string;
    reminder_send?: boolean;
    arrival_time?: string;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => updateAppointmentById(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointmentsQueue"] });
    },
    onError: (error) => {
      console.error("Error in useUpdateAppointmentStatus:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["appointmentsQueue"] });
    },
  });
};

export const useAppointmentAnalytics = (payload: {
  start_date: string;
  end_date: string;
}) => {
  return useQuery({
    queryKey: ["appointmentAnalytics"],
    queryFn: () => getAppointmentAnalytics(payload),
  });
};

export const useCreateWalkInAppointment = (): UseMutationResult<
  any, // response type
  Error, // error type
  AppointmentRequest // variables type
> => {
  return useMutation({
    mutationFn: createWalkInAppointment,
  });
};

// --- Hook useMutation ---
export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ConfirmAppointmentResponse,
    Error,
    number
  >({
    mutationFn: confirmAppointment,
    onSuccess: (data, variables) => {
      toast({
        title: "Appointment Confirmed",
        description: data.message || "Appointment Confirmed",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error, variables) => {
      toast({
        title: "Confirmation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useMarkMessageDelivered = () => {
  return useMutation({
    mutationFn: (id: number) => markMessageDelivered(id),
    onSuccess: () => {
      toast({
        title: "Message Delivered",
        description: "The message has been delivered successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error) => {
      toast({
        title: "Delivery Failed",
        description: "Unable to deliver the message. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useGetAppointmentByState = (state: string) => {
  return useQuery({
    queryKey: ["appointmentByState", state],
    queryFn: () => getAppointmentByState(state),
  });
};

export const useGetNotificationsFromDB = () => {
  return useQuery({
    queryKey: ["notificationsFromDB"],
    queryFn: getNotificationsFromDB,
  });
};

export const useMarkNotificationAsRead = () => {
  return useMutation({
    mutationFn: markNotificationAsRead,
  });
};

export const useMarkAllNotificationsAsRead = () => {
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
  });
};

export const useLongPollingNotifications = ({
  enabled = true,
  initialPollInterval = 2000, // Initial time between retries after errors
  maxPollInterval = 30000, // Maximum time between retries
  longPollTimeout = 25000, // Timeout for long poll requests
} = {}) => {
  const [data, setData] = useState<any[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const previousNotifications = useRef<any[]>([]);
  const isPolling = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true); // Track if component is mounted
  const currentPollInterval = useRef(initialPollInterval);
  const consecutiveErrorsRef = useRef(0);
  const activeRequestRef = useRef<boolean>(false);

  // Debug logging
  useEffect(() => {
    console.log('useLongPollingNotifications enabled:', enabled);
    return () => {
      console.log('useLongPollingNotifications unmounting');
    };
  }, [enabled]);

  const poll = useCallback(async () => {
    if (!enabled || isPolling.current || !isMountedRef.current || activeRequestRef.current) {
      console.log('Skipping poll: enabled=', enabled, 
                  'isPolling=', isPolling.current, 
                  'isMounted=', isMountedRef.current,
                  'activeRequest=', activeRequestRef.current);
      return;
    }

    isPolling.current = true;
    activeRequestRef.current = true;
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      console.log('Starting long polling request...');
      const notifications = await waitForNotifications(signal);
      
      // Only proceed if the component is still mounted and the request wasn't aborted
      if (!isMountedRef.current || signal.aborted) {
        console.log("Long poll request canceled or component unmounted.");
        return;
      }

      // Reset error counters since we got a successful response
      consecutiveErrorsRef.current = 0;
      currentPollInterval.current = initialPollInterval;

      if (notifications) {
        console.log('Setting notifications data:', notifications);
        setData(notifications);
        setError(null);
        setIsLoading(false);

        // Check if this is an array or a single notification object
        const notificationsArray = Array.isArray(notifications) ? notifications : [notifications];

        // Notification handling - show toast for new notifications
        if (previousNotifications.current.length > 0) {
          // Get truly new notifications, not just unread ones
          const newNotifications = notificationsArray.filter(
            (notification: any) => {
              // Check if this notification ID already exists in previous notifications
              return !previousNotifications.current.some(
                (prevNotification) => prevNotification.id === notification.id
              );
            }
          );

          console.log('New notifications detected:', newNotifications.length);
          
          // Show toast for each new notification
          newNotifications.forEach((notification: any) => {
            if (isMountedRef.current) {
              try {
                // Display toast notification
                reactToastify.info(notification.message || notification.title || 'New notification received', {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
                
                // Play notification sound
                const audio = new Audio('/notification-sound.mp3');
                audio.play().catch(e => console.warn('Error playing notification sound:', e));
                
                console.log('Toast notification displayed for:', notification.id);
              } catch (soundError) {
                console.warn("Could not play notification sound:", soundError);
              }
            }
          });
        }
        previousNotifications.current = notificationsArray;
      }

      isPolling.current = false;
      activeRequestRef.current = false;
      
      // Only schedule next poll if component is still mounted
      if (isMountedRef.current) {
        console.log('Scheduling next poll');
        setTimeout(poll, 500); // Small delay between polls
      }

    } catch (err: any) {
      // Don't log or handle AbortError and cancellation errors as actual errors
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        console.log("Long poll request canceled.");
      } 
      // Handle timeout errors specifically (these should be already filtered in waitForNotifications)
      else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        console.log("Long poll timeout - scheduling retry");
        if (isMountedRef.current) {
          setError(null); // Don't show timeout errors to users
        }
      }
      // Handle other errors
      else {
        console.error("Long polling error:", err);
        if (isMountedRef.current) {
          setError(err);
          
          // Implement exponential backoff for error retries
          consecutiveErrorsRef.current++;
          // Double the polling interval with each consecutive error, up to max
          const backoffTime = Math.min(
            currentPollInterval.current * Math.pow(2, Math.min(consecutiveErrorsRef.current - 1, 5)),
            maxPollInterval
          );
          currentPollInterval.current = backoffTime;
          console.log(`Retrying in ${backoffTime}ms (error #${consecutiveErrorsRef.current})`);
        }
      }
      
      isPolling.current = false;
      activeRequestRef.current = false;
      
      // Only retry if still enabled and component is mounted
      if (enabled && isMountedRef.current) {
        setTimeout(poll, currentPollInterval.current);
      }
    }
  }, [enabled, initialPollInterval, maxPollInterval]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (enabled) {
      setIsLoading(true);
      setError(null);
      setData(undefined);
      previousNotifications.current = [];
      consecutiveErrorsRef.current = 0;
      currentPollInterval.current = initialPollInterval;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      isPolling.current = false;
      activeRequestRef.current = false;
      console.log('Starting initial poll');
      poll();
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isPolling.current = false;
      activeRequestRef.current = false;
    }

    return () => {
      console.log('Cleaning up long polling');
      isMountedRef.current = false; // Mark component as unmounted
      if (abortControllerRef.current) {
        console.log('Aborting any in-flight request');
        abortControllerRef.current.abort();
      }
      isPolling.current = false;
      activeRequestRef.current = false;
    };
  }, [enabled, poll]);

  const invalidate = useCallback(() => {
    if (!isMountedRef.current) return;
    
    console.log('Invalidating long polling');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isPolling.current = false;
    activeRequestRef.current = false;
    setIsLoading(true);
    poll();
  }, [poll]);

  return { data, isLoading, error, invalidate };
};

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<any[]>([]);

  const { data, isLoading, error, invalidate } = useLongPollingNotifications({ enabled: true });

  // Process new notifications whenever data changes
  useEffect(() => {
    if (data) {
      // Handle both array and single notification responses
      const notificationsArray = Array.isArray(data) ? data : [data];
      
      // Update notifications state and query cache
      setNotifications(notificationsArray);
      queryClient.setQueryData(['notificationsFromDB'], notificationsArray);
    } else if (!isLoading && !error) {
      setNotifications([]);
      queryClient.setQueryData(['notificationsFromDB'], []);
    }
  }, [data, isLoading, error, queryClient]);

  const markAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state to mark the notification as read
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      invalidate(); // Force a refresh of notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update local state to mark all notifications as read
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      invalidate(); // Force a refresh of notifications
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  return {
    notifications,
    markAsRead,
    clearAll,
    isLoading,
    error
  };
};