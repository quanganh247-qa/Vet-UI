import React from 'react';
import { Plus, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateNavigator } from './DateNavigator';
import { ViewModeSelector } from './ViewModeSelector';

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

export const AppointmentToolbar: React.FC<AppointmentToolbarProps> = ({
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
  // Filter popover state
  const [showFilters, setShowFilters] = React.useState(false);

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'checked-in', label: 'Checked In' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Doctor options (these would typically come from your API)
  const doctorOptions = [
    { value: '', label: 'All Doctors' },
    { value: 'dr-smith', label: 'Dr. Smith' },
    { value: 'dr-jones', label: 'Dr. Jones' },
    { value: 'dr-wilson', label: 'Dr. Wilson' }
  ];

  // Appointment type options
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'checkup', label: 'Check-up' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'emergency', label: 'Emergency' }
  ];

  return (
    <div className="bg-white p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleNewAppointment}
          className="flex items-center gap-1"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Appointment</span>
          <span className="sm:hidden">New</span>
        </Button>
        
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          
          {showFilters && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border z-10">
              <div className="p-3">
                <h3 className="text-sm font-medium mb-2">Filters</h3>
                
                <div className="space-y-3">
                  {/* Status Filter */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Doctor Filter */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Doctor</label>
                    <select
                      value={filterDoctor}
                      onChange={(e) => setFilterDoctor(e.target.value)}
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      {doctorOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Type Filter */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Filter Actions */}
                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterStatus('');
                        setFilterDoctor('');
                        setFilterType('');
                      }}
                    >
                      Clear All
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowFilters(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
        <div className="relative flex items-center">
          <DateNavigator
            selectedDate={selectedDate}
            formatDate={formatDate}
            goToPreviousDay={goToPreviousDay}
            goToNextDay={goToNextDay}
            goToToday={goToToday}
          />
        </div>
        
        <div className="border-l pl-3 hidden md:block">
          <ViewModeSelector
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentToolbar;