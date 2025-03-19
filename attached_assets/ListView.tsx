import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Appointment } from '../../types';

interface ListViewProps {
  filteredAppointments: Appointment[];
  selectedAppointmentId: number | null;
  handleAppointmentClick: (id: number) => void;
  getStatusColorClass: (status: string) => string;
  getTypeColorClass: (type: string) => string;
  setIsQuickActionsOpen: (isOpen: boolean) => void;
  setSelectedAppointmentId: (id: number | null) => void;
}

const ListView: React.FC<ListViewProps> = ({
  filteredAppointments,
  selectedAppointmentId,
  handleAppointmentClick,
  getStatusColorClass,
  getTypeColorClass,
  setIsQuickActionsOpen,
  setSelectedAppointmentId
}) => {
  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bệnh nhân
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại khám
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments
                .sort((a, b) => {
                  // Sort by time
                  const timeA = a.time_slot.start_time;
                  const timeB = b.time_slot.start_time;
                  return timeA.localeCompare(timeB);
                })
                .map(appointment => (
                  <tr 
                    key={appointment.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedAppointmentId === appointment.id ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => handleAppointmentClick(appointment.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.time_slot.start_time} - {appointment.time_slot.start_time}
                      </div>
                      {/* <div className="text-xs text-gray-500">
                        {appointment.duration} phút
                      </div> */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={"/images/default-pet-avatar.svg"} 
                          alt={appointment.pet.pet_name} 
                          className="h-8 w-8 rounded-full mr-2"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.pet.pet_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appointment.pet.pet_breed}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getTypeColorClass(appointment.service.service_name)}`}>
                        {appointment.service.service_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.doctor_name}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.room_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColorClass(appointment.state)}`}>
                        {appointment.state}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppointmentClick(appointment.id);
                          }}
                        >
                          Chi tiết
                        </button>
                        <button 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsQuickActionsOpen(true);
                            setSelectedAppointmentId(appointment.id);
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAppointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy lịch hẹn nào phù hợp với bộ lọc
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView; 