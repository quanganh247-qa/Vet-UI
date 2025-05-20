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
  Calendar,
  Check,
  AlertTriangle,
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

  console.log("Valid id", patient);

  // Vaccination history for the selected patient
  const {
    data: vaccinationHistory = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useVaccineData(isValidPetId ? petId : 0);

  console.log(vaccinationHistory);

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
      className: "bg-green-50 border-green-200 text-green-800",
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
          <div className="w-12 h-12 border-4 border-t-[#2C78E4] border-b-[#2C78E4] border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-[#2C78E4] font-medium">
            Loading vaccination details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 md:px-8 md:py-5 rounded-xl shadow-md mb-6 text-white">
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
          {/* Right Section: Action Buttons */}
          <div className="flex items-center gap-2">
            {!workflowParams.appointmentId && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
                onClick={() =>
                  navigate(isValidPetId ? `/patient/${petId}` : "/patients")
                }
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {isValidPetId ? "Back to Patient" : "Back to Patients"}
              </Button>
            )}
            {workflowParams.appointmentId && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (workflowParams.appointmentId) 
                    params.append("appointmentId", workflowParams.appointmentId);
                  if (workflowParams.petId) 
                    params.append("petId", workflowParams.petId);
                  navigate(`/treatment?${params.toString()}`);
                }}
              >
                <Syringe className="h-4 w-4 mr-1 rotate-180" />
                <span>Go to Treatment</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Workflow Navigation */}
      <WorkflowNavigation
        appointmentId={workflowParams.appointmentId || undefined}
        petId={workflowParams.petId || petIdParam}
        currentStep="vaccination"
      />

      <div className="p-4">
        <div className="space-y-6">
          

          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <VaccinationAdministration
                petId={isValidPetId ? effectivePetId.toString() : undefined}
                appointmentId={workflowParams.appointmentId || undefined}
                onComplete={handleVaccinationComplete}
                onCancel={handleCancelAdministration}
              />
            </CardContent>
          </Card>

          {/* Vaccination History */}
          {vaccinationHistory && vaccinationHistory.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-[#2C78E4]" />
                  Vaccination History
                </h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search vaccinations..."
                    className="pl-10 h-10 rounded-lg border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#F0F7FF]">
                    <TableRow>
                      <TableHead>Vaccine</TableHead>
                      <TableHead>Date Administered</TableHead>
                      <TableHead>Batch No.</TableHead>
                      <TableHead>Next Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedHistory.map((record, index) => (
                      <TableRow key={index} className="hover:bg-[#F0F7FF]/50">
                        <TableCell className="font-medium">
                          {record.vaccine_name || record.vaccine?.name || "Unknown Vaccine"}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {record.date_administered
                            ? format(new Date(record.date_administered), "MMM dd, yyyy")
                            : "Unknown Date"}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {record.batch_number || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {record.next_due_date
                            ? format(new Date(record.next_due_date), "MMM dd, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-50 text-green-700 border-green-100">
                            <Check className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredHistory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center p-4">
                            <Syringe className="h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-sm font-medium text-gray-600">No vaccination records found</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {searchQuery ? `No results for "${searchQuery}"` : "No vaccination history for this patient yet"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {filteredHistory.length > ITEMS_PER_PAGE && (
                  <div className="border-t border-gray-100 px-4 py-2 flex justify-between items-center bg-gray-50">
                    <div className="text-sm text-gray-500">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredHistory.length)} of{" "}
                      {filteredHistory.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="h-8 px-3 text-[#2C78E4] border-[#2C78E4]/30 hover:bg-[#F0F7FF] hover:border-[#2C78E4]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="h-8 px-3 text-[#2C78E4] border-[#2C78E4]/30 hover:bg-[#F0F7FF] hover:border-[#2C78E4]"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Vaccination Administration Dialog */}
      <Dialog open={isAdministrationDialogOpen} onOpenChange={setIsAdministrationDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Syringe className="h-5 w-5 text-[#2C78E4]" />
              Administer Vaccination
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Card className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-4">
                <VaccinationAdministration
                  petId={isValidPetId ? effectivePetId.toString() : undefined}
                  appointmentId={workflowParams.appointmentId || undefined}
                  onComplete={handleVaccinationComplete}
                  onCancel={handleCancelAdministration}
                />
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAdministrationDialogOpen(false)}
              className="border-gray-200"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function getVaccineStatusBadge(vaccine: any) {
  if (!vaccine.available_doses || vaccine.available_doses <= 0) {
    return (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
      >
        <AlertTriangle className="h-3 w-3" />
        Out of Stock
      </Badge>
    );
  }

  if (vaccine.available_doses < 5) {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"
      >
        <AlertTriangle className="h-3 w-3" />
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
        className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
      >
        <AlertTriangle className="h-3 w-3" />
        Expired
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
    >
      <Check className="h-3 w-3" />
      In Stock
    </Badge>
  );
}

export default VaccinationPage;
