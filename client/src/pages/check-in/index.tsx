import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Button 
} from '@/components/ui/button';
import { Check, X, AlertTriangle } from 'lucide-react';

import { getAppointmentById } from '@/services/appointment-services';
import { getPatientById } from '@/services/pet-services';
import { Appointment, Doctor, Patient } from '@/types';

const CheckIn = () => {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedTab, setSelectedTab] = useState('check-in');
  
  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (id) {
        try {
          const appointmentData = await getAppointmentById(parseInt(id));
          if (appointmentData) {
            setAppointment(appointmentData);
            console.log('Appointment Data:', appointmentData);
            
            // Add check for pet_id
            if (appointmentData.pet?.pet_id) {
              const patientData = await getPatientById(appointmentData.pet.pet_id);
              if (patientData) {
                setPatient(patientData);
                console.log("Patient Data:", patientData);
              }
            } else {
              console.error("No pet ID found in appointment data");
            }
          } else {
            console.log("Appointment not found");
            setLocation('/appointments');
          }
        } catch (error) {
          console.error("Error fetching appointment:", error);
          setLocation('/appointments');
        }
      }
    };

    fetchAppointmentData();
  }, [id]);
  
  if (!appointment || !patient ) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading appointment details...</p>
      </div>
    );
  }
  
  const handleCheckIn = () => {
    // Simulating check-in action
    console.log('Patient checked in', { appointment, notes });
    setLocation('/appointment-flow');
  };
  
  const handleCancel = () => {
    setLocation('/appointment-flow');
  };
  
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 bg-blue-100 p-1.5 rounded-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </span>
                <div>
                  <span className="text-blue-600 text-sm font-medium">Scheduled</span>
                  <div className="font-semibold text-gray-900">{appointment.time_slot.start_time} - {appointment.time_slot.end_time}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-gray-600 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {appointment.doctor.doctor_name}
                </span>
                <span className="text-gray-600 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  {appointment.service.service_name}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 px-4 py-3 flex items-center space-x-3 bg-gray-50">
                <img 
                  src={"https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"} 
                  alt={patient.name} 
                  className="h-10 w-10 rounded-lg object-cover border border-gray-200 shadow-sm"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{patient.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm text-gray-600">{patient.breed}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-gray-600">ID: {patient.petid}</p>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="check-in" className="px-4 py-4" onValueChange={setSelectedTab}>
                <TabsList className="inline-flex p-0.5 bg-gray-100 rounded-md">
                  <TabsTrigger value="check-in" className="px-3 py-1.5 text-sm font-medium rounded transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">Check-in</TabsTrigger>
                  <TabsTrigger value="soap-notes" className="px-3 py-1.5 text-sm font-medium rounded transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">SOAP Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="check-in" className="pt-4">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Check-in {patient.name}</h3>
                      
                      <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-4">Verify Owner Information</h4>
                        
                        <div className="space-y-6">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">Owner Name</label>
                              <div className="flex items-center">
                                <div className="font-medium text-gray-900">{appointment.owner.owner_name}</div>
                                <Check className="w-4 h-4 text-green-500 ml-2" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                              <div className="flex items-center">
                                <div className="font-medium text-gray-900">{appointment.owner.owner_phone}</div>
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">Verified</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                            <div className="flex items-center">
                              <div className="font-medium text-gray-900">{appointment.owner.owner_address}</div>
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">Verified</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-4">Appointment Details</h4>
                        
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-600 mb-2">Appointment Reason</label>
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                            {appointment.reason}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-600 mb-2">Additional Notes from Owner</label>
                          <Textarea 
                            placeholder="Enter notes from owner..." 
                            className="min-h-[120px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="soap-notes" className="pt-4">
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h3 className="text-base font-medium text-gray-900 mb-3">Subjective</h3>
                      <Textarea 
                        placeholder="Enter Subjective..."
                        className="min-h-[180px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCheckIn}
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 flex items-center"
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    Complete Check-in
                  </Button>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;