import React from 'react';
import { Appointment, Room, Staff } from '../../types';

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
  // Helper to convert time string (e.g. "09:30") to position percentage
  const timeToPosition = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    // Starting at 8 AM (0%), ending at 5 PM (100%)
    const totalMinutesSince8AM = (hours - 8) * 60 + minutes;
    const totalWorkdayMinutes = (17 - 8) * 60; // 8 AM to 5 PM in minutes
    return (totalMinutesSince8AM / totalWorkdayMinutes) * 100;
  };

  // Calculate width percentage based on duration
  const calculateWidth = (startTime: string, endTime: string): number => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    
    const totalWorkdayMinutes = (17 - 8) * 60; // 8 AM to 5 PM in minutes
    return (durationMinutes / totalWorkdayMinutes) * 100;
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 border-r w-32">Resource</th>
                {Array.from({ length: 10 }).map((_, index) => {
                  const hour = index + 8; // 8 AM to 5 PM
                  return (
                    <th key={index} className="px-4 py-2 border-r text-center w-24">
                      {hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Doctors/Staff Rows */}
              {staff.filter(s => s.role.includes('Veterinarian')).map(doctor => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap border-r bg-gray-50 font-medium">
                    {doctor.name}
                  </td>
                  <td colSpan={10} className="relative">
                    <div className="h-16 relative">
                      {filteredAppointments
                        .filter(app => app.doctor_name === doctor.name)
                        .map(app => {
                          const startPosition = timeToPosition(app.time_slot.start_time);
                          const width = calculateWidth(app.time_slot.start_time, app.time_slot.end_time);
                          
                          return (
                            <div 
                              key={app.id}
                              className={`absolute top-1 h-14 rounded ${getStatusColorClass(app.state)} px-2 py-1 cursor-pointer text-xs overflow-hidden`}
                              style={{ left: `${startPosition}%`, width: `${width}%` }}
                              onClick={() => handleAppointmentClick(app.id)}
                            >
                              <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                {app.pet.pet_name}
                              </div>
                              <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                                {app.service.service_name}
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Rooms Rows */}
              {rooms.map(room => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap border-r bg-gray-50 font-medium">
                    {room.name}
                  </td>
                  <td colSpan={10} className="relative">
                    <div className="h-16 relative">
                      {filteredAppointments
                        .filter(app => app.room_name === room.name)
                        .map(app => {
                          const startPosition = timeToPosition(app.time_slot.start_time);
                          const width = calculateWidth(app.time_slot.start_time, app.time_slot.end_time);
                          
                          return (
                            <div 
                              key={app.id}
                              className={`absolute top-1 h-14 rounded ${getStatusColorClass(app.state)} px-2 py-1 cursor-pointer text-xs overflow-hidden`}
                              style={{ left: `${startPosition}%`, width: `${width}%` }}
                              onClick={() => handleAppointmentClick(app.id)}
                            >
                              <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                {app.pet.pet_name}
                              </div>
                              <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                                {app.service.service_name}
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;