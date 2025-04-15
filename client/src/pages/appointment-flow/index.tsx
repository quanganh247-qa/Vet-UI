import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Appointment, QueueItem, Room } from '@/types';
import { getAllAppointments } from '@/services/appointment-services';
import { getRooms } from '@/services/room-services';
import { 
  ArrowLeft, Calendar, Loader2, RefreshCw, UserCog, LogOut, 
  User, Settings, Plus, Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import EnhancedAppointmentFlowboard from '@/components/appointment/EnhancedAppointmentFlowboard';
import { useListAppointmentsQueue } from '@/hooks/use-appointment';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
  const [, setSidebarContent] = useState('queue');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(
    id ? parseInt(id) : null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { doctor, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch appointments data
  const { 
    data: appointmentsData, 
    isLoading: isLoadingAppointments,
    refetch: refetchAppointments 
  } = useQuery({
    queryKey: ['appointments', selectedDate.toISOString().split('T')[0], currentPage, pageSize],
    queryFn: () => getAllAppointments(selectedDate, "false", currentPage, pageSize),
    enabled: true,
  });
  
  // Fetch rooms data
  const { 
    data: roomsData, 
    isLoading: isLoadingRooms 
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    enabled: true,
  });
  
  const appointments = appointmentsData?.data || [];
  const totalAppointments = appointmentsData?.total || 0;
  const totalPages = Math.ceil(totalAppointments / pageSize);
  const rooms = roomsData?.data || [];
  
  // Generate queue data based on appointments
  const { data: queueData } = useListAppointmentsQueue();

  // Mock staff data until connected to backend
  const staff = [
    { id: 1, name: 'Dr. Smith', role: 'Veterinarian', status: 'Available', avatar: '' },
    { id: 2, name: 'Dr. Johnson', role: 'Veterinarian', status: 'Busy', avatar: '' },
    { id: 3, name: 'Sarah Wilson', role: 'Technician', status: 'Available', avatar: '' },
    { id: 4, name: 'Mike Brown', role: 'Assistant', status: 'Busy', avatar: '' },
  ];
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
      setCurrentPage(1); // Reset to first page when changing date
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  // Update state after appointment is processed
  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      // Here you would make API call to update status
      // For now simulating locally
      const updatedAppointments = appointments.map((appointment: Appointment) => {
        if (appointment.id === appointmentId) {
          return { ...appointment, state: newStatus };
        }
        return appointment;
      });
      
      // Update cache and trigger refresh
      queryClient.setQueryData(['appointments', selectedDate.toISOString().split('T')[0], currentPage, pageSize], {
        ...appointmentsData,
        data: updatedAppointments
      });
      
      // Invalidate related queries to ensure fresh data 
      await invalidateRelatedQueries([
        'appointments',
        'rooms'
      ]);
      
      // Select the next patient if the current one was completed
      if (newStatus === 'Completed' && selectedAppointmentId === appointmentId) {
        const nextPatient = queueData?.[0]?.id;
        if (nextPatient) {
          setSelectedAppointmentId(nextPatient);
        } else {
          setSelectedAppointmentId(null);
        }
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  // Effect to show appointment details when ID is provided in URL
  useEffect(() => {
    if (id && parseInt(id) > 0) {
      setSelectedAppointmentId(parseInt(id));
      setSidebarContent('details');
      setShowSidebar(true);
    }
  }, [id]);

  const handleAppointmentClick = (id: number) => {
    setSelectedAppointmentId(id);
    setSidebarContent('details');
    setShowSidebar(true);
    
    // Update URL without page reload
    navigate(`/appointment-flow/${id}`, { replace: true });
  };

  const handleNewAppointment = () => {
    setSelectedAppointmentId(null);
    setSidebarContent('new');
    setShowSidebar(true);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetchAppointments();
      await invalidateRelatedQueries([
        'appointments',
        'rooms'
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Show loading state
  if (isLoadingAppointments || isLoadingRooms) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-indigo-600 font-medium">Loading appointment data...</p>
      </div>
    );
  }

  // Rendering the mobile menu
  const renderMobileMenu = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
        <div className="flex items-center">
          <UserCog className="h-5 w-5 mr-2 text-indigo-600" />
          <span className="font-medium">Dr. {doctor?.username || 'User'}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex items-center bg-indigo-50 rounded-md p-3 mb-3">
        <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          className="text-sm bg-transparent border-none focus:outline-none w-full"
        />
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full flex items-center justify-center gap-1.5 mb-3"
        onClick={handleRefreshData}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh Data
      </Button>
      
      <Button 
        size="sm" 
        className="w-full bg-indigo-600 text-white mb-3" 
        onClick={handleNewAppointment}
      >
        <Plus className="h-4 w-4 mr-1" /> New Appointment
      </Button>
      
      <div className="border-t border-gray-100 pt-3">
        <Button variant="ghost" size="sm" className="w-full justify-start text-left" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        
        <Button variant="ghost" size="sm" className="w-full justify-start text-left mt-1">
          <User className="h-4 w-4 mr-2" />
          Profile Settings
        </Button>
        
        <Button variant="ghost" size="sm" className="w-full justify-start text-left mt-1">
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-left text-red-500 mt-1"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 md:px-6 max-w-[100vw]">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-3 sm:px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          {/* Top row with title and mobile menu button */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-white flex items-center hover:bg-white/10 rounded-lg px-2 py-1 md:px-3 md:py-2 transition-all mr-2 md:mr-4 md:block hidden">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {/* <span className="text-sm font-medium">Back</span> */}
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-white">Appointment Flow</h1>
              {doctor && (
                <Badge className="ml-2 md:ml-4 bg-white/20 text-white hover:bg-white/30 hidden sm:inline-flex">
                  Dr. {doctor.username}
                </Badge>
              )}
            </div>
            
            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:max-w-none">
                {renderMobileMenu()}
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Controls row - hidden on mobile, shown in dropdown */}
          <div className="hidden md:flex items-center space-x-3">
            {/* <div className="flex items-center bg-white/10 text-white border-white/20 rounded-md px-3 py-1">
              <Calendar className="h-4 w-4 text-white/70 mr-2" />
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="text-sm bg-transparent border-none focus:outline-none text-white"
              />
            </div> */}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/30 flex items-center gap-1.5"
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <UserCog className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">My Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* <Button size="sm" className="bg-white text-indigo-700 hover:bg-white/90" onClick={handleNewAppointment}>
              <Plus className="h-4 w-4 mr-1" /> 
              <span className="hidden sm:inline">New Appointment</span>
            </Button> */}
          </div>
        </div>
      </div>
      
      {/* Appointment Flow Board */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center">
              <CardTitle className="text-base md:text-lg font-semibold text-indigo-900">Appointment Flow Management</CardTitle>
            </div>
            
            {/* Status summary as badges */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-1 text-xs">
                Completed: {appointments.filter(a => a.state === 'Completed').length}
              </Badge>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-2 py-1 text-xs">
                In Progress: {appointments.filter(a => a.state === 'In Progress').length}
              </Badge>
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 px-2 py-1 text-xs">
                Waiting: {appointments.filter(a => a.state === 'Scheduled').length}
              </Badge>
              <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-2 py-1 text-xs">
                Total: {totalAppointments}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-2 sm:p-4 md:p-6 overflow-x-auto">
          {/* Flowboard takes up full width */}
          <div className="min-w-[600px]"> {/* Minimum width to prevent squeezing */}
            <EnhancedAppointmentFlowboard
              appointments={appointments}
              doctors={staff.map(s => ({
                doctor_id: s.id,
                doctor_name: s.name,
                doctor_phone: '',
                doctor_email: '',
                doctor_specialty: s.role,
                doctor_avatar: s.avatar || ''
              }))}
              rooms={rooms}
              onAppointmentUpdate={(appointment) => handleStatusChange(appointment.id, appointment.state)}
              onAppointmentCreate={handleNewAppointment}
              onAppointmentDelete={() => {}} // This is kept but will be ignored in the component
            />
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, totalAppointments)} to{" "}
                  {Math.min(currentPage * pageSize, totalAppointments)} of {totalAppointments} appointments
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-20 h-8 text-xs">
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
                  className="h-8 w-8 p-0 flex items-center justify-center"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    const pageNum = totalPages <= 5 
                      ? i + 1 
                      : currentPage <= 3 
                        ? i + 1 
                        : currentPage >= totalPages - 2 
                          ? totalPages - 4 + i 
                          : currentPage - 2 + i;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-8 w-8 p-0 ${
                          currentPage === pageNum 
                            ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                            : ""
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
                  className="h-8 w-8 p-0 flex items-center justify-center"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentFlow;