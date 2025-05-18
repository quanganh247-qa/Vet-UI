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
  Layers,
} from 'lucide-react';

import CustomCalendar from '@/components/doctor-schedule/CustomCalendar';
import ShiftForm from '@/components/doctor-schedule/ShiftForm';
import ShiftDetailsDialog from '@/components/doctor-schedule/ShiftDetailsDialog';
import ShiftTemplateManager, { ShiftTemplate, defaultShiftTemplates } from '@/components/doctor-schedule/ShiftTemplateManager';
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
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  
  // Template state
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>(defaultShiftTemplates);

  // Data fetching
  const { data: doctorProfile, isLoading: profileLoading } = useDoctorProfile();
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors();
  const currentDoctorId = doctorProfile?.doctor_id;
  
  const { 
    data: shifts = [], 
    isLoading: shiftsLoading,
  } = useShifts(currentDoctorId);
  
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

  const handleOpenTemplateManager = useCallback(() => {
    setIsTemplateManagerOpen(true);
  }, []);

  // Helper functions
  const getSelectedDoctor = useCallback(() => {
    if (!selectedShift || !selectedShift.doctor_id) return undefined;
    
    // More robust doctor lookup with console logging for debugging
    const doctor = doctors?.find((d: Doctor) => 
      d.doctor_id && selectedShift.doctor_id && 
      d.doctor_id.toString() === selectedShift.doctor_id.toString()
    );
    
    return doctor;
  }, [selectedShift, doctors]);

  const convertToWorkShift = useCallback((shift: Shift): WorkShift => {
    if (!shift) {
      console.error('Attempted to convert undefined shift');
      return {
        id: 'unknown',
        title: 'Unknown Shift',
        start_time: new Date(),
        end_time: new Date(),
        // date: '',
        doctor_id: '',
        doctor_name: 'Unknown Doctor',
        status: 'scheduled',
        created_at: new Date()
      };
    }
    
    // Find doctor with proper type conversion for IDs
    const doctor = doctors.find((d: Doctor) => 
      d.doctor_id && shift.doctor_id && 
      d.doctor_id.toString() === shift.doctor_id.toString()
    );

    // Ensure all fields are properly set
    return {
      id: shift.id ? shift.id.toString() : 'unknown',
      title: shift.title || `Shift #${shift.id || 'New'}`,
      start_time: shift.start_time || new Date(),
      end_time: shift.end_time || new Date(),
      doctor_id: shift.doctor_id ? shift.doctor_id.toString() : '',
      doctor_name: doctor ? doctor.doctor_name : 'Unknown Doctor',
      status: shift.status || 'scheduled',
      location: shift.location || 'Not specified',
      description: shift.description || '',
      created_at: shift.created_at || new Date(),
    };
  }, [doctors]);

  // Loading state
  if (profileLoading || doctorsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4] mb-4" />
          <p className="text-[#4B5563] font-medium">Loading schedule data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    {/* Header with gradient background */}
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8 text-white hover:bg-white/20 rounded-full"
              onClick={handleBackToDashboard}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Shift Management</h1>
              <p className="text-white/80 text-sm">
                {userRole === "admin"
                  ? "Manage doctor shifts and schedules"
                  : "View your work shifts and schedule"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleToggleUserRole}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5 rounded-lg"
            >
              <UserCog className="h-4 w-4 mr-1" />
              <span>{userRole === 'admin' ? 'Doctor View' : 'Admin View'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-white pb-3 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-[#111827]">
              Manage Shifts
            </CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={view} onValueChange={handleChangeView} className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="calendar" className="flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-1.5">
                    <Filter className="h-4 w-4" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 border-gray-200 rounded-lg">
                    <Filter className="h-4 w-4 text-[#4B5563]" />
                    <span>Filter Doctor</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white border-gray-200 rounded-lg shadow-md w-[220px]">
                  <DropdownMenuItem 
                    onClick={() => handleFilterByDoctor('all')}
                    className="cursor-pointer hover:bg-[#F9FAFB] text-[#111827]"
                  >
                    All Doctors
                  </DropdownMenuItem>
                  {doctors?.map((doctor: Doctor) => (
                    <DropdownMenuItem
                      key={doctor.doctor_id}
                      onClick={() => handleFilterByDoctor(doctor.doctor_id.toString())}
                      className="cursor-pointer hover:bg-[#F9FAFB] text-[#111827]"
                    >
                      {doctor.doctor_name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="icon"
                onClick={handleResetFilters}
                className="border-gray-200 rounded-lg hover:bg-[#F9FAFB] hover:text-[#2C78E4] hover:border-[#2C78E4]/50"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsAddShiftOpen(true)}
                className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Shift
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2 border-gray-200 rounded-lg hover:bg-[#F9FAFB] hover:border-[#2C78E4]/50"
                onClick={handleOpenTemplateManager}
              >
                <Layers className="h-4 w-4 text-[#4B5563]" />
                <span>Templates</span>
              </Button>
            </div>
          </div>

          {shiftsLoading ? (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-[#F9FAFB]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#2C78E4]" />
                <p className="text-[#4B5563]">Loading shifts...</p>
              </div>
            </div>
          ) : (
            <>
              {view === 'calendar' && (
                <>
                  {filteredShifts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-[#F9FAFB]">
                      <p className="text-[#4B5563]">No shifts found</p>
                      <Button 
                        variant="link" 
                        onClick={() => setIsAddShiftOpen(true)}
                        className="mt-2 text-[#2C78E4]"
                      >
                        Create a new shift
                      </Button>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      <CustomCalendar
                        shifts={filteredShifts.map(shift => convertToWorkShift(shift))}
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
                </>
              )}

              {view === 'list' && (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[#F9FAFB]">
                      <TableRow>
                        <TableHead className="font-medium text-[#111827]">Shift ID</TableHead>
                        <TableHead className="font-medium text-[#111827]">Doctor</TableHead>
                        <TableHead className="font-medium text-[#111827]">Date</TableHead>
                        <TableHead className="font-medium text-[#111827]">Time</TableHead>
                        <TableHead className="font-medium text-[#111827]">Status</TableHead>
                        <TableHead className="font-medium text-[#111827] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData?.length > 0 ? (
                        tableData.map((shift) => (
                          <TableRow
                            key={shift.id}
                            className="cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                            onClick={() => handleViewShift(shift)}
                          >
                            <TableCell className="font-medium text-[#111827]">#{shift.id}</TableCell>
                            <TableCell className="text-[#111827]">{shift.doctorName}</TableCell>
                            <TableCell className="text-[#111827]">{format(new Date(shift.start_time), 'MMM d, yyyy')}</TableCell>
                            <TableCell className="text-[#111827]">
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
                                className="hover:bg-[#F9FAFB] rounded-lg text-[#2C78E4]"
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
                              <p className="text-[#4B5563]">No shifts found</p>
                              <Button
                                variant="link"
                                onClick={() => setIsAddShiftOpen(true)}
                                className="text-sm text-[#2C78E4]"
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
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Shift Dialog */}
      <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 rounded-lg">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-[#111827]">
              {userRole === 'admin' ? 'Add New Shift' : 'Schedule Your Shift'}
            </DialogTitle>
            <DialogDescription className="text-[#4B5563]">
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
            templates={shiftTemplates}
            onSubmit={handleCreateShift}
            onCancel={() => setIsAddShiftOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      {selectedShift && (
        <Dialog open={isEditShiftOpen} onOpenChange={setIsEditShiftOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 rounded-lg">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <DialogTitle className="text-[#111827]">Edit Shift</DialogTitle>
              <DialogDescription className="text-[#4B5563]">
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

      {/* Template Manager Dialog */}
      <Dialog open={isTemplateManagerOpen} onOpenChange={setIsTemplateManagerOpen}>
        <DialogContent className="sm:max-w-[800px] bg-white border border-gray-200 rounded-lg">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-[#111827]">Shift Templates</DialogTitle>
            <DialogDescription className="text-[#4B5563]">
              Manage predefined shift templates for quick scheduling
            </DialogDescription>
          </DialogHeader>
          <ShiftTemplateManager
            templates={shiftTemplates}
            onAddTemplate={(template) => {
              setShiftTemplates(prev => [...prev, template]);
            }}
            onEditTemplate={(id, template) => {
              setShiftTemplates(prev => 
                prev.map(t => t.id === id ? template : t)
              );
            }}
            onDeleteTemplate={(id) => {
              setShiftTemplates(prev => prev.filter(t => t.id !== id));
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftManagement;