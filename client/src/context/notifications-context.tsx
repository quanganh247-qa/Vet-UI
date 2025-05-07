import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { 
  useGetNotificationsFromDB, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  useLongPollingNotifications
} from '@/hooks/use-appointment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface NotificationsContextType {
  notifications: any[];
  markAsRead: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const previousNotificationsRef = useRef<any[]>([]);
  
  // Sử dụng useLongPollingNotifications thay vì polling thông thường
  const { 
    data: longPollData, 
    isLoading: longPollLoading, 
    error: longPollError,
    invalidate 
  } = useLongPollingNotifications({ enabled: true });

  // Get initial notifications and keep as a backup data source
  const { data: dbNotifications, refetch } = useGetNotificationsFromDB();
  
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  // Hợp nhất thông báo từ long polling và từ database
  useEffect(() => {
    if (longPollData) {
      // Khi có dữ liệu mới từ long polling, cập nhật notifications
      const longPollNotifications = Array.isArray(longPollData) ? longPollData : [longPollData];
      
      // Thêm thông báo mới từ long polling
      setNotifications(prevNotifications => {
        const currentIds = new Set(prevNotifications.map(n => n.id));
        const newNotifications = longPollNotifications.filter(n => !currentIds.has(n.id));
        
        // Nếu có thông báo mới, show toast và phát âm thanh
        if (newNotifications.length > 0) {
          showToastForNewNotifications(newNotifications);
        }
        
        return [...newNotifications, ...prevNotifications];
      });
    } 
    // Nếu longPollData là null/undefined nhưng có dbNotifications, sử dụng dbNotifications
    else if (dbNotifications) {
      setNotifications(Array.isArray(dbNotifications) ? dbNotifications : [dbNotifications]);
    }
  }, [longPollData, dbNotifications]);
  
  // Update unread count whenever notifications change
  useEffect(() => {
    if (notifications && Array.isArray(notifications)) {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      setUnreadCount(unreadNotifications.length);
    }
  }, [notifications]);
  
  // Hiển thị toast cho thông báo mới
  const showToastForNewNotifications = useCallback((newNotifications: any[]) => {
    newNotifications.forEach(notification => {
      toast.info(notification.message || notification.title || 'New notification received', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Phát âm thanh thông báo
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.warn('Error playing notification sound:', e));
      } catch (err) {
        console.warn("Could not play notification sound:", err);
      }
    });
  }, []);

  // Function to mark notification as read
  const markAsRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      
      // Update local state instead of just refetching
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      // Invalidate long polling to get fresh data
      invalidate();
      // Also refetch DB notifications for backup
      refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Function to mark all notifications as read
  const clearAll = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Invalidate long polling to get fresh data
      invalidate();
      // Also refetch DB notifications for backup
      refetch();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      markAsRead, 
      clearAll, 
      isLoading: longPollLoading, 
      error: longPollError,
      unreadCount 
    }}>
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
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};