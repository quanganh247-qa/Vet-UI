import React from 'react';
import { Appointment } from '../../types';

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
  renderAppointmentCard: (appointment: Appointment) => React.ReactNode;
}

const ColumnView: React.FC<ColumnViewProps> = ({
  groupedAppointments,
  selectedAppointmentId,
  handleAppointmentClick,
  getStatusColorClass,
  getTypeColorClass,
  formatTime,
  renderAppointmentCard
}) => {
  return (
    <div className="p-4 flex space-x-4 h-full pb-24">
      {/* Scheduled Column */}
      <div className="flex-1 min-w-[250px]">
        <div className="bg-gray-100 rounded-t-lg px-3 py-2 border border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Đã lên lịch</h3>
            <span className="bg-white text-xs font-medium px-2 py-1 rounded">
              {groupedAppointments.scheduled.length}
            </span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-b-lg p-2 border-l border-r border-b border-gray-200 h-full overflow-y-auto">
          {groupedAppointments.scheduled.length > 0 ? (
            groupedAppointments.scheduled.map(appointment => (
              renderAppointmentCard(appointment)
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không có lịch hẹn nào
            </div>
          )}
        </div>
      </div>
      
      {/* Arrived/Waiting Column */}
      <div className="flex-1 min-w-[250px]">
        <div className="bg-blue-100 rounded-t-lg px-3 py-2 border border-blue-200">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-800">Đang chờ</h3>
            <span className="bg-white text-blue-800 text-xs font-medium px-2 py-1 rounded">
              {groupedAppointments.arrived.length}
            </span>
          </div>
        </div>
        <div className="bg-blue-50 rounded-b-lg p-2 border-l border-r border-b border-blue-200 h-full overflow-y-auto">
          {groupedAppointments.arrived.length > 0 ? (
            groupedAppointments.arrived.map(appointment => (
              renderAppointmentCard(appointment)
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không có bệnh nhân đang chờ
            </div>
          )}
        </div>
      </div>
      
      {/* In Progress Column */}
      <div className="flex-1 min-w-[250px]">
        <div className="bg-purple-100 rounded-t-lg px-3 py-2 border border-purple-200">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-purple-800">Đang khám</h3>
            <span className="bg-white text-purple-800 text-xs font-medium px-2 py-1 rounded">
              {groupedAppointments.inProgress.length}
            </span>
          </div>
        </div>
        <div className="bg-purple-50 rounded-b-lg p-2 border-l border-r border-b border-purple-200 h-full overflow-y-auto">
          {groupedAppointments.inProgress.length > 0 ? (
            groupedAppointments.inProgress.map(appointment => (
              renderAppointmentCard(appointment)
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không có ca đang khám
            </div>
          )}
        </div>
      </div>
      
      {/* Completed Column */}
      <div className="flex-1 min-w-[250px]">
        <div className="bg-green-100 rounded-t-lg px-3 py-2 border border-green-200">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-green-800">Hoàn thành</h3>
            <span className="bg-white text-green-800 text-xs font-medium px-2 py-1 rounded">
              {groupedAppointments.completed.length}
            </span>
          </div>
        </div>
        <div className="bg-green-50 rounded-b-lg p-2 border-l border-r border-b border-green-200 h-full overflow-y-auto">
          {groupedAppointments.completed.length > 0 ? (
            groupedAppointments.completed.map(appointment => (
              renderAppointmentCard(appointment)
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có ca hoàn thành
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColumnView; 