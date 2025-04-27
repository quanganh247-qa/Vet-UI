import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppointmentNotification, LowStockNotification } from "@/types";
import { websocketService } from "@/utils/websocket";
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  Ban,
  User,
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
import api from "@/lib/api";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetOverlay,
} from "@/components/ui/sheet";
import { useConfirmAppointment, useMarkMessageDelivered } from "@/hooks/use-appointment";

// Define a type for server notification structure
interface ServerNotification {
  id: number;
  client_id: string;
  message_type: string;
  data: AppointmentNotification;
  status: string;
  retry_count: number;
  username: string;
  created_at: string;
}

// Helper function to parse stored notifications
const parseStoredNotifications = (
  storedNotifications: ServerNotification[]
): ServerNotification[] => {
  if (!Array.isArray(storedNotifications)) return [];
  
  return storedNotifications.filter(item => 
    item.message_type === "appointment_alert" && item.data
  );
};

// Pagination configuration
const ITEMS_PER_PAGE = 5;

const NotificationsPage = () => {
  const [, navigate] = useLocation();
  const [notifications, setNotifications] = useState<ServerNotification[]>([]);
  const [lowStockNotifications, setLowStockNotifications] = useState<
    LowStockNotification[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  
  const [selectedNotificationID, setSelectedNotificationID] = useState<number>();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Selected notification for detail view
  const [selectedNotification, setSelectedNotification] =
    useState<AppointmentNotification | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  console.log(notifications);

  // Fetch stored notifications from the database on component mount
  useEffect(() => {
    const fetchStoredNotifications = async () => {
      try {
        setIsLoading(true);

        // Get notifications from the API
        const response = await api.get(
          "/api/v1/appointment/notifications/pending"
        );
        const result = response.data;

        console.log("API Response:", result);

        if (result.success && result.data) {
          // Parse and add stored notifications
          const parsedNotifications = parseStoredNotifications(result.data);
          // Update state with fetched notifications
          setNotifications(parsedNotifications);
        } else {
          console.error("Failed to fetch notifications:", result);
        }
      } catch (error) {
        console.error("Error fetching stored notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoredNotifications();
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    // Connect to WebSocket when component mounts
    const wsUrl = "ws://localhost:8088/ws";

    try {
      websocketService.connect(wsUrl);

      // We'll use setTimeout to check connection status after a moment
      const connectionTimer = setTimeout(() => {
        setSocketStatus("connected");
      }, 1000);

      // Cleanup WebSocket connection when component unmounts
      return () => {
        clearTimeout(connectionTimer);
        websocketService.disconnect();
      };
    } catch (error) {
      console.error("Error initializing WebSocket:", error);
      setSocketStatus("disconnected");
    }
  }, []);

  // Subscribe to WebSocket notifications
  useEffect(() => {
    // Subscribe to appointment notifications - adjust to handle the server's message format
    const unsubscribeAppointment = websocketService.subscribe<ServerNotification>(
      "appointment_alert", 
      (message) => {
        setNotifications(prev => {
          // Check if notification already exists
          const exists = prev.some(n => n.id === message.id);
          if (exists) {
            // Update the existing notification
            return prev.map(n => n.id === message.id ? message : n);
          } else {
            // Add new notification
            return [message, ...prev];
          }
        });
      }
    );

    return () => {
      unsubscribeAppointment();
    };
  }, []);

  const handleViewAppointment = (notification: ServerNotification) => {
    setSelectedNotification(notification.data);
    setSelectedNotificationID(notification.id);
    console.log("Selected notification ID:", notification.id);
    setIsSheetOpen(true);
  };

  const navigateToAppointment = (appointmentId: number) => {
    setIsSheetOpen(false);
    navigate(`/appointment/${appointmentId}`);
  };

  const { mutateAsync: confirmAppointmentAsync } = useConfirmAppointment();
  const { mutate: markMessageDelivered } = useMarkMessageDelivered();

  const handleConfirmAppointment = async () => {
    if (!selectedNotification || !selectedNotificationID) return;

    setIsConfirming(true);

    try {
      const result = await confirmAppointmentAsync(selectedNotification.appointment_id);
      
      if (result && result.code !== "E") {
        await markMessageDelivered(Number(selectedNotificationID));
        
        setNotifications(prev =>
          prev.map(n => {
            if (n.id === selectedNotificationID) {
              return {
                ...n,
                data: {
                  ...n.data,
                  status: "confirmed"
                }
              };
            }
            return n;
          })
        );
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

      toast({
        title: "Appointment Declined",
        description: `The appointment with ${selectedNotification.pet?.pet_name} has been declined.`,
        variant: "destructive",
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => {
          if (n.id === selectedNotificationID) {
            return {
              ...n,
              data: {
                ...n.data,
                status: "declined"
              }
            };
          }
          return n;
        })
      );

      // Close the sheet after confirmation
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Error declining appointment:", error);
      toast({
        title: "Operation Failed",
        description: "Unable to decline the appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
    setLowStockNotifications([]);
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const data = notification.data;
    // Apply text search
    const matchesSearch =
      searchTerm === "" ||
      data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.pet?.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.date.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply status filter
    const matchesStatus = filterStatus.length === 0;

    return matchesSearch && matchesStatus;
  });

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
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-indigo-100 text-sm">
              View and manage all your notifications
              {socketStatus === "connected" && (
                <span className="ml-2 inline-flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                  Live
                </span>
              )}
              {socketStatus === "disconnected" && (
                <span className="ml-2 inline-flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-400 mr-1"></span>
                  Offline
                </span>
              )}
              {socketStatus === "connecting" && (
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
                    Starting Soon
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
                {socketStatus === "connected" && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
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
                    There are no notifications matching your criteria or you
                    have no notifications yet.
                    {socketStatus === "connected" && (
                      <span className="block mt-2 text-green-600">
                        You're connected and will receive real-time updates.
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] min-h-[400px] max-h-[70vh] w-full overflow-y-auto">
                  <div className="divide-y divide-indigo-100">
                    {paginatedNotifications.map((notification, index) => (
                      <div
                        key={`${notification.id}-${index}`}
                        className="px-6 py-4 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                        onClick={() => handleViewAppointment(notification)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-indigo-900">
                                  {notification.data?.title}
                                </span>
                                <span className="text-indigo-500 mx-2">•</span>
                                <span className="text-sm text-indigo-600">
                                  {notification.data.date},{" "}
                                  {typeof notification.data.time_slot === "object"
                                    ? (
                                        notification.data.time_slot as {
                                          start_time: string;
                                        }
                                      ).start_time
                                    : notification.data.time_slot}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.data.pet?.pet_name} -{" "}
                                {notification.data.reason || "Consultation"}
                              </p>
                            </div>
                          </div>

                          <Badge
                            className={`ml-4 mt-1 ${
                              notification.data.status === "confirmed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : notification.data.status === "declined"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-indigo-100 text-indigo-800 border-indigo-200"
                            }`}
                          >
                            {notification.data.status === "confirmed"
                              ? "Confirmed"
                              : notification.data.status === "declined"
                              ? "Declined"
                              : notification.data.service_name}
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
                                      Low Stock Alert:{" "}
                                      {notification.medicine_name}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Current stock: {notification.current_stock}{" "}
                                    units (below reorder level of{" "}
                                    {notification.reorder_level})
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

            {/* Pagination controls */}
            {totalPages > 1 && (
              <CardFooter className="flex justify-between items-center px-6 py-3 border-t border-indigo-100">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
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
              Review and confirm the appointment
            </p>
          </div>

          {selectedNotification && (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 text-base">
                    Appointment for {selectedNotification.pet?.pet_name} - #
                    {selectedNotification.appointment_id}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <User className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Patient
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedNotification.pet?.pet_name}
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
                          {selectedNotification.doctor?.doctor_name ||
                            "Not assigned yet"}
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
                          {selectedNotification.reason || "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-6">
                  <Button
                    onClick={() =>
                      navigateToAppointment(selectedNotification.appointment_id)
                    }
                    className="w-full border-gray-300"
                    variant="outline"
                  >
                    View Details
                  </Button>

                  <div className="grid grid-cols-2 gap-4 pb-4">
                    {selectedNotification.status !== "confirmed" && (
                      <Button
                        onClick={() => handleConfirmAppointment()}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={isConfirming}
                      >
                        {isConfirming ? "Processing..." : "Confirm"}
                        {!isConfirming && <Check className="ml-2 h-4 w-4" />}
                      </Button>
                    )}

                    {selectedNotification.status !== "declined" && (
                      <Button
                        onClick={handleDeclineAppointment}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        disabled={isConfirming}
                      >
                        {isConfirming ? "Processing..." : "Decline"}
                        {!isConfirming && <X className="ml-2 h-4 w-4" />}
                      </Button>
                    )}
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
