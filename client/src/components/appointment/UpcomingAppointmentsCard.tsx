import React from 'react';
import { Calendar, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppointmentPreview {
  date: string;
  time: string;
  type: string;
  doctor: string;
}

interface UpcomingAppointmentsCardProps {
  appointments: AppointmentPreview[];
  onAddAppointment?: () => void;
}

export const UpcomingAppointmentsCard: React.FC<UpcomingAppointmentsCardProps> = ({
  appointments,
  onAddAppointment
}) => {
  // Function to determine if an appointment is today
  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Function to format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(dateString)) {
      return 'Today';
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Tomorrow';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b font-medium text-gray-700 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center">
          <Calendar size={14} className="mr-2 text-indigo-600" />
          Upcoming Appointments
        </div>
        {onAddAppointment && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddAppointment}
            className="h-7 px-2"
          >
            <Plus size={14} className="mr-1" />
            <span className="text-xs">Add</span>
          </Button>
        )}
      </div>
      
      {appointments.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p className="mb-2">No upcoming appointments</p>
          {onAddAppointment && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddAppointment}
              className="mt-2"
            >
              <Plus size={14} className="mr-1" />
              <span className="text-xs">Schedule Appointment</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="divide-y max-h-[300px] overflow-y-auto">
          {appointments.map((appointment, index) => (
            <div key={index} className="p-3 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-sm">{appointment.type}</div>
                <div className="text-xs text-gray-500">
                  {formatDate(appointment.date)}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-600">
                  {appointment.time} • {appointment.doctor}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {appointments.length > 0 && (
        <div className="p-3 border-t text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            View All
          </Button>
        </div>
      )}
    </div>
  );
};

export default UpcomingAppointmentsCard;