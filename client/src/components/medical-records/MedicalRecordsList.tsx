import React from 'react';
import { Calendar, Pill, Clipboard, AlertCircle, BarChart2, Activity } from 'lucide-react';
import { MedicalRecord } from '../../types';

interface MedicalRecordsListProps {
  medicalRecords: MedicalRecord[];
  onSelectRecord: (recordId: number) => void;
  selectedRecordId: number | null;
}

const MedicalRecordsList: React.FC<MedicalRecordsListProps> = ({
  medicalRecords,
  onSelectRecord,
  selectedRecordId
}) => {
  // Get icon based on record type
  const getRecordTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam':
        return <Clipboard size={16} className="text-blue-500" />;
      case 'vaccination':
        return <Pill size={16} className="text-green-500" />;
      case 'surgery':
        return <Activity size={16} className="text-red-500" />;
      case 'lab':
        return <BarChart2 size={16} className="text-purple-500" />;
      case 'emergency':
        return <AlertCircle size={16} className="text-orange-500" />;
      default:
        return <Clipboard size={16} className="text-gray-500" />;
    }
  };

  // Get style based on record type
  const getRecordTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'vaccination':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'surgery':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'lab':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'emergency':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b font-medium text-gray-700 bg-gray-50 flex justify-between items-center">
        <div>Medical History</div>
        <button className="text-xs bg-indigo-100 text-indigo-700 py-1 px-2 rounded">
          Add Record
        </button>
      </div>
      
      {medicalRecords.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No medical records found
        </div>
      ) : (
        <div className="divide-y max-h-[calc(100vh-220px)] overflow-y-auto">
          {medicalRecords.map((record) => (
            <div
              key={record.id}
              className={`p-3 hover:bg-gray-50 cursor-pointer ${
                selectedRecordId === record.id ? 'bg-indigo-50' : ''
              }`}
              onClick={() => onSelectRecord(record.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center">
                  {getRecordTypeIcon(record.type)}
                  <span className="ml-2 font-medium">{record.type}</span>
                </div>
                <span className="text-xs flex items-center text-gray-500">
                  <Calendar size={12} className="mr-1" />
                  {formatDate(record.date)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm">
                  {record.diagnosis && record.diagnosis.length > 0 ? (
                    <span>
                      {record.diagnosis.slice(0, 2).join(', ')}
                      {record.diagnosis.length > 2 ? '...' : ''}
                    </span>
                  ) : (
                    <span className="text-gray-500">No diagnosis recorded</span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {record.treatments && record.treatments.length > 0 ? (
                  record.treatments.slice(0, 3).map((treatment, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 rounded-full border bg-gray-50"
                    >
                      {treatment}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">No treatments recorded</span>
                )}
                {record.treatments && record.treatments.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50">
                    +{record.treatments.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsList;