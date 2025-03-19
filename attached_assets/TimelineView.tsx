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
  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 border-r">Nguồn lực</th>
                {Array.from({ length: 9 }).map((_, index) => {
                  const hour = index + 8; // 8 AM to 5 PM
                  return (
                    <th key={index} className="px-4 py-2 border-r text-center">
                      {hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Doctors/Staff Rows */}
              {/* {staff.filter(s => s.role === 'Veterinarian').map(doctor => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap border-r bg-gray-50 font-medium">
                    {doctor.name}
                  </td>
                  <td colSpan={9} className="relative">
                    <div className="h-16 relative">
                      {filteredAppointments
                        .filter(app => app.doctor_name === doctor.name)
                        .map(app => {
                          const startHour = parseInt(app.startTime.split(':')[0]);
                          const startPosition = ((startHour - 8) * 100) + '%';
                          const width = ((app.duration / 60) * 100) + '%';
                          
                          return (
                            <div 
                              key={app.id}
                              className={`absolute top-1 h-14 rounded ${getStatusColorClass(app.status)} px-2 py-1 cursor-pointer text-xs`}
                              style={{ left: startPosition, width: width }}
                              onClick={() => handleAppointmentClick(app.id)}
                            >
                              <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                {app.pet_name}
                              </div>
                              <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                                {app.appointmentType}
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </td>
                </tr>
              ))} */}
              
              {/* Rooms Rows */}
              {/* {rooms.map(room => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap border-r bg-gray-50 font-medium">
                    {room.name}
                  </td>
                  <td colSpan={9} className="relative">
                    <div className="h-16 relative">
                      {filteredAppointments
                        .filter(app => app.room === room.name)
                        .map(app => {
                          // Parse time to position it properly - simplified here
                          const startHour = parseInt(app.startTime.split(':')[0]);
                          const startPosition = ((startHour - 8) * 100) + '%';
                          const width = ((app.duration / 60) * 100) + '%';
                          
                          return (
                            <div 
                              key={app.id}
                              className={`absolute top-1 h-14 rounded ${getStatusColorClass(app.status)} px-2 py-1 cursor-pointer text-xs`}
                              style={{ left: startPosition, width: width }}
                              onClick={() => handleAppointmentClick(app.id)}
                            >
                              <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                {app.patientName}
                              </div>
                              <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                                {app.appointmentType}
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </td>
                </tr>
              ))} */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimelineView; 