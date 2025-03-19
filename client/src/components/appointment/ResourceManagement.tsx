import React, { useState } from 'react';
import { X, Users, DoorOpen } from 'lucide-react';
import { Staff, Room } from '../../types';
import { ResourceList } from './ResourceList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResourceManagementProps {
  showResourceManagement: boolean;
  setShowResourceManagement: (show: boolean) => void;
  staff: Staff[];
  rooms: Room[];
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({
  showResourceManagement,
  setShowResourceManagement,
  staff,
  rooms
}) => {
  // Filter options
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  
  // Filter staff by status or role
  const filteredStaff = staff.filter(member => {
    if (staffFilter === 'all') return true;
    if (staffFilter === 'available') return member.status.toLowerCase() === 'available';
    if (staffFilter === 'busy') return member.status.toLowerCase() === 'busy' || member.status.toLowerCase() === 'occupied';
    return member.role.toLowerCase().includes(staffFilter.toLowerCase());
  });
  
  // Filter rooms by status or type
  const filteredRooms = rooms.filter(room => {
    if (roomFilter === 'all') return true;
    if (roomFilter === 'available') return room.status.toLowerCase() === 'available';
    if (roomFilter === 'occupied') return room.status.toLowerCase() === 'occupied';
    if (roomFilter === 'cleaning') return room.status.toLowerCase() === 'cleaning';
    return room.type.toLowerCase().includes(roomFilter.toLowerCase());
  });
  
  if (!showResourceManagement) return null;
  
  return (
    <div className="bg-white border-l shadow-lg h-full flex flex-col" style={{ width: '320px' }}>
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="font-medium">Resources</h3>
        <button 
          onClick={() => setShowResourceManagement(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>
      
      <Tabs defaultValue="staff" className="flex-1 flex flex-col">
        <TabsList className="flex w-full rounded-none border-b">
          <TabsTrigger value="staff" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600">
            <div className="flex items-center">
              <Users size={16} className="mr-2" />
              Staff
            </div>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600">
            <div className="flex items-center">
              <DoorOpen size={16} className="mr-2" />
              Rooms
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="staff" className="flex-1 flex flex-col p-0 m-0">
          {/* Staff Filters */}
          <div className="p-3 bg-gray-50 border-b">
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="all">All Staff</option>
              <option value="available">Available</option>
              <option value="busy">Busy/Occupied</option>
              <option value="veterinarian">Veterinarians</option>
              <option value="technician">Technicians</option>
              <option value="assistant">Assistants</option>
              <option value="receptionist">Receptionists</option>
            </select>
          </div>
          
          {/* Staff List */}
          <div className="flex-1 overflow-y-auto">
            {filteredStaff.length > 0 ? (
              <ResourceList resources={filteredStaff} />
            ) : (
              <div className="p-6 text-center text-gray-500">
                No staff members match your filter
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="rooms" className="flex-1 flex flex-col p-0 m-0">
          {/* Room Filters */}
          <div className="p-3 bg-gray-50 border-b">
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="all">All Rooms</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning</option>
              <option value="exam">Exam Rooms</option>
              <option value="surgery">Surgery Rooms</option>
              <option value="lab">Lab Rooms</option>
            </select>
          </div>
          
          {/* Room List */}
          <div className="flex-1 overflow-y-auto">
            {filteredRooms.length > 0 ? (
              <ResourceList resources={filteredRooms} />
            ) : (
              <div className="p-6 text-center text-gray-500">
                No rooms match your filter
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceManagement;