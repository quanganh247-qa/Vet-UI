import React, { useState } from 'react';
import { useParams } from 'wouter';
import AppointmentToolbar from '@/components/appointment-flow/AppointmentToolbar';
import StatusOverview from '@/components/appointment-flow/StatusOverview';
import ResourceStatusBar from '@/components/appointment-flow/ResourceStatusBar';
import ResourceManagement from '@/components/appointment-flow/ResourceManagement';
import AppointmentCard from '@/components/appointment-flow/AppointmentCard';
import AppointmentSidebar from '@/components/appointment-flow/AppointmentSidebar';
import ColumnView from '@/components/appointment-flow/ColumnView';
import QuickActionsPanel from '@/components/appointment-flow/QuickActionsPanel';
import TimelineView from '@/components/appointment-flow/TimelineView';
import ListView from '@/components/appointment-flow/ListView';
import { Appointment, QueueItem, Room, Staff } from '@/types';

const AppointmentFlow = () => {
  const { id } = useParams();
  const [viewMode, setViewMode] = useState('columns');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarContent, setSidebarContent] = useState('queue');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [showResourceManagement, setShowResourceManagement] = useState(false);

  // Use your existing appointment data from API
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueData, setQueueData] = useState<QueueItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Your existing helper functions
  const formatTime = (timeString: string): string => {
    return timeString;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

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

  const filteredAppointments = appointments.filter(appointment => {
    const statusMatch = filterStatus === 'all' || appointment.state.toLowerCase() === filterStatus.toLowerCase();
    const doctorMatch = filterDoctor === 'all' || appointment.doctor_name === filterDoctor;
    const typeMatch = filterType === 'all' || appointment.service.service_name.toLowerCase() === filterType.toLowerCase();
    return statusMatch && doctorMatch && typeMatch;
  });

  const groupedAppointments = {
    scheduled: filteredAppointments.filter(a => a.state === 'Scheduled' || a.state === 'Confirmed'),
    arrived: filteredAppointments.filter(a => a.state === 'Arrived' || a.state === 'Checked In' || a.state === 'Waiting'),
    inProgress: filteredAppointments.filter(a => a.state === 'In Progress'),
    completed: filteredAppointments.filter(a => a.state === 'Completed')
  };

  const selectedAppointment = appointments.find(a => a.id === selectedAppointmentId);

  const handleAppointmentClick = (id: number) => {
    setSelectedAppointmentId(id);
    setSidebarContent('details');
    setShowSidebar(true);
  };

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    setAppointments(appointments.map(appointment => {
      if (appointment.id === appointmentId) {
        return { ...appointment, state: newStatus };
      }
      return appointment;
    }));
  };

  const handleNewAppointment = () => {
    setSelectedAppointmentId(null);
    setSidebarContent('new');
    setShowSidebar(true);
  };

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

      <div className="flex-1 overflow-hidden flex">
        <div className={`${showSidebar ? 'w-3/4' : 'w-full'} flex-shrink-0 overflow-auto transition-all duration-300 ease-in-out`}>
          <StatusOverview
            scheduledCount={groupedAppointments.scheduled.length}
            waitingCount={groupedAppointments.arrived.length}
            inProgressCount={groupedAppointments.inProgress.length}
            completedCount={groupedAppointments.completed.length}
          />

          <ResourceStatusBar
            showResourceManagement={showResourceManagement}
            setShowResourceManagement={setShowResourceManagement}
          />

          <ResourceManagement
            showResourceManagement={showResourceManagement}
            setShowResourceManagement={setShowResourceManagement}
            staff={staff}
            rooms={rooms}
          />

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

          {viewMode === 'timeline' && (
            <TimelineView
              filteredAppointments={filteredAppointments}
              staff={staff}
              rooms={rooms}
              handleAppointmentClick={handleAppointmentClick}
              getStatusColorClass={getStatusColorClass}
            />
          )}

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

          <QuickActionsPanel
            isQuickActionsOpen={isQuickActionsOpen}
            setIsQuickActionsOpen={setIsQuickActionsOpen}
            selectedAppointmentId={selectedAppointmentId}
            handleStatusChange={handleStatusChange}
          />
        </div>

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

export default AppointmentFlow;