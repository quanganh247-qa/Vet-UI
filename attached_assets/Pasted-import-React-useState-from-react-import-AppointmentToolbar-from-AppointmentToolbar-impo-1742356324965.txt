import React, { useState } from 'react';
import AppointmentToolbar from './AppointmentToolbar';
import StatusOverview from './StatusOverview';
import ResourceStatusBar from './ResourceStatusBar';
import ResourceManagement from './ResourceManagement';
import AppointmentCard from './AppointmentCard';
import AppointmentSidebar from './AppointmentSidebar';
import ColumnView from './ColumnView';
import QuickActionsPanel from './QuickActionsPanel';
import TimelineView from './TimelineView';
import ListView from './ListView';
import { Appointment, QueueItem, Room, Staff } from '../../types';

const EnhancedAppointmentBoard: React.FC = () => {
  // State for managing views, filters, and selected appointments
  const [viewMode, setViewMode] = useState('columns'); // columns, timeline, list
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarContent, setSidebarContent] = useState('queue'); // queue, details, new
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [showResourceManagement, setShowResourceManagement] = useState(false);

  // Mock data for appointments
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      pet: {
        pet_name: "Buddy", pet_breed: "Dog"
      },
      doctor_name: "Dr. Smith",
      service: { service_name: "General Checkup", service_duration: 30 },

      date: "2025-03-18T10:30:00Z",
      reminder_send: true,
      time_slot: { start_time: "10:30", end_time: "11:00" },
      state: "Scheduled",
      room_name: "Room 1",
      reason: "Annual vaccination",
      owner: { owner_name: "John Doe", owner_phone: "123-456-7890" },
      created_at: "2025-03-01T12:00:00Z",
      priority: "High",
    },
    {
      id: 2,
      pet: { pet_name: "Mittens", pet_breed: "Cat" },
      doctor_name: "Dr. Johnson",
      service: { service_name: "Dental Cleaning", service_duration: 30 },
      date: "2025-03-20T14:00:00Z",
      reminder_send: false,
      time_slot: { start_time: "14:00", end_time: "14:30" },
      state: "Confirmed",
      room_name: "Room 2",
      reason: "Bad breath treatment",
      owner: { owner_name: "Alice Brown", owner_phone: "987-654-3210" },
      created_at: "2025-03-02T15:45:00Z",
      priority: "Medium",
    },
  ]);

  // Queue data (patients waiting, estimated times)
  const [queueData, setQueueData] = useState<QueueItem[]>([
    {
      id: 3, // Matches the appointment ID
      position: 1,
      patientName: 'Charlie',
      appointmentType: 'Sick Visit',
      estimatedWaitTime: '15 min',
      actualWaitTime: '15 min',
      status: 'Waiting',
      waitingSince: '9:45 AM',
      priority: 'urgent',
      doctor: 'Dr. Roberts'
    },
    {
      id: 8, // Matches the appointment ID
      position: 2,
      patientName: 'Milo',
      appointmentType: 'New Patient',
      estimatedWaitTime: '5 min',
      actualWaitTime: '5 min',
      status: 'Arrived',
      waitingSince: '1:55 PM',
      priority: 'normal',
      doctor: 'Dr. Roberts'
    }
  ]);

  // Staff/resources data
  const staff: Staff[] = [
    { id: 1, name: 'Dr. Roberts', role: 'Veterinarian', status: 'available', avatar: '/api/placeholder/40/40' },
    { id: 2, name: 'Dr. Carter', role: 'Veterinarian', status: 'busy', avatar: '/api/placeholder/40/40' },
    { id: 3, name: 'Sarah', role: 'Veterinary Technician', status: 'available', avatar: '/api/placeholder/40/40' },
    { id: 4, name: 'David', role: 'Veterinary Technician', status: 'busy', avatar: '/api/placeholder/40/40' },
    { id: 5, name: 'Kelly', role: 'Groomer', status: 'available', avatar: '/api/placeholder/40/40' }
  ];

  const rooms: Room[] = [
    { id: 1, name: 'Exam 1', type: 'exam', status: 'occupied', currentPatient: 'Max', availableAt: '9:30 AM' },
    { id: 2, name: 'Exam 2', type: 'exam', status: 'available', currentPatient: null, availableAt: 'Now' },
    { id: 3, name: 'Exam 3', type: 'exam', status: 'available', currentPatient: null, availableAt: 'Now' },
    { id: 4, name: 'Surgery 1', type: 'surgery', status: 'occupied', currentPatient: 'Luna', availableAt: '11:00 AM' },
    { id: 5, name: 'Grooming', type: 'grooming', status: 'available', currentPatient: null, availableAt: 'Now' }
  ];

  // Format time (e.g., 9:00 AM)
  const formatTime = (timeString: string): string => {
    return timeString;
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Navigate to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Get status color class
  const getStatusColorClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'checked in':
      case 'arrived':
        return 'bg-blue-500 text-white';
      case 'in progress':
        return 'bg-purple-500 text-white';
      case 'waiting':
        return 'bg-yellow-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'confirmed':
      case 'scheduled':
        return 'bg-green-200 text-green-800';
      case 'no show':
        return 'bg-red-500 text-white';
      case 'cancelled':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Get type color class
  const getTypeColorClass = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'check-up':
        return 'bg-green-100 text-green-800';
      case 'surgery':
        return 'bg-red-100 text-red-800';
      case 'sick visit':
        return 'bg-yellow-100 text-yellow-800';
      case 'vaccination':
        return 'bg-blue-100 text-blue-800';
      case 'grooming':
        return 'bg-orange-100 text-orange-800';
      case 'new patient':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter appointments based on selected filters
  const filteredAppointments = appointments.filter(appointment => {
    const statusMatch = filterStatus === 'all' || appointment.state.toLowerCase() === filterStatus.toLowerCase();
    const doctorMatch = filterDoctor === 'all' || appointment.doctor_name === filterDoctor;
    const typeMatch = filterType === 'all' || appointment.service.service_name.toLowerCase() === filterType.toLowerCase();

    return statusMatch && doctorMatch && typeMatch;
  });

  // Group appointments by status for column view
  const groupedAppointments = {
    scheduled: filteredAppointments.filter(a =>
      a.state === 'Scheduled' || a.state === 'Confirmed'
    ),
    arrived: filteredAppointments.filter(a =>
      a.state === 'Arrived' || a.state === 'Checked In' || a.state === 'Waiting'
    ),
    inProgress: filteredAppointments.filter(a =>
      a.state === 'In Progress'
    ),
    completed: filteredAppointments.filter(a =>
      a.state === 'Completed'
    )
  };

  // Get the selected appointment details
  const selectedAppointment = appointments.find(a => a.id === selectedAppointmentId);

  // Handle appointment click
  const handleAppointmentClick = (id: number) => {
    setSelectedAppointmentId(id);
    setSidebarContent('details');
    setShowSidebar(true);
  };

  // Handle status change
  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    setAppointments(appointments.map(appointment => {
      if (appointment.id === appointmentId) {
        return { ...appointment, status: newStatus };
      }
      return appointment;
    }));

    // Update queue if necessary
    if (newStatus === 'Waiting' || newStatus === 'Arrived') {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!queueData.some(q => q.id === appointmentId)) {
        setQueueData([...queueData, {
          id: appointmentId,
          position: queueData.length + 1,
          patientName: appointment!.pet.pet_name,
          appointmentType: appointment!.service.service_name,
          estimatedWaitTime: '15 min',
          actualWaitTime: '0 min',
          status: newStatus,
          waitingSince: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          priority: appointment!.priority,
          doctor: appointment!.doctor_name
        }]);
      }
    } else if (newStatus === 'In Progress' || newStatus === 'Completed') {
      setQueueData(queueData.filter(q => q.id !== appointmentId));
    }
  };

  // Handle showing new appointment form
  const handleNewAppointment = () => {
    setSelectedAppointmentId(null);
    setSidebarContent('new');
    setShowSidebar(true);
  };

  // Render appointment card
  const renderAppointmentCard = (appointment: Appointment) => {
    return (
      <AppointmentCard
        key={appointment.id}
        appointment={appointment}
        selectedAppointmentId={selectedAppointmentId}
        handleAppointmentClick={handleAppointmentClick}
        getStatusColorClass={getStatusColorClass}
        getTypeColorClass={getTypeColorClass}
        formatTime={formatTime}
      />
    );
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* Toolbar */}
      <AppointmentToolbar
        selectedDate={selectedDate}
        formatDate={formatDate}
        goToPreviousDay={goToPreviousDay}
        goToNextDay={goToNextDay}
        goToToday={goToToday}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDoctor={filterDoctor}
        setFilterDoctor={setFilterDoctor}
        filterType={filterType}
        setFilterType={setFilterType}
        handleNewAppointment={handleNewAppointment}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main Appointment Area */}
        <div className={`${showSidebar ? 'w-3/4' : 'w-full'} flex-shrink-0 overflow-auto transition-all duration-300 ease-in-out`}>
          {/* Status Overview */}
          <StatusOverview
            scheduledCount={groupedAppointments.scheduled.length}
            waitingCount={groupedAppointments.arrived.length}
            inProgressCount={groupedAppointments.inProgress.length}
            completedCount={groupedAppointments.completed.length}
          />

          {/* Resource Status Bar */}
          <ResourceStatusBar
            showResourceManagement={showResourceManagement}
            setShowResourceManagement={setShowResourceManagement}
          />

          {/* Resource Management Panel */}
          <ResourceManagement
            showResourceManagement={showResourceManagement}
            setShowResourceManagement={setShowResourceManagement}
            staff={staff}
            rooms={rooms}
          />

          {/* Appointments View - Column View (Kanban style) */}
          {viewMode === 'columns' && (
            <ColumnView
              groupedAppointments={groupedAppointments}
              selectedAppointmentId={selectedAppointmentId}
              handleAppointmentClick={handleAppointmentClick}
              getStatusColorClass={getStatusColorClass}
              getTypeColorClass={getTypeColorClass}
              formatTime={formatTime}
              renderAppointmentCard={renderAppointmentCard}
            />
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <TimelineView
              filteredAppointments={filteredAppointments}
              staff={staff}
              rooms={rooms}
              handleAppointmentClick={handleAppointmentClick}
              getStatusColorClass={getStatusColorClass}
            />
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <ListView
              filteredAppointments={filteredAppointments}
              selectedAppointmentId={selectedAppointmentId}
              handleAppointmentClick={handleAppointmentClick}
              getStatusColorClass={getStatusColorClass}
              getTypeColorClass={getTypeColorClass}
              setIsQuickActionsOpen={setIsQuickActionsOpen}
              setSelectedAppointmentId={setSelectedAppointmentId}
            />
          )}

          {/* Quick Actions Panel (floating) */}
          <QuickActionsPanel
            isQuickActionsOpen={isQuickActionsOpen}
            setIsQuickActionsOpen={setIsQuickActionsOpen}
            selectedAppointmentId={selectedAppointmentId}
            handleStatusChange={handleStatusChange}
          />
        </div>

        {/* Sidebar */}
        <AppointmentSidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          sidebarContent={sidebarContent}
          setSidebarContent={setSidebarContent}
          selectedAppointment={selectedAppointment}
          queueData={queueData}
          handleStatusChange={handleStatusChange}
          getStatusColorClass={getStatusColorClass}
        />
      </div>
    </div>
  );
};

export default EnhancedAppointmentBoard; 