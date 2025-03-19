import React from 'react';
import { Search, MoreHorizontal, Info } from 'lucide-react';
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
    <div className="bg-white rounded-lg shadow-sm">
      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search appointments..."
            className="bg-transparent border-none w-full focus:outline-none text-sm"
          />
        </div>
      </div>
      
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-600 uppercase tracking-wider">
        <div className="col-span-1">Time</div>
        <div className="col-span-2">Patient</div>
        <div className="col-span-2">Owner</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Doctor</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1">Actions</div>
      </div>
      
      {/* Table Body */}
      <div className="divide-y">
        {filteredAppointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No appointments found for the selected filters
          </div>
        ) : (
          filteredAppointments.map(appointment => (
            <div
              key={appointment.id}
              onClick={() => handleAppointmentClick(appointment.id)}
              className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-gray-50 ${
                selectedAppointmentId === appointment.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="col-span-1 font-medium">
                {appointment.time_slot?.start_time || appointment.start_time || "00:00 AM"}
              </div>
              
              <div className="col-span-2 truncate">
                {appointment.pet?.pet_name || "Pet"}
                <div className="text-xs text-gray-500">{appointment.pet?.pet_breed || "Breed"}</div>
              </div>
              
              <div className="col-span-2 truncate">
                {appointment.owner?.owner_name || "Owner"}
                {appointment.priority === 'high' && (
                  <span className="ml-1 text-red-600">
                    <Info size={12} />
                  </span>
                )}
              </div>
              
              <div className="col-span-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColorClass(appointment.type || 'check-up')}`}>
                  {appointment.service?.service_name || appointment.type || "Check-up"}
                </span>
              </div>
              
              <div className="col-span-2 truncate">
                {appointment.doctor_name || "Doctor"}
              </div>
              
              <div className="col-span-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColorClass(appointment.status || 'scheduled')}`}>
                  {appointment.state || appointment.status || "Scheduled"}
                </span>
              </div>
              
              <div className="col-span-1 flex justify-end">
                <button
                  className="p-1 rounded-full hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAppointmentId(appointment.id);
                    setIsQuickActionsOpen(true);
                  }}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListView;