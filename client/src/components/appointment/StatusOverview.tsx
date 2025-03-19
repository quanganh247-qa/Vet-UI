import React from 'react';
import { Check, Clock, ArrowRight, CheckCircle } from 'lucide-react';

interface StatusOverviewProps {
  scheduledCount: number;
  waitingCount: number;
  inProgressCount: number;
  completedCount: number;
}

export const StatusOverview: React.FC<StatusOverviewProps> = ({
  scheduledCount,
  waitingCount,
  inProgressCount,
  completedCount
}) => {
  return (
    <div className="bg-white p-4 border-b">
      <h2 className="text-sm font-medium text-gray-700 mb-3">Today's Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Scheduled */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="text-xl font-semibold">{scheduledCount}</div>
            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Scheduled</div>
          
          {scheduledCount > 0 ? (
            <div className="mt-2 text-xs text-blue-600 flex items-center">
              <span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
              Next in 15 min
            </div>
          ) : (
            <div className="mt-2 text-xs text-gray-400">No appointments</div>
          )}
        </div>
        
        {/* Waiting */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="text-xl font-semibold">{waitingCount}</div>
            <div className="h-7 w-7 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock size={16} className="text-yellow-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Waiting</div>
          
          {waitingCount > 0 ? (
            <div className="mt-2 text-xs text-yellow-600 flex items-center">
              <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></span>
              Wait time: ~15 min
            </div>
          ) : (
            <div className="mt-2 text-xs text-gray-400">No waiting patients</div>
          )}
        </div>
        
        {/* In Progress */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="text-xl font-semibold">{inProgressCount}</div>
            <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center">
              <ArrowRight size={16} className="text-indigo-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">In Progress</div>
          
          {inProgressCount > 0 ? (
            <div className="mt-2 text-xs text-indigo-600 flex items-center">
              <span className="h-2 w-2 rounded-full bg-indigo-500 mr-1"></span>
              {inProgressCount === 1 ? '1 exam ongoing' : `${inProgressCount} exams ongoing`}
            </div>
          ) : (
            <div className="mt-2 text-xs text-gray-400">No active exams</div>
          )}
        </div>
        
        {/* Completed */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="text-xl font-semibold">{completedCount}</div>
            <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={16} className="text-green-600" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Completed</div>
          
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
            {(completedCount / (scheduledCount + waitingCount + inProgressCount + completedCount) * 100).toFixed(0)}% complete rate
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusOverview;