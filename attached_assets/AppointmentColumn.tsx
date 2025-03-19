import React from 'react';
import { Plus } from 'lucide-react';
import AppointmentCard from './AppointmentCard';
import { Appointment } from '../../types';

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
  return (
    <div className="flex-1 min-w-[280px] max-w-sm">
      <div className="bg-gray-100 px-3 py-2 rounded-t-lg border border-b-0">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
            {appointments.length}
          </span>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-b-lg border border-t-0 h-[calc(100vh-220px)] overflow-y-auto">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 text-sm mb-2">Không có cuộc hẹn</p>
            <button className="flex items-center text-xs text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-50">
              <Plus size={14} className="mr-1" />
              Thêm cuộc hẹn
            </button>
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