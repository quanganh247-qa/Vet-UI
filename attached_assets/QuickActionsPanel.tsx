import React from 'react';
import { X, CheckCircle, Play, MessageSquare, Edit, XCircle } from 'lucide-react';

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
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Thao tác nhanh</h3>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setIsQuickActionsOpen(false)}
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <button 
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center"
          onClick={() => {
            handleStatusChange(selectedAppointmentId, 'Checked In');
            setIsQuickActionsOpen(false);
          }}
        >
          <CheckCircle size={14} className="mr-1" />
          Check-in
        </button>
        
        <button 
          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center justify-center"
          onClick={() => {
            handleStatusChange(selectedAppointmentId, 'In Progress');
            setIsQuickActionsOpen(false);
          }}
        >
          <Play size={14} className="mr-1" />
          Bắt đầu khám
        </button>
        
        <button 
          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center justify-center"
          onClick={() => {
            handleStatusChange(selectedAppointmentId, 'Completed');
            setIsQuickActionsOpen(false);
          }}
        >
          <CheckCircle size={14} className="mr-1" />
          Hoàn thành
        </button>
        
        <button className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50 flex items-center justify-center">
          <MessageSquare size={14} className="mr-1" />
          Tin nhắn
        </button>
        
        <button className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50 flex items-center justify-center">
          <Edit size={14} className="mr-1" />
          Sửa
        </button>
        
        <button className="px-3 py-1.5 border text-red-600 text-sm rounded hover:bg-red-50 flex items-center justify-center">
          <XCircle size={14} className="mr-1" />
          Hủy
        </button>
      </div>
    </div>
  );
};

export default QuickActionsPanel; 