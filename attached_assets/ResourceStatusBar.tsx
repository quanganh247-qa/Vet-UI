import React from 'react';
import { Users } from 'lucide-react';

interface ResourceStatusBarProps {
  showResourceManagement: boolean;
  setShowResourceManagement: (show: boolean) => void;
}

const ResourceStatusBar: React.FC<ResourceStatusBarProps> = ({
  showResourceManagement,
  setShowResourceManagement
}) => {
  return (
    <div className="bg-indigo-50 border-b border-indigo-100 p-2 flex justify-between items-center">
      <div className="flex space-x-4">
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          <span className="text-sm text-gray-700">2 Bác sĩ sẵn sàng</span>
        </div>
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
          <span className="text-sm text-gray-700">1 Bác sĩ bận</span>
        </div>
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          <span className="text-sm text-gray-700">3 Phòng sẵn sàng</span>
        </div>
        <div className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
          <span className="text-sm text-gray-700">2 Phòng đang sử dụng</span>
        </div>
      </div>
      
      <button 
        className={`text-sm flex items-center px-3 py-1 rounded ${
          showResourceManagement 
            ? 'bg-indigo-200 text-indigo-800' 
            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
        }`}
        onClick={() => setShowResourceManagement(!showResourceManagement)}
      >
        <Users size={16} className="mr-1" />
        {showResourceManagement ? 'Ẩn quản lý tài nguyên' : 'Hiển thị quản lý tài nguyên'}
      </button>
    </div>
  );
};

export default ResourceStatusBar; 