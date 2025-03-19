import React from 'react';
import { Clock, User, FileText, AlertTriangle } from 'lucide-react';
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
  // Format time
  const timeDisplay = () => {
    if (appointment.time_slot?.start_time) {
      return formatTime(appointment.time_slot.start_time);
    } else if (appointment.start_time) {
      return formatTime(appointment.start_time);
    }
    return "00:00 AM";
  };

  // Get room display
  const getRoomDisplay = () => {
    if (appointment.room_name) {
      return appointment.room_name;
    }
    return null;
  };

  // Check for priority appointment
  const isPriority = appointment.priority === 'urgent' || appointment.priority === 'high';

  // Get status class
  const statusClass = getStatusColorClass(appointment.status || appointment.state || 'scheduled');
  
  // Get type class
  const typeClass = getTypeColorClass(appointment.type || appointment.service?.service_name || 'check-up');

  return (
    <div
      className={`rounded-md border overflow-hidden shadow-sm cursor-pointer transition-all ${
        selectedAppointmentId === appointment.id ? 'ring-2 ring-indigo-500' : 'hover:shadow'
      }`}
      onClick={() => handleAppointmentClick(appointment.id)}
    >
      {/* Card header with time and status */}
      <div className={`px-3 py-2 flex justify-between items-center ${statusClass}`}>
        <div className="flex items-center space-x-1">
          <Clock size={14} />
          <span className="text-sm font-medium">{timeDisplay()}</span>
        </div>
        
        {getRoomDisplay() && (
          <span className="text-xs bg-white bg-opacity-25 px-2 py-0.5 rounded-full">
            {getRoomDisplay()}
          </span>
        )}
      </div>
      
      {/* Card body with pet/owner info */}
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-medium">
              {appointment.pet?.pet_name || "Pet Name"}
            </div>
            <div className="text-xs text-gray-500">
              {appointment.pet?.pet_breed || "Breed"}
            </div>
          </div>
          
          {isPriority && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full flex items-center">
              <AlertTriangle size={12} className="mr-1" />
              Priority
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <User size={12} />
            <span>{appointment.owner?.owner_name || "Owner"}</span>
          </div>
          
          <span className={`text-xs px-2 py-0.5 rounded-full ${typeClass}`}>
            {appointment.service?.service_name || appointment.type || "Check-up"}
          </span>
        </div>
        
        <div className="mt-2 text-xs text-gray-600 line-clamp-2">
          {appointment.reason || "No reason provided"}
        </div>
        
        {appointment.doctor_name && (
          <div className="mt-2 pt-2 border-t text-xs text-gray-500 flex items-center justify-between">
            <span>Dr. {appointment.doctor_name}</span>
            
            {appointment.status === 'in-progress' && (
              <span className="flex items-center text-indigo-600">
                <FileText size={12} className="mr-1" />
                SOAP
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;