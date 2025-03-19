import React from 'react';
import { X, Clock, CheckCircle, User, Phone, Mail, Calendar, MapPin, FileText, MessageSquare } from 'lucide-react';
import { Appointment, QueueItem } from '../../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface AppointmentSidebarProps {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarContent: string;
  setSidebarContent: React.Dispatch<React.SetStateAction<string>>;
  selectedAppointment: Appointment | undefined;
  queueData: QueueItem[];
  handleStatusChange: (appointmentId: number, newStatus: string) => void;
  getStatusColorClass: (status: string) => string;
}

export const AppointmentSidebar: React.FC<AppointmentSidebarProps> = ({
  showSidebar,
  setShowSidebar,
  sidebarContent,
  setSidebarContent,
  selectedAppointment,
  queueData,
  handleStatusChange,
  getStatusColorClass
}) => {
  if (!showSidebar) return null;
  
  // Render queue tab content
  const renderQueueContent = () => {
    return (
      <div>
        {queueData.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No patients in the queue
          </div>
        ) : (
          <div className="divide-y max-h-[calc(100vh-180px)] overflow-y-auto">
            {queueData.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mr-3">
                    <span className="font-medium text-indigo-600">{item.position}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="font-medium">{item.patientName}</div>
                      <div className={`px-2 py-0.5 rounded-full text-xs ${getStatusColorClass(item.status)}`}>
                        {item.status}
                      </div>
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-500">
                      {item.appointmentType} • {item.doctor}
                    </div>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center text-xs">
                        <Clock size={12} className="mr-1 text-gray-400" />
                        <span className="text-gray-600">Waiting: {item.waitingSince}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => {
                            // Handle check-in logic
                          }}
                        >
                          Check In
                        </Button>
                        
                        <Button 
                          variant="default" 
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => {
                            // Handle start appointment logic
                          }}
                        >
                          Start
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render patient details tab content
  const renderPatientContent = () => {
    if (!selectedAppointment) {
      return (
        <div className="p-6 text-center text-gray-500">
          Select an appointment to view patient details
        </div>
      );
    }
    
    return (
      <div className="p-4 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
        {/* Patient Info */}
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <User size={24} className="text-indigo-600" />
          </div>
          <div className="ml-4">
            <div className="font-medium">{selectedAppointment.pet.pet_name}</div>
            <div className="text-sm text-gray-500">{selectedAppointment.pet.pet_breed}</div>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm font-medium mb-2">Owner Information</div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <User size={14} className="mr-2 text-gray-400" />
              <span>{selectedAppointment.owner.owner_name}</span>
            </div>
            <div className="flex items-center text-sm">
              <Phone size={14} className="mr-2 text-gray-400" />
              <span>{selectedAppointment.owner.owner_phone}</span>
            </div>
            {selectedAppointment.owner.owner_email && (
              <div className="flex items-center text-sm">
                <Mail size={14} className="mr-2 text-gray-400" />
                <span>{selectedAppointment.owner.owner_email}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Appointment Details */}
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-2">Appointment Details</div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar size={14} className="mr-2 text-gray-400" />
              <span>{new Date(selectedAppointment.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock size={14} className="mr-2 text-gray-400" />
              <span>{selectedAppointment.time_slot.start_time} - {selectedAppointment.time_slot.end_time}</span>
            </div>
            <div className="flex items-center text-sm">
              <User size={14} className="mr-2 text-gray-400" />
              <span>{selectedAppointment.doctor_name}</span>
            </div>
            {selectedAppointment.room_name && (
              <div className="flex items-center text-sm">
                <MapPin size={14} className="mr-2 text-gray-400" />
                <span>{selectedAppointment.room_name}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Reason for Visit */}
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-2">Reason for Visit</div>
          <p className="text-sm">
            {selectedAppointment.reason || "No reason provided"}
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-16 px-1"
            onClick={() => handleStatusChange(selectedAppointment.id, 'checked-in')}
          >
            <CheckCircle size={16} className="mb-1" />
            <span className="text-xs">Check In</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-16 px-1"
            onClick={() => handleStatusChange(selectedAppointment.id, 'in-progress')}
          >
            <Clock size={16} className="mb-1" />
            <span className="text-xs">Start</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-16 px-1"
            onClick={() => {
              // Handle notes action
            }}
          >
            <FileText size={16} className="mb-1" />
            <span className="text-xs">Notes</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-16 px-1"
            onClick={() => {
              // Handle message action
            }}
          >
            <MessageSquare size={16} className="mb-1" />
            <span className="text-xs">Message</span>
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white border-l shadow-lg z-40 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">
          {sidebarContent === 'patient' ? 'Patient Details' : 'Appointment Queue'}
        </h3>
        <button 
          onClick={() => setShowSidebar(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>
      
      <Tabs 
        defaultValue={sidebarContent} 
        onValueChange={setSidebarContent}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid grid-cols-2 mx-4 mt-2">
          <TabsTrigger value="patient">Patient</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="patient" className="flex-1 p-0 m-0">
          {renderPatientContent()}
        </TabsContent>
        
        <TabsContent value="queue" className="flex-1 p-0 m-0">
          {renderQueueContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentSidebar;