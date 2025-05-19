import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { toast as reactToastify, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetOverlay,
} from "@/components/ui/sheet";
import { useConfirmAppointment, useMarkMessageDelivered } from "@/hooks/use-appointment";
import { useNotificationsContext } from "@/context/notifications-context";
import { cn } from "@/lib/utils";

// Define Notification interface based on database schema
interface Notification {
  id: number;
  username: string;
  title: string;
  content?: string;
  is_read: boolean;
  related_id?: number;
  related_type?: string;
  datetime: string;
  notify_type?: string;
  
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
  reason?: string;
  serviceName?: string;
}

// Pagination configuration
const ITEMS_PER_PAGE = 5;

const NotificationsPage = () => {
  const [, navigate] = useLocation();
  const { notifications: rawNotifications, markAsRead, clearAll, isLoading: isNotificationsLoading } = useNotificationsContext();
  
  const previousNotificationsCount = useRef(0);
  
  // Track if this is the first load
  const isFirstLoad = useRef(true);
  
  // Transform notifications to match UI requirements
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("unread-first");
  const [selectedNotificationID, setSelectedNotificationID] = useState<number>();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Selected notification for detail view
  const [selectedNotification, setSelectedNotification] = 
    useState<Notification | null>(null);
console.log("rawNotifications", selectedNotification)
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      previousNotificationsCount.current = rawNotifications?.length || 0;
      return;
    }
    
    if (rawNotifications && Array.isArray(rawNotifications)) {
      const unreadCount = rawNotifications.filter(n => !n.is_read).length;
      
      // Check if we have new notifications (not just unread ones)
      const newNotifications = rawNotifications.filter(notification => {
        // Consider a notification new if it wasn't in our previous set
        // or if it was updated (e.g., marked as read)
        return !notifications.some(n => n.id === notification.id) ||
          notifications.some(n => n.id === notification.id && n.is_read !== notification.is_read);
      });
      
      if (newNotifications.length > 0) {
        // Show toast for new notifications
        reactToastify.info(`You have ${unreadCount} new notifications`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Play notification sound
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Error playing notification sound:', e));
      }
      
      // Update previous count
      previousNotificationsCount.current = unreadCount;
    }
  }, [rawNotifications, notifications]);

  useEffect(() => {
    if (rawNotifications && Array.isArray(rawNotifications)) {
      // Map database fields to UI fields
      const mappedNotifications = rawNotifications.map((notification: any) => {
        let appointmentId = notification.related_id;
        let date = new Date(notification.datetime || notification.created_at);
        
        // Extract additional info from content if available
        let petInfo = { petName: "Unknown", petId: 0 };
        let doctorInfo = { doctorName: "Unassigned", doctorId: 0 };
        let reason = "General Checkup";
        let timeSlot = {
          startTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: ""
        };
        
        // Check if the content is available
        if (notification.content) {
          // First try to parse as JSON
          try {
            if (typeof notification.content === 'string') {
              // Check if the content starts with '{' which would indicate JSON
              if (notification.content.trim().startsWith('{')) {
                const contentObj = JSON.parse(notification.content);
                
                // Extract data from content JSON
                if (contentObj.timeSlot) {
                  timeSlot = contentObj.timeSlot;
                }
                
                if (contentObj.pet) {
                  petInfo = contentObj.pet;
                } else if (contentObj.pet_name) {
                  petInfo = { 
                    petName: contentObj.pet_name,
                    petId: contentObj.pet_id || 0
                  };
                }
                
                if (contentObj.doctor) {
                  doctorInfo = contentObj.doctor;
                } else if (contentObj.doctor_name) {
                  doctorInfo = {
                    doctorName: contentObj.doctor_name,
                    doctorId: contentObj.doctor_id || 0
                  };
                }
                
                if (contentObj.reason) {
                  reason = contentObj.reason;
                }
              } else {
               
                const petMatch = notification.content.match(/cho\s+([^với]+)\s+với/i);
                if (petMatch && petMatch[1]) {
                  petInfo.petName = petMatch[1].trim();
                }
                
                // Extract doctor name
                const doctorMatch = notification.content.match(/bác\s+sĩ\s+([^ngày]+)/i);
                if (doctorMatch && doctorMatch[1]) {
                  doctorInfo.doctorName = doctorMatch[1].trim();
                }
                
                // Extract appointment date
                const dateMatch = notification.content.match(/ngày\s+(\d{4}-\d{2}-\d{2})/i);
                if (dateMatch && dateMatch[1]) {
                  const appointmentDate = new Date(dateMatch[1]);
                  if (!isNaN(appointmentDate.getTime())) {
                    // Format the date to be like "May 19, 2025"
                    const formattedDate = appointmentDate.toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    date = appointmentDate;
                    timeSlot.startTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }
                }
                
                // Extract reason
                const reasonMatch = notification.content.match(/Lý do:\s+(.+)$/i);
                if (reasonMatch && reasonMatch[1]) {
                  reason = reasonMatch[1].trim();
                }
              }
            } else if (typeof notification.content === 'object') {
              // Content is already an object
              const contentObj = notification.content;
              
              if (contentObj.timeSlot) {
                timeSlot = contentObj.timeSlot;
              }
              
              if (contentObj.pet) {
                petInfo = contentObj.pet;
              } else if (contentObj.pet_name) {
                petInfo = { 
                  petName: contentObj.pet_name,
                  petId: contentObj.pet_id || 0
                };
              }
              
              if (contentObj.doctor) {
                doctorInfo = contentObj.doctor;
              } else if (contentObj.doctor_name) {
                doctorInfo = {
                  doctorName: contentObj.doctor_name,
                  doctorId: contentObj.doctor_id || 0
                };
              }
              
              if (contentObj.reason) {
                reason = contentObj.reason;
              }
            }
          } catch (e) {
            // If JSON parsing fails, try to extract info from text content
            const content = notification.content;
            
            // Extract pet name
            const petMatch = content.match(/cho\s+([^với]+)\s+với/i);
            if (petMatch && petMatch[1]) {
              petInfo.petName = petMatch[1].trim();
            }
            
            // Extract doctor name
            const doctorMatch = content.match(/bác\s+sĩ\s+([^ngày]+)/i);
            if (doctorMatch && doctorMatch[1]) {
              doctorInfo.doctorName = doctorMatch[1].trim();
            }
            
            // Extract appointment date
            const dateMatch = content.match(/ngày\s+(\d{4}-\d{2}-\d{2})/i);
            if (dateMatch && dateMatch[1]) {
              const appointmentDate = new Date(dateMatch[1]);
              if (!isNaN(appointmentDate.getTime())) {
                date = appointmentDate;
                timeSlot.startTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
            }
            
            // Extract reason
            const reasonMatch = content.match(/Lý do:\s+(.+)$/i);
            if (reasonMatch && reasonMatch[1]) {
              reason = reasonMatch[1].trim();
            }
          }
        }
        
        // Create formatted date string (e.g., "May 19, 2025")
        const formattedDate = date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        return {
          ...notification,
          message: typeof notification.content === 'string' ? notification.content : JSON.stringify(notification.content),
          appointmentId: appointmentId || 0,
          date: formattedDate,
          timeSlot,
          pet: petInfo,
          doctor: doctorInfo,
          reason,
          serviceName: notification.notify_type || "Appointment",
        };
      });
      
      setNotifications(mappedNotifications);
    }
  }, [rawNotifications]);
  
  const [lowStockNotifications, setLowStockNotifications] = useState<
    LowStockNotification[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sắp xếp thông báo dựa trên trạng thái đã đọc/chưa đọc và thời gian
  const sortedNotifications = useMemo(() => {
    if (!notifications) return [];
    
    const notificationsCopy = [...notifications];
    
    switch (sortOrder) {
      case "unread-first":
        return notificationsCopy.sort((a, b) => {
          // Ưu tiên sắp xếp theo trạng thái đọc/chưa đọc
          if (a.is_read !== b.is_read) {
            return a.is_read ? 1 : -1; // Thông báo chưa đọc lên đầu
          }
          // Nếu cùng trạng thái thì sắp xếp theo thời gian (mới nhất lên đầu)
          return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
        });
        
      case "newest-first":
        return notificationsCopy.sort((a, b) => 
          new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
        );
        
      case "oldest-first":
        return notificationsCopy.sort((a, b) => 
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        );
        
      default:
        return notificationsCopy;
    }
  }, [notifications, sortOrder]);

  // Filter notifications using the transformed and sorted notifications
  const filteredNotifications = useMemo(() => {
    return sortedNotifications.filter((notification: Notification) => {
      // Apply text search
      const matchesSearch =
        searchTerm === "" ||
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply status filter - to be implemented based on your status requirements
      const matchesStatus = filterStatus.length === 0 || 
        (notification.notify_type && filterStatus.includes(notification.notify_type.toLowerCase()));

      return matchesSearch && matchesStatus;
    });
  }, [sortedNotifications, searchTerm, filterStatus]);

  const handleViewAppointment = async (notification: Notification) => {
    console.log("Opening notification details:", notification);
    setSelectedNotification(notification);
    setSelectedNotificationID(notification.id);
    setIsSheetOpen(true);

    // Mark notification as read when opened
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
        
        // Update UI immediately to show notification as read
        setNotifications(prev => 
          prev.map(item => 
            item.id === notification.id 
              ? { ...item, is_read: true } 
              : item
          )
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const navigateToAppointment = (appointmentId: number) => {
    setIsSheetOpen(false);
    navigate(`/appointment/${appointmentId}`);
  };

  const { mutateAsync: confirmAppointmentAsync } = useConfirmAppointment();

  const handleConfirmAppointment = async () => {
    if (!selectedNotification || !selectedNotificationID) return;

    setIsConfirming(true);

    try {
      const result = await confirmAppointmentAsync(selectedNotification.appointmentId);
      
      if (result && result.code !== "E") {
        // Mark the notification as read
        await markAsRead(selectedNotificationID);
        
        toast({
          title: "Appointment confirmed",
          description: `Appointment with ${selectedNotification.pet?.petName} has been confirmed.`,
          className: "bg-green-500 text-white",
          duration: 5000,
        });
      }
      
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Error confirming appointment:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDeclineAppointment = async () => {
    if (!selectedNotification || !selectedNotificationID) return;

    setIsConfirming(true);

    try {
      // Simulate API call to decline appointment
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mark the notification as read
      await markAsRead(selectedNotificationID);

      toast({
        title: "Appointment declined",
        description: `Appointment with ${selectedNotification.pet?.petName} has been declined.`,
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

  // Paginate notifications
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
              <span className={`h-2 w-2 rounded-full mr-2 ${isNotificationsLoading ? 'bg-yellow-300 animate-pulse' : 'bg-green-300'}`}></span>
              {isNotificationsLoading ? 'Checking for notifications...' : 'Real-time updates active'}
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
                    className={cn(sortOrder === "unread-first" && "bg-[#F9FAFB] font-medium text-[#2C78E4]")}
                    onClick={() => setSortOrder("unread-first")}
                  >
                    Unread first
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn(sortOrder === "newest-first" && "bg-[#F9FAFB] font-medium text-[#2C78E4]")}
                    onClick={() => setSortOrder("newest-first")}
                  >
                    Newest first
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn(sortOrder === "oldest-first" && "bg-[#F9FAFB] font-medium text-[#2C78E4]")}
                    onClick={() => setSortOrder("oldest-first")}
                  >
                    Oldest first
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>


              {(notifications.length > 0 ||
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
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <Badge className="ml-3 bg-red-100 text-red-700 border-red-200 rounded-full">
                      {notifications.filter(n => !n.is_read).length} unread
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading || isNotificationsLoading ? (
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
                    No notifications match your criteria or you have no notifications
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] min-h-[400px] max-h-[70vh] w-full overflow-y-auto">
                  <div className="divide-y divide-[#F9FAFB]">
                    {paginatedNotifications.map((notification: Notification, index: number) => (
                      <div
                        key={`${notification.id}-${index}`}
                        className={cn(
                          "px-6 py-4 hover:bg-[#F9FAFB]/50 cursor-pointer transition-colors",
                          !notification.is_read && "bg-[#F9FAFB]/30 border-l-4 border-[#2C78E4]"
                        )}
                        onClick={() => handleViewAppointment(notification)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <div className={cn(
                              "flex items-center justify-center rounded-full mr-3 flex-shrink-0",
                              !notification.is_read ? "text-[#2C78E4]" : "text-[#4B5563]"
                            )}>
                              {notification.notify_type === "appointment" ? (
                                <Calendar className="h-5 w-5" />
                              ) : (
                                <MessageSquare className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <span className={cn(
                                  "text-sm",
                                  !notification.is_read 
                                    ? "font-semibold text-[#111827]" 
                                    : "font-medium text-[#4B5563]"
                                )}>
                                  {notification.title}
                                  {!notification.is_read && (
                                    <span className="ml-2 inline-flex items-center">
                                      <span className="h-2 w-2 rounded-full bg-[#2C78E4]"></span>
                                    </span>
                                  )}
                                </span>
                                <span className="text-[#2C78E4] mx-2">•</span>
                                <span className="text-sm text-[#2C78E4]">
                                  {new Date(notification.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className={cn(
                                "text-sm mt-1",
                                !notification.is_read ? "text-[#111827]" : "text-[#4B5563]"
                              )}>
                                {notification.pet?.petName ? `${notification.pet.petName} - ` : ""}
                                {notification.reason || "General Checkup"}
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
                    ))}

                    {lowStockNotifications.length > 0 && (
                      <>
                        <div className="px-6 py-3 bg-[#F9FAFB]">
                          <h3 className="text-xs font-medium text-[#2C78E4] uppercase tracking-wide">
                            Low Stock Alert
                          </h3>
                        </div>

                        {lowStockNotifications.map((notification, index) => (
                          <div
                            key={`${notification.medicine_id}-${index}`}
                            className="px-6 py-4 hover:bg-[#F9FAFB]/50 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                <div>
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium text-[#111827]">
                                      Low Stock Alert:{" "}
                                      {notification.medicine_name}
                                    </span>
                                  </div>
                                  <p className="text-sm text-[#4B5563] mt-1">
                                    Current stock: {notification.current_stock}{" "}
                                    units (reorder level: {notification.reorder_level})
                                  </p>
                                </div>
                              </div>

                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 ml-4 mt-1 rounded-full">
                                Low Stock Alert
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
              <div className="space-y-6">
                <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-[#F9FAFB]">
                  <h3 className="font-semibold text-[#111827] mb-4 text-base">
                    Appointment for {selectedNotification.pet?.petName || "Unknown Pet"} - #{selectedNotification.appointmentId}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <User className="h-4 w-4 text-[#2C78E4] mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-[#111827]">
                          Pet
                        </div>
                        <div className="text-sm text-[#4B5563]">
                          {selectedNotification.pet?.petName || "Unknown"}
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
                          {selectedNotification.doctor?.doctorName || "Unassigned"}
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
                          {selectedNotification.date} at {selectedNotification.timeSlot?.startTime || "Unspecified time"}
                          {selectedNotification.timeSlot?.endTime && ` - ${selectedNotification.timeSlot.endTime}`}
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
                          {selectedNotification.reason || "Unspecified"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-6">
           

                  <div className="grid grid-cols-2 gap-4 pb-4">
                    <Button
                      onClick={() => handleConfirmAppointment()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl"
                      disabled={isConfirming}
                    >
                      {isConfirming ? "Processing..." : "Confirm"}
                      {!isConfirming && <Check className="ml-2 h-4 w-4" />}
                    </Button>

                    <Button
                      onClick={handleDeclineAppointment}
                      className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl"
                      disabled={isConfirming}
                    >
                      {isConfirming ? "Processing..." : "Decline"}
                      {!isConfirming && <X className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

         
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NotificationsPage;
