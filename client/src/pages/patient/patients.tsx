import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ListPatients } from '@/services/pet-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Search, Plus, Loader2, ChevronRight, PawPrint, UserCircle, 
  List, Grid, Calendar, ArrowLeft, UserCog, LogOut, User, Settings,
  MoreHorizontal, Pencil, Trash2, Syringe, Stethoscope, ClipboardList
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { usePatientsData } from '@/hooks/use-pet';
import { PaginatedResponse } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";

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

// Define the type for the paginated data
interface PaginatedPetData extends PaginatedResponse<Pet> {
  totalPages: number;
  page: number;
  pageSize: number;
  total: number;
}

interface ExpandedCardState {
  [key: string]: boolean;
}

export const PatientsPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10); // Changed from 8 to 10
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { doctor, logout } = useAuth();
  const [expandedCards, setExpandedCards] = useState<ExpandedCardState>({});

  // Use React Query for data fetching with pagination with proper typing
  const { 
    data: patientsData, 
    isLoading, 
    isError 
  } = usePatientsData(currentPage, pageSize) as { 
    data: PaginatedPetData | undefined; 
    isLoading: boolean; 
    isError: boolean 
  };

  // Sửa hàm handlePageChange để đảm bảo nó hoạt động đúng
  const handlePageChange = (newPage: number) => {
    // Đảm bảo rằng chúng ta có thể chuyển trang ngay cả khi totalPages chưa được xác định
    if (newPage >= 1 && (!patientsData?.totalPages || newPage <= patientsData.totalPages)) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const filteredPatients = !patientsData?.data ? [] : patientsData.data.filter((patient: Pet) =>
    patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient?.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient?.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient?.username && patient.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePatientClick = (patientId: string) => {
    setLocation(`/patient/${patientId}`);
  };

  // Action Handlers
  const handleEditPatient = (patientId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card/row click
    setLocation(`/patient/${patientId}/edit`); // Navigate to edit page (assuming route exists)
    console.log(`Edit patient: ${patientId}`);
  };

  const handleDeletePatient = (patientId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card/row click
    // Implement deletion logic, possibly with a confirmation dialog
    console.log(`Delete patient: ${patientId}`);
    alert(`Placeholder: Delete patient ${patientId}`); // Placeholder alert
  };

  const handleVaccination = (patientId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card/row click
    setLocation(`/patient/${patientId}/vaccination`); // Navigate to vaccination page
  };

  const handleTreatment = (patientId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card/row click
    setLocation(`/patient/${patientId}/treatment`); // Navigate to treatment page
  };

  const handlePrescription = (patientId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card/row click
    setLocation(`/patient/${patientId}/prescription`); // Navigate to prescription page
    console.log(`Prescription for patient: ${patientId}`);
  };

  const toggleCardExpansion = (petId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedCards(prev => ({
      ...prev,
      [petId]: !prev[petId]
    }));
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-indigo-600 font-medium">Loading patient data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 dark:text-red-400">Failed to fetch patients</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 max-w-[100vw]">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8 text-white hover:bg-white/20"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Patients</h1>
            {doctor && (
              <Badge className="ml-4 bg-white/20 text-white hover:bg-white/30">
                Dr. {doctor.username}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white/10 text-white border-white/20 rounded-md px-3 py-1">
              <Calendar className="h-4 w-4 text-white/70 mr-2" />
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="text-sm bg-transparent border-none focus:outline-none text-white"
              />
            </div>
            <Button 
              onClick={() => setLocation('/patients/new')}
              className="bg-white text-indigo-700 hover:bg-white/90"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> New Patient
            </Button>
          </div>
        </div>
      </div>

      {/* Search and filter section */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3 border-b">
          <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
            <Search className="h-5 w-5 mr-2 text-indigo-600" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search patients by name, owner, or species..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>
            
            {/* <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">View:</span>
              <div className="flex bg-gray-100 rounded-md p-1">
                <Button 
                  size="sm" 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "h-8 w-8 p-0",
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-gray-200'
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
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-gray-200'
                  )}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Patients data display */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
              <PawPrint className="h-5 w-5 mr-2 text-indigo-600" />
              Patients List
            </CardTitle>
            <div className="text-xs text-gray-500">
              {patientsData?.total ? (
                <span>{patientsData.total} patients found</span>
              ) : (
                <span>No patients found</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={viewMode === 'grid' ? 'p-6' : 'p-0'}>
          {/* Patients grid view */}
            {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPatients.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No patients found matching your search criteria
              </div>
              ) : (
              filteredPatients.map((patient: Pet) => (
                <Card 
                key={patient.petid} 
                className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 flex flex-col"
                >
                <div 
                  className="aspect-w-16 aspect-h-9 bg-indigo-50 cursor-pointer"
                  onClick={() => handlePatientClick(patient.petid)}
                >
                  {patient.data_image ? (
                  <img 
                    src={`data:image/png;base64,${patient.data_image}`} 
                    alt={patient.name}
                    className="object-cover w-full h-full"
                  />
                  ) : (
                  <div className="flex items-center justify-center h-full text-indigo-300">
                    <PawPrint className="h-12 w-12" />
                  </div>
                  )}
                </div>
                <CardHeader 
                  className="pb-2 cursor-pointer"
                  onClick={() => handlePatientClick(patient.petid)}
                >
                  <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{patient.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-indigo-600 border-indigo-200"
                  >
                    {patient.type}
                  </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 pt-1">
                  <UserCircle className="h-3.5 w-3.5 text-gray-400" />
                  <span>{patient.username || 'Unknown Owner'}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className={cn(
                  "grid gap-x-4 gap-y-2 text-sm transition-all duration-300",
                  expandedCards[patient.petid] ? "grid-cols-2" : "grid-cols-2"
                  )}>
                  <div>
                    <span className="text-gray-500">Breed:</span>
                    <span className="ml-1 text-gray-900">{patient.breed}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-1 text-gray-900">{patient.age} years</span>
                  </div>
                  {expandedCards[patient.petid] && (
                    <>
                    <div>
                      <span className="text-gray-500">Gender:</span>
                      <span className="ml-1 text-gray-900">{patient.gender || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Weight:</span>
                      <span className="ml-1 text-gray-900">{patient.weight} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Color:</span>
                      <span className="ml-1 text-gray-900">{patient.color || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Birth Date:</span>
                      <span className="ml-1 text-gray-900">
                      {patient.birth_date ? format(new Date(patient.birth_date), 'MM/dd/yyyy') : 'Unknown'}
                      </span>
                    </div>
                    {patient.microchip_number && (
                      <div className="col-span-2">
                      <span className="text-gray-500">Microchip:</span>
                      <span className="ml-1 text-gray-900">{patient.microchip_number}</span>
                      </div>
                    )}
                    </>
                  )}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => toggleCardExpansion(patient.petid, e)}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  >
                    {expandedCards[patient.petid] ? 'Show Less' : 'Show More'}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => handlePatientClick(patient.petid)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleEditPatient(patient.petid, e)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => handleVaccination(patient.petid, e)}>
                        <Syringe className="mr-2 h-4 w-4" />
                        <span>Vaccination</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleTreatment(patient.petid, e)}>
                        <Stethoscope className="mr-2 h-4 w-4" />
                        <span>Treatment</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handlePrescription(patient.petid, e)}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        <span>Prescription</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={(e) => handleDeletePatient(patient.petid, e)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </CardContent>
                </Card>
              ))
              )}
            </div>
            )}

          {/* Patients list view */}
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
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
                      Gender
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        No patients found matching your search criteria
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient: Pet) => (
                      <tr
                        key={patient.petid}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handlePatientClick(patient.petid)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              {patient.data_image ? (
                                <img 
                                  src={`data:image/png;base64,${patient.data_image}`} 
                                  alt={patient.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <PawPrint className="h-5 w-5 text-indigo-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                              <div className="text-sm text-gray-500">{patient.breed}</div>
                            </div>
                          </div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handlePatientClick(patient.petid)}
                        >
                          <Badge 
                            variant="outline"
                            className="bg-indigo-50 text-indigo-600 border-indigo-200"
                          >
                            {patient.type}
                          </Badge>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handlePatientClick(patient.petid)}
                        >
                          <div className="text-sm text-gray-900">{patient.username || 'Unknown'}</div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handlePatientClick(patient.petid)}
                        >
                          <div className="text-sm text-gray-900">{patient.age} years</div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handlePatientClick(patient.petid)}
                        >
                          <div className="text-sm text-gray-900">{patient.gender || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => handlePatientClick(patient.petid)}>
                                <User className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleEditPatient(patient.petid, e)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => handleVaccination(patient.petid, e)}>
                                <Syringe className="mr-2 h-4 w-4" />
                                <span>Vaccination</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleTreatment(patient.petid, e)}>
                                <Stethoscope className="mr-2 h-4 w-4" />
                                <span>Treatment</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handlePrescription(patient.petid, e)}>
                                <ClipboardList className="mr-2 h-4 w-4" />
                                <span>Prescription</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={(e) => handleDeletePatient(patient.petid, e)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * pageSize + 1, patientsData?.total || 0)} - {Math.min(currentPage * pageSize, patientsData?.total || 0)} of {patientsData?.total || 0} patients
            </span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-md border border-gray-200 bg-white text-sm p-1"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-white shadow-sm border-gray-200 hover:bg-gray-50"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {patientsData?.totalPages && patientsData.totalPages <= 7 ? (
                // Show all page numbers if there are 7 or fewer pages
                Array.from({ length: patientsData.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      'px-3',
                      currentPage === page && 'bg-indigo-600 text-white hover:bg-indigo-700'
                    )}
                  >
                    {page}
                  </Button>
                ))
              ) : (
                // Show limited page numbers with ellipsis for many pages
                <>
                  {/* First page */}
                  <Button
                    variant={currentPage === 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    className={cn(
                      'px-3',
                      currentPage === 1 && 'bg-indigo-600 text-white hover:bg-indigo-700'
                    )}
                  >
                    1
                  </Button>
                  
                  {/* Ellipsis if needed */}
                  {currentPage > 3 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  
                  {/* Pages around current page */}
                  {Array.from(
                    { length: Math.min(3, patientsData?.totalPages || 1) },
                    (_, i) => {
                      const pageNum = Math.max(
                        2,
                        currentPage - 1 + i - (currentPage > 2 ? 1 : 0)
                      );
                      if (pageNum >= 2 && pageNum < (patientsData?.totalPages || 1)) {
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={cn(
                              'px-3',
                              currentPage === pageNum && 'bg-indigo-600 text-white hover:bg-indigo-700'
                            )}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    }
                  )}
                  
                  {/* Ellipsis if needed */}
                  {patientsData?.totalPages && currentPage < patientsData.totalPages - 2 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  
                  {/* Last page */}
                  {patientsData?.totalPages && patientsData.totalPages > 1 && (
                    <Button
                      variant={currentPage === patientsData.totalPages ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(patientsData.totalPages)}
                      className={cn(
                        'px-3',
                        currentPage === patientsData.totalPages && 'bg-indigo-600 text-white hover:bg-indigo-700'
                      )}
                    >
                      {patientsData.totalPages}
                    </Button>
                  )}
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={patientsData?.total ? currentPage >= Math.ceil(patientsData.total / pageSize) : true}
              className="bg-white shadow-sm border-gray-200 hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};