import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Filter,
  Calendar as CalendarIcon,
  RotateCcw,
  Loader2,
  ArrowLeft,
  UserCog,
} from 'lucide-react';

import CustomCalendar from '@/components/doctor-schedule/CustomCalendar';
import ShiftForm from '@/components/doctor-schedule/ShiftForm';
import ShiftDetailsDialog from '@/components/doctor-schedule/ShiftDetailsDialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Doctor, Shift, WorkShift, WorkScheduleFilters } from '@/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDoctors, useDoctorProfile } from '@/hooks/use-doctor';
import { useShifts, useShiftMutations } from '@/hooks/use-shifts';

const ShiftManagement = () => {
  // State management
  const [userRole, setUserRole] = useState<'doctor' | 'admin'>('doctor');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [filters, setFilters] = useState<WorkScheduleFilters>({});
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  
  // Dialog states
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isEditShiftOpen, setIsEditShiftOpen] = useState(false);
  const [isViewShiftOpen, setIsViewShiftOpen] = useState(false);

  // Data fetching
  const { data: doctorProfile, isLoading: profileLoading } = useDoctorProfile();
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors();
  const currentDoctorId = doctorProfile?.doctor_id;
  
  const { 
    data: shifts = [], 
    isLoading: shiftsLoading,
  } = useShifts(userRole === 'doctor' ? currentDoctorId : undefined);
  
  const { createMutation, deleteMutation } = useShiftMutations();

  // Derived data - Optimized using memoization
  const doctors = useMemo(() => {
    if (!doctorsData?.data) return [];
    
    return doctorsData.data.map((doctor: Doctor) => ({
      doctor_id: doctor.doctor_id,
      doctor_name: doctor.doctor_name,
      specialization: doctor.specialization,
      role: doctor.role,
    }));
  }, [doctorsData]);

  // Function to generate demo shifts for testing
  const generateDemoShifts = useMemo(() => {
    if (!doctors || doctors.length === 0) return [];
    
    const today = new Date();
    const demoShifts = [];
    
    // Create shifts for the next 7 days
    for (let i = -3; i < 4; i++) {
      const shiftDate = new Date(today);
      shiftDate.setDate(shiftDate.getDate() + i);
      
      // Morning shift
      const morningStart = new Date(shiftDate);
      morningStart.setHours(9, 0, 0, 0);
      
      const morningEnd = new Date(shiftDate);
      morningEnd.setHours(13, 0, 0, 0);
      
      demoShifts.push({
        id: 1000 + i * 2,
        doctor_id: doctors[0].doctor_id,
        start_time: morningStart,
        end_time: morningEnd,
        assigned_patients: 0,
        created_at: new Date(),
        title: "Morning Shift",
        status: "scheduled" as "scheduled" | "completed" | "cancelled",
        location: "Room 101",
        description: "Regular morning shift"
      });
      
      // Afternoon shift
      const afternoonStart = new Date(shiftDate);
      afternoonStart.setHours(14, 0, 0, 0);
      
      const afternoonEnd = new Date(shiftDate);
      afternoonEnd.setHours(18, 0, 0, 0);
      
      demoShifts.push({
        id: 1000 + i * 2 + 1,
        doctor_id: doctors.length > 1 ? doctors[1].doctor_id : doctors[0].doctor_id,
        start_time: afternoonStart,
        end_time: afternoonEnd,
        assigned_patients: 0,
        created_at: new Date(),
        title: "Afternoon Shift",
        status: "scheduled" as "scheduled" | "completed" | "cancelled",
        location: "Room 102",
        description: "Regular afternoon shift"
      });
    }
    
    return demoShifts;
  }, [doctors]);

  // Use demo shifts when no real shifts exist
  const effectiveShifts = useMemo(() => {
    if (shifts.length === 0 && !shiftsLoading && doctors.length > 0) {
      return generateDemoShifts;
    }
    return shifts;
  }, [shifts, shiftsLoading, generateDemoShifts, doctors]);

  // Use effective shifts for filtering - Optimized filter logic
  const filteredShifts = useMemo(() => {
    if (!effectiveShifts || !Array.isArray(effectiveShifts)) return [];
    
    let filtered = effectiveShifts.filter(shift => 
      shift && 
      shift.id && 
      shift.doctor_id && 
      shift.start_time && 
      shift.end_time
    );
  
    if (filters.doctorId) {
      filtered = filtered.filter(
        (shift) => shift.doctor_id?.toString() === filters.doctorId
      );
    }
  
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(
        (shift) => new Date(shift.start_time) >= startDate
      );
    }
  
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(
        (shift) => new Date(shift.start_time) <= endDate
      );
    }
  
    return filtered;
  }, [effectiveShifts, filters]);

  const tableData = useMemo(() => {
    return filteredShifts.map((shift) => {
      if (!shift || !shift.doctor_id) {
        return {
          ...shift,
          doctorName: 'Unknown'
        };
      }
  
      const doctor = doctors.find(
        (d: Doctor) => d.doctor_id?.toString() === shift.doctor_id?.toString()
      );
      
      return {
        ...shift,
        doctorName: doctor ? doctor.doctor_name : 'Unknown',
      };
    });
  }, [filteredShifts, doctors]);

  // Event handlers - Optimized with useCallback
  const handleToggleUserRole = useCallback(() => {
    setUserRole((prev) => (prev === 'doctor' ? 'admin' : 'doctor'));
  }, []);

  const handleViewShift = useCallback((shift: Shift) => {
    setSelectedShift(shift);
    setIsViewShiftOpen(true);
  }, []);

  const handleEditShift = useCallback(() => {
    setIsViewShiftOpen(false);
    setIsEditShiftOpen(true);
  }, []);

  const handleDeleteShift = useCallback(() => {
    if (!selectedShift) return;

    deleteMutation.mutate(selectedShift.id, {
      onSuccess: () => {
        setIsViewShiftOpen(false);
        setSelectedShift(null);
      }
    });
  }, [selectedShift, deleteMutation]);

  const handleCreateShift = useCallback((data: any) => {
    const shiftData = {
      start_time: new Date(
        data.date.setHours(
          parseInt(data.startTime.split(':')[0]),
          parseInt(data.startTime.split(':')[1])
        )
      ),
      end_time: new Date(
        data.date.setHours(
          parseInt(data.endTime.split(':')[0]),
          parseInt(data.endTime.split(':')[1])
        )
      ),
      doctor_id: parseInt(data.doctorId),
      title: data.title,
      status: data.status,
      location: data.location,
      description: data.description,
    };

    createMutation.mutate(shiftData, {
      onSuccess: () => {
        setIsAddShiftOpen(false);
      },
    });
  }, [createMutation]);

  const handleFilterByDoctor = useCallback((doctorId: string) => {
    setFilters(prev => ({ ...prev, doctorId: doctorId === 'all' ? undefined : doctorId }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handleChangeView = useCallback((value: string) => {
    setView(value as 'calendar' | 'list');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    window.history.back();
  }, []);

  // Helper functions
  const getSelectedDoctor = useCallback(() => {
    if (!selectedShift) return undefined;
    return doctors.find(
      (d: Doctor) => d.doctor_id.toString() === selectedShift.doctor_id.toString()
    );
  }, [selectedShift, doctors]);

  const convertToWorkShift = useCallback((shift: Shift): WorkShift => ({
    id: shift.id.toString(),
    title: shift.title || `Shift #${shift.id}`,
    start_time: shift.start_time,
    end_time: shift.end_time,
    doctor_id: shift.doctor_id?.toString(),
    status: shift.status || 'scheduled',
    location: shift.location,
    description: shift.description,
    created_at: shift.created_at,
  }), []);

  // Loading state
  if (profileLoading || doctorsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading schedule data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with gradient background - consistent with other workflow pages */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
            onClick={handleBackToDashboard}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-white font-semibold text-lg">
              Shift Management
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleUserRole}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
          >
            <UserCog className="h-4 w-4 mr-1" />
            <span>Switch to {userRole === 'admin' ? 'Doctor' : 'Admin'} View</span>
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Tabs value={view} onValueChange={handleChangeView} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                List View
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsAddShiftOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {userRole === 'admin' ? 'Add Shift' : 'Schedule Shift'}
              </Button>

              {userRole === 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[250px] p-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Doctor</p>
                        <Select
                          value={filters.doctorId || 'all'}
                          onValueChange={handleFilterByDoctor}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Doctors" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Doctors</SelectItem>
                            {doctors?.map((doctor: Doctor) => (
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

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleResetFilters}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset Filters
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <TabsContent value="calendar" className="mt-6">
            {shiftsLoading ? (
              <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/20">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading shifts...</p>
                </div>
              </div>
            ) : filteredShifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">No shifts found</p>
                <Button 
                  variant="link" 
                  onClick={() => setIsAddShiftOpen(true)}
                  className="mt-2"
                >
                  Create a new shift
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <CustomCalendar
                  shifts={filteredShifts.map(shift => ({
                    ...convertToWorkShift(shift),
                    start_time: new Date(shift.start_time),
                    end_time: new Date(shift.end_time)
                  }))}
                  doctors={doctors}
                  onClickShift={(workShift) => {
                    const shift = shifts.find(s => s.id.toString() === workShift.id);
                    if (shift) handleViewShift(shift);
                  }}
                  userRole={userRole}
                  currentDoctorId={currentDoctorId}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <Card className="border shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle>Work Shifts</CardTitle>
                <CardDescription>
                  {filteredShifts.length} {filteredShifts.length === 1 ? 'shift' : 'shifts'} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shift ID</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData?.length > 0 ? (
                        tableData.map((shift) => (
                          <TableRow
                            key={shift.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleViewShift(shift)}
                          >
                            <TableCell className="font-medium">#{shift.id}</TableCell>
                            <TableCell>{shift.doctorName}</TableCell>
                            <TableCell>{format(new Date(shift.start_time), 'PPP')}</TableCell>
                            <TableCell>
                              {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                ${(shift.status ?? 'scheduled') === 'completed' ? 'bg-green-100 text-green-800' : 
                                  (shift.status ?? 'scheduled') === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                  'bg-blue-100 text-blue-800'}`}
                              >
                                {shift.status ?? 'scheduled'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewShift(shift);
                                }}
                                className="hover:bg-muted rounded-full"
                                aria-label={`View shift ${shift.id}`}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <p className="text-muted-foreground">No shifts found</p>
                              <Button
                                variant="link"
                                onClick={() => setIsAddShiftOpen(true)}
                                className="text-sm"
                              >
                                Create a new shift
                              </Button>
                            </div>
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
            <DialogTitle>
              {userRole === 'admin' ? 'Add New Shift' : 'Schedule Your Shift'}
            </DialogTitle>
            <DialogDescription>
              {userRole === 'admin'
                ? 'Create a new work shift for a doctor'
                : 'Schedule your work shift'}
            </DialogDescription>
          </DialogHeader>
          <ShiftForm
            doctors={userRole === 'admin' ? doctors : [{
              doctor_id: Number(currentDoctorId),
              doctor_name: doctorProfile?.doctor_name || '',
              specialization: doctorProfile?.specialization || '',
              role: doctorProfile?.role || '',
            }]}
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
              shift={convertToWorkShift(selectedShift)}
              doctors={userRole === 'admin' ? doctors : [{
                doctor_id: Number(currentDoctorId),
                doctor_name: doctorProfile?.doctor_name || '',
                specialization: doctorProfile?.specialization || '',
                role: doctorProfile?.role || '',
              }]}
              onSubmit={() => setIsEditShiftOpen(false)}
              onCancel={() => setIsEditShiftOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Shift Dialog */}
      {selectedShift && (
        <ShiftDetailsDialog
          shift={convertToWorkShift(selectedShift)}
          doctor={getSelectedDoctor()}
          isOpen={isViewShiftOpen}
          onClose={() => setIsViewShiftOpen(false)}
          onEdit={handleEditShift}
          onDelete={userRole === 'admin' ? handleDeleteShift : undefined}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default ShiftManagement;