import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
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
  PawPrint,
  FlaskConical,
  Info,
} from "lucide-react";
import VaccinationAdministration from "@/components/vaccination/VaccinationAdministration";
import VaccinationHistory from "@/components/vaccination/VaccinationHistory";
import { useToast } from "@/components/ui/use-toast";
import { usePatientData } from "@/hooks/use-pet";
import { useVaccineData, useAllVaccines } from "@/hooks/use-vaccine";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import WorkflowNavigation from "@/components/WorkflowNavigation";

const ITEMS_PER_PAGE = 10;

const VaccinationPage: React.FC = () => {
  const { patientId: petIdParam } = useParams<{ patientId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Extract query parameters
  const [workflowParams, setWorkflowParams] = useState<{
    appointmentId: string | null;
    petId: string | null;
  }>({
    appointmentId: null,
    petId: null,
  });

  // Extract URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    const urlPetId = searchParams.get("petId");

    setWorkflowParams({
      appointmentId: urlAppointmentId || null,
      petId: urlPetId || petIdParam || null,
    });
  }, [petIdParam]);

  // Determine pet ID from either workflow or direct URL
  const effectivePetId = workflowParams.petId || petIdParam || "0";
  const petId = parseInt(effectivePetId, 10);
  const isValidPetId = petId > 0;
  const isStandaloneMode = !isValidPetId;

  // Patient data (if in patient-specific mode)
  const { data: patient, isLoading: isPatientLoading } = usePatientData(
    isValidPetId ? effectivePetId : undefined
  );

  // Vaccination history for the selected patient
  const {
    data: vaccinationHistory = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useVaccineData(isValidPetId ? petId : 0);

  // Load all vaccines for standalone mode
  const { data: allVaccines = [], isLoading: isAllVaccinesLoading } =
    useAllVaccines();

  const [isAdministrationDialogOpen, setIsAdministrationDialogOpen] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("vaccinations");

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

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
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
      className: "bg-green-500 text-white",
    });
  };

  const handleCancelAdministration = () => {
    setIsAdministrationDialogOpen(false);
  };

  const isLoading =
    isPatientLoading || isHistoryLoading || isAllVaccinesLoading;

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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">
        {/* Header Row */}
        <div className="flex justify-between items-center">
          {/* Left Section: Back Button + Title */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back</span>
            </Button>
            <div>
              <h1 className="text-white font-semibold text-lg">
                Vaccination Management {patient ? `- ${patient.name}` : ""}
              </h1>
            </div>
          </div>
          {/* Right Section: Back Button (only if no appointmentId) */}
          {!workflowParams.appointmentId && (
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all"
                onClick={() =>
                  navigate(isValidPetId ? `/patient/${petId}` : "/patients")
                }
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isValidPetId ? "Back to Patient" : "Back to Patients"}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Workflow Navigation */}
      <WorkflowNavigation
        appointmentId={workflowParams.appointmentId || undefined}
        petId={workflowParams.petId || petIdParam}
        currentStep="vaccination"
      />

      <Tabs
        defaultValue="vaccinations"
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="vaccinations" className="flex items-center gap-2">
            <Syringe className="h-4 w-4" />
            Vaccination Records
          </TabsTrigger>
          <TabsTrigger value="administer" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Administer Vaccine
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vaccinations" className="space-y-4">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b pb-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                    <Syringe className="h-5 w-5 mr-2 text-indigo-600" />
                    {isStandaloneMode
                      ? "All Vaccination Records"
                      : "Vaccination History"}
                  </CardTitle>
                  <CardDescription>
                    {isStandaloneMode
                      ? "Review vaccination records across all patients"
                      : `Review past vaccinations administered to ${
                          patient?.name || "the patient"
                        }.`}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search vaccinations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Vaccination Records Table */}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-medium">Vaccine</TableHead>
                      <TableHead className="font-medium">Batch #</TableHead>
                      <TableHead className="font-medium">Date</TableHead>
                      <TableHead className="font-medium">Next Due</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Provider</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedHistory.length > 0 ? (
                      paginatedHistory.map((vaccine) => (
                        <TableRow
                          key={vaccine.vaccination_id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {vaccine.vaccine_name}
                          </TableCell>
                          <TableCell>{vaccine.batch_number}</TableCell>
                          <TableCell>
                            {vaccine.date_administered
                              ? format(
                                  new Date(vaccine.date_administered),
                                  "MMM d, yyyy"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {vaccine.next_due_date
                              ? format(
                                  new Date(vaccine.next_due_date),
                                  "MMM d, yyyy"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {getVaccineStatusBadge(vaccine)}
                          </TableCell>
                          <TableCell>
                            {vaccine.vaccine_provider || "Unknown"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-gray-500"
                        >
                          No vaccination records found
                          {searchQuery && " matching your search"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            {/* Pagination */}
            {totalPages > 1 && (
              <CardFooter className="flex justify-between items-center border-t p-4">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredHistory.length
                  )}{" "}
                  of {filteredHistory.length} records
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>

          {isValidPetId && filteredHistory.length > 0 && (
            <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b pb-4">
                <CardTitle className="text-lg font-semibold text-indigo-900 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-indigo-600" />
                  Vaccination Overview
                </CardTitle>
                <CardDescription>
                  Upcoming, past, and overdue vaccinations for{" "}
                  {patient?.name || "this patient"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <VaccinationHistory vaccines={vaccinationHistory} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="administer" className="space-y-4">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <VaccinationAdministration
                petId={isValidPetId ? effectivePetId.toString() : undefined}
                appointmentId={workflowParams.appointmentId || undefined}
                onComplete={handleVaccinationComplete}
                onCancel={handleCancelAdministration}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function getVaccineStatusBadge(vaccine: any) {
  if (!vaccine.available_doses || vaccine.available_doses <= 0) {
    return (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200"
      >
        Out of Stock
      </Badge>
    );
  }

  if (vaccine.available_doses < 5) {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-700 border-yellow-200"
      >
        Low Stock
      </Badge>
    );
  }

  if (
    vaccine.expiration_date &&
    new Date(vaccine.expiration_date) < new Date()
  ) {
    return (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200"
      >
        Expired
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-green-50 text-green-700 border-green-200"
    >
      In Stock
    </Badge>
  );
}

export default VaccinationPage;
