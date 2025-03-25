import React, { useState } from 'react';
import { X, Users, DoorOpen, Search, Plus, Check, Clock, AlertTriangle, Activity } from 'lucide-react';
import { Staff, Room } from '../../types';
import { ResourceList } from './ResourceList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ResourceManagementProps {
  showResourceManagement: boolean;
  setShowResourceManagement: (show: boolean) => void;
  staff: Staff[];
  rooms: Room[];
  onAssignRoom?: (roomId: number, staffId: number | null, patientName: string | null) => void;
  onChangeRoomStatus?: (roomId: number, newStatus: string) => void;
  onChangeStaffStatus?: (staffId: number, newStatus: string) => void;
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({
  showResourceManagement,
  setShowResourceManagement,
  staff,
  rooms,
  onAssignRoom,
  onChangeRoomStatus,
  onChangeStaffStatus
}) => {
  // Filter options
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [staffSearch, setStaffSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [patientNameToAssign, setPatientNameToAssign] = useState('');
  const [selectedStaffToAssign, setSelectedStaffToAssign] = useState<number | null>(null);
  
  // Filter staff by status or role
  const filteredStaff = staff.filter(member => {
    const statusMatch = staffFilter === 'all' || 
      (staffFilter === 'available' && member.status.toLowerCase() === 'available') ||
      (staffFilter === 'busy' && ['busy', 'occupied'].includes(member.status.toLowerCase())) ||
      (staffFilter.toLowerCase() === member.role.toLowerCase());
      
    const searchMatch = !staffSearch || 
      member.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      member.role.toLowerCase().includes(staffSearch.toLowerCase());
      
    return statusMatch && searchMatch;
  });
  
  // Filter rooms by status or type
  const filteredRooms = rooms.filter(room => {
    const statusMatch = roomFilter === 'all' || 
      (roomFilter === 'available' && room.status.toLowerCase() === 'available') ||
      (roomFilter === 'occupied' && room.status.toLowerCase() === 'occupied') ||
      (roomFilter === 'cleaning' && room.status.toLowerCase() === 'cleaning') ||
      (roomFilter.toLowerCase() === room.type.toLowerCase());
      
    const searchMatch = !roomSearch || 
      room.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
      (room.currentPatient && room.currentPatient.toLowerCase().includes(roomSearch.toLowerCase()));
      
    return statusMatch && searchMatch;
  });
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>;
      case 'occupied':
      case 'busy':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Occupied</Badge>;
      case 'cleaning':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Cleaning</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Maintenance</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };
  
  // Handle room assignment
  const handleAssignRoom = () => {
    if (selectedRoomId && onAssignRoom) {
      onAssignRoom(selectedRoomId, selectedStaffToAssign, patientNameToAssign);
      setShowAssignDialog(false);
      setPatientNameToAssign('');
      setSelectedStaffToAssign(null);
    }
  };
  
  const handleRoomStatusChange = (roomId: number, newStatus: string) => {
    if (onChangeRoomStatus) {
      onChangeRoomStatus(roomId, newStatus);
    }
  };
  
  const handleStaffStatusChange = (staffId: number, newStatus: string) => {
    if (onChangeStaffStatus) {
      onChangeStaffStatus(staffId, newStatus);
    }
  };
  
  const openAssignDialog = (roomId: number) => {
    setSelectedRoomId(roomId);
    setShowAssignDialog(true);
  };
  
  if (!showResourceManagement) return null;
  
  return (
    <div className="fixed inset-y-0 right-0 z-20 bg-white border-l shadow-lg flex flex-col" style={{ width: '380px' }}>
      <div className="p-3 border-b flex justify-between items-center bg-indigo-50">
        <h3 className="font-medium text-indigo-800">Resource Management</h3>
        <button 
          onClick={() => setShowResourceManagement(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>
      
      <Tabs defaultValue="staff" className="flex-1 flex flex-col">
        <TabsList className="flex w-full rounded-none border-b p-0">
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
        
        {/* Staff Tab */}
        <TabsContent value="staff" className="flex-1 flex flex-col p-0 m-0">
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex flex-col space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search staff..." 
                  className="pl-8 text-sm"
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                />
              </div>
              
              <Select value={staffFilter} onValueChange={setStaffFilter}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Filter staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy/Occupied</SelectItem>
                  <SelectItem value="veterinarian">Veterinarians</SelectItem>
                  <SelectItem value="technician">Technicians</SelectItem>
                  <SelectItem value="assistant">Assistants</SelectItem>
                  <SelectItem value="receptionist">Receptionists</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Staff List */}
          <ScrollArea className="flex-1">
            {filteredStaff.length > 0 ? (
              <div className="divide-y">
                {filteredStaff.map((member) => (
                  <div key={member.id} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.name} 
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <Users size={14} className="text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      {getStatusBadge(member.status)}
                    </div>
                    
                    {onChangeStaffStatus && (
                      <div className="mt-2 flex space-x-1 justify-end">
                        {member.status.toLowerCase() !== 'available' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 text-xs px-2 text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleStaffStatusChange(member.id, 'Available')}
                          >
                            <Check size={12} className="mr-1" />
                            Set Available
                          </Button>
                        )}
                        
                        {member.status.toLowerCase() !== 'busy' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 text-xs px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleStaffStatusChange(member.id, 'Busy')}
                          >
                            <Activity size={12} className="mr-1" />
                            Set Busy
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No staff members match your filter
              </div>
            )}
          </ScrollArea>
          
          <div className="p-3 border-t bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>Total: {staff.length}</div>
              <div>{staff.filter(s => s.status.toLowerCase() === 'available').length} available</div>
            </div>
          </div>
        </TabsContent>
        
        {/* Rooms Tab */}
        <TabsContent value="rooms" className="flex-1 flex flex-col p-0 m-0">
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex flex-col space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search rooms..." 
                  className="pl-8 text-sm"
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                />
              </div>
              
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Filter rooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="exam">Exam Rooms</SelectItem>
                  <SelectItem value="surgery">Surgery Rooms</SelectItem>
                  <SelectItem value="lab">Lab Rooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Room List */}
          <ScrollArea className="flex-1">
            {filteredRooms.length > 0 ? (
              <div className="divide-y">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center mr-3">
                          <DoorOpen size={16} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium">{room.name}</p>
                          <p className="text-xs text-gray-500">{room.type}</p>
                        </div>
                      </div>
                      {getStatusBadge(room.status)}
                    </div>
                    
                    {room.currentPatient && (
                      <div className="mt-1 text-sm text-gray-600 ml-11">
                        <p>Patient: <span className="font-medium">{room.currentPatient}</span></p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock size={12} className="mr-1" />
                          <span>Available at: {room.availableAt}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 flex space-x-1 justify-end">
                      {(room.status.toLowerCase() === 'available' && onAssignRoom) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-xs px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => openAssignDialog(room.id)}
                        >
                          <Plus size={12} className="mr-1" />
                          Assign
                        </Button>
                      )}
                      
                      {onChangeRoomStatus && (
                        <>
                          {room.status.toLowerCase() !== 'available' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-7 text-xs px-2 text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleRoomStatusChange(room.id, 'Available')}
                            >
                              <Check size={12} className="mr-1" />
                              Available
                            </Button>
                          )}
                          
                          {room.status.toLowerCase() !== 'cleaning' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-7 text-xs px-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() => handleRoomStatusChange(room.id, 'Cleaning')}
                            >
                              <AlertTriangle size={12} className="mr-1" />
                              Cleaning
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No rooms match your filter
              </div>
            )}
          </ScrollArea>
          
          <div className="p-3 border-t bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>Total: {rooms.length}</div>
              <div>{rooms.filter(r => r.status.toLowerCase() === 'available').length} available</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Room Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Room</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="patientName" className="text-sm font-medium">
                Patient Name
              </label>
              <Input
                id="patientName"
                placeholder="Enter patient name"
                value={patientNameToAssign}
                onChange={(e) => setPatientNameToAssign(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="assignedStaff" className="text-sm font-medium">
                Assigned Staff (Optional)
              </label>
              <Select value={selectedStaffToAssign?.toString() || ''} onValueChange={(value) => setSelectedStaffToAssign(value ? parseInt(value) : null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {staff
                    .filter(s => s.status.toLowerCase() === 'available')
                    .map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name} ({s.role})
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignRoom}
              disabled={!patientNameToAssign.trim()}
            >
              Assign Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceManagement;