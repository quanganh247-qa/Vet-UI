import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { QueueItem } from '../../types';

interface AppointmentQueueProps {
  queueData: QueueItem[];
  getStatusColorClass: (status: string) => string;
}

const AppointmentQueue: React.FC<AppointmentQueueProps> = ({
  queueData,
  getStatusColorClass
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-indigo-50 px-4 py-3 border-b">
        <h3 className="font-medium text-indigo-800">Patient Queue</h3>
      </div>
      
      {queueData.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No patients in queue
        </div>
      ) : (
        <div className="divide-y">
          {queueData.map((item) => (
            <div key={item.id} className="p-3 hover:bg-gray-50">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">{item.patientName}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColorClass(item.status)}`}>
                  {item.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                <div>{item.appointmentType}</div>
                <div>{item.doctor}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  <span>Waiting since: {item.waitingSince}</span>
                </div>
                
                <div className="flex items-center text-xs">
                  {item.priority === 'high' || item.priority === 'urgent' ? (
                    <span className="flex items-center text-red-600">
                      <AlertCircle size={12} className="mr-1" />
                      High Priority
                    </span>
                  ) : (
                    <span>Wait time: {item.actualWaitTime}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentQueue;