import React from 'react';
import { Staff, Room, Resource } from '../../types';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

// Type guard to determine if a resource is a Room
const isRoom = (resource: Resource): resource is Room => {
  return 'type' in resource && 'name' in resource;
};

interface ResourceListProps {
  resources: Resource[];
}

export const ResourceList: React.FC<ResourceListProps> = ({
  resources
}) => {
  // Function to get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'occupied':
      case 'busy':
        return <XCircle size={16} className="text-red-500" />;
      case 'break':
      case 'cleaning':
      case 'maintenance':
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return <CheckCircle2 size={16} className="text-gray-500" />;
    }
  };

  // Function to get the status badge style
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
      case 'busy':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'break':
      case 'cleaning':
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="divide-y">
      {resources.map((resource, index) => (
        <div key={index} className="flex items-center p-3 hover:bg-gray-50">
          {/* Avatar or Room icon */}
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {isRoom(resource) ? (
              <div className="font-medium text-indigo-600">
                {resource.name.substring(0, 1)}
              </div>
            ) : (
              resource.avatar ? (
                <img src={resource.avatar} alt={resource.name} className="w-full h-full object-cover" />
              ) : (
                <div className="font-medium text-indigo-600">
                  {resource.name.substring(0, 1)}
                </div>
              )
            )}
          </div>
          
          {/* Resource info */}
          <div className="ml-3 flex-grow">
            <div className="font-medium">{resource.name}</div>
            <div className="text-xs text-gray-500">
              {isRoom(resource) ? resource.type : resource.role}
            </div>
          </div>
          
          {/* Status */}
          <div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusStyle(resource.status)}`}>
              {getStatusIcon(resource.status)}
              <span className="ml-1">{resource.status}</span>
            </span>
          </div>
          
          {/* Additional info based on resource type */}
          <div className="ml-2 text-right">
            {isRoom(resource) && resource.currentPatient && (
              <div className="text-xs text-gray-500">
                {resource.currentPatient}
              </div>
            )}
            {isRoom(resource) && resource.availableAt && (
              <div className="text-xs text-gray-500">
                Available at {new Date(resource.availableAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourceList;