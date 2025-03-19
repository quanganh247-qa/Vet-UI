import React from 'react';
import { CalendarClock, UserCheck, ClipboardCheck, CheckCircle } from 'lucide-react';

interface StatusOverviewProps {
  scheduledCount: number;
  waitingCount: number;
  inProgressCount: number;
  completedCount: number;
}

const StatusOverview: React.FC<StatusOverviewProps> = ({
  scheduledCount,
  waitingCount,
  inProgressCount,
  completedCount
}) => {
  const totalCount = scheduledCount + waitingCount + inProgressCount + completedCount;
  
  // Calculate percentages for the progress bars
  const getPercentage = (count: number) => {
    return totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-medium text-gray-700 mb-4">Today's Status</h3>
      
      <div className="space-y-4">
        {/* Scheduled */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <CalendarClock size={16} className="text-blue-500 mr-2" />
              <span className="text-sm font-medium">Scheduled</span>
            </div>
            <span className="text-sm font-medium">{scheduledCount}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${getPercentage(scheduledCount)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Waiting */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <UserCheck size={16} className="text-yellow-500 mr-2" />
              <span className="text-sm font-medium">Waiting</span>
            </div>
            <span className="text-sm font-medium">{waitingCount}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-yellow-500 h-2 rounded-full" 
              style={{ width: `${getPercentage(waitingCount)}%` }}
            ></div>
          </div>
        </div>
        
        {/* In Progress */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <ClipboardCheck size={16} className="text-indigo-500 mr-2" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <span className="text-sm font-medium">{inProgressCount}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-2 rounded-full" 
              style={{ width: `${getPercentage(inProgressCount)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Completed */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <CheckCircle size={16} className="text-green-500 mr-2" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <span className="text-sm font-medium">{completedCount}</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${getPercentage(completedCount)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Appointments</span>
          <span className="font-medium">{totalCount}</span>
        </div>
        
        <div className="flex justify-between mt-2">
          <div className="text-center flex-1">
            <div className="text-xs text-gray-500">Waiting</div>
            <div className="font-medium text-yellow-600">{waitingCount}</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xs text-gray-500">In Progress</div>
            <div className="font-medium text-indigo-600">{inProgressCount}</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xs text-gray-500">Completed</div>
            <div className="font-medium text-green-600">{completedCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusOverview;