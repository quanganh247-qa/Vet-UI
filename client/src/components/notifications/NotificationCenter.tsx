import React, { useState, useEffect } from 'react';
import { LowStockNotification } from '../../types';
import LowStockAlert from './LowStockAlert';
import { websocketService, useLowStockNotifications } from '../../utils/websocket';

interface NotificationCenterProps {
  onReorderMedicine: (medicineId: number) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onReorderMedicine }) => {
  const [notifications, setNotifications] = useState<LowStockNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    const wsUrl = 'ws://localhost:8088/ws';
    websocketService.connect(wsUrl);

    // Cleanup WebSocket connection when component unmounts
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Subscribe to low stock notifications
  useEffect(() => {
    const unsubscribe = useLowStockNotifications((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return unsubscribe;
  }, []);

  const handleDismissNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleOpen();
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
        <svg 
          className="w-6 h-6 text-gray-700 hover:text-gray-900" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {/* Notification panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  className="text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => setNotifications([])}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <div className="p-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No notifications</p>
            ) : (
              notifications.map((notification, index) => (
                <LowStockAlert
                  key={`${notification.medicine_id}-${index}`}
                  notification={notification}
                  onClose={() => handleDismissNotification(index)}
                  onReorder={onReorderMedicine}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 