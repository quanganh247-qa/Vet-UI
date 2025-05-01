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
  Search,
  Dog,
  Cat,
  Bird,
  Rabbit,
  ClipboardList
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const getPetTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'dog': return <Dog className="h-4 w-4 inline-block mr-1 text-gray-500" />;
    case 'cat': return <Cat className="h-4 w-4 inline-block mr-1 text-gray-500" />;
    case 'bird': return <Bird className="h-4 w-4 inline-block mr-1 text-gray-500" />;
    case 'rabbit': return <Rabbit className="h-4 w-4 inline-block mr-1 text-gray-500" />;
    default: return null;
  }
};

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Get appointmentId from URL query parameter
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract appointmentId from URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    setAppointmentId(urlAppointmentId);
  }, []);

  const { data: patientData, isLoading: isPatientLoading, error: patientError } = usePatientData(id);
  const { data: ownerData, isLoading: isOwnerLoading, error: ownerError } = usePetOwnerByPetId(patientData?.petid);
  const { data: vaccinations, isLoading: isVaccinationsLoading, error: vaccinationsError } = useVaccineData(id ? parseInt(id) : 0);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredVaccinations, setFilteredVaccinations] = useState<Vaccination[]>([]);
  const [isAddVaccineDialogOpen, setIsAddVaccineDialogOpen] = useState(false);

  useEffect(() => {
    if (vaccinations) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = vaccinations.filter((vaccination: Vaccination) => 
        vaccination.vaccine_name.toLowerCase().includes(lowercasedQuery) ||
        (vaccination.date_administered && format(new Date(vaccination.date_administered), 'MMM d, yyyy').toLowerCase().includes(lowercasedQuery)) ||
        (vaccination.batch_number && vaccination.batch_number.toLowerCase().includes(lowercasedQuery)) ||
        (vaccination.notes && vaccination.notes.toLowerCase().includes(lowercasedQuery)) ||
        (vaccination.vaccine_provider && vaccination.vaccine_provider.toLowerCase().includes(lowercasedQuery)) // Changed from administered_by
      );
      setFilteredVaccinations(filtered);
    } else {
      setFilteredVaccinations([]);
    }
  }, [vaccinations, searchQuery]);

  const handleBackClick = () => {
    navigate('/patients');
  };
  
  const handleEditClick = () => {
    navigate(`/patients/${id}/edit`);
  };

  const handleAddVaccination = () => {
    setIsAddVaccineDialogOpen(true);
  };

  if (isPatientLoading || isOwnerLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto p-4 md:p-6 animate-pulse">
        <div className="bg-gray-300 h-20 -mx-4 -mt-4 md:-mx-6 md:-mt-6 px-6 py-4 md:px-8 md:py-5 mb-6 rounded-br-xl rounded-bl-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Skeleton className="h-8 w-8 mr-2 rounded-full" />
              <div>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-md overflow-hidden">
              <Skeleton className="h-48 w-full bg-gray-200" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2"><Skeleton className="h-5 w-1/3" /></CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2"><Skeleton className="h-5 w-1/3" /></CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <Card className="border-none shadow-md">
            <CardHeader className="bg-gray-100 pb-3 border-b">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-40" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-64 rounded-md" />
                  <Skeleton className="h-9 w-20 rounded-md" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (patientError || !patientData) {
    return (
      <div className="container max-w-screen-xl mx-auto p-6">
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-red-300 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Patient Data</h2>
          <p className="text-red-600 mb-6">
            {patientError?.message || 'Could not find the requested patient.'}
          </p>
          <Button 
            variant="outline" 
            onClick={handleBackClick}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients List
          </Button>
        </div>
      </div>
    );
  }

  const PetIcon = getPetTypeIcon(patientData.type);

  return (
    <div className="container max-w-screen-xl mx-auto p-4 md:p-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 -mx-4 -mt-4 md:-mx-6 md:-mt-6 px-6 py-4 md:px-8 md:py-5 mb-6 rounded-br-xl rounded-bl-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-3 h-9 w-9 text-white hover:bg-white/20 rounded-full"
              onClick={handleBackClick}
              aria-label="Back to patients list"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
                {PetIcon && <span className="mr-2 text-white/80">{React.cloneElement(PetIcon, { className: "h-6 w-6 inline-block text-white/90" })}</span>}
                {patientData.name}
              </h1>
              <div className="text-sm text-white/80 flex items-center gap-2 mt-1">
                <span>{patientData.type}</span>
                <span className="opacity-50">•</span>
                <span>{patientData.breed}</span>
                <span className="opacity-50">•</span>
                <span>{patientData.gender}</span>
                <span className="opacity-50">•</span>
                <span>{patientData.age} yrs</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/30 hover:bg-white/25 transition-colors duration-150"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4 mr-1.5" /> Edit Patient
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg overflow-hidden lg:col-span-1 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="aspect-square relative">
              {patientData.data_image ? (
                <img 
                  src={`data:image/png;base64,${patientData.data_image}`} 
                  alt={`${patientData.name}, ${patientData.breed}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-indigo-300 bg-indigo-100">
                  <ImageIcon size={80} strokeWidth={1.5} />
                </div>
              )}
              <Badge 
                variant="secondary" 
                className={`absolute bottom-3 right-3 text-xs font-semibold shadow-md ${
                  patientData.gender === "Male" 
                    ? "bg-blue-500 text-white border-blue-600" 
                    : "bg-pink-500 text-white border-pink-600"
                }`}
              >
                {patientData.gender === "Male" ? "♂ MALE" : "♀ FEMALE"}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-indigo-900">{patientData.name}</h3>
              <p className="text-sm text-gray-600">{patientData.breed} {patientData.type}</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg lg:col-span-2">
             <CardHeader className="pb-3 border-b bg-gray-50/50 rounded-t-lg">
               <CardTitle className="text-lg font-semibold text-gray-800">Details</CardTitle>
             </CardHeader>
             <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
               <div className="space-y-3">
                 <h4 className="text-sm font-medium text-indigo-700 border-b pb-1 mb-2">Pet Information</h4>
                 <DetailItem label="Age" value={`${patientData.age} years`} />
                 <DetailItem label="Weight" value={`${patientData.weight} kg`} />
                 <DetailItem label="Birth Date" value={patientData.birth_date ? format(new Date(patientData.birth_date), 'MMMM d, yyyy') : 'Unknown'} />
                 {patientData.microchip_number && (
                   <DetailItem label="Microchip" value={patientData.microchip_number} />
                 )}
               </div>

               <div className="space-y-3">
                 <h4 className="text-sm font-medium text-purple-700 border-b pb-1 mb-2 flex items-center">
                   <UserCircle className="h-4 w-4 mr-1.5 text-purple-500" /> Owner Information
                 </h4>
                 {isOwnerLoading ? (
                   <div className="space-y-2 pt-1">
                     <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-4 w-1/2" />
                     <Skeleton className="h-4 w-2/3" />
                   </div>
                 ) : ownerData ? (
                   <>
                     <DetailItem label="Name" value={ownerData.username || 'N/A'} />
                     <DetailItem label="Phone" value={ownerData.phone_number || 'N/A'} />
                     <DetailItem label="Email" value={ownerData.email || 'N/A'} />
                     <DetailItem label="Address" value={ownerData.address || 'N/A'} />
                   </>
                 ) : (
                   <p className="text-sm text-gray-500 italic pt-1">Owner information not available.</p>
                 )}
               </div>

               {patientData.notes && (
                 <div className="md:col-span-2 mt-3 pt-3 border-t">
                   <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                   <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border">
                     {patientData.notes}
                   </p>
                 </div>
               )}
             </CardContent>
           </Card>
        </div>
        
        <AlertDialog>
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 pb-3 border-b rounded-t-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                  <FlaskConical className="h-5 w-5 mr-2 text-amber-700" />
                  Vaccination History
                </CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      type="search"
                      placeholder="Search vaccinations..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9"
                    />
                  </div>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" className="h-9" onClick={() => setIsAddVaccineDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Record
                    </Button>
                  </AlertDialogTrigger>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isVaccinationsLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              ) : filteredVaccinations && filteredVaccinations.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="py-2 px-4">Vaccine</TableHead>
                        <TableHead className="py-2 px-4">Administered</TableHead>
                        <TableHead className="py-2 px-4">Next Due</TableHead>
                        <TableHead className="py-2 px-4">Provider</TableHead> {/* Changed from Administered By */}
                        <TableHead className="py-2 px-4">Lot Number</TableHead>
                        <TableHead className="py-2 px-4">Status</TableHead>
                        <TableHead className="py-2 px-4">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVaccinations.map((vaccination) => {
                        const isOverdue = new Date(vaccination.next_due_date) < new Date();
                        return (
                          <TableRow key={vaccination.vaccination_id} className="hover:bg-gray-50 transition-colors duration-150">
                            <TableCell className="font-medium py-2 px-4">{vaccination.vaccine_name}</TableCell>
                            <TableCell className="py-2 px-4">{format(new Date(vaccination.date_administered), 'MMM d, yyyy')}</TableCell>
                            <TableCell className={`py-2 px-4 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                              {format(new Date(vaccination.next_due_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="py-2 px-4">{vaccination.vaccine_provider || 'N/A'}</TableCell> 
                            <TableCell className="py-2 px-4">{vaccination.batch_number || 'N/A'}</TableCell>
                            <TableCell className="py-2 px-4">
                              <Badge
                                variant={isOverdue ? "destructive" : "outline"}
                                className={`text-xs font-semibold ${
                                  isOverdue 
                                    ? "bg-red-100 text-red-800 border-red-300" 
                                    : "bg-green-100 text-green-800 border-green-300"
                                }`}
                              >
                                {isOverdue ? "OVERDUE" : "UP TO DATE"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2 px-4 max-w-xs truncate text-sm text-gray-600" title={vaccination.notes || ''}>
                              {vaccination.notes || '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-16 px-6 bg-gray-50 rounded-b-lg">
                  <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {searchQuery ? 'No Matching Vaccinations' : 'No Vaccination Records'}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    {searchQuery 
                      ? 'Try adjusting your search query.' 
                      : 'Add the first vaccination record for this patient.'}
                  </p>
                  {!searchQuery && (
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setIsAddVaccineDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Vaccination Record
                      </Button>
                    </AlertDialogTrigger>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add New Vaccination Record</AlertDialogTitle>
              <AlertDialogDescription>
                Enter the details for the new vaccination. (Form fields would go here)
                <div className="mt-4 p-4 border rounded bg-yellow-50 border-yellow-200 text-yellow-800 text-sm">
                  Form implementation is pending.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => console.log("Save vaccination")}>Save Record</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-indigo-50 to-white flex flex-row justify-between items-center">
            <div className="flex items-center">
              <ClipboardList className="h-5 w-5 text-indigo-600 mr-2" />
              <CardTitle className="text-lg font-semibold text-gray-800">SOAP History</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              onClick={() => {
                const params = new URLSearchParams();
                if (appointmentId) params.append("appointmentId", appointmentId);
                if (patientData?.petid) params.append("petId", patientData.petid.toString());
                window.location.href = `/soap-history?${params.toString()}`;
              }}
            >
              View Complete History
            </Button>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <ClipboardList className="h-12 w-12 text-indigo-300 mb-3" />
              <h3 className="text-gray-700 font-medium mb-2">Track SOAP Notes History</h3>
              <p className="text-gray-500 text-sm max-w-md mb-4">
                View the complete medical SOAP history for this patient, including subjective observations, 
                objective findings, assessments, and treatment plans.
              </p>
              <Button
                variant="default"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (appointmentId) params.append("appointmentId", appointmentId);
                  if (patientData?.petid) params.append("petId", patientData.petid.toString());
                  window.location.href = `/soap-history?${params.toString()}`;
                }}
              >
                Access SOAP History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string | number | undefined | null }> = ({ label, value }) => (
  <div>
    <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
    <div className="text-sm font-medium text-gray-800">{value || <span className="text-gray-400 italic">N/A</span>}</div>
  </div>
);

export default PatientDetailsPage;