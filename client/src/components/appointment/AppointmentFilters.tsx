import React from 'react';

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
    <div className="bg-white border rounded-lg shadow-sm p-4">
      <h3 className="font-medium text-gray-700 mb-3">Appointment Filters</h3>
      
      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Status</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterStatus === '' 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterStatus('')}
            >
              All
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterStatus === 'scheduled' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterStatus('scheduled')}
            >
              Scheduled
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterStatus === 'checked-in' 
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterStatus('checked-in')}
            >
              Checked In
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterStatus === 'waiting' 
                  ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterStatus('waiting')}
            >
              Waiting
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterStatus === 'in-progress' 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterStatus('in-progress')}
            >
              In Progress
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterStatus === 'completed' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </button>
          </div>
        </div>
        
        {/* Doctor Filter */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Doctor</label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
          >
            <option value="">All Doctors</option>
            <option value="1">Dr. Sarah Wilson</option>
            <option value="2">Dr. Michael Chen</option>
            <option value="3">Dr. Emily Rodriguez</option>
            <option value="4">Dr. James Thompson</option>
          </select>
        </div>
        
        {/* Type Filter */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Appointment Type</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterType === '' 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterType('')}
            >
              All Types
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterType === 'check-up' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterType('check-up')}
            >
              Check-up
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterType === 'vaccination' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterType('vaccination')}
            >
              Vaccination
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterType === 'surgery' 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterType('surgery')}
            >
              Surgery
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterType === 'dental' 
                  ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterType('dental')}
            >
              Dental
            </button>
            <button
              className={`px-3 py-1.5 text-xs rounded-md ${
                filterType === 'emergency' 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setFilterType('emergency')}
            >
              Emergency
            </button>
          </div>
        </div>
      </div>
      
      {/* Clear Filters Button */}
      <div className="mt-4 pt-3 border-t">
        <button
          className="w-full px-3 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-md text-sm hover:bg-gray-200"
          onClick={() => {
            setFilterStatus('');
            setFilterDoctor('');
            setFilterType('');
          }}
          disabled={!filterStatus && !filterDoctor && !filterType}
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default AppointmentFilters;