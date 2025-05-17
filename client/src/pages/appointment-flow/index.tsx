import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Appointment, QueueItem, Room } from "@/types";
import { getAllAppointments } from "@/services/appointment-services";
import { getRooms } from "@/services/room-services";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  RefreshCw,
  UserCog,
  LogOut,
  User,
  Settings,
  Plus,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RotateCcw,
  Clock,
  FileText,
  Stethoscope,
  CheckCircle,
  PlusCircle,
  PawPrint,
  AlertCircle,
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import EnhancedAppointmentFlowboard from "@/components/appointment/AppointmentFlowboard";
import { useListAppointmentsQueue } from "@/hooks/use-appointment";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDoctors } from "@/hooks/use-doctor";

// Utility function to invalidate related queries
const invalidateRelatedQueries = async (patterns: string[]) => {
  for (const pattern of patterns) {
    await queryClient.invalidateQueries({ queryKey: [pattern] });
  }
};

const AppointmentFlow = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  console.log("selectedDate1", selectedDate);
  const [, setShowSidebar] = useState(true);
  const [, setSidebarContent] = useState("queue");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(id ? parseInt(id) : null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { doctor, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: staff } = useDoctors();

  // Fetch appointments data
  const {
    data: appointmentsData,
    isLoading: isLoadingAppointments,
    refetch: refetchAppointments,
    error: appointmentsError,
  } = useQuery({
    queryKey: [
      "appointments",
      selectedDate.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }),
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      getAllAppointments(selectedDate, "false", currentPage, pageSize),
    enabled: true,
  });

  // Debug logs for appointments
  console.log("Appointments Query State:", {
    isLoading: isLoadingAppointments,
    data: appointmentsData,
    error: appointmentsError,
    selectedDate: selectedDate.toISOString(),
    currentPage,
    pageSize,
  });

  // Fetch rooms data
  const {
    data: roomsData,
    isLoading: isLoadingRooms,
    error: roomsError,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
    enabled: true,
  });

  // Queue data
  const { data: queueData, error: queueError } = useListAppointmentsQueue();

  const appointments = appointmentsData?.data || [];
  const totalAppointments = appointmentsData?.total || 0;
  const totalPages = Math.ceil(totalAppointments / pageSize);
  const rooms = roomsData?.data || [];

  // Filter appointments based on search term and status
  const filteredAppointments = appointments.filter(
    (appointment: Appointment) => {
      const matchesSearch = searchTerm
        ? appointment.pet?.pet_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          appointment.doctor?.doctor_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (appointment.service?.service_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;

      const matchesStatus = statusFilter
        ? appointment.state.toLowerCase() === statusFilter.toLowerCase()
        : true;

      return matchesSearch && matchesStatus;
    }
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
      setCurrentPage(1); // Reset to first page when changing date
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
  };

  // Update state after appointment is processed
  const handleStatusChange = async (
    appointmentId: number,
    newStatus: string
  ) => {
    try {
      // Here you would make API call to update status
      // For now simulating locally
      const updatedAppointments = appointments.map(
        (appointment: Appointment) => {
          if (appointment.id === appointmentId) {
            return { ...appointment, state: newStatus };
          }
          return appointment;
        }
      );

      // Update cache and trigger refresh
      queryClient.setQueryData(
        [
          "appointments",
          selectedDate.toISOString().split("T")[0],
          currentPage,
          pageSize,
        ],
        {
          ...appointmentsData,
          data: updatedAppointments,
        }
      );

      // Invalidate related queries to ensure fresh data
      await invalidateRelatedQueries(["appointments", "rooms"]);

      toast({
        title: "Status updated",
        description: `Appointment status has been changed to ${newStatus}`,
        className: "bg-green-50 text-green-800 border-green-200",
      });

      // Select the next patient if the current one was completed
      if (
        newStatus === "Completed" &&
        selectedAppointmentId === appointmentId
      ) {
        const nextPatient = queueData?.[0]?.id;
        if (nextPatient) {
          setSelectedAppointmentId(nextPatient);
        } else {
          setSelectedAppointmentId(null);
        }
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);

      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  // Effect to show appointment details when ID is provided in URL
  useEffect(() => {
    if (id && parseInt(id) > 0) {
      setSelectedAppointmentId(parseInt(id));
      setSidebarContent("details");
      setShowSidebar(true);
    }
  }, [id]);

  const handleAppointmentClick = (id: number) => {
    setSelectedAppointmentId(id);
    setSidebarContent("details");
    setShowSidebar(true);

    // Update URL without page reload
    navigate(`/appointment-flow/${id}`, { replace: true });
  };

  const handleNewAppointment = () => {
    setSelectedAppointmentId(null);
    setSidebarContent("new");
    setShowSidebar(true);
    navigate("/appointments/new");
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetchAppointments();
      await invalidateRelatedQueries(["appointments", "rooms"]);

      toast({
        title: "Data refreshed",
        description: "Appointment data has been updated",
        className: "bg-blue-50 text-blue-800 border-blue-200",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);

      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Show loading state
  if (isLoadingAppointments || isLoadingRooms) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f6fcfe]">
        <Loader2 className="h-8 w-8 animate-spin text-[#23b3c7] mb-4" />
        <p className="text-[#23b3c7] font-medium">
          Loading appointment data...
        </p>
      </div>
    );
  }

  // Rendering the mobile menu
  const renderMobileMenu = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[#b6e6f2] pb-3 mb-3">
        <div className="flex items-center">
          <UserCog className="h-5 w-5 mr-2 text-[#23b3c7]" />
          <span className="font-medium">Dr. {doctor?.username || "User"}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center bg-[#eaf7fa] rounded-md p-3 mb-3">
        <Calendar className="h-4 w-4 text-[#23b3c7] mr-2" />
        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={handleDateChange}
          className="text-sm bg-transparent border-none focus:outline-none w-full"
        />
      </div>

      <div className="border-t border-[#b6e6f2] pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left"
          asChild
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left mt-1"
        >
          <User className="h-4 w-4 mr-2" />
          Profile Settings
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left mt-1"
        >
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-left text-[#ff5a5f] mt-1"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-[#23b3c7] px-6 py-4 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 h-8 w-8 text-white hover:bg-white/20 md:block hidden"
                asChild
              >
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Appointment Flowboard
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:max-w-none">
                {renderMobileMenu()}
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg border border-[#b6e6f2] shadow-sm p-6 mb-6">
          {/* Search and filter section */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6 bg-[#eaf7fa] p-3 rounded-md border border-[#b6e6f2]">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#b6e6f2]" />
                <Input
                  placeholder="Search appointments..."
                  className="pl-10 border-[#b6e6f2] focus:border-[#23b3c7] focus:ring-[#23b3c7]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[180px] border-[#b6e6f2]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Waiting</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={handleDateChange}
                  className="border-[#b6e6f2] h-10"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={clearFilters}
                className="border-[#b6e6f2]"
              >
                <RotateCcw className="h-4 w-4 text-[#23b3c7]" />
              </Button>
            </div>
          </div>

          {/* Flowboard section */}
          <div className="bg-white rounded-lg overflow-hidden mb-6">
            <div className="border-b border-[#b6e6f2] p-4 bg-[#eaf7fa]">
              <h2 className="text-lg font-semibold text-[#1e293b] flex items-center">
                <Stethoscope className="mr-2 h-5 w-5 text-[#23b3c7]" />
                Flowboard
              </h2>
            </div>

            <div className="p-4 overflow-x-auto">
              <div className="min-w-[600px]">
                <EnhancedAppointmentFlowboard
                  appointments={filteredAppointments}
                  doctors={staff?.data?.map((s: any) => ({
                    doctor_id: s.id,
                    doctor_name: s.name,
                    doctor_phone: "",
                    doctor_email: "",
                    doctor_specialty: s.role,
                    doctor_avatar: s.avatar || "",
                  }))}
                  rooms={rooms}
                  onAppointmentUpdate={(appointment) =>
                    handleStatusChange(appointment.id, appointment.state)
                  }
                  onAppointmentCreate={handleNewAppointment}
                  onAppointmentDelete={() => {}} // This is kept but will be ignored in the component
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  onPreviousDay={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(selectedDate.getDate() - 1);
                    setSelectedDate(newDate);
                  }}
                  onNextDay={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(selectedDate.getDate() + 1);
                    setSelectedDate(newDate);
                  }}
                  onToday={() => setSelectedDate(new Date())}
                />
              </div>
            </div>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 border-t border-[#b6e6f2] pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#888]">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * pageSize + 1,
                    totalAppointments
                  )}{" "}
                  to {Math.min(currentPage * pageSize, totalAppointments)} of{" "}
                  {totalAppointments} appointments
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-20 h-8 text-xs border-[#b6e6f2]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 p-0 flex items-center justify-center border-[#b6e6f2]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    const pageNum =
                      totalPages <= 5
                        ? i + 1
                        : currentPage <= 3
                        ? i + 1
                        : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-8 w-8 p-0 ${
                          currentPage === pageNum
                            ? "bg-[#23b3c7] text-white hover:bg-[#23b3c7]"
                            : "border-[#b6e6f2]"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 p-0 flex items-center justify-center border-[#b6e6f2]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentFlow;
