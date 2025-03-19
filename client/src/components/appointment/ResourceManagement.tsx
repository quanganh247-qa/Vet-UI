import React from 'react';
import { X, User, Home } from 'lucide-react';
import { Room, Staff } from '../../types';

interface ResourceManagementProps {
  showResourceManagement: boolean;
  setShowResourceManagement: (show: boolean) => void;
  staff: Staff[];
  rooms: Room[];
}

const ResourceManagement: React.FC<ResourceManagementProps> = ({
  showResourceManagement,
  setShowResourceManagement,
  staff,
  rooms
}) => {
  if (!showResourceManagement) return null;

  return (
    <div className="bg-white shadow-md rounded-lg m-4 overflow-hidden border">
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
        <h3 className="font-medium text-indigo-800">Resource Management</h3>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setShowResourceManagement(false)}
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-6">
        {/* Staff Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <User size={16} className="mr-2" />
            Staff
          </h4>
          <div className="space-y-3">
            {staff.map((person) => (
              <div key={person.id} className="flex items-center justify-between p-2 border rounded-md bg-white">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {person.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{person.name}</p>
                    <p className="text-xs text-gray-500">{person.role}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  person.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {person.status === 'available' ? 'Available' : 'Busy'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Rooms Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Home size={16} className="mr-2" />
            Rooms
          </h4>
          <div className="space-y-3">
            {rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-2 border rounded-md bg-white">
                <div>
                  <p className="text-sm font-medium">{room.name}</p>
                  <p className="text-xs text-gray-500">
                    {room.status === 'occupied' 
                      ? `In use: ${room.currentPatient} - Available at: ${room.availableAt}` 
                      : 'Currently available'}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  room.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : room.status === 'maintenance'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {room.status === 'available' 
                    ? 'Available' 
                    : room.status === 'maintenance'
                      ? 'Maintenance'
                      : 'In Use'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceManagement;