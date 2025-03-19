import React from 'react';
import { Calendar, AlertCircle, Check, Plus, Printer, Download } from 'lucide-react';
import { Vaccine } from '../../types';

interface PetVaccineRecordProps {
  vaccines: Vaccine[];
  onAddVaccine: () => void;
}

const PetVaccineRecord: React.FC<PetVaccineRecordProps> = ({
  vaccines,
  onAddVaccine
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Function to check if a vaccine is expired
  const isExpired = (expirationDate: string) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    return today > expiration;
  };

  // Function to check if a vaccine is about to expire (within 30 days)
  const isExpiringSoon = (expirationDate: string) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return today <= expiration && expiration <= thirtyDaysFromNow;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b font-medium text-gray-700 bg-gray-50 flex justify-between items-center">
        <div>Vaccination Records</div>
        <div className="flex space-x-2">
          <button className="text-xs flex items-center bg-gray-100 text-gray-700 py-1 px-2 rounded">
            <Printer size={14} className="mr-1" />
            Print
          </button>
          <button className="text-xs flex items-center bg-gray-100 text-gray-700 py-1 px-2 rounded">
            <Download size={14} className="mr-1" />
            Export
          </button>
          <button 
            className="text-xs flex items-center bg-indigo-100 text-indigo-700 py-1 px-2 rounded"
            onClick={onAddVaccine}
          >
            <Plus size={14} className="mr-1" />
            Add Vaccine
          </button>
        </div>
      </div>
      
      {vaccines.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <div className="mb-2">No vaccination records found</div>
          <button 
            onClick={onAddVaccine}
            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center justify-center mx-auto"
          >
            <Plus size={16} className="mr-1" />
            Add First Vaccination Record
          </button>
        </div>
      ) : (
        <div className="p-4">
          {/* Upcoming/Due Vaccines Section */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Upcoming & Due Vaccinations
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start">
              <div className="mr-2 mt-0.5">
                <AlertCircle size={16} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-yellow-700">
                  Rabies vaccination is due in 30 days (Apr 19, 2025)
                </p>
                <button className="mt-1 text-xs bg-yellow-100 text-yellow-800 py-1 px-2 rounded">
                  Schedule Appointment
                </button>
              </div>
            </div>
          </div>
          
          {/* All Vaccinations Table */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              All Vaccinations
            </h3>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vaccine
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Administered
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Administered By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vaccines.map((vaccine) => (
                    <tr key={vaccine.id}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{vaccine.name}</div>
                        <div className="text-xs text-gray-500">
                          {vaccine.lot_number && `Lot #: ${vaccine.lot_number}`}
                          {vaccine.site && ` | Site: ${vaccine.site}`}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(vaccine.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(vaccine.expiration)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {vaccine.administered_by ? `Dr. ${vaccine.administered_by}` : 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {isExpired(vaccine.expiration) ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Expired
                          </span>
                        ) : isExpiringSoon(vaccine.expiration) ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Expiring Soon
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
                            <Check size={10} className="mr-1" />
                            Valid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetVaccineRecord;