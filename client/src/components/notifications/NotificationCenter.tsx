import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { LowStockNotification } from '@/types';
import LowStockAlert from './LowStockAlert';
import { websocketService } from '@/utils/websocket';
import {
  Bell,
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isPast, isToday, addMinutes, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationCenterProps {
  onReorderMedicine: (medicineId: number) => void;
}

export interface AppointmentNotification {
  id: string;
  appointmentId: number;
  title: string;
  date: string;
  time: string;
  status: 'upcoming' | 'starting_soon' | 'completed';
  patient?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onReorderMedicine }) => {
  const [, navigate] = useLocation();
  const [lowStockNotifications, setLowStockNotifications] = useState<LowStockNotification[]>([]);
  const [appointmentNotifications, setAppointmentNotifications] = useState<AppointmentNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockAppointments: AppointmentNotification[] = [
      {
        id: '1',
        appointmentId: 101,
        title: 'Online consultation',
        date: '07/18/24',
        time: '2:30 PM',
        status: 'upcoming',
        patient: 'Fluffy'
      },
      {
        id: '2',
        appointmentId: 102,
        title: 'Online consultation',
        date: '06/02/24',
        time: '2:00 PM',
        status: 'starting_soon',
        patient: 'Max'
      },
      {
        id: '3',
        appointmentId: 103,
        title: 'Online consultation',
        date: '06/01/24',
        time: '1:30 PM',
        status: 'starting_soon',
        patient: 'Bella'
      },
      {
        id: '4',
        appointmentId: 104,
        title: 'Online consultation',
        date: '05/21/24',
        time: '1:00 PM',
        status: 'starting_soon',
        patient: 'Charlie'
      },
      {
        id: '5',
        appointmentId: 105,
        title: 'Online consultation',
        date: '05/20/24',
        time: '2:30 PM',
        status: 'completed',
        patient: 'Lucy'
      },
      {
        id: '6',
        appointmentId: 106,
        title: 'Online consultation',
        date: '03/18/24',
        time: '12:30 PM',
        status: 'starting_soon',
        patient: 'Daisy'
      }
    ];
    
    setAppointmentNotifications(mockAppointments);
    setUnreadCount(mockAppointments.filter(a => a.status !== 'completed').length);
  }, []);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8088/ws";
    websocketService.connect(wsUrl);

    // Cleanup WebSocket connection when component unmounts
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Subscribe to low stock notifications
  useEffect(() => {
    const unsubscribeLowStock = websocketService.subscribe<LowStockNotification>('low_stock_alert', (newNotification) => {
      setLowStockNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Subscribe to appointment notifications
    const unsubscribeAppointment = websocketService.subscribe<AppointmentNotification>('appointment_alert', (newNotification) => {
      setAppointmentNotifications(prev => {
        // Check if notification already exists
        const exists = prev.some(n => n.id === newNotification.id);
        if (exists) {
          // Update the existing notification
          return prev.map(n => n.id === newNotification.id ? newNotification : n);
        } else {
          // Add new notification and increment unread count
          setUnreadCount(prevCount => prevCount + 1);
          return [newNotification, ...prev];
        }
      });
    });

    return () => {
      unsubscribeLowStock();
      unsubscribeAppointment();
    };
  }, []);

  const handleViewAppointment = (appointmentId: number) => {
    navigate(`/appointment/${appointmentId}`);
    setIsOpen(false);
    setIsFullScreen(false);
  };

  const handleDismissNotification = (index: number) => {
    setLowStockNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsFullScreen(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleOpen();
    }
  };

  const getNotificationMessage = (notification: AppointmentNotification) => {
    switch (notification.status) {
      case 'upcoming':
        return 'The consultation is scheduled for tomorrow.';
      case 'starting_soon':
        return 'Your online consultation will start in 30 minutes';
      case 'completed':
        return 'Consultation completed';
      default:
        return '';
    }
  };

  return (
    <div className="relative">
      {/* Notification bell icon */}
      <div 
        className="relative cursor-pointer"
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Open notifications"
      >
        <Bell className="h-6 w-6 text-gray-700 hover:text-indigo-600 transition-colors" />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {/* Notification panel */}
      {isOpen && (
        <div 
          className={cn(
            "absolute right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50 transition-all duration-300 transform origin-top-right",
            isFullScreen 
              ? "fixed inset-0 m-0 rounded-none w-full h-full"
              : "w-96 max-h-[80vh]"
          )}
        >
          <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              {isFullScreen && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-indigo-600 hover:bg-indigo-100"
                  onClick={toggleFullScreen}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              
              <h3 className={cn(
                "text-indigo-900 font-semibold",
                isFullScreen ? "text-lg" : "text-sm"
              )}>
                Notifications
              </h3>
              
              <div className="flex items-center gap-2">
                {!isFullScreen && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-indigo-600 hover:bg-indigo-100 text-xs"
                    onClick={toggleFullScreen}
                  >
                    View All
                  </Button>
                )}
                
                {(appointmentNotifications.length > 0 || lowStockNotifications.length > 0) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-indigo-600 hover:bg-indigo-100 text-xs"
                    onClick={() => {
                      setAppointmentNotifications([]);
                      setLowStockNotifications([]);
                      setUnreadCount(0);
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <ScrollArea className={cn(
            "overflow-y-auto",
            isFullScreen ? "h-[calc(100vh-56px)]" : "max-h-[60vh]"
          )}>
            {appointmentNotifications.length === 0 && lowStockNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="bg-indigo-50 p-3 rounded-full mb-4">
                  <Bell className="h-6 w-6 text-indigo-500" />
                </div>
                <p className="text-indigo-900 font-medium mb-1">No notifications yet</p>
                <p className="text-gray-500 text-sm text-center">
                  We'll let you know when there are new updates
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {appointmentNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={cn(
                      "px-4 py-3 hover:bg-indigo-50/50 cursor-pointer transition-colors",
                      notification.status === 'completed' ? "bg-gray-50" : "bg-blue-50/50"
                    )}
                    onClick={() => handleViewAppointment(notification.appointmentId)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-indigo-500 mr-2" />
                        <span className="text-sm font-medium text-indigo-900">
                          {notification.title}, {notification.date}, {notification.time}
                        </span>
                      </div>
                      
                      {notification.status === 'completed' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      
                      {notification.status === 'starting_soon' && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      {getNotificationMessage(notification)}
                    </p>
                  </div>
                ))}

                {/* Low stock notifications section */}
                {lowStockNotifications.length > 0 && (
                  <>
                    <div className="p-2 bg-indigo-50">
                      <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">
                        Inventory Alerts
                      </h4>
                    </div>
                    {lowStockNotifications.map((notification, index) => (
                      <LowStockAlert
                        key={`${notification.medicine_id}-${index}`}
                        notification={notification}
                        onClose={() => handleDismissNotification(index)}
                        onReorder={onReorderMedicine}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 