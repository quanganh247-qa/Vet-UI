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
  const [sortOrder, setSortOrder] = useState<string>("unread-first"); // Thêm state cho sắp xếp
console.log(notifications)
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      previousNotificationsCount.current = rawNotifications?.length || 0;
      return;
    }
    
    if (rawNotifications && Array.isArray(rawNotifications)) {
      const unreadCount = rawNotifications.filter(n => !n.is_read).length;
      
      if (unreadCount > 0 && unreadCount > previousNotificationsCount.current) {
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
  }, [rawNotifications]);

  useEffect(() => {
    if (rawNotifications && Array.isArray(rawNotifications)) {
      // Map database fields to UI fields
      const mappedNotifications = rawNotifications.map((notification: any) => {
        let appointmentId = notification.related_id;
        let date = new Date(notification.datetime);
        
        // Extract additional info from content if available
        let petInfo;
        let doctorInfo;
        let reason;
        let timeSlot;
        
        try {
          const contentObj = notification.content ? JSON.parse(notification.content) : {};
          
          // Extract data from content JSON
          timeSlot = contentObj.timeSlot || {
            startTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: ""
          };
          
          petInfo = contentObj.pet || { 
            petName: contentObj.pet_name || "Unknown",
            petId: contentObj.pet_id || 0
          };
          
          doctorInfo = contentObj.doctor || {
            doctorName: contentObj.doctor_name || "Unassigned",
            doctorId: contentObj.doctor_id || 0
          };
          
          reason = contentObj.reason || "General Checkup";
          
        } catch (e) {
          // Default values if parsing fails
          timeSlot = {
            startTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: ""
          };
          petInfo = { petName: "Unknown", petId: 0 };
          doctorInfo = { doctorName: "Unassigned", doctorId: 0 };
          reason = "General Checkup";
        }
        
        return {
          ...notification,
          message: notification.content || "",
          appointmentId: appointmentId || 0,
          date: date.toLocaleDateString(),
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
  
  const [selectedNotificationID, setSelectedNotificationID] = useState<number>();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Selected notification for detail view
  const [selectedNotification, setSelectedNotification] = 
    useState<Notification | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

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
    setSelectedNotification(notification);
    setSelectedNotificationID(notification.id);
    setIsSheetOpen(true);

    // Đánh dấu thông báo là đã đọc khi mở xem chi tiết
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
        
        // Cập nhật UI ngay lập tức để hiển thị thông báo đã đọc
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
          title: "Đã xác nhận cuộc hẹn",
          description: `Cuộc hẹn với ${selectedNotification.pet?.petName} đã được xác nhận.`,
          variant: "default",
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
      });

      // Close the sheet after confirmation
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Error declining appointment:", error);
      toast({
        title: "Operation failed",
        description: "Cannot decline appointment. Please try again.",
        variant: "destructive",
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
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-indigo-100 text-sm">
              View and manage all your notifications
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => navigate("/")}
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
              {/* Thêm dropdown sắp xếp */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-indigo-200 text-indigo-600"
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Sort
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem 
                    className={cn(sortOrder === "unread-first" && "bg-indigo-50 font-medium")}
                    onClick={() => setSortOrder("unread-first")}
                  >
                    Unread first
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn(sortOrder === "newest-first" && "bg-indigo-50 font-medium")}
                    onClick={() => setSortOrder("newest-first")}
                  >
                    Newest first
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn(sortOrder === "oldest-first" && "bg-indigo-50 font-medium")}
                    onClick={() => setSortOrder("oldest-first")}
                  >
                    Oldest first
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-indigo-200 text-indigo-600"
                  >
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
                    checked={filterStatus.includes("upcoming")}
                    onCheckedChange={(checked) => {
                      setFilterStatus((prev) =>
                        checked
                          ? [...prev, "upcoming"]
                          : prev.filter((status) => status !== "upcoming")
                      );
                    }}
                  >
                    Upcoming
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterStatus.includes("starting_soon")}
                    onCheckedChange={(checked) => {
                      setFilterStatus((prev) =>
                        checked
                          ? [...prev, "starting_soon"]
                          : prev.filter((status) => status !== "starting_soon")
                      );
                    }}
                  >
                    Starting soon
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterStatus.includes("completed")}
                    onCheckedChange={(checked) => {
                      setFilterStatus((prev) =>
                        checked
                          ? [...prev, "completed"]
                          : prev.filter((status) => status !== "completed")
                      );
                    }}
                  >
                    Completed
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {(notifications.length > 0 ||
                lowStockNotifications.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleClearAll}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <Card className="border border-indigo-100">
            <CardHeader className="pb-3 border-b border-indigo-100">
              <CardTitle className="text-lg text-indigo-900 flex items-center justify-between">
                <div className="flex items-center">
                  All notifications
                  {/* Hiển thị số lượng thông báo chưa đọc */}
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <Badge className="ml-3 bg-red-100 text-red-700 border-red-200">
                      {notifications.filter(n => !n.is_read).length} unread
                    </Badge>
                  )}
                </div>
                {/* <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                  Real-time update
                </Badge> */}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin"></div>
                </div>
              ) : filteredNotifications.length === 0 &&
                lowStockNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-indigo-50 p-4 rounded-full mb-4">
                    <Bell className="h-8 w-8 text-indigo-500" />
                  </div>
                  <p className="text-indigo-900 font-medium text-lg mb-1">
                    No notifications found
                  </p>
                  <p className="text-gray-500 text-sm text-center max-w-md">
                    No notifications match your criteria or you have no notifications
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] min-h-[400px] max-h-[70vh] w-full overflow-y-auto">
                  <div className="divide-y divide-indigo-100">
                    {paginatedNotifications.map((notification: Notification, index: number) => (
                      <div
                        key={`${notification.id}-${index}`}
                        className={cn(
                          "px-6 py-4 hover:bg-indigo-50/50 cursor-pointer transition-colors",
                          !notification.is_read && "bg-indigo-50/30 border-l-4 border-indigo-500"
                        )}
                        onClick={() => handleViewAppointment(notification)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <div className={cn(
                              "flex items-center justify-center rounded-full mr-3 flex-shrink-0",
                              !notification.is_read ? "text-indigo-600" : "text-gray-400"
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
                                    ? "font-semibold text-indigo-900" 
                                    : "font-medium text-gray-700"
                                )}>
                                  {notification.title}
                                  {!notification.is_read && (
                                    <span className="ml-2 inline-flex items-center">
                                      <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                    </span>
                                  )}
                                </span>
                                <span className="text-indigo-500 mx-2">•</span>
                                <span className="text-sm text-indigo-600">
                                  {new Date(notification.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className={cn(
                                "text-sm mt-1",
                                !notification.is_read ? "text-gray-700" : "text-gray-500"
                              )}>
                                {notification.pet?.petName} -{" "}
                                  {notification.reason || "General Checkup"}
                              </p>
                            </div>
                          </div>

                          <Badge
                            className={cn(
                              "ml-4 mt-1",
                              !notification.is_read 
                                ? "bg-indigo-100 text-indigo-800 border-indigo-200 font-medium" 
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            )}
                          >
                            {notification.serviceName}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {lowStockNotifications.length > 0 && (
                      <>
                        <div className="px-6 py-3 bg-indigo-50">
                          <h3 className="text-xs font-medium text-indigo-800 uppercase tracking-wide">
                            Low Stock Alert
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
                                      Low Stock Alert:{" "}
                                      {notification.medicine_name}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Current stock: {notification.current_stock}{" "}
                                    units (reorder level: {notification.reorder_level})
                                  </p>
                                </div>
                              </div>

                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 ml-4 mt-1">
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
              <CardFooter className="flex justify-between items-center px-6 py-3 border-t border-indigo-100">
                <div className="text-sm text-gray-500">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
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
        <SheetContent className="sm:max-w-md bg-white p-0 flex flex-col">
          <div className="px-6 py-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Appointment Details
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Review and confirm appointment
            </p>
          </div>

          {selectedNotification && (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 text-base">
                    Appointment for {selectedNotification.pet?.petName} - #
                    {selectedNotification.id}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <User className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Pet
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedNotification.pet?.petName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <User className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Doctor
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedNotification.doctor?.doctorName ||
                            "Unassigned"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Reason
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedNotification.reason || "Unspecified"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-6">
                  <Button
                    onClick={() =>
                      navigateToAppointment(selectedNotification.appointmentId)
                    }
                    className="w-full border-gray-300"
                    variant="outline"
                  >
                    View details
                  </Button>

                  <div className="grid grid-cols-2 gap-4 pb-4">
                    <Button
                      onClick={() => handleConfirmAppointment()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={isConfirming}
                    >
                      {isConfirming ? "Processing..." : "Confirm"}
                      {!isConfirming && <Check className="ml-2 h-4 w-4" />}
                    </Button>

                    <Button
                      onClick={handleDeclineAppointment}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
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

          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <Button
              variant="outline"
              onClick={() => setIsSheetOpen(false)}
              className="w-full justify-center"
            >
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NotificationsPage;
