import React, { useState, useEffect, useCallback } from "react";
import { format, addDays, isAfter, isBefore } from "date-fns";
import {
  Plus,
  Filter,
  Calendar as CalendarIcon,
  RotateCcw,
  User,
  Clock,
  FileText,
  Check,
  X,
  Stethoscope,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

import DoctorScheduleCalendar from "@/components/doctor-schedule/DoctorScheduleCalendar";
import ShiftForm from "@/components/doctor-schedule/ShiftForm";
import ShiftDetailsDialog from "@/components/doctor-schedule/ShiftDetailsDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doctor, WorkShift, WorkScheduleFilters } from "@/types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { useDoctors } from "@/hooks/use-doctor";
import { useGetAllShifts, useShiftMutations } from "@/hooks/use-shifts";
import { cn, formatDateForBackend } from "@/lib/utils";

const ScheduleManagement = () => {
  const [userRole, setUserRole] = useState<"doctor" | "admin">("admin");
  const [currentDoctorId, setCurrentDoctorId] = useState<string>("1");

  // Add shift with direct payload
  const addShiftWithPayload = useCallback((payload: {
    start_time: string,
    end_time: string,
    doctor_id: number,
    title?: string,
    description?: string,
    status?: string
  }) => {
    handleCreateShift(payload);
  }, []);

  // State for UI
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [filters, setFilters] = useState<WorkScheduleFilters>({});
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data using hooks
  const { data: doctorsData } = useDoctors();
  const { data: shiftsData, isLoading: shiftsLoading } = useGetAllShifts();
  const { createMutation, updateMutation, deleteMutation } =
    useShiftMutations();

  // State for filtered shifts
  const [filteredShifts, setFilteredShifts] = useState<WorkShift[]>([]);

  // Modal states
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isEditShiftOpen, setIsEditShiftOpen] = useState(false);
  const [isViewShiftOpen, setIsViewShiftOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Update filtered shifts whenever source data changes
  useEffect(() => {
    if (!shiftsData) {
      setFilteredShifts([]);
      return;
    }

    let filtered = [...shiftsData];

    if (filters.doctorId) {
      filtered = filtered.filter(
        (shift) => shift.doctor_id === filters.doctorId
      );
    }

    // Apply date range filter
    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      filtered = filtered.filter(
        (shift) =>
          isAfter(new Date(shift.start_time), startDate) ||
          format(new Date(shift.start_time), "yyyy-MM-dd") ===
          format(startDate, "yyyy-MM-dd")
      );
    }

    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (shift) =>
          isBefore(new Date(shift.start_time), endDate) ||
          format(new Date(shift.start_time), "yyyy-MM-dd") ===
          format(endDate, "yyyy-MM-dd")
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((shift) => shift.status === statusFilter);
    }

    // For doctor view, only show their shifts
    if (userRole === "doctor") {
      filtered = filtered.filter(
        (shift) => shift.doctor_id === currentDoctorId
      );
    }

    // Apply search term if available
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((shift) => {
        const doctor = doctorsData?.data?.find(
          (d: Doctor) => d.doctor_id.toString() === shift.doctor_id.toString()
        );

        return (
          shift.title?.toLowerCase().includes(lowerSearchTerm) ||
          doctor?.doctor_name?.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }

    setFilteredShifts(filtered);
  }, [
    shiftsData,
    filters,
    dateFilter,
    statusFilter,
    userRole,
    currentDoctorId,
    searchTerm,
    doctorsData?.data,
  ]);

  // Toggle between doctor and admin views
  const toggleUserRole = () => {
    setUserRole((prev) => (prev === "doctor" ? "admin" : "doctor"));
  };

  const handleViewShift = (shift: WorkShift) => {
    setSelectedShift(shift);
    setIsViewShiftOpen(true);
  };

  const handleEditShift = () => {
    setIsViewShiftOpen(false);
    setIsEditShiftOpen(true);
  };

  const handleDeleteShift = () => {
    if (selectedShift) {
      deleteMutation.mutate(Number(selectedShift.id), {
        onSuccess: () => {
          toast({
            title: "Shift deleted successfully",
            description: "The shift has been removed from the schedule.",
            className: "bg-green-50 text-green-800 border-green-200",
          });
          setIsViewShiftOpen(false);
          setSelectedShift(null);
        },
        onError: (error) => {
          toast({
            title: "Failed to delete shift",
            description: "An error occurred while deleting the shift.",
            variant: "destructive",
          });
          console.error("Error deleting shift:", error);
        },
      });
    }
  };

  const handleCreateShift = (data: any) => {
    // Check if data is in direct payload format (with start_time and end_time)
    if (data.start_time && data.end_time && data.doctor_id) {
      // Format dates for backend API
      const shiftData = {
        title: data.title || "Scheduled Shift",
        doctor_id: Number(data.doctor_id),
        start_time: formatDateForBackend(data.start_time),
        end_time: formatDateForBackend(data.end_time),
        description: data.description || "",
        status: data.status || "scheduled",
      };

      createMutation.mutate(shiftData, {
        onSuccess: () => {
          toast({
            title: "Shift created successfully",
            description: `New shift "${shiftData.title}" has been added to the schedule.`,
            className: "bg-green-50 text-green-800 border-green-200",
          });
          setIsAddShiftOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Failed to create shift",
            description: "An error occurred while creating the shift.",
            variant: "destructive",
          });
          console.error("Error creating shift:", error);
        },
      });

      return;
    }

    // Form data format (original implementation)
    // Ensure we have valid data
    if (!data.title || !data.doctorId || !data.date) {
      console.error("Missing required shift data");
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create a new date object to avoid mutating the original date
    const dateObj = new Date(data.date);
    const startTime = data.startTime ? data.startTime.split(":") : ["9", "0"];
    const endTime = data.endTime ? data.endTime.split(":") : ["17", "0"];

    const startDate = new Date(dateObj);
    startDate.setHours(
      parseInt(startTime[0] || 0),
      parseInt(startTime[1] || 0),
      0
    );

    const endDate = new Date(dateObj);
    endDate.setHours(parseInt(endTime[0] || 0), parseInt(endTime[1] || 0), 0);

    const shiftData = {
      title: data.title,
      doctor_id: Number(data.doctorId),
      start_time: formatDateForBackend(startDate),
      end_time: formatDateForBackend(endDate),
      description: data.description || "",
      status: data.status || "scheduled",
    };

    createMutation.mutate(shiftData, {
      onSuccess: () => {
        toast({
          title: "Shift created successfully",
          description: `New shift "${data.title}" has been added to the schedule.`,
          className: "bg-green-50 text-green-800 border-green-200",
        });
        setIsAddShiftOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Failed to create shift",
          description: "An error occurred while creating the shift.",
          variant: "destructive",
        });
        console.error("Error creating shift:", error);
      },
    });
  };

  const handleUpdateShift = (data: any) => {
    if (selectedShift) {
      // Ensure we have valid data
      if (!data.title || !data.doctorId || !data.date) {
        console.error("Missing required shift data");
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Create a new date object to avoid mutating the original date
      const dateObj = new Date(data.date);
      const startTime = data.startTime ? data.startTime.split(":") : ["9", "0"];
      const endTime = data.endTime ? data.endTime.split(":") : ["17", "0"];

      const startDate = new Date(dateObj);
      startDate.setHours(
        parseInt(startTime[0] || 0),
        parseInt(startTime[1] || 0),
        0
      );

      const endDate = new Date(dateObj);
      endDate.setHours(parseInt(endTime[0] || 0), parseInt(endTime[1] || 0), 0);

      const updatedData = {
        id: Number(selectedShift.id),
        data: {
          title: data.title,
          doctor_id: Number(data.doctorId),
          start_time: startDate,
          end_time: endDate,
          description: data.description || "",
          status: data.status || "scheduled",
        },
      };

      updateMutation.mutate(updatedData, {
        onSuccess: () => {
          toast({
            title: "Shift updated successfully",
            description: `The shift "${data.title}" has been updated.`,
            className: "bg-green-50 text-green-800 border-green-200",
          });
          setIsEditShiftOpen(false);
          setSelectedShift(null);
        },
        onError: (error) => {
          toast({
            title: "Failed to update shift",
            description: "An error occurred while updating the shift.",
            variant: "destructive",
          });
          console.error("Error updating shift:", error);
        },
      });
    }
  };

  const handleFilterByDoctor = (doctorId: string) => {
    setFilters({
      ...filters,
      doctorId: doctorId === "all" ? undefined : doctorId,
    });
  };

  const handleDateFilterChange = (
    type: "startDate" | "endDate",
    value: string
  ) => {
    setDateFilter((prev) => ({ ...prev, [type]: value }));
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleResetFilters = () => {
    setFilters({});
    setDateFilter({ startDate: "", endDate: "" });
    setStatusFilter("all");
    setSearchTerm("");
  };

  const getSelectedDoctor = () => {
    if (!selectedShift || !doctorsData?.data) return undefined;

    const doctor = doctorsData.data.find(
      (d: Doctor) =>
        d.doctor_id.toString() === selectedShift.doctor_id.toString()
    );

    return doctor;
  };

  // Count shifts by status for simple stats
  const scheduledShifts = filteredShifts.filter(
    (s) => s.status === "scheduled"
  ).length;
  const completedShifts = filteredShifts.filter(
    (s) => s.status === "completed"
  ).length;
  const cancelledShifts = filteredShifts.filter(
    (s) => s.status === "cancelled"
  ).length;

  // Handlers for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredShifts.length / itemsPerPage);

  const paginatedShifts = filteredShifts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
    {/* Header with gradient background */}
    <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8 text-white hover:bg-white/20 rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Schedule Management</h1>
              <p className="text-white/80 text-sm">
                {userRole === "admin"
                  ? "Manage doctor schedules and work shifts"
                  : "View your work schedule and upcoming shifts"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleUserRole}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-lg"
            >
              <User className="h-4 w-4 mr-2" />
              {userRole === "admin" ? "Doctor View" : "Admin View"}
            </Button>

            {userRole === "admin" && (
              <>
                <Button
                  onClick={() => setIsAddShiftOpen(true)}
                  size="sm"
                  className="bg-white hover:bg-white/90 text-[#2C78E4] rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shift
                </Button>
                
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search and filters section */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4B5563] h-4 w-4" />
              <Input
                placeholder="Search by shift name or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 rounded-lg focus:ring-[#2C78E4] focus:border-[#2C78E4]"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[160px] border-gray-200 rounded-lg">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-lg border-gray-200">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFilter({ startDate: "", endDate: "" });
                  setFilters({});
                }}
                className="rounded-lg border-gray-200 hover:bg-[#F9FAFB] hover:text-[#2C78E4] hover:border-[#2C78E4]"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-5 mb-6">
        {/* Main content area */}
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow>
              <TableHead className="font-medium text-[#111827]">
                Doctor
              </TableHead>
              <TableHead className="font-medium text-[#111827]">
                Date
              </TableHead>
              <TableHead className="font-medium text-[#111827]">
                Time
              </TableHead>
              <TableHead className="font-medium text-[#111827] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedShifts.map((shift) => {
              const doctor = doctorsData?.data?.find(
                (d: Doctor) =>
                  d.doctor_id.toString() === shift.doctor_id.toString()
              );
              return (
                <TableRow
                  key={shift.id}
                  className="hover:bg-[#F9FAFB] cursor-pointer"
                  onClick={() => handleViewShift(shift)}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2 text-[#2C78E4]" />
                      {doctor?.doctor_name || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(shift.start_time), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#2C78E4]" />
                      {format(new Date(shift.start_time), "HH:mm")} -{" "}
                      {format(new Date(shift.end_time), "HH:mm")}
                      <Badge
                        className={cn(
                          "ml-2 capitalize font-medium rounded-full",
                          shift.status === "scheduled" &&
                          "bg-blue-100 text-blue-800 hover:bg-blue-100",
                          shift.status === "completed" &&
                          "bg-green-100 text-green-800 hover:bg-green-100",
                          shift.status === "cancelled" &&
                          "bg-red-100 text-red-800 hover:bg-red-100"
                        )}
                      >
                        {shift.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewShift(shift);
                      }}
                      className="text-[#2C78E4] hover:text-[#2C78E4]/80 hover:bg-[#2C78E4]/5 rounded-lg"
                    >
                      View details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="border-t border-gray-100 px-4 py-3 bg-white rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[#4B5563]">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredShifts.length)} - {Math.min(currentPage * itemsPerPage, filteredShifts.length)} of {filteredShifts.length} shifts
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn("rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                
                return (
                  <Button
                    key={pageNum}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                      currentPage === pageNum
                        ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                        : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={cn("rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                  currentPage >= totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shift Dialog */}
      <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
        <DialogContent className="sm:max-w-[550px] border border-gray-200 bg-white">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-[#111827]">
              Add New Shift
            </DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              Create a new work shift for a doctor in the schedule
            </DialogDescription>
          </DialogHeader>
          <ShiftForm
            doctors={doctorsData?.data}
            onSubmit={handleCreateShift}
            onCancel={() => setIsAddShiftOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      {selectedShift && (
        <Dialog open={isEditShiftOpen} onOpenChange={setIsEditShiftOpen}>
          <DialogContent className="sm:max-w-[550px] border border-gray-200 bg-white">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-[#111827]">
                Edit Shift
              </DialogTitle>
              <DialogDescription className="text-[#4B5563]">
                Update the details of this work shift
              </DialogDescription>
            </DialogHeader>
            <ShiftForm
              shift={selectedShift}
              doctors={doctorsData?.data}
              onSubmit={handleUpdateShift}
              onCancel={() => setIsEditShiftOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Shift Dialog */}
      {selectedShift && (
        <ShiftDetailsDialog
          shift={selectedShift}
          doctor={getSelectedDoctor()}
          isOpen={isViewShiftOpen}
          onClose={() => setIsViewShiftOpen(false)}
          onEdit={userRole === "admin" ? handleEditShift : undefined}
          onDelete={userRole === "admin" ? handleDeleteShift : undefined}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default ScheduleManagement;
