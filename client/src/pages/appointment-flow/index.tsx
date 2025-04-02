import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Appointment, QueueItem, Room, Staff } from '@/types';
import { getAllAppointments } from '@/services/appointment-services';
import { getRooms } from '@/services/room-services';
import { ArrowLeft, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import EnhancedAppointmentFlowboard from '@/components/appointment/EnhancedAppointmentFlowboard';
import { useListAppointmentsQueue } from '@/hooks/use-appointment';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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

  // Fetch appointments data
  const { 
    data: appointmentsData, 
    isLoading: isLoadingAppointments,
    refetch: refetchAppointments 
  } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => getAllAppointments(selectedDate, "false", 1, 9999),
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
      queryClient.setQueryData(['appointments', selectedDate.toISOString().split('T')[0]], {
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
      await invalidateRelatedQueries(['appointments', 'rooms']);
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

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-white font-semibold text-lg">
            Appointment Flow
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-2.5 py-0.5 text-xs">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            {format(selectedDate, 'MMM d, yyyy')}
          </Badge>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/10 text-white border-white/20 hover:bg-white/30 flex items-center gap-1.5 text-xs"
            onClick={handleRefreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Status summary */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-1">
            Completed: {appointments.filter(a => a.state === 'Completed').length}
          </Badge>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-2 py-1">
            In Progress: {appointments.filter(a => a.state === 'In Progress').length}
          </Badge>
          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 px-2 py-1">
            Waiting: {appointments.filter(a => a.state === 'Scheduled').length}
          </Badge>
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-2 py-1">
            Total: {appointments.length}
          </Badge>
        </div>
        
        {/* Flowboard takes up full width */}
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
          staff={staff as Staff[]}
          onAppointmentUpdate={(appointment) => handleStatusChange(appointment.id, appointment.state)}
          onAppointmentCreate={handleNewAppointment}
          onAppointmentDelete={() => {}} // This is kept but will be ignored in the component
        />
      </div>
    </div>
  );
};

export default AppointmentFlow;