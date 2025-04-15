import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Plus,
  Filter,
  Calendar as CalendarIcon,
  RotateCcw,
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
  CardDescription,
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

// Mock data - replace with actual API calls
const mockDoctors: Doctor[] = [
  {
    doctor_id: 1,
    doctor_name: "Dr. John Smith",
    doctor_specialty: "Surgery",
    doctor_phone: "123-456-7890",
    doctor_email: "john.smith@vetclinic.com",
    role: "senior",
  },
  {
    doctor_id: 2,
    doctor_name: "Dr. Maria Garcia",
    doctor_specialty: "Internal Medicine",
    doctor_phone: "123-456-7891",
    doctor_email: "maria.garcia@vetclinic.com",
    role: "senior",
  },
  {
    doctor_id: 3,
    doctor_name: "Dr. Sarah Johnson",
    doctor_specialty: "Dermatology",
    doctor_phone: "123-456-7892",
    doctor_email: "sarah.johnson@vetclinic.com",
    role: "junior",
  },
];

const mockShifts: WorkShift[] = [
  {
    id: "1",
    title: "Morning Shift",
    start_time: new Date(new Date().setHours(8, 0, 0, 0)),
    end_time: new Date(new Date().setHours(16, 0, 0, 0)),
    doctor_id: "1",
    status: "scheduled",
    location: "Main Building, Room 101",
    created_at: new Date(new Date().setDate(new Date().getDate() - 7)),
  },
  {
    id: "2",
    title: "Evening Shift",
    start_time: new Date(new Date().setHours(16, 0, 0, 0)),
    end_time: new Date(new Date().setHours(24, 0, 0, 0)),
    doctor_id: "2",
    status: "scheduled",
    location: "Main Building, Room 102",
    created_at: new Date(new Date().setDate(new Date().getDate() - 7)),
  },
  {
    id: "3",
    title: "Surgery Shift",
    start_time: new Date(new Date().setDate(new Date().getDate() + 1)),
    end_time: new Date(new Date().setDate(new Date().getDate() + 1)),
    doctor_id: "1",
    status: "scheduled",
    description: "Scheduled for surgeries only",
    location: "Surgery Wing, Room 3",
    created_at: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
  {
    id: "4",
    title: "Weekend Shift",
    start_time: new Date(new Date().setDate(new Date().getDate() + 3)),
    end_time: new Date(new Date().setDate(new Date().getDate() + 3)),
    doctor_id: "3",
    status: "scheduled",
    location: "Main Building, Reception",
    created_at: new Date(new Date().setDate(new Date().getDate() - 14)),
  },
];

const ScheduleManagement = () => {
  const [userRole, setUserRole] = useState<"doctor" | "admin">("admin"); // For demo, toggle this to show different views
  const [currentDoctorId, setCurrentDoctorId] = useState<string>("1"); // In a real app, get from auth context

  // State for UI
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [shifts, setShifts] = useState<WorkShift[]>(mockShifts);
  const [filteredShifts, setFilteredShifts] = useState<WorkShift[]>(mockShifts);
  const [filters, setFilters] = useState<WorkScheduleFilters>({});

  // Modal states
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isEditShiftOpen, setIsEditShiftOpen] = useState(false);
  const [isViewShiftOpen, setIsViewShiftOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);

  useEffect(() => {
    // Apply filters
    let filtered = [...shifts];

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

    if (filters.status) {
      filtered = filtered.filter((shift) => shift.status === filters.status);
    }

    // For doctor view, only show their shifts
    if (userRole === "doctor") {
      filtered = filtered.filter((shift) => shift.doctor_id === currentDoctorId);
    }

    setFilteredShifts(filtered);
  }, [shifts, filters, userRole, currentDoctorId]);

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
      // In a real app, call API to delete shift
      setShifts(shifts.filter((s) => s.id !== selectedShift.id));
      setIsViewShiftOpen(false);
      setSelectedShift(null);
    }
  };

  const handleCreateShift = (data: any) => {
    // In a real app, call API to create shift
    const newShift: WorkShift = {
      id: Math.random().toString(36).substring(7),
      title: data.title,
      doctor_id: data.doctor_id,
      start_time: new Date(
        data.date.setHours(
          parseInt(data.start_time.split(":")[0]),
          parseInt(data.start_time.split(":")[1])
        )
      ),
      end_time: new Date(
        data.date.setHours(
          parseInt(data.end_time.split(":")[0]),
          parseInt(data.end_time.split(":")[1])
        )
      ),
      status: data.status,
      location: data.location,
      description: data.description,
      created_at: new Date(),
    };

    setShifts([...shifts, newShift]);
    setIsAddShiftOpen(false);
  };

  const handleUpdateShift = (data: any) => {
    if (selectedShift) {
      // In a real app, call API to update shift
      const updatedShift: WorkShift = {
        ...selectedShift,
        title: data.title,
        doctor_id: data.doctor_id,
        start_time: new Date(
          data.date.setHours(
            parseInt(data.start_time.split(":")[0]),
            parseInt(data.start_time.split(":")[1])
          )
        ),
        end_time: new Date(
          data.date.setHours(
            parseInt(data.end_time.split(":")[0]),
            parseInt(data.end_time.split(":")[1])
          )
        ),
        status: data.status,
        location: data.location,
        description: data.description,
      };

      setShifts(
        shifts.map((s) => (s.id === selectedShift.id ? updatedShift : s))
      );
      setIsEditShiftOpen(false);
      setSelectedShift(null);
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
    if (!selectedShift) return undefined;
    return doctors.find(
      (d) => d.doctor_id.toString() === selectedShift.doctor_id
    );
  };

  // Data for the list view
  const tableData = filteredShifts.map((shift) => {
    const doctor = doctors.find(
      (d) => d.doctor_id.toString() === shift.doctor_id
    );
    return {
      ...shift,
      doctorName: doctor ? doctor.doctor_name : "Unknown",
    };
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schedule Management
          </h1>
          <p className="text-muted-foreground">
            {userRole === "admin"
              ? "Manage doctor work schedules effectively"
              : "View your work schedule"}
          </p>
        </div>

        {/* Toggle between admin/doctor view for demo purposes */}
        <Button variant="outline" onClick={toggleUserRole}>
          Switch to {userRole === "admin" ? "Doctor" : "Admin"} View
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Tabs value={view} onValueChange={(value) => setView(value as 'calendar' | 'list')} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="calendar">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="list">
                <Filter className="h-4 w-4 mr-2" />
                List View
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              {userRole === 'admin' && (
                <Button onClick={() => setIsAddShiftOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shift
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
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
                          {doctors?.map(doctor => (
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
                  
                  <div className="p-2 border-t">
                    <p className="text-sm font-medium mb-2">Status</p>
                    <Select 
                      value={filters.status || 'all'} 
                      onValueChange={(value) => handleFilterByStatus(value as any)}
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
          
          <TabsContent value="calendar">
            <DoctorScheduleCalendar
              shifts={filteredShifts}
              doctors={doctors}
              onClickShift={handleViewShift}
              userRole={userRole}
              currentDoctorId={currentDoctorId}
            />
          </TabsContent>
          
          <TabsContent value="list">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Work Shifts</CardTitle>
                <CardDescription>
                  {filteredShifts.length} shifts found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shift Title</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.length > 0 ? (
                        tableData.map((shift) => (
                          <TableRow 
                            key={shift.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleViewShift(shift)}
                          >
                            <TableCell>{shift.title}</TableCell>
                            <TableCell>{shift.doctorName}</TableCell>
                            <TableCell>{format(new Date(shift.start_time), 'PPP')}</TableCell>
                            <TableCell>
                              {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}
                            </TableCell>
                            <TableCell>{shift.location}</TableCell>
                            <TableCell>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                shift.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                shift.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {shift.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
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
                          <TableCell colSpan={7} className="h-24 text-center">
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
      
      {/* Add Shift Dialog */}
      <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Shift</DialogTitle>
            <DialogDescription>
              Create a new work shift for a doctor
            </DialogDescription>
          </DialogHeader>
          <ShiftForm
            doctors={doctors}
            onSubmit={handleCreateShift}
            onCancel={() => setIsAddShiftOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      {selectedShift && (
        <Dialog open={isEditShiftOpen} onOpenChange={setIsEditShiftOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Shift</DialogTitle>
              <DialogDescription>
                Update the details of this work shift
              </DialogDescription>
            </DialogHeader>
            <ShiftForm
              shift={selectedShift}
              doctors={doctors}
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
