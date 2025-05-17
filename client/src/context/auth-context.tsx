import { loginDoctor, refreshAccessToken } from '@/services/auth-services';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLongPollingNotifications } from '@/hooks/use-appointment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Doctor {
  id: string;
  username: string;
  password: string;
}

interface AuthContextType {
  doctor: Doctor | null;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
  notificationCount: number;
  notifications: any[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [enablePolling, setEnablePolling] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);

  // Long polling hook that will be active as soon as enablePolling is true
  const { data: notifications } = useLongPollingNotifications({
    enabled: enablePolling,
  });

  // Process notifications when they arrive
  useEffect(() => {
    if (notifications && Array.isArray(notifications)) {      
      // Filter unread notifications
      const unreadCount = notifications.filter(n => !n.is_read).length;
      setNotificationCount(unreadCount);
      setAllNotifications(notifications);

      // Show toast for new notifications
      const lastNotificationTime = localStorage.getItem('lastNotificationTime');
      const currentTime = new Date().getTime();
      
      // Only show toasts for notifications that arrived after last check
      if (lastNotificationTime) {
        const newNotifications = notifications.filter(
          n => new Date(n.datetime).getTime() > parseInt(lastNotificationTime)
        );
        
        if (newNotifications.length > 0) {
          console.log('New notifications to show:', newNotifications.length);
          
          // Show toast for new notifications
          toast.info(`You have ${newNotifications.length} new notification(s)`, {
            position: "top-right",
            autoClose: 3000,
          });
          
          // Play notification sound
          try {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(e => console.warn('Error playing sound:', e));
          } catch (err) {
            console.warn('Error with notification sound:', err);
          }
        }
      }
      
      // Update last notification time
      localStorage.setItem('lastNotificationTime', currentTime.toString());
    }
  }, [notifications]);

  // Check if user is logged in when page loads
  useEffect(() => {
    const checkAuth = async () => {
      const storedDoctor = localStorage.getItem('doctor');
      const token = localStorage.getItem('access_token');
      const doctorId = localStorage.getItem('doctor_id');
      
      if (token && (storedDoctor || doctorId)) {
        if (storedDoctor) {
          setDoctor(JSON.parse(storedDoctor));
        }
        setIsAuthenticated(true);
        // Start polling after authentication is confirmed
        setEnablePolling(true);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      // Call login API
      const response = await loginDoctor(credentials);
      
      // Make sure to store all necessary data consistently
      const doctorData = response.data.doctor;
      
      // Store doctor object
      localStorage.setItem('doctor', JSON.stringify(doctorData));
      
      // Store doctor_id separately for easy access
      localStorage.setItem('doctor_id', doctorData.doctor_id);
      
      // Store tokens
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token || '');
  
      setDoctor(doctorData as Doctor);
      setIsAuthenticated(true);
      
      // Start notifications polling
      setEnablePolling(true);
      
      // Initialize lastNotificationTime to now
      localStorage.setItem('lastNotificationTime', new Date().getTime().toString());
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = useCallback(() => {
    // Stop polling notifications when logging out
    setEnablePolling(false);
    
    // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem('doctor');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    setDoctor(null);
    setIsAuthenticated(false);
    setNotificationCount(0);
    setAllNotifications([]);

  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        doctor, 
        login, 
        logout, 
        isAuthenticated, 
        isLoading, 
        refreshToken: refreshAccessToken,
        notificationCount,
        notifications: allNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};