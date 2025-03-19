import React from 'react';
import { Plus } from 'lucide-react';
import DateNavigator from './DateNavigator';
import AppointmentFilters from './AppointmentFilters';
import ViewModeSelector from './ViewModeSelector';
interface AppointmentToolbarProps {
  selectedDate: Date;
  formatDate: (date: Date) => string;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterDoctor: string;
  setFilterDoctor: (doctor: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  handleNewAppointment: () => void;
}

const AppointmentToolbar: React.FC<AppointmentToolbarProps> = ({
  selectedDate,
  formatDate,
  goToPreviousDay,
  goToNextDay,
  goToToday,
  viewMode,
  setViewMode,
  filterStatus,
  setFilterStatus,
  filterDoctor,
  setFilterDoctor,
  filterType,
  setFilterType,
  handleNewAppointment
}) => {
  return (
    <div className="bg-white border-b p-4">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <DateNavigator 
          selectedDate={selectedDate}
          formatDate={formatDate}
          goToPreviousDay={goToPreviousDay}
          goToNextDay={goToNextDay}
          goToToday={goToToday}
        />
        
        <div className="flex items-center space-x-2">
          <button 
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            onClick={handleNewAppointment}
          >
            <Plus size={16} className="mr-1" />
            Cuộc hẹn mới
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-between items-center gap-4">
        <AppointmentFilters 
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterDoctor={filterDoctor}
          setFilterDoctor={setFilterDoctor}
          filterType={filterType}
          setFilterType={setFilterType}
        />
        
        <ViewModeSelector 
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>
    </div>
  );
};

export default AppointmentToolbar; 