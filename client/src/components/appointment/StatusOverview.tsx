import React from 'react';

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
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-gray-600 text-sm font-medium">Scheduled</h3>
        <div className="mt-2 flex items-center">
          <span className="text-2xl font-semibold">{scheduledCount}</span>
          <div className="ml-2 h-2 w-2 rounded-full bg-green-400"></div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-gray-600 text-sm font-medium">Waiting</h3>
        <div className="mt-2 flex items-center">
          <span className="text-2xl font-semibold">{waitingCount}</span>
          <div className="ml-2 h-2 w-2 rounded-full bg-blue-400"></div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-gray-600 text-sm font-medium">In Progress</h3>
        <div className="mt-2 flex items-center">
          <span className="text-2xl font-semibold">{inProgressCount}</span>
          <div className="ml-2 h-2 w-2 rounded-full bg-purple-400"></div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-gray-600 text-sm font-medium">Completed</h3>
        <div className="mt-2 flex items-center">
          <span className="text-2xl font-semibold">{completedCount}</span>
          <div className="ml-2 h-2 w-2 rounded-full bg-green-600"></div>
        </div>
      </div>
    </div>
  );
};

export default StatusOverview;