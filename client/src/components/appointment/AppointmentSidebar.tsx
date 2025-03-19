import React from 'react';
import { FileText, Users, X, ExternalLink, Phone, MessageSquare, Edit, XCircle, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { Appointment, QueueItem } from '../../types';
import AppointmentQueue from './AppointmentQueue';
import AppointmentDetails from './AppointmentDetails';

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

const AppointmentSidebar: React.FC<AppointmentSidebarProps> = ({
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

  return (
    <div className="w-1/4 border-l bg-white overflow-auto">
      {/* Sidebar Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-medium">
          {sidebarContent === 'queue' && 'Waiting List'}
          {sidebarContent === 'details' && 'Appointment Details'}
          {sidebarContent === 'new' && 'New Appointment'}
        </h3>

        <div className="flex">
          <button
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 mr-1"
            onClick={() => setSidebarContent(
              sidebarContent === 'queue' ? 'details' :
                sidebarContent === 'details' ? 'queue' : 'queue'
            )}
          >
            {sidebarContent === 'queue' ? <FileText size={16} /> : <Users size={16} />}
          </button>
          <button
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            onClick={() => setShowSidebar(false)}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Sidebar Content */}
      {sidebarContent === 'queue' && (
        <div className="p-4">
          <div className="mb-4 flex justify-between items-center">
            <h4 className="font-medium">Waiting Patients ({queueData.length})</h4>
            <button className="text-xs text-indigo-600 hover:text-indigo-800">
              Show waiting room display
            </button>
          </div>

          {queueData.length > 0 ? (
            <div className="space-y-3">
              {queueData
                .sort((a, b) => {
                  if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                  if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
                  return a.position - b.position;
                })
                .map(queueItem => {
                  return (
                    <div
                      key={queueItem.id}
                      className={`border rounded overflow-hidden ${queueItem.priority === 'urgent' ? 'border-red-400' : 'border-gray-200'
                        }`}
                    >
                      <div className={`px-3 py-2 ${getStatusColorClass(queueItem.status)}`}>
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">#{queueItem.position}: {queueItem.patientName}</div>
                          {queueItem.priority === 'urgent' && (
                            <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
                              Priority
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <div className="text-gray-500 text-xs">Doctor</div>
                            <div>{queueItem.doctor}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Type</div>
                            <div>{queueItem.appointmentType}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <div className="text-gray-500 text-xs">Wait Time</div>
                            <div className={queueItem.actualWaitTime > '15 min' ? 'text-red-600' : ''}>
                              {queueItem.actualWaitTime}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Since</div>
                            <div>{queueItem.waitingSince}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-end space-x-2">
                          <button
                            className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                            onClick={() => handleStatusChange(queueItem.id, 'In Progress')}
                          >
                            Start Exam
                          </button>
                          <button className="px-2 py-1 border text-xs rounded hover:bg-gray-50">
                            Notify
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No patients waiting
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-medium mb-3">Wait Time Statistics</h4>
            <div className="bg-gray-50 p-3 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Average Wait Time</div>
                  <div className="text-xl font-bold text-indigo-600">12 min</div>
                </div>
                <div>
                  <div className="text-gray-500">Patients waiting &gt;15 min</div>
                  <div className="text-xl font-bold text-red-600">1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {sidebarContent === 'details' && selectedAppointment && (
        <div className="p-4">
          <AppointmentDetails
            appointment={selectedAppointment}
            handleStatusChange={handleStatusChange}
          />
        </div>
      )}
    </div>
  );
};

export default AppointmentSidebar;