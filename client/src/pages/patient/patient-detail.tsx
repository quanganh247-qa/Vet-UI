import React, { useState, useEffect, Suspense } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Activity, Syringe, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getPatientById } from '@/services/pet-services';
import { getVaccinations } from '@/services/vaccine-services';
import { getMedicalRecordsByPatientId } from '@/services/medical-record-services';
import { getPatientTreatments } from '@/services/treament-services';

const MedicalRecords = React.lazy(() => import("@/pages/medical-records"));
const Treatment = React.lazy(() => import("@/pages/treatment"));

interface Pet {
  petid: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  birth_date: string;
  weight: number;
  microchip_number: string;
  data_image: string;
  original_name: string;
  username: string;
}

interface Vaccine {
  vaccination_id: number;
  vaccine_name: string;
  date_administered: string;
  next_due_date: string;
  batch_number: string;
  vaccine_provider: string;
  notes: string;
  pet_id: number;
}

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  doctor: string;
  weight: number;
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
}

interface Treatment {
  id: string;
  name: string;
  date: string;
  status: 'completed' | 'ongoing' | 'scheduled';
  description: string;
  nextAppointment?: string;
  prescribedMedications?: string[];
  followUpNotes?: string;
}

export const PatientDetailPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('info');
  const [pet, setPet] = useState<Pet | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const petId = window.location.pathname.split('/').pop();
        if (!petId) {
          throw new Error('No pet ID provided');
        }
        const numericPetId = parseInt(petId);
        
        // Fetch pet and vaccines data in parallel
        const [petData, vaccinesData] = await Promise.all([
          getPatientById(numericPetId),
          getVaccinations(numericPetId)
        ]);

        setPet(petData);
        
        setVaccines(vaccinesData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pet data');
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">{error || 'Pet not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => setLocation('/patients')}
          className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Pets
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{pet.name}</h1>
      </div>

      {/* Pet Photo and Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Photo Section */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
              <img
                src={'https://i.pinimg.com/736x/2a/25/b6/2a25b650a1d075d3f5cff5182cbca1f0.jpg'}
                alt={`${pet.name} - ${pet.breed}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 flex justify-center">
              {/* <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Change Photo
              </button> */}
            </div>
          </div>
        </div>

        {/* Pet Info Card */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Species</h3>
                <p className="mt-1 text-sm text-gray-900">{pet.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Breed</h3>
                <p className="mt-1 text-sm text-gray-900">{pet.breed}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Age</h3>
                <p className="mt-1 text-sm text-gray-900">{pet.age} years</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                <p className="mt-1 text-sm text-gray-900">{pet.type === 'Dog' ? 'Male' : 'Female'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Weight</h3>
                <p className="mt-1 text-sm text-gray-900">{pet.weight} kg</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Microchip ID</h3>
                <p className="mt-1 text-sm text-gray-900">{pet.microchip_number || 'Not registered'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`${
                activeTab === 'info'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Owner Info
            </button>
            <button
              onClick={() => setActiveTab('vaccines')}
              className={`${
                activeTab === 'vaccines'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Vaccines
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`${
                activeTab === 'records'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Medical Records
            </button>
            <button
              onClick={() => setActiveTab('treatments')}
              className={`${
                activeTab === 'treatments'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Treatments
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Owner Name</h3>
                <p className="mt-1 text-sm text-gray-900">{pet.username}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-sm text-gray-900">0978710192</p>
              </div>
            </div>
          )}

          {activeTab === 'vaccines' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Vaccination History</h2>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  Add Vaccine
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vaccines?.map((vaccine) => (
                      <tr key={vaccine.vaccination_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vaccine.vaccine_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(vaccine.date_administered), 'MMM d, yyyy')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(vaccine.next_due_date), 'MMM d, yyyy')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            vaccine.notes === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {vaccine.notes}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <Suspense fallback={<div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>}>
              <MedicalRecords patientId={pet.petid.toString()} />
            </Suspense>
          )}

          {activeTab === 'treatments' && (
            <Suspense fallback={<div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>}>
              <Treatment petId={pet.petid.toString()} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}; 