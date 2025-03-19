import React from 'react';
import { 
  Calendar, 
  User, 
  FileText, 
  PenTool, 
  Pill, 
  Thermometer, 
  Heart, 
  Weight, 
  Activity,
  Download,
  Printer,
  Edit
} from 'lucide-react';
import { MedicalRecord, Doctor } from '../../types';

interface MedicalRecordDetailProps {
  record: MedicalRecord;
  doctor?: Doctor;
}

const MedicalRecordDetail: React.FC<MedicalRecordDetailProps> = ({
  record,
  doctor
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get color for record type
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vaccination':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'surgery':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'lab':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'emergency':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b font-medium text-gray-700 bg-gray-50 flex justify-between items-center">
        <div>Medical Record Details</div>
        <div className="flex space-x-2">
          <button className="text-xs flex items-center bg-gray-100 text-gray-700 py-1 px-2 rounded">
            <Printer size={14} className="mr-1" />
            Print
          </button>
          <button className="text-xs flex items-center bg-gray-100 text-gray-700 py-1 px-2 rounded">
            <Download size={14} className="mr-1" />
            Export
          </button>
          <button className="text-xs flex items-center bg-indigo-100 text-indigo-700 py-1 px-2 rounded">
            <Edit size={14} className="mr-1" />
            Edit
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Header information */}
        <div className="flex justify-between mb-4">
          <div>
            <span className={`text-xs px-3 py-1 rounded-full ${getTypeColor(record.type)}`}>
              {record.type}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={14} className="mr-1" />
            {formatDate(record.date)}
          </div>
        </div>
        
        {/* Doctor information */}
        {doctor && (
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-md">
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-indigo-600" />
            </div>
            <div className="ml-3">
              <div className="font-medium">{doctor.name}</div>
              <div className="text-xs text-gray-500">{doctor.role || doctor.specialty || 'Veterinarian'}</div>
            </div>
          </div>
        )}
        
        {/* Vital signs if available */}
        {record.vital_signs && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
              <Activity size={14} className="mr-1 text-indigo-600" />
              Vital Signs
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {record.vital_signs.temperature && (
                <div className="p-2 bg-blue-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">Temperature</div>
                  <div className="font-medium">{record.vital_signs.temperature}°F</div>
                </div>
              )}
              {record.vital_signs.heart_rate && (
                <div className="p-2 bg-red-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">Heart Rate</div>
                  <div className="font-medium">{record.vital_signs.heart_rate} bpm</div>
                </div>
              )}
              {record.vital_signs.weight && (
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">Weight</div>
                  <div className="font-medium">{record.vital_signs.weight} kg</div>
                </div>
              )}
              {record.vital_signs.respiratory_rate && (
                <div className="p-2 bg-purple-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">Respiratory Rate</div>
                  <div className="font-medium">{record.vital_signs.respiratory_rate} rpm</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Diagnosis */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
            <FileText size={14} className="mr-1 text-indigo-600" />
            Diagnosis
          </h3>
          {record.diagnosis && record.diagnosis.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {record.diagnosis.map((item, index) => (
                <li key={index} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No diagnosis recorded</p>
          )}
        </div>
        
        {/* Treatments */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
            <Pill size={14} className="mr-1 text-indigo-600" />
            Treatments
          </h3>
          {record.treatments && record.treatments.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {record.treatments.map((item, index) => (
                <li key={index} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No treatments recorded</p>
          )}
        </div>
        
        {/* Lab Results */}
        {record.lab_results && Object.keys(record.lab_results).length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
              <BarChart2 size={14} className="mr-1 text-indigo-600" />
              Lab Results
            </h3>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference Range
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(record.lab_results).map(([key, value]: [string, any]) => (
                    <tr key={key}>
                      <td className="px-4 py-2 text-sm">{key}</td>
                      <td className="px-4 py-2 text-sm">{value.result}</td>
                      <td className="px-4 py-2 text-sm">{value.reference_range || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm">
                        {value.status && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            value.status === 'normal' 
                              ? 'bg-green-100 text-green-800' 
                              : value.status === 'high'
                                ? 'bg-red-100 text-red-800'
                                : value.status === 'low'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}>
                            {value.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Notes */}
        {record.notes && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
              <PenTool size={14} className="mr-1 text-indigo-600" />
              Notes
            </h3>
            <div className="p-3 bg-gray-50 rounded-md text-sm">
              {record.notes}
            </div>
          </div>
        )}
        
        {/* Attachments */}
        {record.attachments && record.attachments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700">Attachments</h3>
            <div className="grid grid-cols-2 gap-2">
              {record.attachments.map((attachment, index) => (
                <div key={index} className="border rounded-md p-2 flex items-center">
                  <div className="text-xs">
                    <div>{attachment.name}</div>
                    <div className="text-gray-500">{attachment.type}</div>
                  </div>
                  <button className="ml-auto text-indigo-600">
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordDetail;