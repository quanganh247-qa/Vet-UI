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
  ClipboardList,
  Pencil,
  Trash,
  Weight,
  CalendarDays,
  QrCode,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

// Component definitions moved here to fix linter errors
const DetailItem: React.FC<{ label: string; value: string | number | undefined | null }> = ({ label, value }) => (
  <div className="space-y-1">
    <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</div>
    <div className="text-sm font-semibold text-slate-800">{value || <span className="text-slate-400 italic">Not specified</span>}</div>
  </div>
);

const DetailItemWithIcon: React.FC<{ 
  icon: React.ReactNode;
  label: string; 
  value: string | number | undefined | null 
}> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <div className="mt-1 p-1">{icon}</div>
    <div className="space-y-1">
      <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value || <span className="text-slate-400 italic">Not specified</span>}</div>
    </div>
  </div>
);

const getPetTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'dog': return <Dog className="h-4 w-4 inline-block mr-1 text-slate-500" />;
    case 'cat': return <Cat className="h-4 w-4 inline-block mr-1 text-slate-500" />;
    case 'bird': return <Bird className="h-4 w-4 inline-block mr-1 text-slate-500" />;
    case 'rabbit': return <Rabbit className="h-4 w-4 inline-block mr-1 text-slate-500" />;
    default: return null;
  }
};

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

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

  const handleAddVaccination = () => {
    setIsAddVaccineDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  if (isPatientLoading || isOwnerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container max-w-7xl mx-auto p-4 md:p-6 animate-pulse">
          <div className="bg-gradient-to-r from-slate-200 to-slate-300 h-24 -mx-4 -mt-4 md:-mx-6 md:-mt-6 px-6 py-4 md:px-8 md:py-6 mb-8 rounded-br-2xl rounded-bl-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 mr-3 rounded-full" />
                <div>
                  <Skeleton className="h-7 w-40 mb-2" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-20 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
            </div>
          </div>
          
          <Skeleton className="h-12 w-96 mb-6 rounded-xl" />
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 border-0 shadow-xl rounded-2xl overflow-hidden">
                <Skeleton className="h-80 w-full bg-slate-200" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2 border-0 shadow-xl rounded-2xl">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-32 mb-3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-32 mb-3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (patientError || !patientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container max-w-7xl mx-auto p-6">
          <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white rounded-2xl border border-red-100 shadow-xl p-12 text-center">
            <div className="bg-red-50 rounded-full p-4 mb-6">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-3">Unable to Load Patient</h2>
            <p className="text-red-600 mb-8 max-w-md leading-relaxed">
              {(patientError as any)?.message || 'The requested patient could not be found or there was an error loading the data.'}
            </p>
            <Button 
              variant="outline" 
              onClick={handleBackClick}
              className="border-red-200 text-red-700 hover:bg-red-50 px-6 py-3 rounded-xl"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-7xl mx-auto p-4 md:p-6">
        {/* Enhanced Header with modern gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 -mx-4 -mt-4 md:-mx-6 md:-mt-6 px-6 py-8 md:px-8 md:py-10 mb-8 rounded-br-2xl rounded-bl-2xl shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-4 h-12 w-12 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                onClick={handleBackClick}
                aria-label="Back to patients list"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center mb-2">
                  {PetIcon && <span className="mr-3 text-white/90">{React.cloneElement(PetIcon, { className: "h-7 w-7 inline-block text-white/90" })}</span>}
                  {patientData.name}
                  <Heart className="h-6 w-6 ml-3 text-red-300" fill="currentColor" />
                </h1>
                <div className="text-sm text-white/90 flex items-center gap-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full">{patientData.type}</span>
                  <span className="text-white/70">•</span>
                  <span>{patientData.breed}</span>
                  <span className="text-white/70">•</span>
                  <span>{patientData.gender}</span>
                  <span className="text-white/70">•</span>
                  <span>{patientData.age} years old</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 px-4 py-2 rounded-xl"
                onClick={handleEditClick}
              >
                <Pencil className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-red-500/30 backdrop-blur-sm transition-all duration-200 px-4 py-2 rounded-xl"
                onClick={handleDeleteClick}
              >
                <Trash className="h-4 w-4 mr-2" /> Remove
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs with modern design */}
        <Tabs defaultValue="details" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="bg-white/70 backdrop-blur-sm p-1.5 rounded-2xl mb-8 border border-slate-200/50 shadow-lg inline-flex">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md text-slate-600 hover:text-slate-800 px-6 py-3 rounded-xl transition-all duration-200 font-medium"
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Patient Details
            </TabsTrigger>
            <TabsTrigger 
              value="vaccinations" 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md text-slate-600 hover:text-slate-800 px-6 py-3 rounded-xl transition-all duration-200 font-medium"
            >
              <FlaskConical className="h-4 w-4 mr-2" />
              Vaccinations
            </TabsTrigger>
            <TabsTrigger 
              value="soap" 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md text-slate-600 hover:text-slate-800 px-6 py-3 rounded-xl transition-all duration-200 font-medium"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Medical Records
            </TabsTrigger>
          </TabsList>

          {/* Patient Details Tab - Enhanced */}
          <TabsContent value="details" className="mt-0 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Patient Photo Card */}
              <Card className="border-0 shadow-2xl overflow-hidden lg:col-span-1 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-2xl">
                <div className="aspect-square relative">
                  {patientData.data_image ? (
                    <img 
                      src={`data:image/png;base64,${patientData.data_image}`} 
                      alt={`${patientData.name}, ${patientData.breed}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-blue-400 bg-gradient-to-br from-blue-50 to-indigo-100">
                      <ImageIcon size={80} strokeWidth={1.5} />
                    </div>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={`absolute bottom-4 right-4 text-xs font-bold shadow-lg rounded-full px-3 py-1.5 backdrop-blur-sm ${
                      patientData.gender === "Male" 
                        ? "bg-blue-500/90 text-white border-blue-600/50" 
                        : "bg-pink-500/90 text-white border-pink-600/50"
                    }`}
                  >
                    {patientData.gender === "Male" ? "♂ MALE" : "♀ FEMALE"}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{patientData.name}</h3>
                    <p className="text-slate-600 flex items-center text-sm">
                      {PetIcon && React.cloneElement(PetIcon, { className: "h-4 w-4 inline-block mr-2 text-blue-500" })}
                      {patientData.breed} {patientData.type}
                    </p>
                  </div>
                  
                  <Separator className="my-5" />

                  <div className="space-y-4">
                    <DetailItemWithIcon 
                      icon={<Weight className="h-4 w-4 text-blue-500" />}
                      label="Weight"
                      value={`${patientData.weight} kg`}
                    />
                    <DetailItemWithIcon 
                      icon={<CalendarDays className="h-4 w-4 text-blue-500" />}
                      label="Birth Date"
                      value={patientData.birth_date ? format(new Date(patientData.birth_date), 'MMMM d, yyyy') : 'Unknown'}
                    />
                    {patientData.microchip_number && (
                      <DetailItemWithIcon 
                        icon={<QrCode className="h-4 w-4 text-blue-500" />}
                        label="Microchip"
                        value={patientData.microchip_number}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Information Card */}
              <Card className="border-0 shadow-2xl lg:col-span-2 rounded-2xl bg-white">
                <CardHeader className="pb-4 border-b bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-t-2xl">
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                    <Stethoscope className="h-6 w-6 mr-3 text-blue-600" />
                    Complete Patient Profile
                  </CardTitle>
                  <CardDescription className="text-slate-600">Comprehensive information about patient and owner</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <h4 className="text-sm font-bold text-blue-600 border-b border-blue-100 pb-2 mb-4 flex items-center">
                        <Dog className="h-4 w-4 mr-2 text-blue-600" /> Pet Information
                      </h4>
                      
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

                    <div className="space-y-5">
                      <h4 className="text-sm font-bold text-blue-600 border-b border-blue-100 pb-2 mb-4 flex items-center">
                        <UserCircle className="h-4 w-4 mr-2 text-blue-600" /> Owner Information
                      </h4>
                      
                      {isOwnerLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      ) : ownerData ? (
                        <div className="space-y-4">
                          <DetailItemWithIcon 
                            icon={<UserCircle className="h-4 w-4 text-blue-500" />}
                            label="Full Name" 
                            value={ownerData.username || 'N/A'} 
                          />
                          <DetailItemWithIcon 
                            icon={<Phone className="h-4 w-4 text-blue-500" />}
                            label="Phone Number" 
                            value={ownerData.phone_number || 'N/A'} 
                          />
                          <DetailItemWithIcon 
                            icon={<Mail className="h-4 w-4 text-blue-500" />}
                            label="Email Address" 
                            value={ownerData.email || 'N/A'} 
                          />
                          <DetailItemWithIcon 
                            icon={<MapPin className="h-4 w-4 text-blue-500" />}
                            label="Home Address" 
                            value={ownerData.address || 'N/A'} 
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                          <UserCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm text-slate-500 italic">Owner information unavailable</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {patientData.notes && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-blue-600 mb-3 flex items-center">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Additional Notes
                      </h4>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                        {patientData.notes}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vaccination History Tab - Enhanced */}
          <TabsContent value="vaccinations" className="mt-0">
            <AlertDialog>
              <Card className="border-0 shadow-2xl rounded-2xl bg-white">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 pb-6 border-b rounded-t-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800 flex items-center mb-2">
                        <FlaskConical className="h-6 w-6 mr-3 text-blue-600" />
                        Vaccination Registry
                      </CardTitle>
                      <CardDescription className="text-slate-600 text-base">
                        Complete immunization history for {patientData.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex-grow sm:flex-grow-0 sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          type="search"
                          placeholder="Search vaccination records..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-11 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white shadow-sm"
                        />
                      </div>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 shadow-lg hover:shadow-xl transition-all duration-200"
                          onClick={() => setIsAddVaccineDialogOpen(true)}
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
                    <div className="p-8 space-y-4">
                      <Skeleton className="h-12 w-full rounded-lg" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                  ) : filteredVaccinations && filteredVaccinations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                          <TableRow className="border-b border-slate-200">
                            <TableHead className="py-4 px-6 text-slate-700 font-semibold">Vaccine Name</TableHead>
                            <TableHead className="py-4 px-6 text-slate-700 font-semibold">Date Given</TableHead>
                            <TableHead className="py-4 px-6 text-slate-700 font-semibold">Next Due</TableHead>
                            <TableHead className="py-4 px-6 text-slate-700 font-semibold">Provider</TableHead>
                            <TableHead className="py-4 px-6 text-slate-700 font-semibold">Batch Number</TableHead>
                            <TableHead className="py-4 px-6 text-slate-700 font-semibold">Status</TableHead>
                            <TableHead className="py-4 px-6 text-slate-700 font-semibold">Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVaccinations.map((vaccination, index) => {
                            const isOverdue = new Date(vaccination.next_due_date) < new Date();
                            return (
                              <TableRow 
                                key={vaccination.vaccination_id} 
                                className={`hover:bg-blue-50/50 transition-colors duration-200 border-b border-slate-100 ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                                }`}
                              >
                                <TableCell className="font-semibold py-4 px-6 text-blue-700">{vaccination.vaccine_name}</TableCell>
                                <TableCell className="py-4 px-6 text-slate-600">{format(new Date(vaccination.date_administered), 'MMM d, yyyy')}</TableCell>
                                <TableCell className={`py-4 px-6 font-medium ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                                  {format(new Date(vaccination.next_due_date), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-slate-600">{vaccination.vaccine_provider || 'N/A'}</TableCell> 
                                <TableCell className="py-4 px-6 text-slate-600">{vaccination.batch_number || 'N/A'}</TableCell>
                                <TableCell className="py-4 px-6">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs font-bold rounded-full px-3 py-1 ${
                                      isOverdue 
                                        ? "bg-red-100 text-red-700 border-red-300" 
                                        : "bg-green-100 text-green-700 border-green-300"
                                    }`}
                                  >
                                    {isOverdue ? "OVERDUE" : "CURRENT"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4 px-6 max-w-xs truncate text-sm text-slate-600" title={vaccination.notes || ''}>
                                  {vaccination.notes || '—'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-20 px-8 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-b-2xl">
                      <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <FlaskConical className="h-12 w-12 text-blue-500" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700 mb-3">
                        {searchQuery ? 'No Matching Records' : 'No Vaccination History'}
                      </h3>
                      <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                        {searchQuery 
                          ? 'No vaccination records match your search criteria. Try adjusting your search terms.' 
                          : 'Start building this patient\'s vaccination history by adding their first immunization record.'}
                      </p>
                      {!searchQuery && (
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsAddVaccineDialogOpen(true)} 
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl"
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

              <AlertDialogContent className="rounded-2xl max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold text-slate-800">Add Vaccination Record</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-600">
                    Create a new vaccination entry for {patientData.name}.
                    <div className="mt-6 p-4 border rounded-xl bg-amber-50 border-amber-200 text-amber-800 text-sm">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Form implementation pending
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => console.log("Save vaccination")} 
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    Save Record
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          {/* SOAP History Tab - Enhanced */}
          <TabsContent value="soap" className="mt-0">
            <Card className="border-0 shadow-2xl overflow-hidden rounded-2xl bg-white">
              <CardHeader className="pb-6 border-b bg-gradient-to-r from-slate-50 to-blue-50/50 flex flex-row justify-between items-center rounded-t-2xl">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center mb-2">
                    <ClipboardList className="h-6 w-6 text-blue-600 mr-3" />
                    Medical SOAP Records
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base">
                    Comprehensive medical documentation and treatment history
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl px-4 py-3"
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
                <div className="flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-dashed border-blue-200">
                  <div className="bg-blue-100 rounded-full p-8 w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                    <ClipboardList className="h-16 w-16 text-blue-500" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-700 mb-4">Complete Medical History</h3>
                  <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                    Access the complete SOAP (Subjective, Objective, Assessment, Plan) medical documentation 
                    for {patientData.name}, including all clinical observations, diagnoses, and treatment protocols.
                  </p>
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (appointmentId) params.append("appointmentId", appointmentId);
                      if (patientData?.petid) params.append("petId", patientData.petid.toString());
                      window.location.href = `/soap-history?${params.toString()}`;
                    }}
                  >
                    <ClipboardList className="h-5 w-5 mr-3" />
                    Open Medical Records
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-red-700 flex items-center">
                <AlertCircle className="h-6 w-6 mr-3" />
                Delete Patient Record
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 text-base leading-relaxed">
                This action will permanently delete <strong>{patientData.name}'s</strong> complete medical record, 
                including all vaccination history, SOAP notes, and associated data. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="rounded-xl">Keep Record</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PatientDetailsPage;