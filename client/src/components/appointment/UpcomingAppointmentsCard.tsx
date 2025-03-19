import React from "react";
import { Calendar, PlusCircle } from "lucide-react";

interface AppointmentPreview {
  date: string;
  time: string;
  type: string;
  doctor: string;
}

interface UpcomingAppointmentsCardProps {
  appointments: AppointmentPreview[];
  onAddAppointment?: () => void;
}

const UpcomingAppointmentsCard: React.FC<UpcomingAppointmentsCardProps> = ({
  appointments,
  onAddAppointment,
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center">
          <Calendar size={18} className="text-indigo-500 mr-2" />
          Upcoming Appointments
        </h3>
        <button 
          className="text-indigo-600 hover:text-indigo-800"
          onClick={onAddAppointment}
        >
          <PlusCircle size={18} />
        </button>
      </div>
      <div className="p-4">
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-2">
            No upcoming appointments
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment, index) => (
              <div key={index} className="bg-indigo-50 p-3 rounded-lg">
                <div className="font-medium text-indigo-800">
                  {appointment.date} - {appointment.time}
                </div>
                <div className="text-sm text-indigo-600">
                  {appointment.type}
                </div>
                <div className="text-sm text-indigo-600">
                  with {appointment.doctor}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointmentsCard;