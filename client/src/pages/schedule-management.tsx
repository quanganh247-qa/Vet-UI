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


  // Format dates as "YYYY-MM-DD HH:MM:SS" for backend compatibility
  const formatDateForBackend = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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

      // Log detailed time information for debugging
      console.log("Creating shift with payload:", shiftData);
      console.log(JSON.stringify(shiftData, null, 2));
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
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Schedule Management
            </h1>
            <p className="text-indigo-100 text-sm">
              {userRole === "admin"
                ? "Manage doctor schedules and work shifts"
                : "View your work schedule and upcoming shifts"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleUserRole}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <User className="h-4 w-4 mr-2" />
              {userRole === "admin" ? "Doctor View" : "Admin View"}
            </Button>

            {userRole === "admin" && (
              <>
                <Button
                  onClick={() => setIsAddShiftOpen(true)}
                  size="sm"
                  className="bg-white hover:bg-white/90 text-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shift
                </Button>
                <Button
                  onClick={() => {
                    // Create afternoon shift with explicit time values
                    const today = new Date();
                    const shiftDate = new Date(today);
                    shiftDate.setHours(13, 0, 0, 0); // 1:00 PM

                    const endDate = new Date(today);
                    endDate.setHours(17, 0, 0, 0); // 5:00 PM

                    addShiftWithPayload({
                      start_time: formatDateForBackend(shiftDate),
                      end_time: formatDateForBackend(endDate),
                      doctor_id: 2,
                      title: "Afternoon Shift (1PM-5PM)"
                    });
                  }}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white ml-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Afternoon Shift
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-indigo-100 p-5 mb-6">
        {/* Main content area */}
        <Table>
          <TableHeader className="bg-indigo-50">
            <TableRow>
              <TableHead className="font-medium text-indigo-900">
                Doctor
              </TableHead>
              <TableHead className="font-medium text-indigo-900">
                Date
              </TableHead>
              <TableHead className="font-medium text-indigo-900">
                Time
              </TableHead>
              <TableHead className="font-medium text-indigo-900 text-right">
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
                  className="hover:bg-indigo-50/50 cursor-pointer"
                  onClick={() => handleViewShift(shift)}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2 text-indigo-500" />
                      {doctor?.doctor_name || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(shift.start_time), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      {format(new Date(shift.start_time), "HH:mm")} -{" "}
                      {format(new Date(shift.end_time), "HH:mm")}
                      <Badge
                        className={cn(
                          "ml-2 capitalize font-medium",
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
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                    >
                      View details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Add Shift Dialog */}
        <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
          <DialogContent className="sm:max-w-[550px] border border-indigo-200 bg-white">
            <DialogHeader className="border-b border-indigo-100 pb-4">
              <DialogTitle className="text-indigo-900">
                Add New Shift
              </DialogTitle>
              <DialogDescription className="text-indigo-500">
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
            <DialogContent className="sm:max-w-[550px] border border-indigo-200 bg-white">
              <DialogHeader className="border-b border-indigo-100 pb-4">
                <DialogTitle className="text-indigo-900">
                  Edit Shift
                </DialogTitle>
                <DialogDescription className="text-indigo-500">
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
    </div>
  );
};

export default ScheduleManagement;
