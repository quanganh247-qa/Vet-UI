import React, { useState, useEffect } from "react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useDoctors } from "@/hooks/use-doctors";
import { useGetAllShifts, useShiftMutations } from "@/hooks/use-shifts";
import { cn } from "@/lib/utils";

const ScheduleManagement = () => {
  const [userRole, setUserRole] = useState<"doctor" | "admin">("admin");
  const [currentDoctorId, setCurrentDoctorId] = useState<string>("1");

  // State for UI
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [filters, setFilters] = useState<WorkScheduleFilters>({});
  const { toast } = useToast();
  
  // Fetch data using hooks
  const { data: doctorsData } = useDoctors();
  const { data: shiftsData, isLoading: shiftsLoading } = useGetAllShifts();
  const { createMutation, updateMutation, deleteMutation } = useShiftMutations();
  
  // State for filtered shifts
  const [filteredShifts, setFilteredShifts] = useState<WorkShift[]>([]);
  
  // Modal states
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isEditShiftOpen, setIsEditShiftOpen] = useState(false);
  const [isViewShiftOpen, setIsViewShiftOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
        (shift) => isAfter(new Date(shift.start_time), startDate) || 
                  format(new Date(shift.start_time), 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd')
      );
    }

    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (shift) => isBefore(new Date(shift.start_time), endDate) || 
                  format(new Date(shift.start_time), 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')
      );
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(
        (shift) => shift.status === statusFilter
      );
    }

    // For doctor view, only show their shifts
    if (userRole === "doctor") {
      filtered = filtered.filter((shift) => shift.doctor_id === currentDoctorId);
    }

    setFilteredShifts(filtered);
  }, [shiftsData, filters, dateFilter, statusFilter, userRole, currentDoctorId]);

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
        }
      });
    }
  };

  const handleCreateShift = (data: any) => {    
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
    const startTime = data.startTime ? data.startTime.split(':') : ['9', '0'];
    const endTime = data.endTime ? data.endTime.split(':') : ['17', '0'];
    
    const startDate = new Date(dateObj);
    startDate.setHours(parseInt(startTime[0] || 0), parseInt(startTime[1] || 0), 0);
    
    const endDate = new Date(dateObj);
    endDate.setHours(parseInt(endTime[0] || 0), parseInt(endTime[1] || 0), 0);
    
    const shiftData = {
      title: data.title,
      doctor_id: Number(data.doctorId),
      start_time: startDate,
      end_time: endDate,
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
      }
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
      const startTime = data.startTime ? data.startTime.split(':') : ['9', '0'];
      const endTime = data.endTime ? data.endTime.split(':') : ['17', '0'];
      
      const startDate = new Date(dateObj);
      startDate.setHours(parseInt(startTime[0] || 0), parseInt(startTime[1] || 0), 0);
      
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
        }
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
        }
      });
    }
  };

  const handleFilterByDoctor = (doctorId: string) => {
    setFilters({ ...filters, doctorId: doctorId === 'all' ? undefined : doctorId });
  };
  
  const handleDateFilterChange = (type: 'startDate' | 'endDate', value: string) => {
    setDateFilter(prev => ({ ...prev, [type]: value }));
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleResetFilters = () => {
    setFilters({});
    setDateFilter({ startDate: '', endDate: '' });
    setStatusFilter('all');
  };

  const getSelectedDoctor = () => {
    if (!selectedShift || !doctorsData?.data) return undefined;
    
    const doctor = doctorsData.data.find(
      (d: Doctor) => d.doctor_id.toString() === selectedShift.doctor_id.toString()
    );
    
    return doctor;
  };

  // Count shifts by status for simple stats
  const scheduledShifts = filteredShifts.filter(s => s.status === 'scheduled').length;
  const completedShifts = filteredShifts.filter(s => s.status === 'completed').length;
  const cancelledShifts = filteredShifts.filter(s => s.status === 'cancelled').length;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Simple header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-sm text-gray-500">
              {userRole === "admin" ? "Manage doctor schedules" : "View your work schedule"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleUserRole}
            >
              <User className="h-4 w-4 mr-2" />
              {userRole === "admin" ? "Doctor View" : "Admin View"}
            </Button>
            
            {userRole === 'admin' && (
              <Button 
                onClick={() => setIsAddShiftOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Shift
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Simple stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="text-2xl font-bold">{scheduledShifts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="text-2xl font-bold">{completedShifts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <X className="h-4 w-4 mr-2 text-red-500" />
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="text-2xl font-bold">{cancelledShifts}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content area */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <Tabs value={view} onValueChange={(value) => setView(value as 'calendar' | 'list')} className="w-full">
          {/* Tab controls and filters */}
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[280px] p-4">
                  {userRole === 'admin' && (
                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2">Doctor</p>
                      <Select 
                        value={filters.doctorId || 'all'} 
                        onValueChange={handleFilterByDoctor}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Doctors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Doctors</SelectItem>
                          {doctorsData?.data?.map((doctor: Doctor) => (
                            <SelectItem 
                              key={doctor.doctor_id} 
                              value={doctor.doctor_id.toString()}
                            >
                              {doctor.doctor_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-2">Date Range</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs mb-1">From</p>
                        <Input 
                          type="date" 
                          value={dateFilter.startDate}
                          onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <p className="text-xs mb-1">To</p>
                        <Input 
                          type="date" 
                          value={dateFilter.endDate}
                          onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-2">Status</p>
                    <Select 
                      value={statusFilter} 
                      onValueChange={handleStatusFilterChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                
                  <Button 
                    className="w-full mt-2"
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-2" />
                    Reset Filters
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Tab Content */}
          <TabsContent value="calendar" className="mt-2">
            <DoctorScheduleCalendar
              shifts={filteredShifts}
              doctors={doctorsData?.data}
              onClickShift={handleViewShift}
              userRole={userRole}
              currentDoctorId={currentDoctorId}
            />
          </TabsContent>
          
          <TabsContent value="list" className="mt-2">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShifts.length > 0 ? (
                  filteredShifts.map((shift) => {
                    const doctor = doctorsData?.data?.find(
                      (d: Doctor) => d.doctor_id.toString() === shift.doctor_id.toString()
                    );
                    
                    return (
                      <TableRow 
                        key={shift.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleViewShift(shift)}
                      >
                        <TableCell>{doctor?.doctor_name || "Unknown"}</TableCell>
                        <TableCell>{format(new Date(shift.start_time), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "capitalize",
                            shift.status === "scheduled" && "bg-blue-100 text-blue-800",
                            shift.status === "completed" && "bg-green-100 text-green-800",
                            shift.status === "cancelled" && "bg-red-100 text-red-800",
                          )}>
                            {shift.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewShift(shift);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                      No shifts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Shift Dialog */}
      <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Shift</DialogTitle>
            <DialogDescription>
              Create a new work shift for a doctor
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Shift</DialogTitle>
              <DialogDescription>
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
