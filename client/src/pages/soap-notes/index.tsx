import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronLeft,
  Save,
  Mic, 
  MicOff,
  AlertTriangle
} from 'lucide-react';
import { 
  getAppointmentById, 
  getPatientById, 
  getDoctorById,
  type Appointment,
  type Patient,
  type Doctor
} from '@/data/mock-data';

const SoapNotes = () => {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const [soapData, setSoapData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });
  
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
  
  const handleInputChange = (field: string, value: string) => {
    setSoapData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  type InputChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real application, this would trigger speech recognition
  };
  
  const handleSave = () => {
    console.log('Saving SOAP notes:', soapData);
    // In a real application, this would save the SOAP data to the backend
    alert('SOAP notes saved successfully!');
  };
  
  const handleBackToPatient = () => {
    if (patient) {
      setLocation(`/patient/${patient.id}`);
    } else {
      setLocation('/appointment-flow');
    }
  };
  
  if (!appointment || !patient || !doctor) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading patient details...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBackToPatient}
            className="mr-4 p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">SOAP Notes</h1>
            <p className="text-gray-600">
              Patient: {patient.name} • Appointment: {appointment.date} {appointment.start_time}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar - Patient info */}
          <div className="col-span-3">
            <div className="bg-indigo-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                  <img 
                    src={patient.image_url || "https://via.placeholder.com/48"} 
                    alt={patient.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{patient.name}</h3>
                  <p className="text-sm text-gray-500">
                    {patient.species}, {patient.breed}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Age:</div>
                  <div className="font-medium">{patient.age}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Sex:</div>
                  <div className="font-medium">{patient.sex}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Weight:</div>
                  <div className="font-medium">{patient.weight}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Color:</div>
                  <div className="font-medium">{patient.color}</div>
                </div>
              </div>
              
              {patient.alerts && patient.alerts.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-amber-700 flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Alerts
                  </h4>
                  {patient.alerts.map((alert, idx) => (
                    <div key={idx} className="bg-amber-50 p-2 rounded text-sm mb-1">
                      <span className="font-medium">{alert.type}:</span> {alert.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium mb-2">Appointment Details</h3>
              
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Date:</div>
                  <div className="font-medium">{appointment.date}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Time:</div>
                  <div className="font-medium">{appointment.start_time} - {appointment.end_time}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Type:</div>
                  <div className="font-medium">{appointment.type}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-gray-500">Doctor:</div>
                  <div className="font-medium">{doctor.name}</div>
                </div>
                
                <div className="col-span-2 mt-2">
                  <div className="text-gray-500">Reason for Visit:</div>
                  <div className="font-medium mt-1 p-2 bg-gray-50 rounded">{appointment.reason}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content - SOAP notes */}
          <div className="col-span-9">
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-indigo-50 px-4 py-3 border-b flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                  </div>
                  <h3 className="font-medium">SOAP Notes Editor</h3>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleRecording}
                    className={isRecording ? "text-red-600 border-red-200 bg-red-50" : ""}
                  >
                    {isRecording ? (
                      <><MicOff className="h-4 w-4 mr-1" /> Stop Recording</>
                    ) : (
                      <><Mic className="h-4 w-4 mr-1" /> Start Recording</>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-blue-600"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Notes
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList>
                    <TabsTrigger value="all">All Sections</TabsTrigger>
                    <TabsTrigger value="subjective">Subjective</TabsTrigger>
                    <TabsTrigger value="objective">Objective</TabsTrigger>
                    <TabsTrigger value="assessment">Assessment</TabsTrigger>
                    <TabsTrigger value="plan">Plan</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-6 py-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        S - Subjective (Patient/Client Report)
                      </label>
                      <Textarea 
                        placeholder="Enter client's description of the problem..."
                        className="min-h-[100px]"
                        value={soapData.subjective}
                        onChange={(e: InputChangeEvent) => handleInputChange('subjective', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        O - Objective (Clinical Findings)
                      </label>
                      <Textarea 
                        placeholder="Enter physical exam findings, vital signs, test results..."
                        className="min-h-[100px]"
                        value={soapData.objective}
                        onChange={(e: InputChangeEvent) => handleInputChange('objective', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        A - Assessment (Diagnosis)
                      </label>
                      <Textarea 
                        placeholder="Enter diagnosis or assessment of the condition..."
                        className="min-h-[100px]"
                        value={soapData.assessment}
                        onChange={(e) => handleInputChange('assessment', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        P - Plan (Treatment & Next Steps)
                      </label>
                      <Textarea 
                        placeholder="Enter treatment plan, medications, follow-up instructions..."
                        className="min-h-[100px]"
                        value={soapData.plan}
                        onChange={(e) => handleInputChange('plan', e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="subjective" className="py-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        S - Subjective (Patient/Client Report)
                      </label>
                      <Textarea 
                        placeholder="Enter client's description of the problem..."
                        className="min-h-[300px]"
                        value={soapData.subjective}
                        onChange={(e) => handleInputChange('subjective', e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="objective" className="py-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        O - Objective (Clinical Findings)
                      </label>
                      <Textarea 
                        placeholder="Enter physical exam findings, vital signs, test results..."
                        className="min-h-[300px]"
                        value={soapData.objective}
                        onChange={(e) => handleInputChange('objective', e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="assessment" className="py-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        A - Assessment (Diagnosis)
                      </label>
                      <Textarea 
                        placeholder="Enter diagnosis or assessment of the condition..."
                        className="min-h-[300px]"
                        value={soapData.assessment}
                        onChange={(e) => handleInputChange('assessment', e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="plan" className="py-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        P - Plan (Treatment & Next Steps)
                      </label>
                      <Textarea 
                        placeholder="Enter treatment plan, medications, follow-up instructions..."
                        className="min-h-[300px]"
                        value={soapData.plan}
                        onChange={(e) => handleInputChange('plan', e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSave} className="bg-[#2C7BE5] hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-1" />
                    Save SOAP Notes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoapNotes;