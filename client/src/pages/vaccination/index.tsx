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
