import React from 'react';
import {
  Calendar,
  Clock,
  FilePlus,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckSquare,
  XSquare,
  Edit,
  Trash,
  PlusCircle,
  ShieldAlert
} from 'lucide-react';
import { Appointment } from '../../types';

interface AppointmentDetailsProps {
  appointment: Appointment;
  handleStatusChange: (appointmentId: number, newStatus: string) => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  appointment,
  handleStatusChange
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'checked-in':
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getFormattedTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-4">
      {/* Appointment Status */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">{appointment.reason}</h3>
          <div className="flex items-center mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
        </div>
        
        <div className="flex">
          <button className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 mr-1">
            <Edit size={16} />
          </button>
          <button className="p-1 text-gray-500 hover:text-red-700 rounded hover:bg-gray-100">
            <Trash size={16} />
          </button>
        </div>
      </div>
      
      {/* Appointment Details Card */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <div className="flex items-start space-x-2">
            <Calendar size={16} className="text-indigo-500 mt-0.5" />
            <div>
              <div className="text-sm font-medium">{appointment.date}</div>
              <div className="text-xs text-gray-500">Date</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Clock size={16} className="text-indigo-500 mt-0.5" />
            <div>
              <div className="text-sm font-medium">
                {getFormattedTime(appointment.start_time)} - {getFormattedTime(appointment.end_time)}
              </div>
              <div className="text-xs text-gray-500">Time</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <FilePlus size={16} className="text-indigo-500 mt-0.5" />
          <div>
            <div className="text-sm font-medium">{appointment.type}</div>
            <div className="text-xs text-gray-500">Appointment Type</div>
          </div>
        </div>
      </div>
      
      {/* Patient Information */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Patient Information</h4>
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-4 flex items-center space-x-3">
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-indigo-500" />
            </div>
            <div>
              <div className="font-medium">
                {appointment.pet?.pet_name || "Pet Name"}
              </div>
              <div className="text-sm text-gray-500">
                {appointment.pet?.pet_breed || "Breed"}
              </div>
            </div>
          </div>
          
          <div className="border-t px-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Owner</div>
                <div className="text-sm">{appointment.owner?.owner_name || "Owner Name"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div className="text-sm flex items-center">
                  <Phone size={14} className="mr-1 text-indigo-500" />
                  {appointment.owner?.owner_phone || "Phone Number"}
                </div>
              </div>
            </div>
          </div>
          
          {appointment.alerts && appointment.alerts.length > 0 && (
            <div className="px-4 py-3 bg-red-50 flex items-start space-x-2">
              <ShieldAlert size={16} className="text-red-500 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-red-800">Alerts</div>
                <ul className="text-xs text-red-700 mt-1">
                  {appointment.alerts.map((alert, index) => (
                    <li key={index}>{alert.description}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Doctor Information */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Staff Assignment</h4>
        <div className="bg-white border rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-indigo-500" />
            </div>
            <div>
              <div className="font-medium">{appointment.doctor_name || "Doctor"}</div>
              <div className="text-xs text-gray-500">Primary Care</div>
            </div>
          </div>
          <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
            Reassign
          </button>
        </div>
      </div>
      
      {/* Actions */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          {appointment.status === 'scheduled' && (
            <>
              <button 
                onClick={() => handleStatusChange(appointment.id, 'checked-in')}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center"
              >
                <CheckSquare size={16} className="mr-1" />
                Check In
              </button>
              <button className="px-3 py-2 border text-sm rounded hover:bg-gray-50 flex items-center justify-center">
                <XSquare size={16} className="mr-1" />
                Cancel
              </button>
            </>
          )}
          
          {appointment.status === 'checked-in' && (
            <>
              <button 
                onClick={() => handleStatusChange(appointment.id, 'in-progress')}
                className="px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center justify-center"
              >
                <CheckSquare size={16} className="mr-1" />
                Start Exam
              </button>
              <button className="px-3 py-2 border text-sm rounded hover:bg-gray-50 flex items-center justify-center">
                <MessageSquare size={16} className="mr-1" />
                Message
              </button>
            </>
          )}
          
          {appointment.status === 'in-progress' && (
            <>
              <button 
                onClick={() => handleStatusChange(appointment.id, 'completed')}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center justify-center"
              >
                <CheckSquare size={16} className="mr-1" />
                Complete
              </button>
              <button className="px-3 py-2 border text-sm rounded hover:bg-gray-50 flex items-center justify-center">
                <FilePlus size={16} className="mr-1" />
                SOAP Notes
              </button>
            </>
          )}
          
          {appointment.status === 'completed' && (
            <>
              <button className="px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center justify-center">
                <FilePlus size={16} className="mr-1" />
                View SOAP Notes
              </button>
              <button className="px-3 py-2 border text-sm rounded hover:bg-gray-50 flex items-center justify-center">
                <PlusCircle size={16} className="mr-1" />
                Follow-up
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Additional Notes */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Appointment Notes</h4>
        <div className="border rounded-md p-2 bg-white">
          <p className="text-sm text-gray-700">
            {appointment.notes || "No notes available for this appointment."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;