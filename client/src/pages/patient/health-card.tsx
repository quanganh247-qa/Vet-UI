import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link, useParams } from "wouter";
import {
  ChevronLeft,
  MoreVertical,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  Check,
  AlertCircle,
  Clock,
  Stethoscope,
  FileText,
  PawPrint,
  Tag,
  User,
  Archive,
  Bell,
  Users,
  Syringe,
  X,
  Download,
  ExternalLink,
  Image as ImageIcon,
  FileType,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { usePatientDetails } from "@/hooks/use-patient-details";
import { usePetWeightHistory } from "@/hooks/use-pet";
import { useVaccineData } from "@/hooks/use-vaccine";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import {
  PetWeightHistoryResponse,
  WeightRecordResponse,
} from "@/services/pet-services";
import { Vaccination } from "@/types";
import { useFiles } from "@/hooks/use-file";
import { useTreatmentsData } from "@/hooks/use-treatment";
import { useAppointmentData } from "@/hooks/use-appointment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useUploadFile } from "@/hooks/use-file";
import { toast } from "@/components/ui/use-toast";
import { FileResponse, FileData } from "@/services/file-services";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HealthCardProps {
  petId?: string;
  appointmentId?: string;
}

// Define interface for treatment data
interface Treatment {
  id: number;
  name: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

const HealthCard: React.FC<HealthCardProps> = ({
  petId: propsPetId,
  appointmentId: propsAppointmentId,
}) => {
  const [location, navigate] = useLocation();
  const params = useParams();
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");

  const [preventiveFilter, setPreventiveFilter] = useState<
    "all" | "upcoming" | "due-soon" | "overdue"
  >("all");
  const [showDebug, setShowDebug] = useState(false);
  const [workflowParams, setWorkflowParams] = useState<{
    appointmentId: string | null;
    petId: string | null;
  }>({
    appointmentId: null,
    petId: null,
  });

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get params from URL or props
  useEffect(() => {
    // Get all query params from URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    const urlPetId = searchParams.get("petId");

    // Check URL pathname for alternative parameter formats (e.g., /patient/:id/health-card)
    const pathnameParams = location.split("/").filter(Boolean);
    let pathPetId = null;

    // Extract pet ID from URL path if it follows expected patterns
    if (pathnameParams.length >= 3) {
      if (
        pathnameParams[0] === "patient" &&
        pathnameParams[2] === "health-card"
      ) {
        // Pattern: /patient/:id/health-card
        pathPetId = pathnameParams[1];
      } else if (
        pathnameParams[0] === "appointment" &&
        pathnameParams[2] === "health-card"
      ) {
        // Pattern: /appointment/:id/health-card
        // Here we don't get petId from path but we might have appointmentId
        const pathAppointmentId = pathnameParams[1];
      }
    }

    // Set appointmentId and petId by priority
    let appointmentIdValue = urlAppointmentId || propsAppointmentId || null;
    // Try to get pet ID from multiple possible sources
    let petIdValue =
      urlPetId ||
      propsPetId ||
      params.patientId ||
      params.id ||
      pathPetId ||
      null;

    setWorkflowParams({
      appointmentId: appointmentIdValue,
      petId: petIdValue,
    });
  }, [propsPetId, propsAppointmentId, params, location]);

  // Use effective IDs for routing
  const effectiveAppointmentId = workflowParams.appointmentId || "";

  const { data: appointmentData } = useAppointmentData(effectiveAppointmentId);

  // Fetch patient details only if we have a valid petId
  const validPetId = appointmentData?.pet?.pet_id;
  const { pet: patientInfo, isLoading, error } = usePatientDetails(validPetId);

  // Default mock data to use when no patient data is available
  const defaultPatientInfo = {
    name: "Unnamed Patient",
    species: "",
    breed: "",
    gender: "",
    neutered: false,
    age: "",
    weight: 0,
    weightTrend: "up",
  };

  // Use patient info from API or fall back to default
  const displayPatientInfo = patientInfo || defaultPatientInfo;

  // Utility function to build query parameters
  const buildUrlParams = () => {
    const params = new URLSearchParams();
    if (effectiveAppointmentId)
      params.append("appointmentId", effectiveAppointmentId);
    if (validPetId) params.append("petId", validPetId);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const [weightHistoryPage, setWeightHistoryPage] = useState(1);
  const [weightHistoryPageSize, setWeightHistoryPageSize] = useState(10);

  const {
    data: weightHistoryData,
    isLoading: weightHistoryLoading,
    error: weightHistoryError,
  } = usePetWeightHistory(validPetId, weightHistoryPage, weightHistoryPageSize);

  // Transform weight history for display
  const transformWeightHistoryForDisplay = (
    weightHistory: PetWeightHistoryResponse | null | undefined
  ) => {
    if (!weightHistory || !weightHistory.weight_history) {
      return [];
    }

    // Sort by date (newest to oldest)
    return [...weightHistory.weight_history]
      .sort(
        (a, b) =>
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      )
      .map((record) => ({
        id: record.id,
        weight: weightUnit === "kg" ? record.weight_kg : record.weight_lb,
        date: new Date(record.recorded_at).toLocaleDateString(),
        source: record.notes?.toLowerCase().includes("client")
          ? "client"
          : "clinic",
      }));
  };

  // Format weight history data for chart
  const formatWeightHistoryForChart = (
    weightHistory: PetWeightHistoryResponse | null | undefined
  ) => {
    if (!weightHistory || !weightHistory.weight_history) {
      return {
        labels: [],
        datasets: [
          {
            label: "Weight",
            data: [],
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            tension: 0.3,
          },
        ],
      };
    }

    // Sort by date (oldest to newest)
    const sortedHistory = [...weightHistory.weight_history].sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

    return {
      labels: sortedHistory.map((entry) => {
        const date = new Date(entry.recorded_at);
        return date.toLocaleDateString();
      }),
      datasets: [
        {
          label: `Weight (${weightUnit})`,
          data: sortedHistory.map((entry) =>
            weightUnit === "kg" ? entry.weight_kg : entry.weight_lb
          ),
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#6366f1",
          fill: true,
        },
      ],
    };
  };

  // Chart options
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          precision: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        displayColors: false,
      },
    },
  };

  const {
    data: preventiveData,
    isLoading: preventiveHistoryLoading,
    error: preventiveHistoryError,
  } = useVaccineData(validPetId);

  // Format preventive data or use sample data if none available
  const preventiveHistory: Vaccination[] = preventiveData?.length
    ? preventiveData
    : [];

  const {
    data: filesData,
    isLoading: filesLoading,
    error: filesError,
  } = useFiles(validPetId > 0 ? validPetId : 0);

  console.log("filesData", filesData);
  const {
    data: treatmentData,
    isLoading: treatmentLoading,
    error: treatmentError,
  } = useTreatmentsData(validPetId > 0 ? validPetId.toString() : "");

  const uploadFileMutation = useUploadFile();

  const handleBack = () => {
    // Check referrer to determine where to navigate back to
    const referrer = document.referrer;
    const queryParams = buildUrlParams();

    if (referrer && referrer.includes("/examination")) {
      navigate(`/examination${queryParams}`);
    } else if (validPetId) {
      navigate(`/patient/${validPetId}${queryParams}`);
    } else {
      navigate(`/patients${queryParams}`);
    }
  };

  const handleButtonClick = (action: string, item?: any) => {
    console.log(`Action: ${action}`, item);

    if (action === "upload-file") {
      setUploadDialogOpen(true);
    } else if (action === "delete-file" && item) {
      // Handle file deletion (to be implemented)
      console.log("Deleting file:", item);
      toast({
        title: "File deletion",
        description: "File deletion is not implemented yet.",
        variant: "destructive",
      });
    } else {
      // Handle other actions
      console.log(`Action: ${action}`, item);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !validPetId) return;

    try {
      const file = files[0];
      uploadFileMutation.mutate(
        {
          file,
          pet_id: Number(validPetId),
        },
        {
          onSuccess: () => {
            toast({
              title: "Success",
              description: "File uploaded successfully",
              variant: "default",
            });
            setUploadDialogOpen(false);
            // Reset the file input
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          },
          onError: (error) => {
            console.error("Upload error:", error);
            toast({
              title: "Upload failed",
              description: "There was an error uploading your file",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    }
  };

  // Get status color for preventive care
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-800";
      case "due-soon":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon for preventive care
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Check className="h-4 w-4" />;
      case "due-soon":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Navigation functions
  const navigateToExamination = () => {
    navigate(`/examination${buildUrlParams()}`);
  };

  const navigateToSOAP = () => {
    navigate(`/soap${buildUrlParams()}`);
  };

  const navigateToLabManagement = () => {
    navigate(`/lab-management${buildUrlParams()}`);
  };

  const navigateToTreatment = () => {
    navigate(`/treatment${buildUrlParams()}`);
  };

  const navigateToVaccination = () => {
    navigate(`/vaccination${buildUrlParams()}`);
  };

  const handleFilePreview = (file: FileData) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  // Function to render the appropriate file preview based on file type
  const renderFilePreview = () => {
    if (!selectedFile) return null;
    
    const fileName = selectedFile.path.split("/").pop() || "";
    const fileExt = fileName.split(".").pop()?.toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
      fileExt || ""
    );
    const isPdf = fileExt === "pdf";
    const isViewableInBrowser = isPdf || isImage;
    
    if (isImage) {
      return (
        <div className="flex items-center justify-center h-full max-h-[70vh]">
          <img 
            src={selectedFile.url} 
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-md" 
          />
        </div>
      );
    } else if (isPdf) {
      return (
        <div className="h-[70vh] w-full">
          <iframe 
            src={`${selectedFile.url}#view=FitH`} 
            title={fileName}
            className="w-full h-full border-0 rounded-md"
          />
        </div>
      );
    } else {
      // For other file types, show a preview card with options
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-gray-100 p-8 rounded-full mb-4">
            <FileType className="h-16 w-16 text-indigo-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">{fileName}</h3>
          <p className="text-gray-500 mb-6">
            This file type cannot be previewed directly
          </p>
          <div className="flex space-x-4">
            <Button
              onClick={() => window.open(selectedFile.url, "_blank")}
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in new tab
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement("a");
                link.href = selectedFile.url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      );
    }
  };

  // Get file type icon based on extension
  const getFileIcon = (fileName: string) => {
    const fileExt = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExt || "")) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (fileExt === "pdf") {
      return <FileText className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
              onClick={handleBack}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back</span>
            </Button>
            <h1 className="text-white font-semibold text-lg">
              Patient Health Card
            </h1>
          </div>

          {showDebug && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 rounded-lg px-3 py-2 transition-all"
              onClick={() => setShowDebug(false)}
            >
              Hide Debug
            </Button>
          )}
        </div>
      </div>

      <WorkflowNavigation
        appointmentId={effectiveAppointmentId}
        petId={validPetId}
        currentStep="health-card"
      />

      <div className="container mx-auto px-4 pb-8">
        {showDebug && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6 text-xs font-mono overflow-auto">
            <h3 className="font-bold mb-2">Debug Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p>
                  <strong>Current Location:</strong> {location}
                </p>
                <p>
                  <strong>URL Parameters:</strong>
                </p>
                <ul className="ml-4 list-disc">
                  {Array.from(new URLSearchParams(window.location.search)).map(
                    ([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    )
                  )}
                </ul>
                <p>
                  <strong>Path Parameters:</strong>
                </p>
                <pre>{JSON.stringify(params, null, 2)}</pre>
              </div>
              <div>
                <p>
                  <strong>Component Props:</strong>
                </p>
                <p>appointmentId: {propsAppointmentId || "undefined"}</p>
                <p>petId: {propsPetId || "undefined"}</p>
                <p>
                  <strong>Effective Values:</strong>
                </p>
                <p>
                  effectiveAppointmentId:{" "}
                  {effectiveAppointmentId || "undefined"}
                </p>
                <p>effectivePetId: {validPetId || "undefined"}</p>
                <p>
                  <strong>Patient Data:</strong>
                </p>
                <p>isLoading: {isLoading ? "true" : "false"}</p>
                <p>hasError: {error ? "true" : "false"}</p>
                <p>validPetId: {validPetId}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-indigo-600 font-medium">
                Loading patient details...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-6 mb-6 max-w-3xl mx-auto">
            <div className="flex">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">
                  Error loading patient data
                </h3>
                <p className="text-sm text-red-700 mt-2">
                  There was a problem fetching patient information.
                  {validPetId === 0 ? " No valid patient ID provided." : ""}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-white text-red-600 border-red-300 hover:bg-red-50"
                  onClick={handleBack}
                >
                  Go back
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Workflow Navigation Buttons - Fixed at bottom right */}
            {effectiveAppointmentId && (
              <div className="fixed bottom-6 right-6 z-10 flex flex-col space-y-3">
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                  onClick={() => {
                    if (!showDebug) setShowDebug(true);
                    else navigateToExamination();
                  }}
                >
                  <Stethoscope className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
                  onClick={navigateToSOAP}
                >
                  <FileText className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Patient Information Card */}
            <Card className="mb-6 border border-gray-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
              <CardHeader className="flex flex-row items-start justify-between pb-2 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                <div>
                  {displayPatientInfo.alerts &&
                    displayPatientInfo.alerts.length > 0 && (
                      <div className="flex space-x-2 mb-2">
                        {displayPatientInfo.alerts.map((alert: any) => (
                          <div
                            key={alert.id}
                            className={`px-3 py-1 rounded-full text-xs font-medium bg-${alert.color}-100 text-${alert.color}-800`}
                          >
                            {alert.name}
                          </div>
                        ))}
                        <div className="p-1 rounded-full bg-orange-100">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        </div>
                      </div>
                    )}
                  <CardTitle className="text-3xl mb-1 flex items-center text-indigo-900">
                    <PawPrint className="h-7 w-7 mr-2 text-indigo-500" />
                    {displayPatientInfo.name}
                  </CardTitle>
                  <div className="text-sm text-gray-600">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center">
                        <Tag className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                        {displayPatientInfo.species} /{" "}
                        {displayPatientInfo.breed}
                      </span>
                      <span className="flex items-center">
                        <User className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                        {displayPatientInfo.gender}{" "}
                        {displayPatientInfo.neutered && "(Neutered)"} /{" "}
                        {displayPatientInfo.age}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Weight</span>
                    <div className="flex items-center justify-end">
                      <span className="text-xl font-medium">
                        {displayPatientInfo.weight} {weightUnit}
                      </span>
                      {displayPatientInfo.weightTrend === "up" ? (
                        <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 ml-1 text-red-500" />
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-indigo-600 hover:bg-indigo-50"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleButtonClick("edit-patient")}
                        className="flex items-center cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Patient
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleButtonClick("archive-patient")}
                        className="flex items-center cursor-pointer"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Patient
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleButtonClick("change-owner")}
                        className="flex items-center cursor-pointer"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Change Owner
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleButtonClick("manage-alerts")}
                        className="flex items-center cursor-pointer"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Manage Alerts
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-4 px-6">
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="bg-indigo-50 rounded-lg p-3 flex flex-col justify-center min-w-[120px]">
                    <span className="text-xs text-indigo-500 mb-1">
                      Microchip
                    </span>
                    <span className="font-medium">
                      {displayPatientInfo.microchip_number || "Not registered"}
                    </span>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 flex flex-col justify-center min-w-[120px]">
                    <span className="text-xs text-indigo-500 mb-1">
                      Date of Birth
                    </span>
                    <span className="font-medium">
                      {displayPatientInfo.birth_date || "Unknown"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Tracker */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Weight Tracker</CardTitle>
                <div className="flex space-x-2">
                  <div className="flex rounded-md border overflow-hidden">
                    <Button
                      variant={weightUnit === "lbs" ? "default" : "outline"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setWeightUnit("lbs")}
                    >
                      lbs
                    </Button>
                    <Button
                      variant={weightUnit === "kg" ? "default" : "outline"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setWeightUnit("kg")}
                    >
                      kg
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleButtonClick("add-weight")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden shadow-inner border border-gray-100">
                  {weightHistoryLoading ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-gray-500 text-sm">
                        Loading weight history...
                      </p>
                    </div>
                  ) : weightHistoryError ? (
                    <div className="flex items-center justify-center text-center p-4">
                      <div>
                        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-red-500 font-medium">
                          Error loading weight history
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Please try again later
                        </p>
                      </div>
                    </div>
                  ) : !weightHistoryData ||
                    !weightHistoryData.weight_history ||
                    weightHistoryData.weight_history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <TrendingUp className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 mb-1">
                        No weight records available
                      </p>
                      <p className="text-xs text-gray-400 max-w-xs">
                        Add weight records to track this patient's weight over
                        time.
                      </p>
                      <Button
                        className="mt-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        variant="outline"
                        size="sm"
                        onClick={() => handleButtonClick("add-weight")}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add weight record
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-full p-3">
                      <Line
                        data={formatWeightHistoryForChart(weightHistoryData)}
                        options={chartOptions}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Weight History</h4>
                    {transformWeightHistoryForDisplay(weightHistoryData)
                      .length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setWeightHistoryPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={weightHistoryPage === 1}
                        className="text-xs"
                      >
                        Show more
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {weightHistoryLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-t-indigo-600 border-l-transparent border-r-transparent border-b-indigo-600 rounded-full animate-spin"></div>
                      </div>
                    ) : weightHistoryError ? (
                      <p className="text-sm text-red-500 py-2 text-center">
                        Could not load weight records
                      </p>
                    ) : transformWeightHistoryForDisplay(weightHistoryData)
                        .length === 0 ? (
                      <div className="text-center py-4 border border-dashed border-gray-200 rounded-md bg-gray-50">
                        <p className="text-sm text-gray-500">
                          No weight records found
                        </p>
                      </div>
                    ) : (
                      transformWeightHistoryForDisplay(weightHistoryData).map(
                        (entry, index) => (
                          <div
                            key={`weight-entry-${entry.id || index}`}
                            className="flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 transition-colors rounded-md border border-gray-100"
                          >
                            <div>
                              <span className="font-medium">
                                {weightUnit === "lbs"
                                  ? parseFloat(entry.weight.toString()).toFixed(
                                      3
                                    )
                                  : parseFloat(entry.weight.toString()).toFixed(
                                      1
                                    )}{" "}
                                {weightUnit}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                {entry.date}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                                onClick={() =>
                                  handleButtonClick("edit-weight", entry)
                                }
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  handleButtonClick("delete-weight", entry)
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical History Tabs */}
            <Card>
              <Tabs defaultValue="preventive">
                <CardHeader className="pb-0">
                  <TabsList className="w-full">
                    <TabsTrigger value="preventive" className="flex-1">
                      Preventive
                    </TabsTrigger>
                    <TabsTrigger value="medications" className="flex-1">
                      File Medications
                    </TabsTrigger>
                    <TabsTrigger value="treatments" className="flex-1">
                      Treatments
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Preventive Tab Content */}
                  <TabsContent value="preventive">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-medium">Vaccination History</h3>
                      <div className="flex space-x-2">
                        <div className="flex rounded-md border overflow-hidden">
                          <Button
                            variant={
                              preventiveFilter === "all" ? "default" : "outline"
                            }
                            size="sm"
                            className="rounded-none"
                            onClick={() => setPreventiveFilter("all")}
                          >
                            All
                          </Button>
                          <Button
                            variant={
                              preventiveFilter === "upcoming"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="rounded-none"
                            onClick={() => setPreventiveFilter("upcoming")}
                          >
                            Upcoming
                          </Button>
                          <Button
                            variant={
                              preventiveFilter === "due-soon"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="rounded-none"
                            onClick={() => setPreventiveFilter("due-soon")}
                          >
                            Due Soon
                          </Button>
                          <Button
                            variant={
                              preventiveFilter === "overdue"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="rounded-none"
                            onClick={() => setPreventiveFilter("overdue")}
                          >
                            Overdue
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => navigateToVaccination()}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Vaccination
                        </Button>
                      </div>
                    </div>

                    {preventiveHistoryLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : preventiveHistoryError ? (
                      <div className="text-center py-6 bg-red-50 rounded-md border border-red-100">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">
                          Error loading vaccination history
                        </p>
                        <p className="text-sm text-red-500 mt-1">
                          Please try again later
                        </p>
                      </div>
                    ) : !preventiveHistory || preventiveHistory.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-200 rounded-md bg-gray-50">
                        <Syringe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-1">
                          No vaccination records found
                        </p>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">
                          Add vaccination records to keep track of this
                          patient's preventive care.
                        </p>
                        <Button
                          className="mt-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          variant="outline"
                          size="sm"
                          onClick={() => navigateToVaccination()}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add vaccination
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 mt-2">
                        {preventiveHistory.map((item, index) => {
                          // Determine status based on due date
                          let status = "upcoming";
                          let statusLabel = "Upcoming";
                          const now = new Date();
                          const dueDate = item.next_due_date
                            ? new Date(item.next_due_date)
                            : null;

                          if (dueDate) {
                            const diffTime = dueDate.getTime() - now.getTime();
                            const diffDays = Math.ceil(
                              diffTime / (1000 * 60 * 60 * 24)
                            );

                            if (diffDays < 0) {
                              status = "overdue";
                              statusLabel = "Overdue";
                            } else if (diffDays < 14) {
                              status = "due-soon";
                              statusLabel = "Due Soon";
                            }
                          }

                          // Skip if filtered
                          if (
                            preventiveFilter !== "all" &&
                            status !== preventiveFilter
                          ) {
                            return null;
                          }

                          return (
                            <div
                              key={`preventive-${index}`}
                              className="flex justify-between items-center p-3 bg-white hover:bg-gray-50 transition-colors rounded-md border border-gray-100 shadow-sm"
                            >
                              <div className="flex items-center">
                                <div
                                  className={`p-2 rounded-full mr-3 ${getStatusColor(
                                    status
                                  )}`}
                                >
                                  {getStatusIcon(status)}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {item.vaccine_name}
                                  </p>
                                  <div className="flex text-sm text-gray-500 mt-0.5">
                                    {item.date_administered && (
                                      <span className="mr-3">
                                        Administered:{" "}
                                        {new Date(
                                          item.date_administered
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                    {item.next_due_date && (
                                      <span>
                                        Due:{" "}
                                        {new Date(
                                          item.next_due_date
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs mr-3 ${getStatusColor(
                                    status
                                  )}`}
                                >
                                  {statusLabel}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                                  onClick={() =>
                                    handleButtonClick("edit-vaccination", item)
                                  }
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  {/* File medicines from minio  Tab Content */}
                  <TabsContent value="medications">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-medium">
                        Current & Past Medications
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => handleButtonClick("upload-file")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Upload File
                      </Button>
                    </div>

                    {filesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : filesError ? (
                      <div className="text-center py-6 bg-red-50 rounded-md border border-red-100">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">
                          Error loading files
                        </p>
                        <p className="text-sm text-red-500 mt-1">
                          Please try again later
                        </p>
                      </div>
                    ) : !filesData ||
                      !filesData.files ||
                      !Array.isArray(filesData.files) ||
                      filesData.files.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-200 rounded-md bg-gray-50">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-1">No files uploaded</p>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">
                          Upload files such as prescriptions, medical documents,
                          or other important records.
                        </p>
                        <Button
                          className="mt-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          variant="outline"
                          size="sm"
                          onClick={() => handleButtonClick("upload-file")}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Upload file
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 mt-2">
                        {filesData.files.map(
                          (file: FileData, index: number) => {
                            const fileName =
                              file.path.split("/").pop() || "File";
                            const fileExt =
                              fileName.split(".").pop()?.toLowerCase() || "";
                            const isPdf = fileExt === "pdf";
                            
                            return (
                              <div 
                                key={`file-${index}`} 
                                className="flex justify-between items-center p-3 bg-white hover:bg-gray-50 transition-colors rounded-md border border-gray-100 shadow-sm"
                                onClick={() => handleFilePreview(file)}
                              >
                                <div className="flex items-center">
                                  <div className="p-2 rounded-full mr-3 bg-blue-100 text-blue-600">
                                    {getFileIcon(fileName)}
                                  </div>
                                  <div>
                                    <p className="font-medium">{fileName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Uploaded on:{" "}
                                      {new Date().toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-indigo-600 hover:bg-indigo-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFilePreview(file);
                                    }}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleButtonClick("delete-file", file);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* Treatment Tab Content */}
                  <TabsContent value="treatments">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-medium">Treatments History</h3>
                      <Button size="sm" onClick={() => navigateToTreatment()}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Treatment
                      </Button>
                    </div>

                    {treatmentLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : treatmentError ? (
                      <div className="text-center py-6 bg-red-50 rounded-md border border-red-100">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">
                          Error loading treatments
                        </p>
                        <p className="text-sm text-red-500 mt-1">
                          Please try again later
                        </p>
                      </div>
                    ) : !treatmentData || treatmentData.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-200 rounded-md bg-gray-50">
                        <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-1">
                          No treatments found
                        </p>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">
                          Add treatments to keep track of this patient's medical
                          history.
                        </p>
                        <Button
                          className="mt-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          variant="outline"
                          size="sm"
                          onClick={() => navigateToTreatment()}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add treatment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 mt-2">
                        {treatmentData.map(
                          (treatment: Treatment, index: number) => (
                            <div
                              key={`treatment-${treatment.id || index}`}
                              className="flex justify-between items-center p-3 bg-white hover:bg-gray-50 transition-colors rounded-md border border-gray-100 shadow-sm"
                            >
                              <div className="flex items-center">
                                <div className="p-2 rounded-full mr-3 bg-purple-100 text-purple-600">
                                  <Stethoscope className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {treatment.name}
                                  </p>
                                  <div className="flex text-sm text-gray-500 mt-0.5">
                                    <span className="mr-3">
                                      Started:{" "}
                                      {new Date(
                                        treatment.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs ${
                                        treatment.status === "active"
                                          ? "bg-green-100 text-green-800"
                                          : treatment.status === "completed"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      {treatment.status
                                        .charAt(0)
                                        .toUpperCase() +
                                        treatment.status.slice(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-indigo-600 hover:bg-indigo-50"
                                  onClick={() => navigateToTreatment()}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </>
        )}
      </div>

      {/* File Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-indigo-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-3 mb-3 bg-indigo-100 rounded-full">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Click to select a file or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Images, and Documents
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={uploadFileMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadFileMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>Select File</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl w-full p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="flex items-center">
                {selectedFile &&
                  getFileIcon(selectedFile.path.split("/").pop() || "")}
                <span className="ml-2 truncate">
                  {selectedFile?.path.split("/").pop()}
                </span>
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (selectedFile) {
                      window.open(selectedFile.url, "_blank");
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open in Browser
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (selectedFile) {
                      const fileName = selectedFile.path.split("/").pop() || "";
                      const link = document.createElement("a");
                      link.href = selectedFile.url;
                      link.download = fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="text-gray-500">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>
          <div className="p-0 h-[75vh]">{renderFilePreview()}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthCard;
