import React from 'react';
import { X, CheckSquare, MessageSquare, Edit, Trash, CalendarX, Clock, FilePlus } from 'lucide-react';

interface QuickActionsPanelProps {
  isQuickActionsOpen: boolean;
  setIsQuickActionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAppointmentId: number | null;
  handleStatusChange: (appointmentId: number, newStatus: string) => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  isQuickActionsOpen,
  setIsQuickActionsOpen,
  selectedAppointmentId,
  handleStatusChange
}) => {
  if (!isQuickActionsOpen || !selectedAppointmentId) return null;

  return (
    <div className="absolute top-0 right-0 z-50 bg-white shadow-lg rounded-md border mt-2 mr-2 overflow-hidden w-64">
      <div className="bg-indigo-50 px-3 py-2 flex justify-between items-center border-b">
        <div className="font-medium text-indigo-800 text-sm">Quick Actions</div>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setIsQuickActionsOpen(false)}
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="p-3">
        <div className="mb-2 text-xs text-gray-500">Change Status</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            className="px-3 py-2 flex items-center justify-center text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100"
            onClick={() => {
              handleStatusChange(selectedAppointmentId, 'checked-in');
              setIsQuickActionsOpen(false);
            }}
          >
            <CheckSquare size={14} className="mr-1" />
            Check In
          </button>
          
          <button
            className="px-3 py-2 flex items-center justify-center text-xs bg-indigo-50 text-indigo-700 rounded border border-indigo-200 hover:bg-indigo-100"
            onClick={() => {
              handleStatusChange(selectedAppointmentId, 'in-progress');
              setIsQuickActionsOpen(false);
            }}
          >
            <Clock size={14} className="mr-1" />
            Start
          </button>
          
          <button
            className="px-3 py-2 flex items-center justify-center text-xs bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100"
            onClick={() => {
              handleStatusChange(selectedAppointmentId, 'completed');
              setIsQuickActionsOpen(false);
            }}
          >
            <CheckSquare size={14} className="mr-1" />
            Complete
          </button>
          
          <button
            className="px-3 py-2 flex items-center justify-center text-xs bg-yellow-50 text-yellow-700 rounded border border-yellow-200 hover:bg-yellow-100"
            onClick={() => {
              handleStatusChange(selectedAppointmentId, 'waiting');
              setIsQuickActionsOpen(false);
            }}
          >
            <Clock size={14} className="mr-1" />
            Waiting
          </button>
        </div>
        
        <div className="mb-2 text-xs text-gray-500">Other Actions</div>
        <div className="space-y-2">
          <button className="w-full px-3 py-2 flex items-center text-xs text-gray-700 rounded border bg-gray-50 hover:bg-gray-100">
            <Edit size={14} className="mr-1.5" />
            Edit Appointment
          </button>
          
          <button className="w-full px-3 py-2 flex items-center text-xs text-gray-700 rounded border bg-gray-50 hover:bg-gray-100">
            <FilePlus size={14} className="mr-1.5" />
            SOAP Notes
          </button>
          
          <button className="w-full px-3 py-2 flex items-center text-xs text-gray-700 rounded border bg-gray-50 hover:bg-gray-100">
            <MessageSquare size={14} className="mr-1.5" />
            Message Owner
          </button>
          
          <button className="w-full px-3 py-2 flex items-center text-xs text-red-600 rounded border border-red-200 bg-red-50 hover:bg-red-100">
            <CalendarX size={14} className="mr-1.5" />
            Cancel Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;