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
import { cn } from "@/lib/utils";

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
      1,
      99999,
    ],
    queryFn: () =>
      getAllAppointments(selectedDate, "false", 1, 99999),
    enabled: true,
  });

  console.log("Appointments data:", appointmentsData);

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
      <div className="h-screen flex flex-col items-center justify-center bg-[#F0F4FC]">
        <Loader2 className="h-10 w-10 animate-spin text-[#2C78E4] mb-4" />
        <p className="text-[#2C78E4] font-medium">
          Loading appointment data...
        </p>
      </div>
    );
  }

  // Rendering the mobile menu
  const renderMobileMenu = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center">
          <div className="bg-[#2C78E4]/10 p-2 rounded-full mr-3">
            <UserCog className="h-5 w-5 text-[#2C78E4]" />
          </div>
          <span className="font-medium text-[#111827]">Dr. {doctor?.username || "User"}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(false)}
          className="rounded-full hover:bg-[#F0F4FC]"
        >
          <X className="h-5 w-5 text-[#4B5563]" />
        </Button>
      </div>

      <div className="flex items-center bg-[#F0F4FC] rounded-2xl p-4 mb-4">
        <Calendar className="h-5 w-5 text-[#2C78E4] mr-3" />
        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={handleDateChange}
          className="text-sm bg-transparent border-none focus:outline-none w-full text-[#111827]"
        />
      </div>


    </div>
  );

  return (
    <div className="space-y-6">
    {/* Header with gradient background */}
    <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-3 h-9 w-9 text-white hover:bg-white/20 md:block hidden rounded-full"
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

          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 md:hidden rounded-full"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:max-w-none bg-white rounded-r-2xl border-none shadow-lg p-0">
                {renderMobileMenu()}
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-2 rounded-xl px-4 py-2"
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              className="bg-white text-[#2C78E4] hover:bg-white/90 flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm"
              onClick={handleNewAppointment}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Appointment</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white rounded-2xl border-none shadow-md overflow-hidden">
          <CardHeader className="bg-white px-6 py-5 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-[#111827]">Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search and filter section */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6 bg-[#F0F4FC] p-4 rounded-2xl border border-gray-100">
              <div className="flex flex-1 gap-3 flex-wrap md:flex-nowrap">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
                  <Input
                    placeholder="Search appointments..."
                    className="pl-10 border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] rounded-xl bg-white"
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
                  <SelectTrigger className="w-[180px] border-gray-200 rounded-xl bg-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-md border-none">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Waiting</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center">
                  <Input
                    type="date"
                    value={format(selectedDate, "yyyy-MM-dd")}
                    onChange={handleDateChange}
                    className="border-gray-200 h-10 rounded-xl bg-white"
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  className="border-gray-200 h-10 w-10 rounded-xl hover:bg-[#2C78E4]/5 hover:border-[#2C78E4]/20 bg-white"
                >
                  <RotateCcw className="h-4 w-4 text-[#2C78E4]" />
                </Button>
              </div>
            </div>

            {/* Flowboard section */}
            <div className="bg-white rounded-2xl overflow-hidden mb-6 border border-gray-100">
              <div className="min-w-[600px] overflow-x-auto">
                <EnhancedAppointmentFlowboard
                  appointments={filteredAppointments}
                  doctors={staff?.data}
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
          </CardContent>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 px-6 py-4 bg-white">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-[#4B5563]">Show</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-20 h-9 text-xs border-gray-200 rounded-xl bg-white">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-md border-none">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[#4B5563]">entries</span>
              </div>

              <div className="text-sm text-[#4B5563]">
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalAppointments)} - {Math.min(currentPage * pageSize, totalAppointments)} of {totalAppointments} appointments
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={cn(
                    "rounded-xl h-9 w-9 p-0 mx-0.5 text-sm font-medium transition-colors",
                    currentPage <= 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex gap-2">
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
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={cn(
                          "rounded-xl h-9 w-9 p-0 mx-0.5 text-sm font-medium transition-colors",
                          currentPage === pageNum
                            ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                            : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    "rounded-xl h-9 w-9 p-0 mx-0.5 text-sm font-medium transition-colors",
                    currentPage >= totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AppointmentFlow;
