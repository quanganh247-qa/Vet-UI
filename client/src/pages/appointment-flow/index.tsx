import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Clock, 
  Layout, 
  List, 
  Plus,
  AlertTriangle,
  X
} from 'lucide-react';
import {
  mockAppointments,
  mockPatients,
  mockDoctors,
  getPatientById,
  getDoctorById,
  getAppointmentsByStatus
} from '@/data/mock-data';

// Appointment Card component for the Kanban view
const AppointmentCard = ({ appointment, className = '' }) => {
  const patient = getPatientById(appointment.patient_id);
  const doctor = getDoctorById(appointment.doctor_id);
  
  if (!patient || !doctor) return null;
  
  // Map status to styles
  const statusStyles = {
    'scheduled': 'bg-green-100',
    'checked-in': 'bg-blue-100',
    'in-progress': 'bg-purple-100',
    'completed': 'bg-emerald-100',
    'waiting': 'bg-amber-100'
  };
  
  const statusClasses = statusStyles[appointment.status] || 'bg-gray-100';
  
  return (
    <div className={`${statusClasses} rounded-md mb-3 p-3 shadow-sm ${className}`}>
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center">
          <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
            <img 
              src={patient.image_url || 'https://via.placeholder.com/24'} 
              alt={patient.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-medium">{patient.name}</span>
        </div>
        <div className="text-xs text-gray-600 font-medium">
          {appointment.start_time}
        </div>
      </div>
      
      <div className="mb-1.5 text-sm text-gray-700">
        <span>{patient.species} - {patient.breed}</span>
      </div>
      
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs bg-white px-2 py-0.5 rounded">{appointment.type}</span>
        <span className="text-xs text-gray-600">{doctor.name}</span>
      </div>
      
      {appointment.reason && (
        <div className="text-xs text-gray-600 mb-1.5">{appointment.reason}</div>
      )}
      
      {appointment.alerts && appointment.alerts.length > 0 && (
        <div className="text-xs text-amber-600 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {appointment.alerts[0].type} to {appointment.alerts[0].description}
        </div>
      )}
    </div>
  );
};

// Waiting List component
const WaitingList = ({ waitingList, activePatient, onStartExam }) => {
  return (
    <div className="w-72 bg-white rounded border shadow-sm p-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Danh sách chờ</h3>
        <button className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {waitingList.map((patient, index) => (
        <div 
          key={index} 
          className={`p-3 mb-2 rounded-md ${activePatient === index ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-50'}`}
        >
          <div className="flex items-center justify-between">
            <div className="font-medium mb-1">
              #{index + 1}: {patient.name}
            </div>
            {activePatient === index && (
              <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Ưu tiên</span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-2">
            <div>
              <div className="font-medium">Bác sĩ</div>
              <div>Dr. Roberts</div>
            </div>
            <div>
              <div className="font-medium">Loại khám</div>
              <div>Sick Visit</div>
            </div>
            <div>
              <div className="font-medium">Thời gian chờ</div>
              <div>{index === 0 ? '15 min' : '5 min'}</div>
            </div>
            <div>
              <div className="font-medium">Chờ từ</div>
              <div>{index === 0 ? '9:45 AM' : '1:55 PM'}</div>
            </div>
          </div>
          
          <Button 
            onClick={() => onStartExam(index)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1"
          >
            Bắt đầu khám
          </Button>
        </div>
      ))}
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Thông kê thời gian chờ</h4>
        <div className="grid grid-cols-2 gap-1 text-sm text-gray-600">
          <div>Thời gian chờ trung bình</div>
          <div className="text-right">12 phút</div>
          <div>Bệnh nhân đã đợi lâu nhất</div>
          <div className="text-right text-amber-600">&gt;15 phút</div>
          <div className="font-medium">Bệnh nhân đợi lâu</div>
          <div className="text-right text-amber-600">1</div>
        </div>
      </div>
    </div>
  );
};

// Timeline Grid component
const TimelineGrid = ({ appointments, doctors, resources }) => {
  const hours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 AM', '1 PM', '2 PM', '3 PM', '4 PM'];
  
  // Group appointments by doctor and resource
  const getResourceAppointments = (resourceId) => {
    return appointments.filter(app => {
      if (resourceId.startsWith('Dr.')) {
        // Filter by doctor
        const doctorId = doctors.find(d => d.name === resourceId)?.id;
        return app.doctor_id === doctorId;
      } else {
        // Other resources like exam rooms and equipment
        // For now, just return a sample appointment
        return resourceId === 'Exam 1' && app.id === 4;
      }
    });
  };
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-[150px_1fr] gap-1">
          <div className="font-medium text-gray-700 py-2">NGUỒN LỰC</div>
          <div className="grid grid-cols-9 gap-1">
            {hours.map((hour, idx) => (
              <div key={idx} className="font-medium text-gray-700 py-2 text-center">
                {hour}
              </div>
            ))}
          </div>
          
          {resources.map((resource, idx) => (
            <div key={idx} className="grid grid-cols-[150px_1fr] gap-1">
              <div className="font-medium text-gray-700 py-2">{resource}</div>
              <div className="col-span-1 grid grid-cols-9 gap-1 relative">
                {getResourceAppointments(resource).map((app, appIdx) => {
                  const patient = getPatientById(app.patient_id);
                  const doctor = getDoctorById(app.doctor_id);
                  
                  if (!patient || !doctor) return null;
                  
                  // Convert appointment time to grid position
                  const startHour = parseInt(app.start_time.split(':')[0]);
                  const startCol = startHour - 8 + (app.start_time.includes('PM') && startHour !== 12 ? 12 : 0);
                  const endHour = parseInt(app.end_time.split(':')[0]);
                  const endCol = endHour - 8 + (app.end_time.includes('PM') && endHour !== 12 ? 12 : 0);
                  const span = endCol - startCol || 1;
                  
                  // Map status to styles
                  const statusColors = {
                    'scheduled': 'bg-green-500',
                    'checked-in': 'bg-blue-500',
                    'in-progress': 'bg-purple-500',
                    'completed': 'bg-emerald-500',
                    'waiting': 'bg-amber-500'
                  };
                  
                  const bgColor = statusColors[app.status] || 'bg-gray-500';
                  
                  return (
                    <div 
                      key={appIdx}
                      className={`${bgColor} text-white rounded p-2 absolute`}
                      style={{
                        gridColumn: `${startCol + 1} / span ${span}`,
                        top: '2px',
                        bottom: '2px',
                        left: `${(startCol) * (100/9)}%`,
                        width: `${span * (100/9)}%`
                      }}
                    >
                      <div className="text-sm font-medium">{patient.name}</div>
                      <div className="text-xs">{app.type}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Appointment Flow Component
const AppointmentFlow = () => {
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState('kanban');
  const [activePatient, setActivePatient] = useState(0);
  
  // Mock waiting list
  const waitingList = [
    { name: 'Charlie', timeWaiting: 15, priority: true },
    { name: 'Milo', timeWaiting: 5, priority: false }
  ];
  
  // Get appointments by status
  const scheduledApps = getAppointmentsByStatus('scheduled');
  const waitingApps = getAppointmentsByStatus('waiting');
  const inProgressApps = getAppointmentsByStatus('in-progress');
  const completedApps = getAppointmentsByStatus('completed');
  const checkedInApps = getAppointmentsByStatus('checked-in');
  
  const handleStartExam = (index) => {
    console.log(`Starting exam for patient at index ${index}`);
  };
  
  return (
    <div className="max-w-full bg-white rounded-lg shadow-sm">
      <div className="p-5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Appointment Flow</h1>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-56 pl-8 pr-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2C7BE5]"
              />
              <svg 
                className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-center h-9 w-9 bg-indigo-100 rounded-full">
                <span className="text-indigo-600 text-sm font-medium">2</span>
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">2</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                DR
              </div>
              <span className="text-sm">Dr. Roberts</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <button className="p-1.5 border rounded">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-1.5">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="text-gray-800 font-medium">Tuesday, March 18, 2025</span>
            </div>
            <button className="p-1.5 border rounded">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              className="flex items-center text-indigo-600"
              onClick={() => setLocation('/appointments/new')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Cuộc hẹn mới
            </Button>
            
            <div className="flex border rounded-md overflow-hidden">
              <button className={`px-3 py-1.5 flex items-center ${activeView === 'kanban' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700'}`} onClick={() => setActiveView('kanban')}>
                <Layout className="h-4 w-4 mr-1" />
                Cột
              </button>
              <button className={`px-3 py-1.5 flex items-center ${activeView === 'timeline' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700'}`} onClick={() => setActiveView('timeline')}>
                <Clock className="h-4 w-4 mr-1" />
                Dòng thời gian
              </button>
              <button className={`px-3 py-1.5 flex items-center ${activeView === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700'}`} onClick={() => setActiveView('list')}>
                <List className="h-4 w-4 mr-1" />
                Danh sách
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 text-sm mb-5">
          <div className="border rounded px-3 py-1.5 flex items-center">
            <Filter className="h-4 w-4 mr-1.5 text-gray-500" />
            <span>Tất cả trạng thái</span>
            <ChevronRight className="h-4 w-4 ml-1.5 text-gray-500" />
          </div>
          
          <div className="border rounded px-3 py-1.5 flex items-center">
            <span>Tất cả bác sĩ</span>
            <ChevronRight className="h-4 w-4 ml-1.5 text-gray-500" />
          </div>
          
          <div className="border rounded px-3 py-1.5 flex items-center">
            <span>Tất cả loại cuộc hẹn</span>
            <ChevronRight className="h-4 w-4 ml-1.5 text-gray-500" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm mb-5">
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="ml-1">2 Bác sĩ sẵn sàng</span>
          </div>
          <div className="text-gray-300">|</div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            <span className="ml-1">1 Bác sĩ bận</span>
          </div>
          <div className="text-gray-300">|</div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-gray-500"></span>
            <span className="ml-1">3 Phòng sẵn sàng</span>
          </div>
          <div className="text-gray-300">|</div>
          <div className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span className="ml-1">2 Phòng đang sử dụng</span>
          </div>
        </div>
        
        {activeView === 'kanban' && (
          <div className="flex space-x-4">
            <div className="flex-1 grid grid-cols-4 gap-4">
              {/* Scheduled */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Đã lên lịch
                    <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">{scheduledApps.length}</span>
                  </h3>
                </div>
                
                <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                  {scheduledApps.map((app) => (
                    <Link key={app.id} href={`/check-in/${app.id}`}>
                      <AppointmentCard appointment={app} className="cursor-pointer hover:shadow-md transition-shadow" />
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Checked In */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    Đang chờ
                    <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{checkedInApps.length + waitingApps.length}</span>
                  </h3>
                </div>
                
                <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                  {checkedInApps.map((app) => (
                    <Link key={app.id} href={`/appointment/${app.id}`}>
                      <AppointmentCard appointment={app} className="cursor-pointer hover:shadow-md transition-shadow" />
                    </Link>
                  ))}
                  
                  {waitingApps.map((app) => (
                    <Link key={app.id} href={`/appointment/${app.id}`}>
                      <AppointmentCard appointment={app} className="cursor-pointer hover:shadow-md transition-shadow" />
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* In Progress */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                    Đang khám
                    <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">{inProgressApps.length}</span>
                  </h3>
                </div>
                
                <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                  {inProgressApps.map((app) => (
                    <Link key={app.id} href={`/appointment/${app.id}`}>
                      <AppointmentCard appointment={app} className="cursor-pointer hover:shadow-md transition-shadow" />
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Completed */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></div>
                    Hoàn thành
                    <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full">{completedApps.length}</span>
                  </h3>
                </div>
                
                <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                  {completedApps.map((app) => (
                    <Link key={app.id} href={`/appointment/${app.id}`}>
                      <AppointmentCard appointment={app} className="cursor-pointer hover:shadow-md transition-shadow" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            <WaitingList waitingList={waitingList} activePatient={activePatient} onStartExam={handleStartExam} />
          </div>
        )}
        
        {activeView === 'timeline' && (
          <div className="flex space-x-4">
            <TimelineGrid 
              appointments={mockAppointments} 
              doctors={mockDoctors} 
              resources={['Dr. Roberts', 'Dr. Carter', 'Exam 1', 'Exam 2', 'Exam 3', 'Surgery 1', 'Grooming']}
            />
            
            <WaitingList waitingList={waitingList} activePatient={activePatient} onStartExam={handleStartExam} />
          </div>
        )}
        
        {activeView === 'list' && (
          <div className="flex space-x-4">
            <div className="flex-1 border rounded">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <div className="grid grid-cols-5 gap-4 font-medium text-gray-700">
                  <div>Patient</div>
                  <div>Appointment</div>
                  <div>Doctor</div>
                  <div>Time</div>
                  <div>Status</div>
                </div>
              </div>
              
              <div className="divide-y">
                {mockAppointments.map((app) => {
                  const patient = getPatientById(app.patient_id);
                  const doctor = getDoctorById(app.doctor_id);
                  
                  return (
                    <div key={app.id} className="px-4 py-3 hover:bg-gray-50">
                      <div className="grid grid-cols-5 gap-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                            <img 
                              src={patient?.image_url || 'https://via.placeholder.com/32'} 
                              alt={patient?.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{patient?.name}</div>
                            <div className="text-xs text-gray-500">{patient?.species} - {patient?.breed}</div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center">
                          <div>{app.type}</div>
                          <div className="text-xs text-gray-500">{app.reason}</div>
                        </div>
                        <div className="flex items-center">
                          {doctor?.name}
                        </div>
                        <div className="flex flex-col justify-center">
                          <div>{app.start_time} - {app.end_time}</div>
                          <div className="text-xs text-gray-500">{app.date}</div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            app.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                            app.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                            app.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status === 'scheduled' ? 'Scheduled' :
                             app.status === 'checked-in' ? 'Checked In' :
                             app.status === 'in-progress' ? 'In Progress' :
                             app.status === 'completed' ? 'Completed' :
                             'Waiting'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <WaitingList waitingList={waitingList} activePatient={activePatient} onStartExam={handleStartExam} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentFlow;