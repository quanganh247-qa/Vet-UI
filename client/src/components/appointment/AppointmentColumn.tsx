import React from 'react';
import { Plus } from 'lucide-react';
import { Appointment } from '../../types';
import AppointmentCard from './AppointmentCard';

interface AppointmentColumnProps {
  title: string;
  appointments: Appointment[];
  selectedAppointmentId: number | null;
  handleAppointmentClick: (id: number) => void;
  getStatusColorClass: (status: string) => string;
  getTypeColorClass: (type: string) => string;
  formatTime: (time: string) => string;
}

const AppointmentColumn: React.FC<AppointmentColumnProps> = ({
  title,
  appointments,
  selectedAppointmentId,
  handleAppointmentClick,
  getStatusColorClass,
  getTypeColorClass,
  formatTime
}) => {
  // Get color class for column header based on title
  const getColumnHeaderClass = () => {
    switch (title.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'checked in':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className={`px-4 py-3 border-b ${getColumnHeaderClass()}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <span className="text-xs bg-white px-2 py-0.5 rounded-full">{appointments.length}</span>
        </div>
      </div>
      
      <div className="p-3 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto">
        {appointments.length === 0 ? (
          <div className="text-center text-gray-400 py-6">
            <div className="mb-2">No appointments</div>
            {title === 'Scheduled' && (
              <button className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800">
                <Plus size={14} className="mr-1" />
                Add Appointment
              </button>
            )}
          </div>
        ) : (
          appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              selectedAppointmentId={selectedAppointmentId}
              handleAppointmentClick={handleAppointmentClick}
              getStatusColorClass={getStatusColorClass}
              getTypeColorClass={getTypeColorClass}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentColumn;