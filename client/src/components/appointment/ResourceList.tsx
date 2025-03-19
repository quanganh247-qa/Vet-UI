import React from 'react';
import { Resource, Room } from '../../types';

// Type guard to check if a resource is a Room
const isRoom = (resource: Resource): resource is Room => {
  return 'type' in resource;
};

interface ResourceListProps {
  resources: Resource[];
}

const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-indigo-50 px-4 py-3 border-b">
        <h3 className="font-medium text-indigo-800">Resources</h3>
      </div>
      
      <div className="divide-y">
        {resources.map((resource) => (
          <div key={resource.id} className="p-3 hover:bg-gray-50">
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium">{resource.name}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                resource.status === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : resource.status === 'occupied' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {resource.status === 'available' 
                  ? 'Available' 
                  : resource.status === 'occupied' 
                    ? 'In Use' 
                    : 'Maintenance'}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>
                {isRoom(resource) 
                  ? (resource.type === 'exam' 
                      ? 'Exam Room' 
                      : resource.type === 'surgery' 
                        ? 'Surgery Room' 
                        : 'Grooming Station')
                  : resource.role}
              </div>
              {isRoom(resource) ? (
                resource.currentPatient ? (
                  <div className="text-xs">Patient: {resource.currentPatient}</div>
                ) : (
                  <div className="text-xs">Available at: {resource.availableAt}</div>
                )
              ) : (
                <div className="text-xs">Staff</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;