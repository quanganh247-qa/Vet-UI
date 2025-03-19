import React from 'react';
import { Users, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResourceStatusBarProps {
  showResourceManagement: boolean;
  setShowResourceManagement: (show: boolean) => void;
}

export const ResourceStatusBar: React.FC<ResourceStatusBarProps> = ({
  showResourceManagement,
  setShowResourceManagement
}) => {
  return (
    <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        {/* Staff Status Summary */}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users size={16} className="text-indigo-600" />
          </div>
          <div className="ml-2">
            <div className="text-xs font-medium">Staff</div>
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-gray-600">4 Available</span>
              <span className="text-xs text-gray-400">|</span>
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span className="text-xs text-gray-600">2 Occupied</span>
            </div>
          </div>
        </div>

        {/* Room Status Summary */}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <DoorOpen size={16} className="text-blue-600" />
          </div>
          <div className="ml-2">
            <div className="text-xs font-medium">Rooms</div>
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-gray-600">3 Available</span>
              <span className="text-xs text-gray-400">|</span>
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span className="text-xs text-gray-600">2 Occupied</span>
              <span className="text-xs text-gray-400">|</span>
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              <span className="text-xs text-gray-600">1 Cleaning</span>
            </div>
          </div>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowResourceManagement(!showResourceManagement)}
        className="text-xs"
      >
        {showResourceManagement ? 'Hide Resources' : 'Show Resources'}
      </Button>
    </div>
  );
};

export default ResourceStatusBar;