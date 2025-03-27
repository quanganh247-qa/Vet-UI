import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ListPatients } from '@/services/pet-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Plus, Loader2, ChevronRight, PawPrint, UserCircle, List, Grid } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
    patient.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient.username && patient.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePatientClick = (patientId: string) => {
    setLocation(`/patients/${patientId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Patients</h1>
            <p className="text-indigo-100 text-sm">
              Manage and view all patient records
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => setLocation('/patients/new')}
              className="bg-white text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Patient
            </Button>
          </div>
        </div>
      </div>

      {/* Search and filter section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search patients by name, owner, or species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 dark:placeholder:text-gray-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-md p-1">
              <Button 
                size="sm" 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                onClick={() => setViewMode('list')}
                className={cn(
                  "h-8 w-8 p-0",
                  viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "h-8 w-8 p-0",
                  viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Patients grid view */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No patients found matching your search criteria
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <Card 
                key={patient.petid} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePatientClick(patient.petid)}
              >
                <div className="aspect-w-16 aspect-h-9 bg-indigo-50 dark:bg-indigo-900/20">
                  <div className="flex items-center justify-center h-full text-indigo-300 dark:text-indigo-700">
                    <PawPrint className="h-12 w-12" />
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                    >
                      {patient.type}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <UserCircle className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                    <span>{patient.username || 'Unknown Owner'}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Breed:</span>
                      <span className="ml-1 text-gray-900 dark:text-gray-300">{patient.breed}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Age:</span>
                      <span className="ml-1 text-gray-900 dark:text-gray-300">{patient.age} years</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                      <span className="ml-1 text-gray-900 dark:text-gray-300">{patient.gender || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                      <span className="ml-1 text-gray-900 dark:text-gray-300">{patient.weight} kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Patients list view */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pet Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Species
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      No patients found matching your search criteria
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.petid}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-pointer transition-colors"
                      onClick={() => handlePatientClick(patient.petid)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <PawPrint className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{patient.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{patient.breed}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant="outline"
                          className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                        >
                          {patient.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-200">{patient.username || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-200">{patient.age} years</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-200">{patient.gender || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 inline" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}; 