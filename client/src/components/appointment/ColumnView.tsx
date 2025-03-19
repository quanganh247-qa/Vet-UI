import React from 'react';
import { Appointment } from '../../types';
import AppointmentCard from './AppointmentCard';
import AppointmentColumn from './AppointmentColumn';

interface ColumnViewProps {
  groupedAppointments: {
    scheduled: Appointment[];
    arrived: Appointment[];
    inProgress: Appointment[];
    completed: Appointment[];
  };
  selectedAppointmentId: number | null;
  handleAppointmentClick: (id: number) => void;
  getStatusColorClass: (status: string) => string;
  getTypeColorClass: (type: string) => string;
  formatTime: (time: string) => string;
}

const ColumnView: React.FC<ColumnViewProps> = ({
  groupedAppointments,
  selectedAppointmentId,
  handleAppointmentClick,
  getStatusColorClass,
  getTypeColorClass,
  formatTime
}) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <AppointmentColumn
        title="Scheduled"
        appointments={groupedAppointments.scheduled}
        selectedAppointmentId={selectedAppointmentId}
        handleAppointmentClick={handleAppointmentClick}
        getStatusColorClass={getStatusColorClass}
        getTypeColorClass={getTypeColorClass}
        formatTime={formatTime}
      />
      
      <AppointmentColumn
        title="Checked In"
        appointments={groupedAppointments.arrived}
        selectedAppointmentId={selectedAppointmentId}
        handleAppointmentClick={handleAppointmentClick}
        getStatusColorClass={getStatusColorClass}
        getTypeColorClass={getTypeColorClass}
        formatTime={formatTime}
      />
      
      <AppointmentColumn
        title="In Progress"
        appointments={groupedAppointments.inProgress}
        selectedAppointmentId={selectedAppointmentId}
        handleAppointmentClick={handleAppointmentClick}
        getStatusColorClass={getStatusColorClass}
        getTypeColorClass={getTypeColorClass}
        formatTime={formatTime}
      />
      
      <AppointmentColumn
        title="Completed"
        appointments={groupedAppointments.completed}
        selectedAppointmentId={selectedAppointmentId}
        handleAppointmentClick={handleAppointmentClick}
        getStatusColorClass={getStatusColorClass}
        getTypeColorClass={getTypeColorClass}
        formatTime={formatTime}
      />
    </div>
  );
};

export default ColumnView;