import React from 'react';
import { Filter } from 'lucide-react';

interface AppointmentFiltersProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterDoctor: string;
  setFilterDoctor: (doctor: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
}

const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  filterStatus,
  setFilterStatus,
  filterDoctor,
  setFilterDoctor,
  filterType,
  setFilterType
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center">
        <Filter size={16} className="text-gray-500 mr-2" />
        <span className="text-sm font-medium">Filters:</span>
      </div>
      
      <select 
        className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="all">All Statuses</option>
        <option value="Scheduled">Scheduled</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Checked In">Checked In</option>
        <option value="Waiting">Waiting</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
        <option value="No Show">No Show</option>
      </select>
      
      <select 
        className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={filterDoctor}
        onChange={(e) => setFilterDoctor(e.target.value)}
      >
        <option value="all">All Doctors</option>
        <option value="Dr. Roberts">Dr. Roberts</option>
        <option value="Dr. Carter">Dr. Carter</option>
        <option value="Dr. Smith">Dr. Smith</option>
      </select>
      
      <select 
        className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
      >
        <option value="all">All Appointment Types</option>
        <option value="Check-up">Check-up</option>
        <option value="Surgery">Surgery</option>
        <option value="Sick Visit">Sick Visit</option>
        <option value="Vaccination">Vaccination</option>
        <option value="Follow-up">Follow-up</option>
        <option value="Dental Cleaning">Dental Cleaning</option>
        <option value="General Checkup">General Checkup</option>
      </select>
    </div>
  );
};

export default AppointmentFilters;