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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Kiểm tra xem người dùng đã đăng nhập hay chưa
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const isAuth = !!token;
      setIsAuthenticated(isAuth);
    };
    
    // Kiểm tra khi component được mount
    checkAuth();
    
    // Thiết lập event listener để theo dõi thay đổi trong localStorage
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event để lắng nghe đăng nhập/đăng xuất từ AuthContext
    window.addEventListener('auth-state-changed', checkAuth);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed', checkAuth);
    };
  }, []);
  
  // Sử dụng useLongPollingNotifications chỉ khi đã đăng nhập
  const { 
    data: longPollData, 
    isLoading: longPollLoading, 
    error: longPollError,
    invalidate 
  } = useLongPollingNotifications({ enabled: isAuthenticated });

  // Get initial notifications and keep as a backup data source
  const { data: dbNotifications, refetch } = useGetNotificationsFromDB();
  
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  // Hợp nhất thông báo từ long polling và từ database
  useEffect(() => {
    let hasChanged = false;
    
    if (longPollData) {
      // console.log("Long poll data received:", longPollData);
      // Khi có dữ liệu mới từ long polling, cập nhật notifications
      const longPollNotifications = Array.isArray(longPollData) ? longPollData : [longPollData];
      
      // Thêm thông báo mới từ long polling
      setNotifications(prevNotifications => {
        
        // Create a more robust deduplication using both ID and content
        const currentNotifications = new Map();
        
        // First, add all existing notifications to the map
        prevNotifications.forEach(n => {
          if (n && n.id) {
            const key = `${n.id}-${n.title}-${n.created_at}`;
            currentNotifications.set(key, n);
            currentNotifications.set(n.id, n); // Also map by ID for simple lookup
          }
        });
        
        // Filter new notifications that don't already exist
        const newNotifications = longPollNotifications.filter(n => {
          if (!n || !n.id) return false;
          
          const key = `${n.id}-${n.title}-${n.created_at}`;
          const existsByKey = currentNotifications.has(key);
          const existsById = currentNotifications.has(n.id);
          
          if (existsByKey || existsById) {
            // console.log("Skipping duplicate notification:", n.id, n.title);
            return false;
          }
          
          return true;
        });
        
        // console.log("New notifications to add:", newNotifications.length);
        
        // Nếu có thông báo mới, show toast và phát âm thanh
        if (newNotifications.length > 0) {
          hasChanged = true;
          showToastForNewNotifications(newNotifications);
          // console.log("Added new notifications:", newNotifications.map(n => n.id));
          return [...newNotifications, ...prevNotifications];
        }
        
        // console.log("No new notifications to add");
        return prevNotifications; // Return same reference to prevent unnecessary re-renders
      });
    } 
    // Nếu longPollData là null/undefined nhưng có dbNotifications, sử dụng dbNotifications
    else if (dbNotifications && notifications.length === 0) {
      // console.log("Setting initial notifications from DB:", dbNotifications.length);
      const dbNotificationsArray = Array.isArray(dbNotifications) ? dbNotifications : [dbNotifications];
      setNotifications(dbNotificationsArray);
      hasChanged = true;
    }
    
    // if (hasChanged) {
    //   // console.log("Notifications state was updated");
    // }
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