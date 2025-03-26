import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ListPatients } from '@/services/pet-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Search, Plus, Loader2 , ChevronRight} from 'lucide-react';

interface Pet {
  petid: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  gender: string;
  weight: number;
  microchip_number: string;
  color: string;
  birth_date: string;
  original_name: string;
  username: string;
  data_image?: string;
}

export const PatientsPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [patients, setPatients] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await ListPatients();
        setPatients(data || []); // Ensure we always set an array
      } catch (err) {
        setError('Failed to fetch patients');
        console.error('Error fetching patients:', err);
        setPatients([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = loading ? [] : patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  const handlePatientClick = (patientId: string) => {
    setLocation(`/patients/${patientId}`);
  };
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patients</h1>
        <Button onClick={() => setLocation('/patients/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search patients by name, owner, or species..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.petid} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation(`/patients/${patient.petid}`)}>
            <CardHeader>
              <CardTitle>{patient.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-semibold">Species:</span> {patient.type}</p>
                <p><span className="font-semibold">Breed:</span> {patient.breed}</p>
                <p><span className="font-semibold">Age:</span> {patient.age} years</p>
                <p><span className="font-semibold">Gender:</span> {patient.gender}</p>
                <p><span className="font-semibold">Weight:</span> {patient.weight} kg</p>
                <p><span className="font-semibold">Microchip:</span> {patient.microchip_number}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}
            {/* Patients List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pet Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Species
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No patients found
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr
                  key={patient.petid}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handlePatientClick(patient.petid)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500">{patient.breed}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {/* {format(new Date(patient.age), 'MMM dd, yyyy')} */}
                      {patient.age}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {patient.is_active}
                    </span> */}
                    <div className="text-sm text-gray-900">{patient.gender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 






// import React, { useState, useEffect } from 'react';
// import { Search, Plus, ChevronRight } from 'lucide-react';
// import { useLocation } from 'wouter';
// import { format } from 'date-fns';

// interface Patient {
//   id: string;
//   name: string;
//   species: string;
//   breed: string;
//   age: number;
//   gender: string;
//   ownerName: string;
//   lastVisit: string;
//   status: 'active' | 'inactive';
// }

// export const PatientsPage: React.FC = () => {
//   const [, setLocation] = useLocation();
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // TODO: Replace with actual API call
//     const fetchPatients = async () => {
//       try {
//         // Simulated data - replace with actual API call
//         const mockPatients: Patient[] = [
//           {
//             id: '1',
//             name: 'Max',
//             species: 'Dog',
//             breed: 'Golden Retriever',
//             age: 3,
//             gender: 'Male',
//             ownerName: 'John Doe',
//             lastVisit: '2024-03-15',
//             status: 'active'
//           },
//           // Add more mock data as needed
//         ];
//         setPatients(mockPatients);
//       } catch (error) {
//         console.error('Error fetching patients:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPatients();
//   }, []);

//   const filteredPatients = patients.filter(patient =>
//     patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     patient.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     patient.species.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handlePatientClick = (patientId: string) => {
//     setLocation(`/patients/${patientId}`);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
//         <button
//           onClick={() => setLocation('/patients/new')}
//           className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
//         >
//           <Plus className="w-5 h-5 mr-2" />
//           Add New Patient
//         </button>
//       </div>

//       {/* Search Bar */}
//       <div className="mb-6">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Search patients by name, owner, or species..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       {/* Patients List */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Patient Name
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Species
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Owner
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Last Visit
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {loading ? (
//               <tr>
//                 <td colSpan={6} className="px-6 py-4 text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredPatients.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
//                   No patients found
//                 </td>
//               </tr>
//             ) : (
//               filteredPatients.map((patient) => (
//                 <tr
//                   key={patient.id}
//                   className="hover:bg-gray-50 cursor-pointer"
//                   onClick={() => handlePatientClick(patient.id)}
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{patient.name}</div>
//                     <div className="text-sm text-gray-500">{patient.breed}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{patient.species}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{patient.ownerName}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">
//                       {format(new Date(patient.lastVisit), 'MMM dd, yyyy')}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                       patient.status === 'active'
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-red-100 text-red-800'
//                     }`}>
//                       {patient.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <ChevronRight className="w-5 h-5 text-gray-400" />
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }; 