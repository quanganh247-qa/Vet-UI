import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Appointment } from '../../types';

interface AppointmentCardProps {
  appointment: Appointment;
  selectedAppointmentId: number | null;
  handleAppointmentClick: (id: number) => void;
  getStatusColorClass: (status: string) => string;
  getTypeColorClass: (type: string) => string;
  formatTime: (time: string) => string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  selectedAppointmentId,
  handleAppointmentClick,
  getStatusColorClass,
  getTypeColorClass,
  formatTime
}) => {
  const isSelected = selectedAppointmentId === appointment.id;
  
  return (
    <div 
      className={`
        border rounded-lg shadow-sm mb-3 overflow-hidden cursor-pointer
        hover:shadow transition-shadow duration-200
        ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'}
      `}
      onClick={() => handleAppointmentClick(appointment.id)}
    >
      <div className={`px-3 py-1.5 ${getStatusColorClass(appointment.state)}`}>
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm">{appointment.state}</span>
          <span className="text-xs opacity-90">{formatTime(appointment.time_slot.start_time)} - {formatTime(appointment.time_slot.end_time)}</span>
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex items-center mb-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
            {/* Placeholder image for pet */}
            <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-500">
              🐾
            </div>
          </div>
          <div className="ml-2">
            <div className="font-medium">{appointment.pet.pet_name}</div>
            <div className="text-xs text-gray-600">
              {appointment.pet.pet_breed}
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColorClass(appointment.service.service_name)}`}>
              {appointment.service.service_name}
            </span>
            <span className="text-xs text-gray-500">{appointment.doctor_name}</span>
          </div>
          
          <div className="text-xs text-gray-600 mt-1">{appointment.reason}</div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;