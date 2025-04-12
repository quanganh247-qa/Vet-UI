import React, { useState, useEffect, Suspense } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Activity, Syringe, FileText, Clock, User, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { getPatientById } from '@/services/pet-services';
import { getVaccinations } from '@/services/vaccine-services';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 dark:text-red-400">{error || 'Pet not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/patients')}
              className="mr-4 h-8 w-8 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{pet.name}</h1>
              <p className="text-indigo-100 text-sm">
                Patient Profile
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pet Photo and Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Photo Section */}
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-w-1 aspect-h-1 relative h-80">

                <img
                  src={`data:image/png;base64,${pet.data_image}` || 'https://i.pinimg.com/736x/2a/25/b6/2a25b650a1d075d3f5cff5182cbca1f0.jpg'}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/30 dark:to-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{pet.name}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-800">
                    {pet.breed}
                  </Badge>
                  <Badge variant="outline" className="border-gray-200 dark:border-gray-700">
                    {pet.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pet Info Card */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3 border-b dark:border-gray-700">
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Species</h3>
                  <p className="text-base text-gray-900 dark:text-gray-200">{pet.type}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Breed</h3>
                  <p className="text-base text-gray-900 dark:text-gray-200">{pet.breed}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</h3>
                  <p className="text-base text-gray-900 dark:text-gray-200">{pet.age} years</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</h3>
                  <p className="text-base text-gray-900 dark:text-gray-200">{pet.type === 'Dog' ? 'Male' : 'Female'}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</h3>
                  <p className="text-base text-gray-900 dark:text-gray-200">{pet.weight} kg</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Microchip ID</h3>
                  <p className="text-base text-gray-900 dark:text-gray-200">{pet.microchip_number || 'Not registered'}</p>
                </div>
              </div>

              <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-medium text-gray-900 dark:text-gray-200">Owner Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm text-gray-500 dark:text-gray-400">Name</h4>
                    <p className="text-base text-gray-900 dark:text-gray-200">{pet.username}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm text-gray-500 dark:text-gray-400">Phone</h4>
                    <p className="text-base text-gray-900 dark:text-gray-200">0978710192</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Card className="mt-6 overflow-hidden">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b dark:border-gray-700 bg-transparent p-0">
            <TabsTrigger
              value="info"
              className={cn(
                "data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600",
                "dark:data-[state=active]:border-indigo-400 dark:data-[state=active]:text-indigo-400",
                "rounded-none border-b-2 border-transparent py-3 font-medium text-gray-500 dark:text-gray-400",
                "hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              )}
            >
              Owner Info
            </TabsTrigger>
            <TabsTrigger
              value="vaccines"
              className={cn(
                "data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600",
                "dark:data-[state=active]:border-indigo-400 dark:data-[state=active]:text-indigo-400",
                "rounded-none border-b-2 border-transparent py-3 font-medium text-gray-500 dark:text-gray-400",
                "hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              )}
            >
              Vaccines
            </TabsTrigger>
            <TabsTrigger
              value="records"
              className={cn(
                "data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600",
                "dark:data-[state=active]:border-indigo-400 dark:data-[state=active]:text-indigo-400",
                "rounded-none border-b-2 border-transparent py-3 font-medium text-gray-500 dark:text-gray-400",
                "hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              )}
            >
              Medical Records
            </TabsTrigger>
            {/* <TabsTrigger
              value="treatments"
              className={cn(
                "data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600",
                "dark:data-[state=active]:border-indigo-400 dark:data-[state=active]:text-indigo-400",
                "rounded-none border-b-2 border-transparent py-3 font-medium text-gray-500 dark:text-gray-400",
                "hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              )}
            >
              Treatments
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="info" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Owner Details
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Owner Name</h4>
                      <p className="text-base text-gray-900 dark:text-gray-200">{pet.username}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</h4>
                      <p className="text-base text-gray-900 dark:text-gray-200">0978710192</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Address Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Primary Address</h4>
                    <p className="text-base text-gray-900 dark:text-gray-200">123 Main Street, Cityville</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vaccines" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Syringe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Vaccination History
              </h3>
              <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800">
                Add Vaccine
              </Button>
            </div>

            <div className="overflow-x-auto">
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Due</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {vaccines?.map((vaccine) => (
                      <tr key={vaccine.vaccination_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{vaccine.vaccine_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{format(new Date(vaccine.date_administered), 'MMM d, yyyy')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{format(new Date(vaccine.next_due_date), 'MMM d, yyyy')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={cn(
                            "px-2 text-xs font-semibold rounded-full",
                            vaccine.notes === 'completed'
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          )}>
                            {vaccine.notes}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="records">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
              </div>
            }>
              <MedicalRecords />
            </Suspense>
          </TabsContent>

          <TabsContent value="treatments">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
              </div>
            }>
              <Treatment />
            </Suspense>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}; 