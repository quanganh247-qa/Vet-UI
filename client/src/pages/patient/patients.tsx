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
  const [viewMode, setViewMode] = useState<'list'>('list');
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
    <div className="space-y-6">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8 text-white hover:bg-white/20 rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Patients</h1>
            {doctor && (
              <Badge className="ml-4 bg-white/20 text-white hover:bg-white/30 rounded-full">
                Dr. {doctor.username}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white/10 text-white border-white/20 rounded-lg px-3 py-1 transition-all hover:bg-white/15">
              <Calendar className="h-4 w-4 text-white/80 mr-2" />
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="text-sm bg-transparent border-none focus:outline-none text-white"
              />
            </div>
            <Button 
              onClick={() => setLocation('/patients/new')}
              className="bg-white text-[#2C78E4] hover:bg-white/90 rounded-lg shadow-sm"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> New Patient
            </Button>
          </div>
        </div>
      </div>

      {/* Search and filter section */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-white pb-3 border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-[#111827] flex items-center">
            <Search className="h-5 w-5 mr-2 text-[#2C78E4]" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4B5563] h-4 w-4" />
              <Input
                placeholder="Search patients by name, owner, or species..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 rounded-lg focus:ring-[#2C78E4] focus:border-[#2C78E4]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90' : 'border-gray-200 text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4] hover:border-[#2C78E4]/20'}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients data display */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-white pb-3 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-[#111827] flex items-center">
              <PawPrint className="h-5 w-5 mr-2 text-[#2C78E4]" />
              Patients List
            </CardTitle>
            <div className="text-xs text-[#4B5563]">
              {patientsData?.total ? (
                <span>{patientsData.total} patients found</span>
              ) : (
                <span>No patients found</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={viewMode === 'list' ? 'p-6' : 'p-0'}>
       

          {/* Patients list view */}
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Pet Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Species
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-[#4B5563]">
                        No patients found matching your search criteria
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient: Pet) => (
                      <tr
                        key={patient.petid}
                        className="hover:bg-[#F9FAFB] transition-colors"
                      >
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handlePatientClick(patient.petid)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#2C78E4]/10 flex items-center justify-center">
                              {patient.data_image ? (
                                <img 
                                  src={`data:image/png;base64,${patient.data_image}`} 
                                  alt={patient.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <PawPrint className="h-5 w-5 text-[#2C78E4]" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-[#111827]">{patient.name}</div>
                              <div className="text-sm text-[#4B5563]">{patient.breed}</div>
                            </div>
                          </div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handlePatientClick(patient.petid)}
                        >
                          <Badge 
                            variant="outline"
                            className="bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20 rounded-full"
                          >
                            {patient.type}
                          </Badge>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handlePatientClick(patient.petid)}
                        >
                          <div className="text-sm text-[#111827]">{patient.username || 'Unknown'}</div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handlePatientClick(patient.petid)}
                        >
                          <div className="text-sm text-[#111827]">{patient.age} years</div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handlePatientClick(patient.petid)}
                        >
                          <div className="text-sm text-[#111827]">{patient.gender || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-[#4B5563] hover:bg-[#F9FAFB] rounded-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-md border-none">
                              <DropdownMenuItem onClick={() => handlePatientClick(patient.petid)} className="text-[#4B5563] hover:bg-[#F9FAFB] cursor-pointer">
                                <User className="mr-2 h-4 w-4 text-[#2C78E4]" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleEditPatient(patient.petid, e)} className="text-[#4B5563] hover:bg-[#F9FAFB] cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4 text-[#2C78E4]" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-100" />
                              <DropdownMenuItem onClick={(e) => handleVaccination(patient.petid, e)} className="text-[#4B5563] hover:bg-[#F9FAFB] cursor-pointer">
                                <Syringe className="mr-2 h-4 w-4 text-[#FFA726]" />
                                <span>Vaccination</span>
                              </DropdownMenuItem>
                        
                              <DropdownMenuSeparator className="bg-gray-100" />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 hover:bg-red-50 cursor-pointer"
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
      <div className="border-t border-gray-100 px-4 py-3 bg-white rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#4B5563]">Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-gray-200 bg-white text-sm py-1 px-2 text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-[#4B5563]">entries</span>
          </div>
          
          <div className="text-sm text-[#4B5563]">
            Showing {Math.min((currentPage - 1) * pageSize + 1, patientsData?.total || 0)} - {Math.min(currentPage * pageSize, patientsData?.total || 0)} of {patientsData?.total || 0} patients
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn("rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
              )}
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            
            {patientsData?.totalPages && patientsData.totalPages <= 5 ? (
              // Show all page numbers if there are 5 or fewer pages
              Array.from({ length: patientsData.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    "rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                    currentPage === page
                      ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                      : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
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
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  className={cn(
                    "rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                    currentPage === 1
                      ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                      : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                  )}
                >
                  1
                </Button>
                
                {/* Ellipsis if needed */}
                {currentPage > 3 && (
                  <span className="px-1 text-[#4B5563]">...</span>
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
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={cn(
                            "rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                            currentPage === pageNum
                              ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                              : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
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
                  <span className="px-1 text-[#4B5563]">...</span>
                )}
                
                {/* Last page */}
                {patientsData?.totalPages && patientsData.totalPages > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(patientsData.totalPages)}
                    className={cn(
                      "rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                      currentPage === patientsData.totalPages
                        ? "bg-[#2C78E4] text-white hover:bg-[#2C78E4]/90"
                        : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
                    )}
                  >
                    {patientsData.totalPages}
                  </Button>
                )}
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={patientsData?.total ? currentPage >= Math.ceil(patientsData.total / pageSize) : true}
              className={cn("rounded-lg h-8 w-8 p-0 mx-0.5 text-sm font-medium transition-colors",
                (patientsData?.total ? currentPage >= Math.ceil(patientsData.total / pageSize) : true)
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#4B5563] hover:bg-[#2C78E4]/5 hover:text-[#2C78E4]"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};