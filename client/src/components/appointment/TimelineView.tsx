import React from 'react';
import { format, parseISO } from 'date-fns';
import { Appointment, Staff, Room } from '../../types';

interface TimelineViewProps {
  filteredAppointments: Appointment[];
  staff: Staff[];
  rooms: Room[];
  handleAppointmentClick: (id: number) => void;
  getStatusColorClass: (status: string) => string;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  filteredAppointments,
  staff,
  rooms,
  handleAppointmentClick,
  getStatusColorClass
}) => {
  const resources = [...staff, ...rooms];
  const timeSlots = Array.from({ length: 12 }, (_, i) => 8 + i); // 8am to 7pm
  
  // Helper function to format time as "8:00 AM"
  const formatTimeDisplay = (hour: number) => {
    return `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  // Helper to get resource label
  const getResourceLabel = (resource: Staff | Room) => {
    if ('role' in resource) {
      return resource.name;
    } else {
      return resource.name;
    }
  };

  // Helper to get resource subtitle
  const getResourceSubtitle = (resource: Staff | Room) => {
    if ('role' in resource) {
      return resource.role;
    } else {
      return resource.type;
    }
  };

  // Place appointment on timeline
  const getAppointmentPosition = (appointment: Appointment) => {
    const startHour = parseInt(appointment.start_time.split(':')[0]);
    const startMinute = parseInt(appointment.start_time.split(':')[1]);
    
    // Calculate position as percentage
    const position = (startHour - 8) * 60 + startMinute;
    const left = (position / (12 * 60)) * 100;
    
    // Calculate width based on duration (default to 1 hour if not specified)
    const duration = 60; // Default duration in minutes
    const width = (duration / (12 * 60)) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* Timeline header */}
        <div className="flex border-b">
          <div className="w-48 border-r p-4 flex-shrink-0 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Resources</h3>
          </div>
          <div className="flex-grow">
            <div className="flex">
              {timeSlots.map(hour => (
                <div key={hour} className="flex-1 p-2 text-center border-r text-xs text-gray-500">
                  {formatTimeDisplay(hour)}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Timeline rows */}
        {resources.map(resource => (
          <div key={resource.id} className="flex border-b hover:bg-gray-50">
            <div className="w-48 border-r p-4 flex-shrink-0">
              <div className="font-medium">{getResourceLabel(resource)}</div>
              <div className="text-xs text-gray-500">{getResourceSubtitle(resource)}</div>
              <div className={`mt-1 text-xs px-2 py-0.5 rounded-full inline-block ${
                resource.status === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : resource.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {resource.status}
              </div>
            </div>
            
            <div className="flex-grow relative h-20">
              {/* Time grid lines */}
              <div className="absolute inset-0 grid grid-cols-12">
                {timeSlots.map(hour => (
                  <div key={hour} className="border-r h-full"></div>
                ))}
              </div>
              
              {/* Appointment blocks */}
              {'role' in resource ? (
                filteredAppointments
                  .filter(apt => apt.doctor_id === resource.id)
                  .map(appointment => {
                    const { left, width } = getAppointmentPosition(appointment);
                    return (
                      <div
                        key={appointment.id}
                        className={`absolute p-2 rounded shadow-sm border-l-4 cursor-pointer text-white ${getStatusColorClass(appointment.status)}`}
                        style={{ left, width, top: '4px', bottom: '4px' }}
                        onClick={() => handleAppointmentClick(appointment.id)}
                      >
                        <div className="overflow-hidden text-xs font-medium whitespace-nowrap overflow-ellipsis">
                          {appointment.reason}
                        </div>
                        <div className="overflow-hidden text-xs whitespace-nowrap overflow-ellipsis">
                          {appointment.type}
                        </div>
                      </div>
                    );
                  })
              ) : (
                // For rooms, we could show appointments assigned to this room if we tracked room assignments
                <div className="text-xs text-center text-gray-400 pt-6">
                  {resource.status === 'occupied' && resource.currentPatient ? 
                    `In use: ${resource.currentPatient}` : ''}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;