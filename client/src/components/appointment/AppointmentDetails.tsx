import React from 'react';
import { Clock, Calendar, User, Phone, FileText, MessageSquare } from 'lucide-react';
import { Appointment } from '../../types';

interface AppointmentDetailsProps {
  appointment: Appointment;
  handleStatusChange: (appointmentId: number, newStatus: string) => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  appointment,
  handleStatusChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-indigo-50 px-4 py-3 border-b">
        <h3 className="font-medium text-indigo-800">Appointment Details</h3>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center text-gray-500">
            🐾
          </div>
          <div>
            <div className="font-medium text-lg">{appointment.pet.pet_name}</div>
            <div className="text-sm text-gray-500">{appointment.pet.pet_breed}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-start">
            <Calendar size={16} className="text-gray-500 mt-0.5 mr-2" />
            <div>
              <div className="text-xs text-gray-500">Time</div>
              <div className="text-sm">{appointment.time_slot.start_time} - {appointment.time_slot.end_time}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock size={16} className="text-gray-500 mt-0.5 mr-2" />
            <div>
              <div className="text-xs text-gray-500">Duration</div>
              <div className="text-sm">{appointment.service.service_duration} minutes</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <User size={16} className="text-gray-500 mt-0.5 mr-2" />
            <div>
              <div className="text-xs text-gray-500">Owner</div>
              <div className="text-sm">{appointment.owner.owner_name}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <Phone size={16} className="text-gray-500 mt-0.5 mr-2" />
            <div>
              <div className="text-xs text-gray-500">Contact</div>
              <div className="text-sm">{appointment.owner.owner_phone}</div>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm font-medium mb-1">Service</div>
          <div className="text-sm bg-gray-50 p-2 rounded">{appointment.service.service_name}</div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm font-medium mb-1">Reason</div>
          <div className="text-sm bg-gray-50 p-2 rounded">{appointment.reason}</div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Status</div>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-2 py-1 text-xs rounded-full ${
                appointment.state === 'Checked In' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => handleStatusChange(appointment.id, 'Checked In')}
            >
              Checked In
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded-full ${
                appointment.state === 'Waiting' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => handleStatusChange(appointment.id, 'Waiting')}
            >
              Waiting
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded-full ${
                appointment.state === 'In Progress' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => handleStatusChange(appointment.id, 'In Progress')}
            >
              In Progress
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded-full ${
                appointment.state === 'Completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => handleStatusChange(appointment.id, 'Completed')}
            >
              Completed
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded-full ${
                appointment.state === 'No Show' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => handleStatusChange(appointment.id, 'No Show')}
            >
              No Show
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded-full ${
                appointment.state === 'Cancelled' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => handleStatusChange(appointment.id, 'Cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="flex-1 flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <FileText size={16} className="mr-2" />
            Create SOAP Note
          </button>
          <button className="flex items-center justify-center px-3 py-2 border rounded-md hover:bg-gray-50">
            <MessageSquare size={16} className="mr-2" />
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;