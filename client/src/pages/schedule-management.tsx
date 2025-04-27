import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Plus,
  Filter,
  Calendar as CalendarIcon,
  RotateCcw,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Clock,
  Users,
  Calendar,
  FileText
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
  DropdownMenuLabel,
  DropdownMenuSeparator
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Doctor, WorkShift, WorkScheduleFilters, DoctorDetail } from "@/types";
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
import { useDoctors } from "@/hooks/use-doctors";
import { useGetAllShifts, useShiftMutations } from "@/hooks/use-shifts";

const ScheduleManagement = () => {
  const [userRole, setUserRole] = useState<"doctor" | "admin">("admin"); // For demo, toggle this to show different views
  const [currentDoctorId, setCurrentDoctorId] = useState<string>("1"); // In a real app, get from auth context

  // State for UI
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [filters, setFilters] = useState<WorkScheduleFilters>({});

  // Fetch data using hooks
  const { data: doctorsData } = useDoctors();
  const { data: shiftsData, isLoading: shiftsLoading } = useGetAllShifts();
  const { createMutation, updateMutation, deleteMutation } = useShiftMutations();
  
  // Derived state
  const [filteredShifts, setFilteredShifts] = useState<WorkShift[]>([]);

  // Modal states
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isEditShiftOpen, setIsEditShiftOpen] = useState(false);
  const [isViewShiftOpen, setIsViewShiftOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);

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

    if (filters.startDate) {
      filtered = filtered.filter(
        (shift) => new Date(shift.start_time) >= filters.startDate!
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (shift) => new Date(shift.start_time) <= filters.endDate!
      );
    }

  
    // For doctor view, only show their shifts
    if (userRole === "doctor") {
      filtered = filtered.filter((shift) => shift.doctor_id === currentDoctorId);
    }

    setFilteredShifts(filtered);
  }, [shiftsData, filters, userRole, currentDoctorId]);

  // For demo, toggle between doctor and admin views
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
          setIsViewShiftOpen(false);
          setSelectedShift(null);
        }
      });
    }
  };

  const handleCreateShift = (data: any) => {
    const shiftData = {
      title: data.title,
      doctor_id: Number(data.doctorId),
      start_time: new Date(
        data.date.setHours(
          parseInt(data.startTime.split(":")[0]),
          parseInt(data.startTime.split(":")[1])
        )
      ),
      end_time: new Date(
        data.date.setHours(
          parseInt(data.endTime.split(":")[0]),
          parseInt(data.endTime.split(":")[1])
        )
      ),
      description: data.description,
    };

    createMutation.mutate(shiftData, {
      onSuccess: () => {
        setIsAddShiftOpen(false);
      }
    });
  };

  const handleUpdateShift = (data: any) => {
    if (selectedShift) {
      const updatedData = {
        id: Number(selectedShift.id),
        data: {
          title: data.title,
          doctor_id: Number(data.doctorId),
          start_time: new Date(
            data.date.setHours(
              parseInt(data.startTime.split(":")[0]),
              parseInt(data.startTime.split(":")[1])
            )
          ),
          end_time: new Date(
            data.date.setHours(
              parseInt(data.endTime.split(":")[0]),
              parseInt(data.endTime.split(":")[1])
            )
          ),
          description: data.description,
        }
      };

      updateMutation.mutate(updatedData, {
        onSuccess: () => {
          setIsEditShiftOpen(false);
          setSelectedShift(null);
        }
      });
    }
  };

  const handleFilterByDoctor = (doctorId: string) => {
    setFilters({ ...filters, doctorId: doctorId === 'all' ? undefined : doctorId });
  };

  const handleFilterByStatus = (
    status: "scheduled" | "completed" | "cancelled" | "all" | ""
  ) => {
    setFilters({ ...filters, status: status === 'all' ? undefined : (status as any) });
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const getSelectedDoctor = () => {
    if (!selectedShift || !doctorsData?.data) return undefined;
    
    const doctor = doctorsData.data.find(
      (d: Doctor) => d.doctor_id.toString() === selectedShift.doctor_id.toString()
    );
    
    console.log("Found doctor for shift:", doctor);
    return doctor;
  };

  // Data for the list view
  const tableData = filteredShifts.map((shift) => {
    const doctor = doctorsData?.data?.find(
      (d : Doctor ) => d.doctor_id.toString() === shift.doctor_id
    );
    return {
      ...shift,
      doctorName: doctor ? doctor.doctor_name : "Unknown",
    };
  });

  // Define view steps
  const viewSteps = [
    { id: "calendar", label: "Calendar View", icon: Calendar },
    { id: "list", label: "List View", icon: FileText }
  ];
  
  const activeViewIndex = viewSteps.findIndex(step => step.id === view);
  const progressPercentage = ((activeViewIndex + 1) / viewSteps.length) * 100;

  // Count shifts by status
  const scheduledShifts = filteredShifts.filter(s => s.status === 'scheduled').length;
  const completedShifts = filteredShifts.filter(s => s.status === 'completed').length;
  const cancelledShifts = filteredShifts.filter(s => s.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Schedule Management</h1>
            <p className="text-indigo-100 text-sm">
              {userRole === "admin"
                ? "Manage doctor work schedules effectively"
                : "View your work schedule"}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleUserRole}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <User className="h-4 w-4 mr-2" />
              Switch to {userRole === "admin" ? "Doctor" : "Admin"} View
            </Button>

          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="bg-white rounded-lg border border-indigo-100 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-indigo-900">Doctor Schedule</h1>
            
            {userRole === 'admin' && (
              <Button 
                onClick={() => setIsAddShiftOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Shift
              </Button>
            )}
          </div>

          {/* Statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-indigo-700">
                  <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                  Total Shifts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-900">{filteredShifts.length}</div>
                <p className="text-xs text-indigo-500 mt-1">
                  {userRole === 'admin' ? 'Across all doctors' : 'Scheduled for you'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-indigo-700">
                  <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                  Scheduled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-900">{scheduledShifts}</div>
                <p className="text-xs text-indigo-500 mt-1">Upcoming shifts</p>
              </CardContent>
            </Card>
            
            <Card className="border border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-indigo-700">
                  <Users className="h-4 w-4 mr-2 text-indigo-500" />
                  Doctors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-900">{doctorsData?.data?.length || 0}</div>
                <p className="text-xs text-indigo-500 mt-1">Available for scheduling</p>
              </CardContent>
            </Card>
            
            <Card className="border border-indigo-100 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-indigo-700">
                  <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {scheduledShifts} scheduled
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {completedShifts} completed
                  </Badge>
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {cancelledShifts} cancelled
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow-style navigation */}
          <div className="flex flex-col space-y-3 mb-6">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                View Options
              </div>
              <div className="text-xs text-gray-500 font-medium">
                View {activeViewIndex + 1} of {viewSteps.length}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* View options as workflow steps */}
            <div className="flex justify-between items-center">
              <div className="relative flex items-center space-x-1 overflow-x-auto hide-scrollbar py-2 px-1">
                {viewSteps.map((step, index) => {
                  const isCurrent = step.id === view;
                  const isPast = index < activeViewIndex;
                  const isFuture = index > activeViewIndex;
                  const IconComponent = step.icon;
                  
                  return (
                    <React.Fragment key={step.id}>
                      <Button
                        variant={isCurrent ? "default" : "outline"}
                        size="sm"
                        className={`
                          flex items-center gap-1.5 whitespace-nowrap transition-all duration-200
                          ${isCurrent ? 'bg-indigo-600 text-white shadow-md border-transparent scale-105 hover:bg-indigo-700' : ''}
                          ${isPast ? 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : ''}
                          ${isFuture ? 'border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600' : ''}
                        `}
                        onClick={() => setView(step.id as 'calendar' | 'list')}
                      >
                        <IconComponent className={`h-4 w-4 ${isCurrent ? 'text-white' : isPast ? 'text-indigo-500' : 'text-gray-400'}`} />
                        <span className="text-xs font-medium">{step.label}</span>
                      </Button>
                      
                      {index < viewSteps.length - 1 && (
                        <ChevronRight className={`h-4 w-4 flex-shrink-0 ${
                          index < activeViewIndex ? 'text-indigo-400' : 'text-gray-300'
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Filter dropdown */}
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    {userRole === 'admin' && (
                      <div className="p-2">
                        <p className="text-sm font-medium mb-2">Doctor</p>
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
                  
                    
                    <DropdownMenuItem 
                      className="justify-center text-center cursor-pointer"
                      onClick={handleResetFilters}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Filters
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          {/* Main content tabs */}
          <Tabs value={view} onValueChange={(value) => setView(value as 'calendar' | 'list')} className="w-full">            
            <TabsContent value="calendar" className="mt-0">
              <div className="bg-white rounded-lg border border-indigo-100 overflow-hidden">
                <DoctorScheduleCalendar
                  shifts={filteredShifts}
                  doctors={doctorsData?.data}
                  onClickShift={handleViewShift}
                  userRole={userRole}
                  currentDoctorId={currentDoctorId}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              <Card className="border border-indigo-100 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-indigo-900">Work Shifts</CardTitle>
                  <CardDescription>
                    {filteredShifts.length} shifts found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-indigo-100">
                    <Table>
                      <TableHeader className="bg-indigo-50">
                        <TableRow>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.length > 0 ? (
                          tableData.map((shift) => (
                            <TableRow 
                              key={shift.id}
                              className="cursor-pointer hover:bg-indigo-50/30"
                              onClick={() => handleViewShift(shift)}
                            >
                              <TableCell>{shift.doctor_name}</TableCell>
                              <TableCell>{format(new Date(shift.start_time), 'PPP')}</TableCell>
                              <TableCell>
                                {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}
                              </TableCell>
                            
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewShift(shift);
                                  }}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-indigo-500">
                              No shifts found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Add Shift Dialog */}
      <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
        <DialogContent className="sm:max-w-[600px] border border-indigo-200">
          <DialogHeader>
            <DialogTitle className="text-indigo-900">Add New Shift</DialogTitle>
            <DialogDescription className="text-indigo-500">
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
          <DialogContent className="sm:max-w-[600px] border border-indigo-200">
            <DialogHeader>
              <DialogTitle className="text-indigo-900">Edit Shift</DialogTitle>
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
  );
};

export default ScheduleManagement;
