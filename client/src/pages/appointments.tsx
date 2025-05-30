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
  ChevronRight,
  X,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  CalendarClock,
  UserPlus,
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
  useGetNotificationsFromDB,
} from "@/hooks/use-appointment";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const { data: patientsData, isLoading: patientsLoading } = usePatientList();
  const { doctor, logout } = useAuth();

  const { data: notifications, refetch: refetchNotifications } =
    useGetNotificationsFromDB();

  const markNotificationAsRead = useMarkNotificationAsRead();
  const markAllNotificationsAsRead = useMarkAllNotificationsAsRead();

  const { data: appointmentsData, isLoading: appointmentsLoading } =
    useListAppointments(
      selectedDate,
      "all", // Always fetch all appointments and filter client-side for better UX
      1, // Request page 1 always from the API
      999 // Request a large number to get all appointments for the date
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
        if (typeof appointment.state === "string") {
          const appointmentState = appointment.state.trim().toLowerCase();
          const filterValue = statusFilter.trim().toLowerCase();

          if (appointmentState !== filterValue) {
            return false;
          }
        }
        // Check if state is available via state.state_name (common API pattern)
        else if (appointment.state && typeof appointment.state === "object") {
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
          appointment.id?.toString(),
        ];

        return searchFields.some(
          (field) => field && field.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [appointmentsData, statusFilter, searchTerm]);

  // Calculate paginated data client-side
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(startIndex, startIndex + pageSize);
  }, [filteredAppointments, currentPage, pageSize]);

  // Debug output
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

  // Appointment Details Dialog Component
  const AppointmentDetailsDialog: React.FC<{
    appointment: Appointment | null;
    patient: any;
    open: boolean;
    onClose: () => void;
  }> = ({ appointment, patient, open, onClose }) => {
    if (!appointment) return null;

    const { pet, doctor, owner, service, state, date, time_slot, reason, room } = appointment;

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-[#2C78E4]/10 flex-shrink-0 flex items-center justify-center">
                  {patient?.image_data || patient?.data_image ? (
                    <img
                      src={`data:image/jpeg;base64,${patient?.image_data || patient?.data_image}`}
                      alt={patient?.pet_name || "Pet"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PawPrint className="h-6 w-6 text-[#2C78E4]" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-[#111827]">
                    {pet?.pet_name}
                  </DialogTitle>
                  <DialogDescription className="text-[#4B5563]">
                    Appointment Details - #{appointment.id}
                  </DialogDescription>
                </div>
              </div>
            
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Pet & Owner Information */}
            <div className="bg-[#F9FAFB] p-4 rounded-xl">
              <h3 className="font-semibold text-[#111827] mb-3 flex items-center">
                <PawPrint className="h-4 w-4 mr-2 text-[#2C78E4]" />
                Pet & Owner Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#4B5563] font-medium mb-1">Pet Name</div>
                  <div className="text-sm font-semibold text-[#111827]">{pet?.pet_name}</div>
                </div>
                <div>
                  <div className="text-xs text-[#4B5563] font-medium mb-1">Owner</div>
                  <div className="text-sm font-semibold text-[#111827]">{owner?.owner_name}</div>
                </div>
                {owner?.owner_phone && (
                  <div>
                    <div className="text-xs text-[#4B5563] font-medium mb-1">Phone</div>
                    <div className="text-sm text-[#111827] flex items-center">
                      <Phone className="h-3 w-3 mr-1 text-[#4B5563]" />
                      {owner.owner_phone}
                    </div>
                  </div>
                )}
                {owner?.owner_email && (
                  <div>
                    <div className="text-xs text-[#4B5563] font-medium mb-1">Email</div>
                    <div className="text-sm text-[#111827] flex items-center">
                      <Mail className="h-3 w-3 mr-1 text-[#4B5563]" />
                      {owner.owner_email}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-white border border-[#F9FAFB] p-4 rounded-xl">
              <h3 className="font-semibold text-[#111827] mb-3 flex items-center">
                <CalendarClock className="h-4 w-4 mr-2 text-[#2C78E4]" />
                Appointment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#4B5563] font-medium mb-1">Date</div>
                  <div className="text-sm font-semibold text-[#111827]">
                    {format(new Date(date), "MMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#4B5563] font-medium mb-1">Time</div>
                  <div className="text-sm font-semibold text-[#111827]">
                    {time_slot?.start_time && time_slot?.end_time
                      ? `${time_slot.start_time} - ${time_slot.end_time}`
                      : "Walk-in"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#4B5563] font-medium mb-1">Service</div>
                  <div className="text-sm font-semibold text-[#111827] capitalize">
                    {service?.service_name?.replace(/_/g, " ")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#4B5563] font-medium mb-1">Duration</div>
                  <div className="text-sm font-semibold text-[#111827]">
                    {service?.service_duration} minutes
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#4B5563] font-medium mb-1">Doctor</div>
                  <div className="text-sm font-semibold text-[#111827] flex items-center">
                    <Stethoscope className="h-3 w-3 mr-1 text-[#2C78E4]" />
                    Dr. {doctor?.doctor_name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#4B5563] font-medium mb-1">Room</div>
                  <div className="text-sm font-semibold text-[#111827] flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-[#4B5563]" />
                    {room || "To be assigned"}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-[#4B5563] font-medium mb-1">Status</div>
                  <div className="flex items-center">
                    {state === "completed" ? (
                      <Badge className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <div className="w-2 h-2 rounded-full mr-1.5 bg-green-500" />
                        Completed
                      </Badge>
                    ) : state === "in progress" ? (
                      <Badge className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <div className="w-2 h-2 rounded-full mr-1.5 bg-blue-500" />
                        In Progress
                      </Badge>
                    ) : state === "checked in" ? (
                      <Badge className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2C78E4]/10 text-[#2C78E4] border border-[#2C78E4]/20">
                        <div className="w-2 h-2 rounded-full mr-1.5 bg-[#2C78E4]" />
                        Checked In
                      </Badge>
                    ) : state === "confirmed" ? (
                      <Badge className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFA726]/10 text-[#FFA726] border border-[#FFA726]/20">
                        <div className="w-2 h-2 rounded-full mr-1.5 bg-[#FFA726]" />
                        Confirmed
                      </Badge>
                    ) : state === "canceled" ? (
                      <Badge className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        <div className="w-2 h-2 rounded-full mr-1.5 bg-red-500" />
                        Canceled
                      </Badge>
                    ) : state === "scheduled" ? (
                      <Badge className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        <div className="w-2 h-2 rounded-full mr-1.5 bg-gray-400" />
                        Scheduled
                      </Badge>
                    ) : (
                      <Badge className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        <div className="w-2 h-2 rounded-full mr-1.5 bg-gray-400" />
                        {getFormattedStatus(state)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            {reason && (
              <div className="bg-white border border-[#F9FAFB] p-4 rounded-xl">
                <h3 className="font-semibold text-[#111827] mb-2">Reason for Visit</h3>
                <p className="text-sm text-[#4B5563] leading-relaxed">{reason}</p>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#2C78E4]/5"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">
              Appointments
            </h1>
            {doctor && (
              <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-full">
                {doctor.username}
              </Badge>
            )}
          </div>


          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white/10 text-white border-white/20 rounded-xl px-3 py-1 transition-all hover:bg-white/15">
              <Calendar className="h-4 w-4 text-white/80 mr-2" />
              <input
                type="date"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={handleDateChange}
                className="text-sm bg-transparent border-none focus:outline-none text-white"
              />
            </div>
            


            <div className="flex gap-2">
            <Button
              onClick={() => setLocation("/walk-in")}
              className="bg-white text-[#2C78E4] hover:bg-white/90 flex items-center gap-1.5 shadow-sm rounded-2xl"
            >
              <Plus className="w-4 h-4" />
              Add New Appointment
            </Button>
          </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-[#F9FAFB] shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow md:max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-[#4B5563]" />
              </div>
              <Input
                type="search"
                placeholder="Search by ID, pet, owner, doctor or service..."
                className="pl-10 pr-3 py-2 border border-[#2C78E4]/20 rounded-xl text-sm placeholder-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#2C78E4] focus:border-[#2C78E4] w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#2C78E4]/10 rounded-xl">
                  <Filter className="h-4 w-4 text-[#2C78E4]" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border border-[#2C78E4]/20 rounded-xl text-sm h-10 w-44 focus:ring-2 focus:ring-[#2C78E4] focus:border-[#2C78E4]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-md border-none">
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
      <Card className="border border-[#F9FAFB] shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-white pb-3 border-b border-[#F9FAFB]">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-[#111827] flex items-center">
              <Clock className="mr-2 h-5 w-5 text-[#2C78E4]" />
              Appointments List
            </CardTitle>

            <div className="text-xs text-[#4B5563]">
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
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                    Pet & Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                    Veterinarian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9FAFB] bg-white">
                {isLoading ? (
                  Array(6)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index} className="hover:bg-[#F9FAFB]">
                        {[...Array(7)].map((_, i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-3/4 rounded" />
                              {i === 1 && (
                                <Skeleton className="h-3 w-1/2 rounded" />
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                ) : filteredAppointments?.length > 0 ? (
                  paginatedAppointments.map((appointment: Appointment) => {
                    const { pet, doctor, owner, service, state } = appointment;
                    console.log("appointment", appointment);
                    // Thay vì truy cập trực tiếp vào patientsData, cần truy cập vào mảng data bên trong
                    const patient = patientsData?.data?.find(
                      (p: any) => Number(p.petid) === Number(pet.pet_id)
                    );
                    const statusColors = getStatusColor(state);

                    return (
                      <tr
                        key={appointment.id}
                        className="hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#2C78E4]">
                            #{appointment.id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            
                          <div className="h-16 w-16 rounded-full overflow-hidden bg-[#2C78E4]/10 flex-shrink-0 flex items-center justify-center mr-3">
                          {patient?.image_data || patient?.data_image ? (
                            <img
                              src={`data:image/jpeg;base64,${patient?.image_data || patient?.data_image}`}
                              alt={patient?.pet_name || "Pet"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // Fallback if image fails to load
                                e.currentTarget.src = "";
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement?.querySelector(".fallback-icon")?.classList.remove("hidden");
                              }}
                            />
                          ) : (
                            <PawPrint className="h-8 w-8 text-[#2C78E4] fallback-icon" />
                          )}
                        </div>
                            <div>
                              <div className="font-medium text-[#111827]">
                                {patient?.pet_name}
                              </div>
                              <div className="text-sm text-[#4B5563]">
                                {owner?.owner_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-[#4B5563]">
                            {format(selectedDate, "MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#111827] capitalize">
                            {service.service_name.replace(/_/g, " ")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            
                            <span className="text-sm text-[#111827] font-medium">
                              {doctor?.doctor_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`rounded-xl p-3 ${
                            state === "completed" 
                              ? "bg-green-50/80" 
                              : state === "in progress" 
                              ? "bg-blue-50/80" 
                              : state === "checked in" 
                              ? "bg-[#2C78E4]/5" 
                              : state === "confirmed" 
                              ? "bg-orange-50/80" 
                              : state === "canceled" 
                              ? "bg-red-50/80" 
                              : state === "scheduled" 
                              ? "bg-indigo-50/80" 
                              : "bg-gray-50/80"
                          }`}>
                            {state === "completed" ? (
                              <Badge className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm">
                                <div className="w-2 h-2 rounded-full mr-2 bg-green-600 animate-pulse" />
                                Completed
                              </Badge>
                            ) : state === "in progress" ? (
                              <Badge className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                                <div className="w-2 h-2 rounded-full mr-2 bg-blue-600 animate-pulse" />
                                In Progress
                              </Badge>
                            ) : state === "checked in" ? (
                              <Badge className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#2C78E4]/15 text-[#2C78E4] border border-[#2C78E4]/30 shadow-sm">
                                <div className="w-2 h-2 rounded-full mr-2 bg-[#2C78E4] animate-pulse" />
                                Checked In
                              </Badge>
                            ) : state === "confirmed" ? (
                              <Badge className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
                                <div className="w-2 h-2 rounded-full mr-2 bg-orange-600" />
                                Confirmed
                              </Badge>
                            ) : state === "canceled" ? (
                              <Badge className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm">
                                <div className="w-2 h-2 rounded-full mr-2 bg-red-600" />
                                Canceled
                              </Badge>
                            ) : state === "scheduled" ? (
                              <Badge className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm">
                                <div className="w-2 h-2 rounded-full mr-2 bg-indigo-600" />
                                Scheduled
                              </Badge>
                            ) : (
                              <Badge className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
                                <div className="w-2 h-2 rounded-full mr-2 bg-gray-500" />
                                {getFormattedStatus(state)}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className={(() => {
                              // Check if state is "scheduled"
                              let isScheduled = false;
                              if (typeof state === "string") {
                                isScheduled = state.trim().toLowerCase() === "scheduled";
                              } else if (state && typeof state === "object") {
                                const stateObj = state as { state_name?: string };
                                if (stateObj.state_name) {
                                  isScheduled = stateObj.state_name.trim().toLowerCase() === "scheduled";
                                }
                              }
                              
                              return isScheduled 
                                ? "border-green-500/50 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-500 transition-colors rounded-xl shadow-sm"
                                : "border-[#2C78E4]/20 bg-blue-50 text-[#2C78E4] hover:bg-blue-100 hover:border-[#2C78E4]/30 transition-colors rounded-xl shadow-sm";
                            })()}
                            onClick={() => {
                              // Check if state is "scheduled"
                              let isScheduled = false;
                              if (typeof state === "string") {
                                isScheduled = state.trim().toLowerCase() === "scheduled";
                              } else if (state && typeof state === "object") {
                                const stateObj = state as { state_name?: string };
                                if (stateObj.state_name) {
                                  isScheduled = stateObj.state_name.trim().toLowerCase() === "scheduled";
                                }
                              }
                              
                              if (isScheduled) {
                                // Navigate to check-in page for scheduled appointments
                                setLocation(`appointment/${appointment.id}/check-in`);
                              } else {
                                // Show details dialog for other appointments
                                setSelectedAppointment(appointment);
                                setAppointmentDetailsOpen(true);
                              }
                            }}
                          >
                            {(() => {
                              // Check if state is "scheduled"
                              let isScheduled = false;
                              if (typeof state === "string") {
                                isScheduled = state.trim().toLowerCase() === "scheduled";
                              } else if (state && typeof state === "object") {
                                const stateObj = state as { state_name?: string };
                                if (stateObj.state_name) {
                                  isScheduled = stateObj.state_name.trim().toLowerCase() === "scheduled";
                                }
                              }
                              return isScheduled ? "Check-in" : "View Details";
                            })()}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-16 h-16 bg-[#F9FAFB] rounded-full flex items-center justify-center">
                          <Inbox className="w-8 h-8 text-[#4B5563]" />
                        </div>
                        <div className="text-sm text-[#111827] font-medium">
                          No appointments found
                        </div>
                        <div className="text-xs text-[#4B5563]">
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
            <div className="border-t border-[#F9FAFB] px-4 py-3 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#4B5563]">Show</span>
                  <select
                    value={pageSize.toString()}
                    onChange={(e) =>
                      handlePageSizeChange(parseInt(e.target.value))
                    }
                    className="rounded-xl border border-[#2C78E4]/20 bg-white text-sm py-1 px-2 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-[#4B5563]">entries</span>
                </div>
                
                <div className="text-sm text-[#4B5563]">
                  Showing {filteredAppointments.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, filteredAppointments.length)} of{" "}
                  {filteredAppointments.length} entries
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn("bg-white border border-[#2C78E4]/20 rounded-xl transition-colors px-2.5 py-1.5 text-sm",
                      currentPage === 1 
                        ? "text-[#4B5563]/50 cursor-not-allowed" 
                        : "text-[#2C78E4] hover:bg-[#2C78E4]/5 hover:border-[#2C78E4]/20"
                    )}
                  >
                    <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                    <span>Previous</span>
                  </Button>

                  {filteredAppointments.length > 0 && (
                    <div className="flex items-center">
                      {Math.ceil(filteredAppointments.length / pageSize) <= 5 ? (
                        // Show all page numbers if there are 5 or fewer pages
                        Array.from(
                          {
                            length: Math.ceil(
                              filteredAppointments.length / pageSize
                            ),
                          },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={cn(
                              "rounded-xl h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                              currentPage === page
                                ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                                : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                            )}
                          >
                            {page}
                          </Button>
                        ))
                      ) : (
                        <>
                          {/* First page */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            className={cn(
                              "rounded-xl h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                              currentPage === 1
                                ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                                : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                            )}
                          >
                            1
                          </Button>

                          {/* Show ellipsis if currentPage > 3 */}
                          {currentPage > 3 && (
                            <span className="px-1 text-[#4B5563]">...</span>
                          )}

                          {/* Pages around current page */}
                          {Array.from({ length: 3 }, (_, i) => {
                            // Calculate page numbers around current page
                            let pageNum;
                            if (i === 0) {
                              // First button should be currentPage - 1 (or 2 if we're at page 3)
                              pageNum = currentPage > 2 ? currentPage - 1 : 2;
                            } else if (i === 1) {
                              // Middle button should be currentPage (or 3 if we're at page 1 or 2)
                              pageNum = currentPage <= 2 ? 3 : currentPage;
                            } else {
                              // Last button should be currentPage + 1 (or 4 if we're at page 1)
                              pageNum = currentPage <= 1 ? 4 : currentPage + 1;
                            }
                            
                            // Only show if the page is valid and not the first/last page
                            if (pageNum > 1 && pageNum < Math.ceil(filteredAppointments.length / pageSize)) {
                              return (
                                <Button
                                  key={pageNum}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  className={cn(
                                    "rounded-xl h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                                    currentPage === pageNum
                                      ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                                      : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                                  )}
                                >
                                  {pageNum}
                                </Button>
                              );
                            }
                            return null;
                          })}

                          {/* Show ellipsis if currentPage < totalPages - 2 */}
                          {currentPage < Math.ceil(filteredAppointments.length / pageSize) - 2 && (
                            <span className="px-1 text-[#4B5563]">...</span>
                          )}

                          {/* Last page */}
                          {Math.ceil(filteredAppointments.length / pageSize) > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handlePageChange(
                                  Math.ceil(
                                    filteredAppointments.length / pageSize
                                  )
                                )
                              }
                              className={cn(
                                "rounded-xl h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                                currentPage === Math.ceil(filteredAppointments.length / pageSize)
                                  ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                                  : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                              )}
                            >
                              {Math.ceil(
                                filteredAppointments.length / pageSize
                              )}
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
                        Math.ceil(filteredAppointments.length / pageSize) ||
                      filteredAppointments.length === 0
                    }
                    className={cn("bg-white border border-[#2C78E4]/20 rounded-xl transition-colors px-2.5 py-1.5 text-sm",
                      currentPage >= Math.ceil(filteredAppointments.length / pageSize) || filteredAppointments.length === 0
                        ? "text-[#4B5563]/50 cursor-not-allowed"
                        : "text-[#2C78E4] hover:bg-[#2C78E4]/5 hover:border-[#2C78E4]/20"
                    )}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add notification dialog */}
      <NotificationDialog
        notification={selectedNotification}
        open={notificationDialogOpen}
        onClose={handleCloseNotificationDialog}
      />

      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        patient={selectedAppointment ? patientsData?.data?.find((p: any) => Number(p.petid) === Number(selectedAppointment.pet.pet_id)) : null}
        open={appointmentDetailsOpen}
        onClose={() => setAppointmentDetailsOpen(false)}
      />
    </div>
  );
};

export default Appointments;
