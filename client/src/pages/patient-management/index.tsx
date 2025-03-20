import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle,
  Calendar,
  FileText,
  Syringe,
  BarChart,
  MessageSquare,
  Printer,
  Mail,
  Pencil,
  FilePlus2,
  XCircle
} from 'lucide-react';
// import { Appointment, Patient } from '@/types';
import { Appointment, getAppointmentsByPatientId, getMedicalRecordsByPatientId, getPatientById, getVaccinesByPatientId, MedicalRecord, Patient, Vaccine } from '@/data/mock-data';


const PatientManagement = () => {
  const { id } = useParams<{ id?: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  
  useEffect(() => {
    if (id) {
      const patientId = parseInt(id);
      const patientData = getPatientById(patientId);
      
      if (patientData) {
        setPatient(patientData);
        setAppointments(getAppointmentsByPatientId(patientId));
        setMedicalRecords(getMedicalRecordsByPatientId(patientId));
        setVaccines(getVaccinesByPatientId(patientId));
      }
    }
  }, [id]);
  
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading patient details...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div className="flex">
            <div className="h-24 w-24 rounded-lg overflow-hidden mr-6">
              <img 
                src={patient.image_url || "https://via.placeholder.com/96"} 
                alt={patient.name} 
                className="h-full w-full object-cover"
              />
            </div>
            
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{patient.name}</h1>
              <div className="flex items-center text-gray-600 mt-1">
                <span>{patient.species}, {patient.breed}</span>
                <span className="mx-2">•</span>
                <span>{patient.sex}</span>
                <span className="mx-2">•</span>
                <span>{patient.age}</span>
                <span className="mx-2">•</span>
                <span>{patient.weight}</span>
              </div>
              
              <div className="flex items-center mt-1 text-gray-600">
                <span>Owner: {patient.owner_name}</span>
                <span className="mx-2">•</span>
                <span>{patient.owner_phone}</span>
              </div>
              
              <div className="flex items-center mt-4 space-x-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Insurance</h3>
              <div className="font-medium">{patient.insurance_provider}</div>
              <div className="text-sm text-gray-600">Policy: {patient.insurance_policy}</div>
              <div className="text-sm text-gray-600">Coverage: {patient.insurance_coverage}</div>
            </div>
            
            {patient.alerts && patient.alerts.length > 0 && (
              <div className="bg-amber-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-amber-800 mb-1 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Alerts
                </h3>
                {patient.alerts.map((alert, idx) => (
                  <div key={idx} className="text-sm text-amber-800">
                    {alert.type}: {alert.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="medical-records" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Medical Records
          </TabsTrigger>
          <TabsTrigger value="vaccines" className="flex items-center">
            <Syringe className="h-4 w-4 mr-2" />
            Vaccines
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 10V6C22 4.89543 21.1046 4 20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 15C14.5523 15 15 14.5523 15 14C15 13.4477 14.5523 13 14 13C13.4477 13 13 13.4477 13 14C13 14.5523 13.4477 15 14 15Z" fill="currentColor"/>
              <path d="M6 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Billing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-medium">Upcoming Appointments</h3>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <FilePlus2 className="h-4 w-4 mr-1" />
                    New Appointment
                  </Button>
                </div>
                
                <div className="divide-y">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-medium">{appointment.type}</div>
                          <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                            appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                            appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-gray-600">
                            <div className="text-sm">{appointment.date}</div>
                            <div className="text-sm">{appointment.start_time} - {appointment.end_time}</div>
                          </div>
                          
                          <div className="text-gray-600 text-sm">
                            Reason: {appointment.reason}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">No upcoming appointments</div>
                  )}
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden mt-6">
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-medium">Recent Medical Records</h3>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <FilePlus2 className="h-4 w-4 mr-1" />
                    New Record
                  </Button>
                </div>
                
                <div className="divide-y">
                  {medicalRecords.length > 0 ? (
                    medicalRecords.map((record) => (
                      <div key={record.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{record.type}</div>
                          <div className="text-sm text-gray-600">{record.date}</div>
                        </div>
                        
                        <div className="text-sm text-gray-700 mb-2">
                          <div className="font-medium">Diagnosis:</div>
                          <ul className="list-disc list-inside">
                            {record.diagnosis.map((diagnosis, idx) => (
                              <li key={idx}>{diagnosis}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="text-sm text-gray-700">
                          <div className="font-medium">Treatments:</div>
                          <ul className="list-disc list-inside">
                            {record.treatments.map((treatment, idx) => (
                              <li key={idx}>{treatment}</li>
                            ))}
                          </ul>
                        </div>
                        
                        {record.lab_results && (
                          <div className="text-sm text-gray-700 mt-2">
                            <div className="font-medium">Lab Results:</div>
                            <div>{record.lab_results.bloodwork}</div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">No medical records found</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-span-1">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-medium">Patient Information</h3>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <div className="text-gray-500 mb-1">Age</div>
                      <div className="font-medium">{patient.age}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-500 mb-1">Sex</div>
                      <div className="font-medium">{patient.sex}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-500 mb-1">DOB</div>
                      <div className="font-medium">{patient.dob}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-500 mb-1">Weight</div>
                      <div className="font-medium">{patient.weight}</div>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="text-gray-500 mb-1">Microchip</div>
                      <div className="font-medium">{patient.microchip}</div>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="text-gray-500 mb-1">Color</div>
                      <div className="font-medium">{patient.color}</div>
                    </div>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <div className="text-sm">
                    <div className="text-gray-500 mb-1">Owner Information</div>
                    <div className="font-medium">{patient.owner_name}</div>
                    <div>{patient.owner_phone}</div>
                    <div>{patient.owner_email}</div>
                    <div className="text-gray-700 mt-1">{patient.owner_address}</div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden mt-6">
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-medium">Vaccination Status</h3>
                </div>
                
                <div className="p-4">
                  {vaccines.length > 0 ? (
                    <div className="space-y-3">
                      {vaccines.map((vaccine) => (
                        <div key={vaccine.id} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{vaccine.name}</div>
                            <div className="text-xs text-gray-600">Given: {vaccine.date}</div>
                          </div>
                          <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            Valid until {vaccine.expiration}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">No vaccination records</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="appointments" className="mt-6">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-medium">All Appointments</h3>
              <Button className="bg-[#2C7BE5] hover:bg-blue-700">Schedule New Appointment</Button>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search appointments..." 
                      className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2C7BE5]"
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
                  
                  <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#2C7BE5]">
                    <option>All Types</option>
                    <option>Check-up</option>
                    <option>Vaccination</option>
                    <option>Sick Visit</option>
                    <option>Surgery</option>
                  </select>
                  
                  <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#2C7BE5]">
                    <option>All Status</option>
                    <option>Scheduled</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 16.5V18.75C3 19.3467 3.23705 19.919 3.65901 20.341C4.08097 20.7629 4.65326 21 5.25 21H18.75C19.3467 21 19.919 20.7629 20.341 20.341C20.7629 19.919 21 19.3467 21 18.75V16.5M16.5 12L12 16.5M12 16.5L7.5 12M12 16.5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="border rounded overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.start_time} - {appointment.end_time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dr. {appointment.doctor_id === 1 ? 'Roberts' : appointment.doctor_id === 2 ? 'Carter' : 'Chen'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                            appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex items-center justify-center">
                              <Pencil className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex items-center justify-center">
                              <XCircle className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="medical-records" className="mt-6">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-medium">Medical Records</h3>
              <Button className="bg-[#2C7BE5] hover:bg-blue-700">Add New Record</Button>
            </div>
            
            <div className="divide-y">
              {medicalRecords.length > 0 ? (
                medicalRecords.map((record) => (
                  <div key={record.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{record.type}</h3>
                        <div className="text-sm text-gray-600">{record.date}</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center">
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Diagnosis</h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {record.diagnosis.map((diagnosis, idx) => (
                            <li key={idx}>{diagnosis}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Treatments</h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {record.treatments.map((treatment, idx) => (
                            <li key={idx}>{treatment}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {record.lab_results && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Lab Results</h4>
                        <div className="bg-gray-50 p-3 rounded text-gray-700">
                          {record.lab_results.bloodwork}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No medical records found</div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="vaccines" className="mt-6">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-medium">Vaccination History</h3>
              <Button className="bg-[#2C7BE5] hover:bg-blue-700">Add Vaccination</Button>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administered By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vaccines.length > 0 ? (
                  vaccines.map((vaccine) => (
                    <tr key={vaccine.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vaccine.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vaccine.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vaccine.expiration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dr. {vaccine.administered_by === 1 ? 'Roberts' : vaccine.administered_by === 2 ? 'Carter' : 'Chen'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vaccine.lot_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vaccine.site}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" className="h-8 p-0 flex items-center justify-center">
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No vaccination records found</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-700">
                  Showing {vaccines.length} records
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="communications" className="mt-6">
          <div className="flex justify-center items-center h-64 border rounded-lg bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Communications Module</h3>
              <p className="text-gray-500 mb-4">This feature is coming soon!</p>
              <Button className="bg-[#2C7BE5] hover:bg-blue-700">Contact Owner</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="billing" className="mt-6">
          <div className="flex justify-center items-center h-64 border rounded-lg bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Billing Module</h3>
              <p className="text-gray-500 mb-4">This feature is coming soon!</p>
              <Button className="bg-[#2C7BE5] hover:bg-blue-700">Create Invoice</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientManagement;