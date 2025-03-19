import React from 'react';
import { X, Check, Clock, ClipboardList, MessageSquare, Printer, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsPanelProps {
  isQuickActionsOpen: boolean;
  setIsQuickActionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAppointmentId: number | null;
  handleStatusChange: (appointmentId: number, newStatus: string) => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  isQuickActionsOpen,
  setIsQuickActionsOpen,
  selectedAppointmentId,
  handleStatusChange
}) => {
  if (!isQuickActionsOpen || !selectedAppointmentId) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium">Quick Actions</h3>
          <button 
            onClick={() => setIsQuickActionsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              What would you like to do with this appointment?
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Check In */}
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 px-2"
              onClick={() => {
                handleStatusChange(selectedAppointmentId, 'checked-in');
                setIsQuickActionsOpen(false);
              }}
            >
              <Check size={20} className="mb-1 text-green-600" />
              <span className="text-xs text-center">Check In</span>
            </Button>
            
            {/* Start Appointment */}
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 px-2"
              onClick={() => {
                handleStatusChange(selectedAppointmentId, 'in-progress');
                setIsQuickActionsOpen(false);
              }}
            >
              <Clock size={20} className="mb-1 text-indigo-600" />
              <span className="text-xs text-center">Start Appointment</span>
            </Button>
            
            {/* Complete */}
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 px-2"
              onClick={() => {
                handleStatusChange(selectedAppointmentId, 'completed');
                setIsQuickActionsOpen(false);
              }}
            >
              <ClipboardList size={20} className="mb-1 text-blue-600" />
              <span className="text-xs text-center">Complete</span>
            </Button>
            
            {/* Message */}
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 px-2"
              onClick={() => {
                // Handle messaging functionality
                setIsQuickActionsOpen(false);
              }}
            >
              <MessageSquare size={20} className="mb-1 text-purple-600" />
              <span className="text-xs text-center">Message</span>
            </Button>
            
            {/* Print */}
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 px-2"
              onClick={() => {
                // Handle print functionality
                setIsQuickActionsOpen(false);
              }}
            >
              <Printer size={20} className="mb-1 text-gray-600" />
              <span className="text-xs text-center">Print</span>
            </Button>
            
            {/* Edit */}
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 px-2"
              onClick={() => {
                // Handle edit functionality
                setIsQuickActionsOpen(false);
              }}
            >
              <Edit size={20} className="mb-1 text-amber-600" />
              <span className="text-xs text-center">Edit</span>
            </Button>
            
            {/* Cancel */}
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20 px-2 col-span-2 border-red-200 hover:border-red-300 hover:bg-red-50"
              onClick={() => {
                handleStatusChange(selectedAppointmentId, 'cancelled');
                setIsQuickActionsOpen(false);
              }}
            >
              <Trash size={20} className="mb-1 text-red-600" />
              <span className="text-xs text-center">Cancel Appointment</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;