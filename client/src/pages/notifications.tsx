import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AppointmentNotification, LowStockNotification } from '@/types';
import { websocketService } from '@/utils/websocket';
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NotificationsPage = () => {
  const [, navigate] = useLocation();
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [lowStockNotifications, setLowStockNotifications] = useState<LowStockNotification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  console.log(notifications);

  // Initialize WebSocket connection
  useEffect(() => {
    // Connect to WebSocket when component mounts
    const wsUrl = 'ws://localhost:8088/ws';
    
    try {
      console.log('Connecting to WebSocket for notifications...');
      websocketService.connect(wsUrl);
      
      // We'll use setTimeout to check connection status after a moment
      const connectionTimer = setTimeout(() => {
        setSocketStatus('connected');
        toast({
          title: "Connected to notification service",
          description: "You will receive real-time notifications",
          variant: "default"
        });
      }, 1000);
      
      // Cleanup WebSocket connection when component unmounts
      return () => {
        console.log('Cleaning up WebSocket connection');
        clearTimeout(connectionTimer);
        websocketService.disconnect();
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setSocketStatus('disconnected');
    }
  }, []);

  // Load initial data
  useEffect(() => {
    // Just set loading to false after a short delay
    // We don't need API calls since we're getting real-time data from WebSocket
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Subscribe to WebSocket notifications
  useEffect(() => {
    // Subscribe to appointment notifications - adjust to handle the server's message format
    const unsubscribeAppointment = websocketService.subscribe<{type: string, data: AppointmentNotification}>('appointment_alert', (message) => {
      console.log('Received WebSocket message:', message);
      
      // Extract the actual notification data from the message
      const newNotification = message.data || message;
      
      console.log('Processing notification:', newNotification);
      
      // Show toast notification
      toast({
        title: "New Appointment",
        description: `${newNotification.title} for ${newNotification.pet?.pet_name || 'a patient'}`,
        variant: "default"
      });
      
      setNotifications(prev => {
        // Check if notification already exists
        const exists = prev.some(n => n.id === newNotification.id);
        if (exists) {
          // Update the existing notification
          return prev.map(n => n.id === newNotification.id ? newNotification : n);
        } else {
          // Add new notification
          return [newNotification, ...prev];
        }
      });
    });

    return () => {
      unsubscribeAppointment();
    };
  }, []);

  const handleViewAppointment = (appointmentId: number) => {
    navigate(`/appointment/${appointmentId}`);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setLowStockNotifications([]);
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Apply text search
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.pet?.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.date.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter - currently disabled since we're using a different type
    const matchesStatus = filterStatus.length === 0 /* || filterStatus.includes(notification.status) */;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-indigo-100 text-sm">
              View and manage all your notifications
              {socketStatus === 'connected' && (
                <span className="ml-2 inline-flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                  Live
                </span>
              )}
              {socketStatus === 'disconnected' && (
                <span className="ml-2 inline-flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-400 mr-1"></span>
                  Offline
                </span>
              )}
              {socketStatus === 'connecting' && (
                <span className="ml-2 inline-flex items-center">
                  <span className="h-2 w-2 rounded-full bg-yellow-400 mr-1 animate-pulse"></span>
                  Connecting
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="bg-white rounded-lg border border-indigo-100 shadow-sm p-6 mb-6">
          {/* Search and filter bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <Input
                placeholder="Search notifications..."
                className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setFilterStatus([])}>
                    Clear filters
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={filterStatus.includes('upcoming')}
                    onCheckedChange={(checked) => {
                      setFilterStatus(prev => 
                        checked 
                          ? [...prev, 'upcoming'] 
                          : prev.filter(status => status !== 'upcoming')
                      );
                    }}
                  >
                    Upcoming
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterStatus.includes('starting_soon')}
                    onCheckedChange={(checked) => {
                      setFilterStatus(prev => 
                        checked 
                          ? [...prev, 'starting_soon'] 
                          : prev.filter(status => status !== 'starting_soon')
                      );
                    }}
                  >
                    Starting Soon
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterStatus.includes('completed')}
                    onCheckedChange={(checked) => {
                      setFilterStatus(prev => 
                        checked 
                          ? [...prev, 'completed'] 
                          : prev.filter(status => status !== 'completed')
                      );
                    }}
                  >
                    Completed
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {(notifications.length > 0 || lowStockNotifications.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <Card className="border border-indigo-100">
            <CardHeader className="pb-3 border-b border-indigo-100">
              <CardTitle className="text-lg text-indigo-900 flex items-center justify-between">
                All Notifications
                {socketStatus === 'connected' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                    Live Updates
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin"></div>
                </div>
              ) : filteredNotifications.length === 0 && lowStockNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-indigo-50 p-4 rounded-full mb-4">
                    <Bell className="h-8 w-8 text-indigo-500" />
                  </div>
                  <p className="text-indigo-900 font-medium text-lg mb-1">No notifications found</p>
                  <p className="text-gray-500 text-sm text-center max-w-md">
                    There are no notifications matching your criteria or you have no notifications yet.
                    {socketStatus === 'connected' && (
                      <span className="block mt-2 text-green-600">
                        You're connected and will receive real-time updates.
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px]">
                  <div className="divide-y divide-indigo-100">
                    {filteredNotifications.map((notification) => (
                      <div 
                        key={notification.appointment_id} 
                        className="px-6 py-4 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                        onClick={() => handleViewAppointment(notification.appointment_id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-indigo-900">
                                  {notification.title}
                                </span>
                                <span className="text-indigo-500 mx-2">•</span>
                                <span className="text-sm text-indigo-600">
                                  {notification.date}, {typeof notification.time_slot === 'object' 
                                    ? (notification.time_slot as {start_time: string}).start_time 
                                    : notification.time_slot}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.pet?.pet_name} - {notification.reason || 'Consultation'}
                              </p>
                            </div>
                          </div>
                          
                          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 ml-4 mt-1">
                            {notification.service_name}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {lowStockNotifications.length > 0 && (
                      <>
                        <div className="px-6 py-3 bg-indigo-50">
                          <h3 className="text-xs font-medium text-indigo-800 uppercase tracking-wide">
                            Inventory Alerts
                          </h3>
                        </div>
                        
                        {lowStockNotifications.map((notification, index) => (
                          <div 
                            key={`${notification.medicine_id}-${index}`}
                            className="px-6 py-4 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                <div>
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium text-indigo-900">
                                      Low Stock Alert: {notification.medicine_name}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Current stock: {notification.current_stock} units (below reorder level of {notification.reorder_level})
                                  </p>
                                </div>
                              </div>
                              
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 ml-4 mt-1">
                                Low Stock
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 