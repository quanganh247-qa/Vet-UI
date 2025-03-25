import { useState } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/context/notification-context";
import { Notification } from "@/types";

interface NotificationCenterProps {
className?: string;
}

const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();
  
  const [settings, setSettings] = useState({
    enableAppointmentNotifications: true,
    enablePatientUpdates: true,
    enableSystemNotifications: true,
    enableSoundAlerts: true,
    desktopNotifications: true,
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  // Save settings to localStorage when changed
  const updateSettings = (key: string, value: boolean) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      
      // Apply specific settings
      if (key === 'enableSoundAlerts') {
        localStorage.setItem('notificationSound', value.toString());
      }
      if (key === 'desktopNotifications') {
        localStorage.setItem('desktopNotifications', value.toString());
      }
      
      return newSettings;
    });
  };

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px]"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[380px] p-0">
          <Tabs defaultValue="all">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs h-8 px-2"
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <TabsList className="grid grid-cols-3 p-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="m-0">
              <ScrollArea className="h-[300px]">
                {notifications.length > 0 ? (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-medium">{notification.title}</h4>
                                <p className="text-xs text-gray-500">{getTimeAgo(notification.timestamp)}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => removeNotification(notification.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm mt-1">{notification.message}</p>
                            {notification.action && (
                              <Button 
                                variant="link" 
                                className="text-xs h-6 p-0 mt-1"
                                onClick={() => {
                                  notification.action?.onClick();
                                  markAsRead(notification.id);
                                }}
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="mt-2 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs h-7 px-2"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <Bell className="h-12 w-12 text-gray-300 mb-3" />
                    <h4 className="text-sm font-medium text-gray-500">No notifications</h4>
                    <p className="text-xs text-gray-400 mt-1">New notifications will appear here</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="unread" className="m-0">
              <ScrollArea className="h-[300px]">
                {notifications.filter(n => !n.read).length > 0 ? (
                  <div className="divide-y">
                    {notifications.filter(n => !n.read).map((notification) => (
                      <div key={notification.id} className="p-4 bg-blue-50">
                        <div className="flex items-start">
                          <div className="mr-3 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-medium">{notification.title}</h4>
                                <p className="text-xs text-gray-500">{getTimeAgo(notification.timestamp)}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => removeNotification(notification.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm mt-1">{notification.message}</p>
                            {notification.action && (
                              <Button 
                                variant="link" 
                                className="text-xs h-6 p-0 mt-1"
                                onClick={() => {
                                  notification.action?.onClick();
                                  markAsRead(notification.id);
                                }}
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-7 px-2"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-gray-300 mb-3" />
                    <h4 className="text-sm font-medium text-gray-500">No unread notifications</h4>
                    <p className="text-xs text-gray-400 mt-1">You've read all notifications</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="settings" className="m-0">
              <div className="p-4">
                <h4 className="text-sm font-semibold mb-3">Notification Settings</h4>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium">Appointment Notifications</h5>
                        <p className="text-xs text-gray-500">Receive notifications about new appointments and schedule changes</p>
                      </div>
                      <Switch 
                        checked={settings.enableAppointmentNotifications}
                        onCheckedChange={(checked) => 
                          updateSettings('enableAppointmentNotifications', checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium">Patient Updates</h5>
                        <p className="text-xs text-gray-500">Receive notifications when patients update their information</p>
                      </div>
                      <Switch 
                        checked={settings.enablePatientUpdates}
                        onCheckedChange={(checked) => 
                          updateSettings('enablePatientUpdates', checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium">System Notifications</h5>
                        <p className="text-xs text-gray-500">Updates about maintenance and new features</p>
                      </div>
                      <Switch 
                        checked={settings.enableSystemNotifications}
                        onCheckedChange={(checked) => 
                          updateSettings('enableSystemNotifications', checked)
                        }
                      />
                    </div>
                    
                    <div className="pt-2 border-t">
                      <h5 className="text-sm font-semibold mb-3">Additional Options</h5>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium">Sound Alerts</h5>
                            <p className="text-xs text-gray-500">Play a sound when new notifications arrive</p>
                          </div>
                          <Switch 
                            checked={settings.enableSoundAlerts}
                            onCheckedChange={(checked) => 
                              updateSettings('enableSoundAlerts', checked)
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium">Desktop Notifications</h5>
                            <p className="text-xs text-gray-500">Show notifications even when browser tab is not open</p>
                          </div>
                          <Switch 
                            checked={settings.desktopNotifications}
                            onCheckedChange={(checked) => 
                              updateSettings('desktopNotifications', checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NotificationCenter; 