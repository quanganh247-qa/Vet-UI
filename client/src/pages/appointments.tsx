import { useState, useMemo, useEffect } from "react";
import { parse, format } from "date-fns";
import {
  Calendar,
  Filter,
  Inbox,
  PawPrint,
  Plus,
  Search,
  Download,
  Printer,
  Clock,
  ArrowLeft,
  UserCog, 
  LogOut,
  User, 
  Settings,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFormattedStatus, getStatusColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Appointment, Patient } from "@/types";
import { useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePatientList } from "@/hooks/use-pet";
import { 
  useListAppointments, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  useGetNotificationsFromDB 
} from "@/hooks/use-appointment";
import { WalkInDialog } from "@/components/appointment/WalkInDialog";
import { NotificationDialog } from "@/components/ui/notification-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const Appointments = () => {
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const { data: patientsData, isLoading: patientsLoading } = usePatientList();
  const { doctor, logout } = useAuth();

  const { data: notifications, refetch: refetchNotifications } = useGetNotificationsFromDB();

  console.log("Notifications:", notifications);
  const markNotificationAsRead = useMarkNotificationAsRead();
  const markAllNotificationsAsRead = useMarkAllNotificationsAsRead();

  // Safe time formatting helper
  const formatAppointmentTime = (timeSlot: { start_time?: string } | undefined): string => {
    if (!timeSlot || !timeSlot.start_time) return "No time";
    
    try {
      return format(
        parse(timeSlot.start_time, "HH:mm:ss", new Date()),
        "h:mm a"
      );
    } catch (error) {
      return timeSlot.start_time;
    }
  };

  // Sử dụng useListAppointments hook thay vì gọi API trực tiếp
  const { data: appointmentsData, isLoading: appointmentsLoading } =
    useListAppointments(
      selectedDate,
      "all", // Always fetch all appointments and filter client-side for better UX
      currentPage,
      pageSize
    );

  const isLoading = appointmentsLoading || patientsLoading;

  // Cập nhật cách lấy danh sách cuộc hẹn đã lọc
  const filteredAppointments = useMemo(() => {
    if (!appointmentsData || !Array.isArray(appointmentsData.data)) {
      return [];
    }
    
    return appointmentsData.data.filter((appointment: Appointment) => {
      // Apply status filter if not set to "all"
      if (statusFilter !== "all") {
        // Check if state is directly available as a string
        if (typeof appointment.state === 'string') {
          const appointmentState = appointment.state.trim().toLowerCase();
          const filterValue = statusFilter.trim().toLowerCase();
          
          if (appointmentState !== filterValue) {
            return false;
          }
        } 
        // Check if state is available via state.state_name (common API pattern)
        else if (appointment.state && typeof appointment.state === 'object') {
          const stateObj = appointment.state as { state_name?: string };
          if (stateObj.state_name) {
            const stateName = stateObj.state_name.trim().toLowerCase();
            const filterValue = statusFilter.trim().toLowerCase();
            
            if (stateName !== filterValue) {
              return false;
            }
          }
        }
        // Otherwise filter might not work properly - return all for inspection
      }

      // Apply search term filtering
      if (searchTerm && searchTerm.trim() !== "") {
        const searchLower = searchTerm.toLowerCase().trim();
        const searchFields = [
          appointment.pet?.pet_name,
          appointment.owner?.owner_name,
          appointment.doctor?.doctor_name,
          appointment.service?.service_name,
        ];

        return searchFields.some(
          (field) => field && field.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [appointmentsData, statusFilter, searchTerm]);

  // Debug output
  console.log("Filtered appointments:", filteredAppointments.length);

  // Thêm hàm xử lý thay đổi kích thước trang
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi kích thước trang
  };

  // Thêm hàm xử lý thay đổi trang
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
      setCurrentPage(1); // Reset to first page when changing date
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    markNotificationAsRead.mutate(Number(notificationId), {
      onSuccess: () => {
        refetchNotifications();
      },
    });
  };

  const handleMarkAllNotificationsAsRead = () => {
    markAllNotificationsAsRead.mutate(undefined, {
      onSuccess: () => {
        refetchNotifications();
      },
    });
  };

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    setNotificationDialogOpen(true);
    
    // Mark as read when opened
    if (notification.id && !notification.read) {
      markNotificationAsRead.mutate(notification.id, {
        onSuccess: () => {
          refetchNotifications();
        },
      });
    }
  };
  
  const handleCloseNotificationDialog = () => {
    setNotificationDialogOpen(false);
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 max-w-[100vw]">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8 text-white hover:bg-white/20"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Appointments</h1>
            {doctor && (
              <Badge className="ml-4 bg-white/20 text-white hover:bg-white/30">
                Dr. {doctor.username}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white/10 text-white border-white/20 rounded-md px-3 py-1">
              <Calendar className="h-4 w-4 text-white/70 mr-2" />
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="text-sm bg-transparent border-none focus:outline-none text-white"
              />
            </div>
            <WalkInDialog />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 relative">
                  <Bell className="h-5 w-5" />
                  {notifications && notifications.filter((n: any) => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications?.length > 0 ? (
                  notifications.map((notification: any) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "cursor-pointer",
                        notification.read ? "text-gray-500" : "text-black font-semibold"
                      )}
                    >
                      {notification.message}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem className="text-gray-500">
                    No notifications
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleMarkAllNotificationsAsRead}
                  className="text-indigo-600 cursor-pointer"
                >
                  Mark all as read
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3 border-b">
          <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-indigo-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow md:max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search appointments..."
                className="pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                </div>
                <Input
                  type="date"
                  className="border border-gray-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-36"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={handleDateChange}
                />
              </div>

              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Filter className="h-4 w-4 text-indigo-500" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border border-gray-200 rounded-md text-sm h-10 w-44 focus:ring-2 focus:ring-indigo-500 focus:border-gray-200">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked in">Checked In</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-indigo-600" />
              Appointments List
            </CardTitle>

            <div className="text-xs text-gray-500">
              {!isLoading && filteredAppointments && (
                <span>
                  {filteredAppointments.length} appointments found
                  {statusFilter !== "all" && ` (filtered by: ${statusFilter})`}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pet & Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veterinarian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {[...Array(6)].map((_, i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-3/4 rounded" />
                              {i === 0 && (
                                <Skeleton className="h-3 w-1/2 rounded" />
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                ) : filteredAppointments?.length > 0 ? (
                  filteredAppointments.map((appointment: Appointment) => {
                    const { pet, doctor, owner, service, state } = appointment;

                    // Thay vì truy cập trực tiếp vào patientsData, cần truy cập vào mảng data bên trong
                    const patient = patientsData?.data?.find(
                      (p: Patient) => p.petid === pet.pet_id
                    );
                    const statusColors = getStatusColor(state);

                    return (
                      <tr
                        key={appointment.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <img
                                src={
                                  patient?.data_image
                                    ? `data:image/png;base64,${patient.data_image}`
                                    : "/fallback-image.png"
                                }
                                alt={patient?.name}
                                className="w-10 h-10 rounded-lg"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {patient?.pet_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {owner?.owner_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatAppointmentTime(appointment.time_slot)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(selectedDate, "MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 capitalize">
                            {service.service_name.replace(/_/g, " ")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                {doctor?.doctor_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-900 font-medium">
                              {doctor?.doctor_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`px-2.5 py-0.5 inline-flex items-center rounded-full text-xs font-medium ${
                              statusColors.bgColor
                            } ${statusColors.textColor} border ${
                              state === "completed"
                                ? "border-green-200"
                                : state === "in progress"
                                ? "border-blue-200"
                                : state === "checked in"
                                ? "border-indigo-200"
                                : state === "confirmed"
                                ? "border-purple-200"
                                : state === "canceled"
                                ? "border-red-200"
                                : "border-gray-200"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-1.5 ${statusColors.dotColor}`}
                            />
                            {getFormattedStatus(state)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white shadow-sm border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            onClick={() =>
                              setLocation(
                                `appointment/${appointment.id}/check-in`
                              )
                            }
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                          <Inbox className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          No appointments found
                        </div>
                        <div className="text-xs text-gray-400">
                          Try adjusting your search or filter criteria
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {!isLoading && appointmentsData && (
            <Card className="border-none shadow-md overflow-hidden">
              <CardContent className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Showing {filteredAppointments.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredAppointments.length)}{" "}
                    of {filteredAppointments.length}{" "}
                    {statusFilter !== "all" ? `filtered` : ``} entries
                  </span>
                  <select
                    value={pageSize.toString()}
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                    className="rounded-md border border-gray-200 bg-white text-sm p-1"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-white shadow-sm border-gray-200 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  
                  {filteredAppointments.length > 0 && (
                    <div className="flex items-center gap-1">
                      {Math.ceil(filteredAppointments.length / pageSize) <= 7 ? (
                        // Show all page numbers if there are 7 or fewer pages
                        Array.from({ length: Math.ceil(filteredAppointments.length / pageSize) }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={cn(
                              'px-3',
                              currentPage === page && 'bg-indigo-600 text-white hover:bg-indigo-700'
                            )}
                          >
                            {page}
                          </Button>
                        ))
                      ) : (
                        // Show limited page numbers with ellipsis for many pages
                        <>
                          {/* First page */}
                          <Button
                            variant={currentPage === 1 ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            className={cn(
                              'px-3',
                              currentPage === 1 && 'bg-indigo-600 text-white hover:bg-indigo-700'
                            )}
                          >
                            1
                          </Button>
                          
                          {/* Ellipsis if needed */}
                          {currentPage > 3 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          
                          {/* Pages around current page */}
                          {Array.from(
                            { length: Math.min(3, Math.ceil(filteredAppointments.length / pageSize)) },
                            (_, i) => {
                              const pageNum = Math.max(
                                2,
                                currentPage - 1 + i - (currentPage > 2 ? 1 : 0)
                              );
                              if (pageNum >= 2 && pageNum < Math.ceil(filteredAppointments.length / pageSize)) {
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    className={cn(
                                      'px-3',
                                      currentPage === pageNum && 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    )}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              }
                              return null;
                            }
                          )}
                          
                          {/* Ellipsis if needed */}
                          {currentPage < Math.ceil(filteredAppointments.length / pageSize) - 2 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          
                          {/* Last page */}
                          {Math.ceil(filteredAppointments.length / pageSize) > 1 && (
                            <Button
                              variant={currentPage === Math.ceil(filteredAppointments.length / pageSize) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(Math.ceil(filteredAppointments.length / pageSize))}
                              className={cn(
                                'px-3',
                                currentPage === Math.ceil(filteredAppointments.length / pageSize) && 'bg-indigo-600 text-white hover:bg-indigo-700'
                              )}
                            >
                              {Math.ceil(filteredAppointments.length / pageSize)}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={
                      currentPage >=
                      Math.ceil(filteredAppointments.length / pageSize) || filteredAppointments.length === 0
                    }
                    className="bg-white shadow-sm border-gray-200 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Add notification dialog */}
      <NotificationDialog 
        notification={selectedNotification} 
        open={notificationDialogOpen}
        onClose={handleCloseNotificationDialog}
      />
    </div>
  );
};

export default Appointments;
