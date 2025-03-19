import React from 'react';
import { Users, Presentation } from 'lucide-react';

interface ResourceStatusBarProps {
  showResourceManagement: boolean;
  setShowResourceManagement: (show: boolean) => void;
}

const ResourceStatusBar: React.FC<ResourceStatusBarProps> = ({
  showResourceManagement,
  setShowResourceManagement
}) => {
  return (
    <div className="flex justify-between items-center bg-white p-3 border-b shadow-sm">
      <div className="flex items-center space-x-6">
        <div>
          <div className="text-xs text-gray-500">Veterinarians</div>
          <div className="flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span className="font-medium">3 available</span>
            <span className="mx-1 text-gray-400">/</span>
            <span className="text-gray-500">1 busy</span>
          </div>
        </div>
        
        <div>
          <div className="text-xs text-gray-500">Nurses</div>
          <div className="flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span className="font-medium">2 available</span>
            <span className="mx-1 text-gray-400">/</span>
            <span className="text-gray-500">2 busy</span>
          </div>
        </div>
        
        <div>
          <div className="text-xs text-gray-500">Exam Rooms</div>
          <div className="flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span className="font-medium">2 available</span>
            <span className="mx-1 text-gray-400">/</span>
            <span className="text-gray-500">2 in use</span>
          </div>
        </div>
        
        <div>
          <div className="text-xs text-gray-500">Surgery Rooms</div>
          <div className="flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
            <span className="font-medium">1 available</span>
            <span className="mx-1 text-gray-400">/</span>
            <span className="text-gray-500">1 in use</span>
          </div>
        </div>
      </div>
      
      <div className="flex">
        <button 
          onClick={() => setShowResourceManagement(!showResourceManagement)}
          className={`px-3 py-1.5 text-sm rounded flex items-center ${
            showResourceManagement 
              ? 'bg-indigo-100 text-indigo-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Users size={16} className="mr-1.5" />
          Resource Management
        </button>
        
        <button className="px-3 py-1.5 text-sm rounded flex items-center text-gray-700 hover:bg-gray-100 ml-2">
          <Presentation size={16} className="mr-1.5" />
          Waiting Room Display
        </button>
      </div>
    </div>
  );
};

export default ResourceStatusBar;