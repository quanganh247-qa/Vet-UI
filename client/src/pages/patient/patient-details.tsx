import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  UserCircle, 
  Calendar, 
  Edit, 
  Plus, 
  Image as ImageIcon,
  AlertCircle,
  FlaskConical,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePatientData } from '@/hooks/use-pet';
import { usePetOwnerByPetId } from '@/hooks/use-pet';
import { useVaccineData } from '@/hooks/use-vaccine';
import { Skeleton } from '@/components/ui/skeleton';
import { Vaccination } from '@/types';

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  // Fetch pet data
  const { data: patientData, isLoading: isPatientLoading } = usePatientData(id);
  
  // Fetch owner data
  const { data: ownerData, isLoading: isOwnerLoading } = usePetOwnerByPetId(patientData?.petid);
  
  // Fetch vaccinations
  const { data: vaccinations, isLoading: isVaccinationsLoading } = useVaccineData(id ? parseInt(id) : 0);
  
  // State for vaccination search/filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredVaccinations, setFilteredVaccinations] = useState<Vaccination[]>([]);

  // Filter vaccinations when data changes or search query updates
  useEffect(() => {
    if (vaccinations) {
      if (!searchQuery) {
        setFilteredVaccinations(vaccinations);
      } else {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = vaccinations.filter((vaccination: Vaccination) => 
          vaccination.vaccine_name.toLowerCase().includes(lowercasedQuery) ||
          (vaccination.date_administered && vaccination.date_administered.toLowerCase().includes(lowercasedQuery)) ||
          (vaccination.batch_number && vaccination.batch_number.toLowerCase().includes(lowercasedQuery)) ||
          (vaccination.notes && vaccination.notes.toLowerCase().includes(lowercasedQuery))
        );
        setFilteredVaccinations(filtered);
      }
    }
  }, [vaccinations, searchQuery]);

  const handleBackClick = () => {
    navigate('/patients');
  };
  
  const handleEditClick = () => {
    // Navigate to pet edit page
    navigate(`/patients/${id}/edit`);
  };

  // Loading state
  if (isPatientLoading || isOwnerLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto p-6">
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4"></div>
          <p className="text-indigo-600 font-medium">Loading patient data...</p>
        </div>
      </div>
    );
  }

  // Error state - if no patient data found
  if (!patientData) {
    return (
      <div className="container max-w-screen-xl mx-auto p-6">
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-red-500 font-medium">Patient not found</p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={handleBackClick}
          >
            Back to Patients List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-xl mx-auto p-4 md:p-6">
      {/* Header with back button and patient name */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 -mx-4 -mt-4 md:-mx-6 md:-mt-6 px-6 py-4 md:px-8 md:py-5 mb-6 rounded-br-xl rounded-bl-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8 text-white hover:bg-white/20"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {patientData.name}
              </h1>
              <div className="text-sm text-white/80 flex items-center gap-2">
                <span>{patientData.type}</span>
                <span>•</span>
                <span>{patientData.breed}</span>
                <span>•</span>
                <span>{patientData.gender}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit Patient
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-6">
        {/* Top section with Pet and Owner information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pet image card */}
          <Card className="border-none shadow-md overflow-hidden">
            <div className="aspect-w-1 aspect-h-1 relative bg-indigo-50 h-48">
              {patientData.data_image ? (
                <img 
                  src={`data:image/png;base64,${patientData.data_image}`} 
                  alt={patientData.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-indigo-200">
                  <ImageIcon size={64} />
                </div>
              )}
              
              {/* Gender badge */}
              <div
                className={`absolute bottom-2 right-2 h-8 w-8 rounded-full flex items-center justify-center text-white ${
                  patientData.gender === "Male" ? "bg-blue-500" : "bg-pink-500"
                }`}
              >
                {patientData.gender === "Male" ? "♂" : "♀"}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">{patientData.name}</h3>
              <div className="text-sm text-gray-500">{patientData.breed} {patientData.type}</div>
            </CardContent>
          </Card>
          
          {/* Pet details card */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Pet Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-y-2">
                <div>
                  <div className="text-xs text-gray-500">Age</div>
                  <div className="text-sm font-medium">{patientData.age} years</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Weight</div>
                  <div className="text-sm font-medium">{patientData.weight} kg</div>
                </div>
            
                <div>
                  <div className="text-xs text-gray-500">Birth Date</div>
                  <div className="text-sm font-medium">
                    {patientData.birth_date ? format(new Date(patientData.birth_date), 'MM/dd/yyyy') : 'Unknown'}
                  </div>
                </div>
                {patientData.microchip_number && (
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500">Microchip</div>
                    <div className="text-sm font-medium">{patientData.microchip_number}</div>
                  </div>
                )}
                {patientData.notes && (
                  <div className="col-span-2 mt-2">
                    <div className="text-xs text-gray-500">Notes</div>
                    <div className="text-sm text-gray-600 whitespace-pre-line">
                      {patientData.notes}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Owner details card */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <UserCircle className="h-4 w-4 mr-2 text-gray-500" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isOwnerLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : ownerData ? (
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Name</div>
                    <div className="text-sm font-medium">{ownerData.username || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="text-sm font-medium">{ownerData.phone_number || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm font-medium">{ownerData.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="text-sm font-medium">{ownerData.address || 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">Owner information not available</div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Vaccinations Table */}
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-white pb-3 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                <FlaskConical className="h-5 w-5 mr-2 text-amber-600" />
                Vaccination History
              </CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search vaccinations..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isVaccinationsLoading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredVaccinations && filteredVaccinations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vaccine Name</TableHead>
                      <TableHead>Administered</TableHead>
                      <TableHead>Due Next</TableHead>
                      <TableHead>Administered By</TableHead>
                      <TableHead>Lot Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVaccinations.map((vaccination) => (
                      <TableRow key={vaccination.vaccination_id}>
                        <TableCell className="font-medium">{vaccination.vaccine_name}</TableCell>
                        <TableCell>{format(new Date(vaccination.date_administered), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{format(new Date(vaccination.next_due_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{vaccination.date_administered || 'N/A'}</TableCell>
                        <TableCell>{vaccination.batch_number || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${
                              new Date(vaccination.next_due_date) < new Date() 
                                ? "bg-red-50 text-red-700 border-red-200" 
                                : "bg-green-50 text-green-700 border-green-200"
                            }`}
                          >
                            {new Date(vaccination.next_due_date) < new Date() 
                              ? "OVERDUE" 
                              : "UP TO DATE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{vaccination.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">
                  {searchQuery ? 'No matching vaccinations found' : 'No vaccination records found'}
                </p>
                {!searchQuery && (
                  <Button variant="outline" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Vaccination Record
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDetailsPage;