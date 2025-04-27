import React, { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Syringe,
  PlusCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import VaccinationAdministration from "@/components/vaccination/VaccinationAdministration";
import { useToast } from "@/components/ui/use-toast";
import { usePatientData } from "@/hooks/use-pet";
import { useVaccineData } from "@/hooks/use-vaccine";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 5;

const VaccinationPage: React.FC = () => {
  const { patientId: petIdParam } = useParams<{ patientId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const petId = petIdParam ? parseInt(petIdParam, 10) : 0;

  const isValidPetId = petId > 0;

  const { data: patient, isLoading: isPatientLoading } = usePatientData(
    isValidPetId ? petId.toString() : undefined
  );
  const {
    data: vaccinationHistory = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useVaccineData(
    isValidPetId ? petId : 0
  );

  const [isAdministrationDialogOpen, setIsAdministrationDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = useMemo(() => {
    if (!Array.isArray(vaccinationHistory)) return [];
    return vaccinationHistory.filter((record) => {
      const searchStr = searchQuery.toLowerCase();
      return (
        record.vaccine_name?.toLowerCase().includes(searchStr) ||
        record.vaccine?.name?.toLowerCase().includes(searchStr) ||
        record.batch_number?.toLowerCase().includes(searchStr) ||
        record.administered_by_name?.toLowerCase().includes(searchStr) ||
        record.doctor?.name?.toLowerCase().includes(searchStr)
      );
    });
  }, [vaccinationHistory, searchQuery]);

  const totalPages = Math.ceil((filteredHistory.length) / ITEMS_PER_PAGE);
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredHistory.slice(startIndex, endIndex);
  }, [filteredHistory, currentPage]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleVaccinationComplete = () => {
    setIsAdministrationDialogOpen(false);
    refetchHistory();
    toast({
      title: "Vaccination Record Saved",
      description:
        "The vaccination has been successfully recorded in the patient's chart.",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const handleCancelAdministration = () => {
    setIsAdministrationDialogOpen(false);
  };

  const isLoading = isPatientLoading || isHistoryLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">
            Loading vaccination details...
          </p>
        </div>
      </div>
    );
  }

  if (!isValidPetId || !patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-white rounded-lg shadow-md border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Invalid Patient ID</h2>
          <p className="text-gray-600 mb-4">Could not load vaccination data because the patient ID is missing or invalid.</p>
          <Button onClick={() => navigate('/patients')}>Go Back to Patients List</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Vaccination Management {patient ? `- ${patient.name}` : ""}
            </h1>
            <p className="text-indigo-100 text-sm">
              View history and administer new vaccinations for {patient?.name || 'this patient'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all"
              onClick={() => navigate(isValidPetId ? `/patient/${petId}` : '/patients')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patient
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                <Syringe className="h-5 w-5 mr-2 text-indigo-600" />
                Vaccination History
              </CardTitle>
              <CardDescription>
                Review past vaccinations administered to {patient?.name || "the patient"}.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search vaccinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <Dialog open={isAdministrationDialogOpen} onOpenChange={setIsAdministrationDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                    size="sm"
                    disabled={!isValidPetId}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Administer New Vaccine
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] border border-indigo-200 bg-white">
                  <DialogHeader className="border-b border-indigo-100 pb-4">
                    <DialogTitle className="text-xl font-semibold text-indigo-900 flex items-center">
                      <Syringe className="h-5 w-5 mr-2 text-indigo-600" />
                      Administer New Vaccination
                    </DialogTitle>
                  </DialogHeader>
                  {isValidPetId && (
                    <VaccinationAdministration
                      petId={petId.toString()}
                      onComplete={handleVaccinationComplete}
                      onCancel={handleCancelAdministration}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {Array.isArray(filteredHistory) && filteredHistory.length > 0 ? (
            <div>
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Vaccine Name</TableHead>
                    <TableHead className="font-semibold">Batch Number</TableHead>
                    <TableHead className="font-semibold">Administered By</TableHead>
                    <TableHead className="font-semibold">Next Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHistory.map((record: any, index: number) => (
                    <TableRow
                      key={record.vaccination_record_id || record.id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {record.administration_date ? format(new Date(record.administration_date), 'PP') : 'N/A'}
                      </TableCell>
                      <TableCell>{record.vaccine_name || record.vaccine?.name || 'N/A'}</TableCell>
                      <TableCell>{record.batch_number || 'N/A'}</TableCell>
                      <TableCell>{record.administered_by_name || record.doctor?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {record.next_due_date ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {format(new Date(record.next_due_date), 'PP')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">None</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50/50">
              <div className="flex flex-col items-center gap-2">
                <Syringe className="h-8 w-8 text-gray-400" />
                <p className="text-gray-500 font-medium">
                  {searchQuery ? "No vaccination records match your search." : "No vaccination history found for this patient."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex justify-between items-center pt-4 border-t bg-gray-50/50">
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredHistory.length)} of {filteredHistory.length} records
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="border-gray-200 hover:bg-gray-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default VaccinationPage;
