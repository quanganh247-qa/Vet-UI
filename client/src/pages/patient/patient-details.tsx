import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  UserCircle, 
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
  ClipboardList,
  Pencil,
  Trash2,
  Weight,
  CalendarDays,
  QrCode,
  Mail,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const DetailItem: React.FC<{ label: string; value: string | number | undefined | null }> = ({ label, value }) => (
  <div className="space-y-1">
    <div className="text-sm text-[#4B5563] font-medium">{label}</div>
    <div className="text-sm text-[#111827]">{value || <span className="text-[#9CA3AF]">Not specified</span>}</div>
  </div>
);

const getPetTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'dog': return <Dog className="h-4 w-4" />;
    case 'cat': return <Cat className="h-4 w-4" />;
    case 'bird': return <Bird className="h-4 w-4" />;
    case 'rabbit': return <Rabbit className="h-4 w-4" />;
    default: return null;
  }
};

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    setAppointmentId(urlAppointmentId);
  }, []);

  const { data: patientData, isLoading: isPatientLoading, error: patientError } = usePatientData(id);
  const { data: ownerData, isLoading: isOwnerLoading } = usePetOwnerByPetId(patientData?.petid);
  const { data: vaccinations, isLoading: isVaccinationsLoading } = useVaccineData(id ? parseInt(id) : 0);
  
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
        (vaccination.vaccine_provider && vaccination.vaccine_provider.toLowerCase().includes(lowercasedQuery))
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

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  if (isPatientLoading || isOwnerLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 mr-3 rounded-xl" />
              <div>
                <Skeleton className="h-7 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-[#2C78E4]/20 shadow-sm p-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4]" />
          </div>
        </div>
      </div>
    );
  }

  if (patientError || !patientData) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-white">Patient Details</h1>
              <p className="text-sm text-white">Unable to load patient information</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#2C78E4]/20 shadow-sm p-6">
          <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <AlertCircle className="h-10 w-10 mb-2" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to Load Patient</h2>
            <p className="text-red-600 mb-6">
              {(patientError as any)?.message || 'The requested patient could not be found.'}
            </p>
            <Button 
              variant="outline" 
              onClick={handleBackClick}
              className="border-[#2C78E4]/20 text-[#4B5563] hover:bg-[#F9FAFB] rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Patients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const PetIcon = getPetTypeIcon(patientData.type);

  return (
    <div className="space-y-6">
      {/* Header with gradient background matching product management */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 h-10 w-10 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                {PetIcon && <span className="text-white">{React.cloneElement(PetIcon, { className: "h-5 w-5 text-white" })}</span>}
                {patientData.name}
              </h1>
              <p className="text-sm text-white">
                {patientData.breed} • {patientData.gender} • {patientData.age} years old
              </p>
            </div>
          </div>

          {/* <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 rounded-xl"
              onClick={handleEditClick}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-red-500/30 backdrop-blur-sm transition-all duration-200 rounded-xl"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div> */}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#2C78E4]/20 shadow-sm p-6">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="bg-[#F9FAFB] border border-[#2C78E4]/20 rounded-xl">
            <TabsTrigger 
              value="details"
              className="data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] data-[state=active]:shadow-sm text-[#4B5563] hover:text-[#111827] rounded-xl"
            >
              Patient Details
            </TabsTrigger>
            <TabsTrigger 
              value="vaccinations"
              className="data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] data-[state=active]:shadow-sm text-[#4B5563] hover:text-[#111827] rounded-xl"
            >
              Vaccinations
            </TabsTrigger>
           
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border border-[#2C78E4]/10 rounded-2xl overflow-hidden bg-white">
                <div className="aspect-square relative">
                  {patientData.data_image ? (
                    <img 
                      src={`data:image/png;base64,${patientData.data_image}`} 
                      alt={`${patientData.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#F9FAFB] border border-[#2C78E4]/10">
                      <ImageIcon className="h-16 w-16 text-[#9CA3AF]" />
                    </div>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={`absolute bottom-2 right-2 rounded-full ${
                      patientData.gender === "Male" 
                        ? "bg-[#F0F7FF] text-[#2C78E4] border-[#2C78E4]/20" 
                        : "bg-pink-100 text-pink-800 border-pink-200"
                    }`}
                  >
                    {patientData.gender}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-1 text-[#111827]">{patientData.name}</h3>
                  <p className="text-[#4B5563] text-sm mb-4">
                    {patientData.breed} {patientData.type}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-[#4B5563]" />
                      <span className="text-sm text-[#4B5563]">{patientData.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#4B5563]" />
                      <span className="text-sm text-[#4B5563]">
                        {patientData.birth_date ? format(new Date(patientData.birth_date), 'MMM d, yyyy') : 'Unknown'}
                      </span>
                    </div>
                    {patientData.microchip_number && (
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-[#4B5563]" />
                        <span className="text-sm text-[#4B5563]">{patientData.microchip_number}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2 border border-[#2C78E4]/10 rounded-2xl bg-white">
                <CardHeader className="border-b border-[#2C78E4]/10">
                  <CardTitle className="text-[#111827]">Patient Information</CardTitle>
                  <CardDescription className="text-[#4B5563]">Complete information about patient and owner</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-[#111827] border-b border-[#2C78E4]/10 pb-2">Pet Information</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Age" value={`${patientData.age} years`} />
                        <DetailItem label="Weight" value={`${patientData.weight} kg`} />
                      </div>
                      
                      <DetailItem 
                        label="Birth Date" 
                        value={patientData.birth_date ? format(new Date(patientData.birth_date), 'MMMM d, yyyy') : 'Unknown'} 
                      />
                      
                      {patientData.microchip_number && (
                        <DetailItem label="Microchip ID" value={patientData.microchip_number} />
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-[#111827] border-b border-[#2C78E4]/10 pb-2">Owner Information</h4>
                      
                      {isOwnerLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      ) : ownerData ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-[#4B5563]" />
                            <span className="text-sm text-[#4B5563]">{ownerData.username || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[#4B5563]" />
                            <span className="text-sm text-[#4B5563]">{ownerData.phone_number || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#4B5563]" />
                            <span className="text-sm text-[#4B5563]">{ownerData.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#4B5563]" />
                            <span className="text-sm text-[#4B5563]">{ownerData.address || 'N/A'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-[#F9FAFB] rounded-xl border border-[#2C78E4]/10">
                          <UserCircle className="h-8 w-8 text-[#9CA3AF] mx-auto mb-2" />
                          <p className="text-sm text-[#4B5563]">Owner information unavailable</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {patientData.notes && (
                    <div className="mt-6 pt-6 border-t border-[#2C78E4]/10">
                      <h4 className="font-medium text-[#111827] mb-2">Additional Notes</h4>
                      <div className="text-sm text-[#4B5563] bg-[#F9FAFB] p-3 rounded-xl border border-[#2C78E4]/10">
                        {patientData.notes}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vaccinations">
            <AlertDialog>
              <Card className="border border-[#2C78E4]/10 rounded-2xl bg-white">
                <CardHeader className="border-b border-[#2C78E4]/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-[#111827]">
                        <FlaskConical className="h-5 w-5 text-[#2C78E4]" />
                        Vaccination Records
                      </CardTitle>
                      <CardDescription className="text-[#4B5563]">
                        Immunization history for {patientData.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
                        <Input 
                          type="search"
                          placeholder="Search records..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-xl bg-white"
                        />
                      </div>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          onClick={() => setIsAddVaccineDialogOpen(true)}
                          className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Record
                        </Button>
                      </AlertDialogTrigger>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isVaccinationsLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-[#2C78E4]" />
                    </div>
                  ) : filteredVaccinations && filteredVaccinations.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-[#2C78E4]/10">
                          <TableHead className="text-[#4B5563]">Vaccine Name</TableHead>
                          <TableHead className="text-[#4B5563]">Date Given</TableHead>
                          <TableHead className="text-[#4B5563]">Next Due</TableHead>
                          <TableHead className="text-[#4B5563]">Provider</TableHead>
                          <TableHead className="text-[#4B5563]">Batch Number</TableHead>
                          <TableHead className="text-[#4B5563]">Status</TableHead>
                          <TableHead className="text-[#4B5563]">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVaccinations.map((vaccination) => {
                          const isOverdue = new Date(vaccination.next_due_date) < new Date();
                          return (
                            <TableRow key={vaccination.vaccination_id} className="border-b border-[#2C78E4]/10 hover:bg-[#F9FAFB]">
                              <TableCell className="font-medium text-[#111827]">{vaccination.vaccine_name}</TableCell>
                              <TableCell className="text-[#4B5563]">{format(new Date(vaccination.date_administered), 'MMM d, yyyy')}</TableCell>
                              <TableCell className={isOverdue ? 'text-red-600' : 'text-[#4B5563]'}>
                                {format(new Date(vaccination.next_due_date), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell className="text-[#4B5563]">{vaccination.vaccine_provider || 'N/A'}</TableCell> 
                              <TableCell className="text-[#4B5563]">{vaccination.batch_number || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={isOverdue ? "destructive" : "default"}
                                  className={isOverdue 
                                    ? "bg-red-100 text-red-800 border-red-200 rounded-full" 
                                    : "bg-green-100 text-green-800 border-green-200 rounded-full"
                                  }
                                >
                                  {isOverdue ? "Overdue" : "Current"}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-[#4B5563]">
                                {vaccination.notes || '—'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#2C78E4]/20 h-64 transition-all hover:border-[#2C78E4]/40">
                      <div className="rounded-full bg-[#F0F7FF] p-4 mb-5 shadow-sm">
                        <FlaskConical className="h-7 w-7 text-[#2C78E4]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-[#111827]">
                        {searchQuery ? 'No Matching Records' : 'No Vaccination History'}
                      </h3>
                      <p className="text-sm text-[#4B5563] text-center mb-6 max-w-xs">
                        {searchQuery 
                          ? 'No vaccination records match your search.' 
                          : 'Start building this patient\'s vaccination history.'}
                      </p>
                      {!searchQuery && (
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm"
                            onClick={() => setIsAddVaccineDialogOpen(true)}
                            className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Vaccination
                          </Button>
                        </AlertDialogTrigger>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <AlertDialogContent className="border border-[#2C78E4]/20 bg-white rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#111827]">Add Vaccination Record</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#4B5563]">
                    Create a new vaccination entry for {patientData.name}.
                    <div className="mt-4 p-3 border rounded-xl bg-yellow-50 border-yellow-200 text-yellow-800 text-sm">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Form implementation pending
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="border-t border-[#2C78E4]/10 pt-4">
                  <AlertDialogCancel className="border-[#2C78E4]/20 text-[#4B5563] hover:bg-[#F9FAFB] rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => console.log("Save vaccination")}
                    className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    Save Record
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          <TabsContent value="soap">
            <Card className="border border-[#2C78E4]/10 rounded-2xl bg-white">
              <CardHeader className="border-b border-[#2C78E4]/10 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2 text-[#111827]">
                    <ClipboardList className="h-5 w-5 text-[#2C78E4]" />
                    Medical Records
                  </CardTitle>
                  <CardDescription className="text-[#4B5563]">
                    SOAP notes and treatment history
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2C78E4]/20 text-[#4B5563] hover:bg-[#F9FAFB] rounded-xl"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (appointmentId) params.append("appointmentId", appointmentId);
                    if (patientData?.petid) params.append("petId", patientData.petid.toString());
                    window.location.href = `/soap-history?${params.toString()}`;
                  }}
                >
                  View Full History
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center p-8 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#2C78E4]/20 h-64 transition-all hover:border-[#2C78E4]/40">
                  <div className="rounded-full bg-[#F0F7FF] p-4 mb-5 shadow-sm">
                    <ClipboardList className="h-7 w-7 text-[#2C78E4]" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-[#111827]">Complete Medical History</h3>
                  <p className="text-sm text-[#4B5563] text-center mb-6 max-w-xs">
                    Access the complete SOAP medical documentation for {patientData.name}.
                  </p>
                  <Button
                    size="sm"
                    className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (appointmentId) params.append("appointmentId", appointmentId);
                      if (patientData?.petid) params.append("petId", patientData.petid.toString());
                      window.location.href = `/soap-history?${params.toString()}`;
                    }}
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Open Medical Records
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border border-red-200 bg-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Patient Record
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#4B5563]">
              This will permanently delete <strong>{patientData.name}'s</strong> complete medical record, 
              including all vaccination history and SOAP notes. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-red-100 pt-4">
            <AlertDialogCancel className="border-[#2C78E4]/20 text-[#4B5563] hover:bg-[#F9FAFB] rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PatientDetailsPage;