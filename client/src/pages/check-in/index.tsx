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
import { 
  getAppointmentById, 
  getPatientById, 
  getDoctorById,
  type Appointment,
  type Patient,
  type Doctor
} from '@/data/mock-data';

const CheckIn = () => {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedTab, setSelectedTab] = useState('check-in');
  
  useEffect(() => {
    if (id) {
      const appointmentData = getAppointmentById(parseInt(id));
      if (appointmentData) {
        setAppointment(appointmentData);
        
        const patientData = getPatientById(appointmentData.patient_id);
        if (patientData) {
          setPatient(patientData);
        }
        
        const doctorData = getDoctorById(appointmentData.doctor_id);
        if (doctorData) {
          setDoctor(doctorData);
        }
      }
    }
  }, [id]);
  
  if (!appointment || !patient || !doctor) {
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
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Today's Appointments</h1>
            <div className="mt-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search patients..." 
                  className="w-64 pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2C7BE5]"
                />
                <svg 
                  className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <div>
                <span className="text-gray-500 text-sm">Scheduled</span>
                <div className="font-semibold">{appointment.start_time} - {appointment.end_time}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">🏆 {doctor.name}</span>
                <span className="text-gray-500 text-sm">👨‍⚕️ {appointment.type}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar - Patient list (simulated) */}
          <div className="col-span-3">
            <div className="bg-indigo-50 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                  <img 
                    src={patient.image_url || "https://via.placeholder.com/48"} 
                    alt={patient.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{patient.name}</h3>
                  <p className="text-sm text-gray-500">{patient.species}, {patient.breed}</p>
                  <p className="text-sm text-gray-500">Owner: {patient.owner_name}</p>
                </div>
              </div>
              <div className="mt-2 flex space-x-2">
                <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">Scheduled</span>
                <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">{appointment.type}</span>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="col-span-9">
            <div className="bg-white border rounded-lg">
              <div className="border-b px-4 py-3 flex items-center space-x-4">
                <img 
                  src={patient.image_url || "https://via.placeholder.com/48"} 
                  alt={patient.name} 
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-medium">{patient.name}</h2>
                  <p className="text-sm text-gray-500">{patient.species}, {patient.breed}</p>
                  <p className="text-sm text-gray-500">ID: #{patient.id}</p>
                </div>
                
                {patient.alerts && patient.alerts.length > 0 && (
                  <div className="ml-auto">
                    {patient.alerts.map((alert, idx) => (
                      <div key={idx} className="flex items-center text-amber-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Allergic to {alert.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Tabs defaultValue="check-in" className="px-4 py-4" onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="check-in">Check-in</TabsTrigger>
                  <TabsTrigger value="soap-notes">SOAP Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="check-in" className="pt-4">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-md p-4">
                      <h3 className="text-lg font-medium text-blue-800 mb-2">Check-in {patient.name}</h3>
                      
                      <div className="bg-white rounded-md p-4 border border-blue-100">
                        <h4 className="font-medium text-gray-700 mb-4">Verify Owner Information</h4>
                        
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">Owner Name</label>
                            <div className="flex items-center">
                              <div className="font-medium">{patient.owner_name}</div>
                              <Check className="w-4 h-4 text-green-500 ml-2" />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                            <div className="flex items-center">
                              <div className="font-medium">{patient.owner_phone}</div>
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Verified</span>
                            </div>
                          </div>
                          
                          <div className="col-span-2">
                            <label className="block text-sm text-gray-500 mb-1">Address</label>
                            <div className="flex items-center">
                              <div className="font-medium">{patient.owner_address}</div>
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Verified</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-right">
                          <Button variant="outline" size="sm" className="text-blue-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Update Information
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 bg-white rounded-md p-4 border border-blue-100">
                        <h4 className="font-medium text-gray-700 mb-4">Appointment Details</h4>
                        
                        <div className="mb-3">
                          <label className="block text-sm text-gray-500 mb-1">Appointment Reason</label>
                          <div className="p-2 bg-gray-50 rounded border border-gray-200">
                            {appointment.reason}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm text-gray-500 mb-1">Additional Notes from Owner</label>
                          <Textarea 
                            placeholder="Enter notes from owner..." 
                            className="min-h-[100px]"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="soap-notes" className="pt-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-800">SOAP Notes</h3>
                      <Button 
                        onClick={() => setLocation(`/soap-notes/${appointment.id}`)}
                        className="bg-[#2C7BE5] hover:bg-blue-700"
                      >
                        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Open SOAP Notes
                      </Button>
                    </div>
                    
                    <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800 mb-4 flex items-start">
                      <svg className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 9v4m0 4h.01M8.4 3.57A12 12 0 0 0 7 3c-1.857 0-3.635.553-5.2 1.6l3.2 9.6 7-4.2 3 4.2 7-9.6c-1.6-1.2-3.2-1.6-4.8-1.6-.927 0-1.86.187-2.735.56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div>
                        <span className="font-medium">Pre-exam documentation:</span> Nurses can document subjective information from the client before the doctor enters the exam room. This helps streamline the appointment workflow.
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Chief Complaint</label>
                        <Textarea 
                          placeholder="Enter the main reason for the visit as described by the client..." 
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">History of Present Illness</label>
                        <Textarea 
                          placeholder="Enter additional details about the condition, duration, severity..." 
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      Complete SOAP notes will be available after opening the full SOAP editor.
                    </div>
                  </div>
                </TabsContent>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="text-gray-600"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  
                  <Button 
                    onClick={handleCheckIn}
                    disabled={selectedTab !== 'check-in'}
                    className="bg-[#2C7BE5] hover:bg-blue-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
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