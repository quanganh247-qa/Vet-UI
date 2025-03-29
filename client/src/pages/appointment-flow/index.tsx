import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Appointment, QueueItem, Room, Staff } from '@/types';
import { getAllAppointments } from '@/services/appointment-services';
import { getRooms } from '@/services/room-services';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import EnhancedAppointmentFlowboard from '@/components/appointment/EnhancedAppointmentFlowboard';
import { useListAppointmentsQueue } from '@/hooks/use-appointment';
import { Link } from 'wouter';


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

  // Fetch appointments data
  const { 
    data: appointmentsData, 
    isLoading: isLoadingAppointments,
    refetch: refetchAppointments 
  } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => getAllAppointments(selectedDate,"false"),
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
    <div className="w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Back button and page title */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 px-6 py-3 flex items-center">
        <Link href="/dashboard" className="text-white flex items-center hover:bg-indigo-700/30 rounded-md px-2 py-1 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
        <h1 className="text-white font-medium ml-4">Appointment Flow</h1>

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
        onAppointmentDelete={() => {}}
      />
    </div>
  );
};

export default AppointmentFlow;