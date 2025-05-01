import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Appointment, QueueItem, Room } from '@/types';
import { getAllAppointments } from '@/services/appointment-services';
import { getRooms } from '@/services/room-services';
import { 
  ArrowLeft, Calendar, Loader2, RefreshCw, UserCog, LogOut, 
  User, Settings, Plus, Menu, X, ChevronLeft, ChevronRight,
  Search, Filter, RotateCcw, Clock, FileText, Stethoscope,
  CheckCircle, PlusCircle, PawPrint, AlertCircle
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import EnhancedAppointmentFlowboard from '@/components/appointment/EnhancedAppointmentFlowboard';
import { useListAppointmentsQueue } from '@/hooks/use-appointment';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Utility function to invalidate related queries
const invalidateRelatedQueries = async (patterns: string[]) => {
  for (const pattern of patterns) {
    await queryClient.invalidateQueries({ queryKey: [pattern] });
  }
};

// Format date and time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

// Format time only
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

// Status badge component
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
    case 'in progress':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>;
    case 'scheduled':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Waiting</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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
  
  // Filter appointments based on search term and status
  const filteredAppointments = appointments.filter((appointment: Appointment) => {
    const matchesSearch = searchTerm ? 
      (appointment.pet?.pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor?.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.service?.service_name || '').toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    const matchesStatus = statusFilter ? appointment.state.toLowerCase() === statusFilter.toLowerCase() : true;
    
    return matchesSearch && matchesStatus;
  });
  
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
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
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
      
      toast({
        title: "Status updated",
        description: `Appointment status has been changed to ${newStatus}`,
        className: "bg-green-50 text-green-800 border-green-200",
      });
      
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
    navigate('/appointments/new');
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetchAppointments();
      await invalidateRelatedQueries([
        'appointments',
        'rooms'
      ]);
      
      toast({
        title: "Data refreshed",
        description: "Appointment data has been updated",
        className: "bg-blue-50 text-blue-800 border-blue-200",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      
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
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
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
                <h1 className="text-2xl font-bold text-white">Appointment Flow</h1>
                <p className="text-indigo-100 text-sm">
                  Manage and track appointments through your clinic's workflow
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <Button 
              onClick={handleNewAppointment}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="bg-white rounded-lg border border-indigo-100 shadow-sm p-6 mb-6">
          {/* Search and filter section */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6 bg-indigo-50 p-3 rounded-md border border-indigo-100">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
                <Input
                  placeholder="Search appointments..."
                  className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
                <SelectTrigger className="w-[180px] border-indigo-200">
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
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={handleDateChange}
                  className="border-indigo-200 h-10"
                />
              </div>
              
              <Button variant="outline" size="icon" onClick={clearFilters} className="border-indigo-200">
                <RotateCcw className="h-4 w-4 text-indigo-600" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>

          {/* Appointment Stats */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Today's Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="bg-indigo-50 border-indigo-100">
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <span className="text-indigo-600 text-sm font-medium">Total</span>
                    <span className="text-2xl font-bold text-indigo-800">{totalAppointments}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <span className="text-blue-600 text-sm font-medium">Waiting</span>
                    <span className="text-2xl font-bold text-blue-800">
                      {appointments.filter((a: Appointment) => a.state === 'Scheduled').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 border-amber-100">
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <span className="text-amber-600 text-sm font-medium">In Progress</span>
                    <span className="text-2xl font-bold text-amber-800">
                      {appointments.filter((a: Appointment) => a.state === 'In Progress').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-100">
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <span className="text-green-600 text-sm font-medium">Completed</span>
                    <span className="text-2xl font-bold text-green-800">
                      {appointments.filter((a: Appointment) => a.state === 'Completed').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Flowboard section */}
          <div className="bg-white rounded-lg overflow-hidden mb-6">
            <div className="border-b border-indigo-100 p-4 bg-gradient-to-r from-indigo-50 to-white">
              <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
                <Stethoscope className="mr-2 h-5 w-5 text-indigo-600" />
                Appointment Flowboard
              </h2>
            </div>
            
            <div className="p-4 overflow-x-auto">
              <div className="min-w-[600px]">
                <EnhancedAppointmentFlowboard
                  appointments={filteredAppointments}
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
            </div>
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
                  <SelectTrigger className="w-20 h-8 text-xs border-indigo-200">
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
                  className="h-8 w-8 p-0 flex items-center justify-center border-indigo-200"
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
                            : "border-indigo-200"
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
                  className="h-8 w-8 p-0 flex items-center justify-center border-indigo-200"
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