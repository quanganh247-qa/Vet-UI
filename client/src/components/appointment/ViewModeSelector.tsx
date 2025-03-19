import React from 'react';
import { Columns, List, Clock } from 'lucide-react';

interface ViewModeSelectorProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  setViewMode
}) => {
  return (
    <div className="flex border rounded-md overflow-hidden">
      <button
        className={`flex items-center px-3 py-1.5 ${
          viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => setViewMode('kanban')}
      >
        <Columns size={16} className="mr-1" />
        <span className="text-sm">Kanban</span>
      </button>
      
      <button
        className={`flex items-center px-3 py-1.5 ${
          viewMode === 'timeline' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => setViewMode('timeline')}
      >
        <Clock size={16} className="mr-1" />
        <span className="text-sm">Timeline</span>
      </button>
      
      <button
        className={`flex items-center px-3 py-1.5 ${
          viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => setViewMode('list')}
      >
        <List size={16} className="mr-1" />
        <span className="text-sm">List</span>
      </button>
    </div>
  );
};

export default ViewModeSelector;