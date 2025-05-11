import React, { useState, useEffect } from "react";
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
import { PetWeightHistoryResponse, WeightRecordResponse } from "@/services/pet-services";

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

// Define InternalNote interface
interface InternalNote {
  id: number;
  note: string;
  author: string;
  date: string;
}



// Define interface for preventive care item
interface PreventiveCareItem {
  id: number;
  name: string;
  status: string;
  dueDate?: string;
}


const HealthCard: React.FC<HealthCardProps> = ({
  petId: propsPetId,
  appointmentId: propsAppointmentId,
}) => {
  const [location, navigate] = useLocation();
  const params = useParams();
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [weightFilter, setWeightFilter] = useState<"client" | "clinic" | "all">(
    "all"
  );
  const [preventiveFilter, setPreventiveFilter] = useState<"all" | "upcoming" | "due-soon" | "overdue">("all");
  const [showDebug, setShowDebug] = useState(false);
  const [workflowParams, setWorkflowParams] = useState<{
    appointmentId: string | null;
    petId: string | null;
  }>({
    appointmentId: null,
    petId: null,
  });

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
        if (!urlAppointmentId && pathAppointmentId) {
          console.log("Found appointment ID in path:", pathAppointmentId);
        }
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
  const effectivePetId = workflowParams.petId || "";

  // Fetch patient details only if we have a valid petId
  const validPetId =
    effectivePetId && !isNaN(Number(effectivePetId))
      ? Number(effectivePetId)
      : 0;
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
    if (effectivePetId) params.append("petId", effectivePetId);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const [weightHistoryPage, setWeightHistoryPage] = useState(1);
  const [weightHistoryPageSize, setWeightHistoryPageSize] = useState(10);

  const { data: weightHistoryData, isLoading: weightHistoryLoading, error: weightHistoryError } = usePetWeightHistory(validPetId, weightHistoryPage, weightHistoryPageSize);

  // Transform weight history for display
  const transformWeightHistoryForDisplay = (weightHistory: PetWeightHistoryResponse | null | undefined) => {
    if (!weightHistory || !weightHistory.weight_history) {
      return [];
    }

    // Sort by date (newest to oldest)
    return [...weightHistory.weight_history]
      .sort((a, b) => 
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      )
      .map(record => ({
        id: record.id,
        weight: weightUnit === 'kg' ? record.weight_kg : record.weight_lb,
        date: new Date(record.recorded_at).toLocaleDateString(),
        source: record.notes?.toLowerCase().includes('client') ? 'client' : 'clinic'
      }));
  };

  // Format weight history data for chart
  const formatWeightHistoryForChart = (weightHistory: PetWeightHistoryResponse | null | undefined) => {
    if (!weightHistory || !weightHistory.weight_history) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Weight',
            data: [],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            tension: 0.3,
          }
        ]
      };
    }

    // Sort by date (oldest to newest)
    const sortedHistory = [...weightHistory.weight_history].sort((a, b) => 
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

    return {
      labels: sortedHistory.map(entry => {
        const date = new Date(entry.recorded_at);
        return date.toLocaleDateString();
      }),
      datasets: [
        {
          label: `Weight (${weightUnit})`,
          data: sortedHistory.map(entry => weightUnit === 'kg' ? entry.weight_kg : entry.weight_lb),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#6366f1',
          fill: true,
        }
      ]
    };
  };

  // Chart options
  const chartOptions: ChartOptions<'line'> = {
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
          color: 'rgba(0, 0, 0, 0.05)',
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
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

  const { data: preventiveData, isLoading: preventiveHistoryLoading, error: preventiveHistoryError } = useVaccineData(validPetId);
  
  // Format preventive data or use sample data if none available
  const preventiveHistory: PreventiveCareItem[] = preventiveData?.length ? 
    preventiveData.map((item: any) => ({
      id: item.id || Math.random(),
      name: item.name || item.vaccine_name || "Unknown treatment",
      status: item.status || "upcoming",
      dueDate: item.due_date || item.administration_date || undefined
    }))
  : [];

  const medications = [
    {
      id: 1,
      name: "Heartgard Plus",
      dosage: "1 tablet monthly",
      refills: 2,
      status: "active",
      doctor: "Dr. Smith",
    },
    {
      id: 2,
      name: "Apoquel",
      dosage: "1 tablet daily",
      refills: 0,
      status: "inactive",
      doctor: "Dr. Johnson",
    },
  ];



  const diagnoses = [
    {
      id: 1,
      name: "Seasonal Allergies",
      date: "2023-05-15",
      doctor: "Dr. Smith",
    },
    {
      id: 2,
      name: "Mild Dermatitis",
      date: "2023-09-01",
      doctor: "Dr. Johnson",
    },
  ];

  const handleBack = () => {
    // Check referrer to determine where to navigate back to
    const referrer = document.referrer;
    const queryParams = buildUrlParams();

    if (referrer && referrer.includes("/examination")) {
      navigate(`/examination${queryParams}`);
    } else if (effectivePetId) {
      navigate(`/patient/${effectivePetId}${queryParams}`);
    } else {
      navigate(`/patients${queryParams}`);
    }
  };

  const handleButtonClick = (action: string, item?: any) => {
    console.log(`Action: ${action}`, item);
    // Implement your action logic here
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
        petId={effectivePetId}
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
                <p>effectivePetId: {effectivePetId || "undefined"}</p>
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
                      {displayPatientInfo.bod || "Unknown"}
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
                      variant={
                        weightFilter === "client" ? "default" : "outline"
                      }
                      size="sm"
                      className={`rounded-none ${
                        weightFilter === "client"
                          ? "bg-pink-500 hover:bg-pink-600"
                          : ""
                      }`}
                      onClick={() => setWeightFilter("client")}
                    >
                      Client
                    </Button>
                    <Button
                      variant={
                        weightFilter === "clinic" ? "default" : "outline"
                      }
                      size="sm"
                      className={`rounded-none ${
                        weightFilter === "clinic"
                          ? "bg-teal-500 hover:bg-teal-600"
                          : ""
                      }`}
                      onClick={() => setWeightFilter("clinic")}
                    >
                      Clinic
                    </Button>
                    <Button
                      variant={weightFilter === "all" ? "default" : "outline"}
                      size="sm"
                      className={`rounded-none ${
                        weightFilter === "all"
                          ? "bg-purple-500 hover:bg-purple-600"
                          : ""
                      }`}
                      onClick={() => setWeightFilter("all")}
                    >
                      All
                    </Button>
                  </div>
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
                      <p className="text-gray-500 text-sm">Loading weight history...</p>
                    </div>
                  ) : weightHistoryError ? (
                    <div className="flex items-center justify-center text-center p-4">
                      <div>
                        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-red-500 font-medium">Error loading weight history</p>
                        <p className="text-sm text-gray-500 mt-1">Please try again later</p>
                      </div>
                    </div>
                  ) : !weightHistoryData || !weightHistoryData.weight_history || weightHistoryData.weight_history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <TrendingUp className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 mb-1">No weight records available</p>
                      <p className="text-xs text-gray-400 max-w-xs">
                        Add weight records to track this patient's weight over time.
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
                      <div className="absolute right-8 top-4 flex space-x-2 z-10">
                        <div className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                          {`${weightHistoryData.weight_history.length} records`}
                        </div>
                      </div>
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
                    {transformWeightHistoryForDisplay(weightHistoryData).length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setWeightHistoryPage(prev => Math.max(1, prev - 1))}
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
                      <p className="text-sm text-red-500 py-2 text-center">Could not load weight records</p>
                    ) : transformWeightHistoryForDisplay(weightHistoryData).length === 0 ? (
                      <div className="text-center py-4 border border-dashed border-gray-200 rounded-md bg-gray-50">
                        <p className="text-sm text-gray-500">No weight records found</p>
                      </div>
                    ) : (
                      transformWeightHistoryForDisplay(weightHistoryData)
                        .filter(entry => 
                          weightFilter === "all" || 
                          entry.source === weightFilter
                        )
                        .map((entry, index) => (
                          <div
                            key={`weight-entry-${entry.id || index}`}
                            className="flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 transition-colors rounded-md border border-gray-100"
                          >
                            <div>
                              <span className="font-medium">
                                {entry.weight} {weightUnit}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                {entry.date}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  entry.source === "clinic"
                                    ? "bg-teal-100 text-teal-800"
                                    : "bg-pink-100 text-pink-800"
                                }`}
                              >
                                {entry.source === "clinic" ? "Clinic" : "Client"}
                              </span>
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
                        ))
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
                      Medications
                    </TabsTrigger>
                    <TabsTrigger value="diagnostics" className="flex-1">
                      Diagnostics
                    </TabsTrigger>
                    <TabsTrigger value="diagnoses" className="flex-1">
                      Diagnoses
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Preventive Tab Content */}
                  <TabsContent value="preventive">
                    <div className="flex justify-between mb-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center">
                          <span>Filter</span>
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                        <div className="hidden md:flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`px-3 ${preventiveFilter === 'all' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : ''}`}
                            onClick={() => setPreventiveFilter('all')}
                          >
                            All
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`px-3 ${preventiveFilter === 'upcoming' ? 'bg-green-50 text-green-600 border-green-200' : ''}`}
                            onClick={() => setPreventiveFilter('upcoming')}
                          >
                            Upcoming
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`px-3 ${preventiveFilter === 'due-soon' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : ''}`}
                            onClick={() => setPreventiveFilter('due-soon')}
                          >
                            Due Soon
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`px-3 ${preventiveFilter === 'overdue' ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                            onClick={() => setPreventiveFilter('overdue')}
                          >
                            Overdue
                          </Button>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleButtonClick("add-historical-treatment")
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Treatment
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleButtonClick("download-history")}
                        >
                          Download History
                        </Button>
                      </div>
                    </div>

                    {preventiveHistoryLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : preventiveHistoryError ? (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center my-4">
                        <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">Error loading preventive care records</p>
                        <p className="text-sm text-red-500 mt-1">Please try again later</p>
                      </div>
                    ) : preventiveHistory.length === 0 ? (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-md p-8 text-center my-4">
                        <Stethoscope className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No preventive care records</p>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                          Add vaccinations, wellness visits, and other preventive care to keep track of this patient's health maintenance.
                        </p>
                        <Button
                          className="mt-4"
                          size="sm"
                          onClick={() => handleButtonClick("add-treatment")}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Preventive Care
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 mt-1">
                        {preventiveHistory
                          .filter(item => preventiveFilter === 'all' || item.status === preventiveFilter)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-md border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
                            >
                              <div className="flex items-center">
                                <div
                                  className={`p-1.5 rounded-full mr-3 ${getStatusColor(
                                    item.status
                                  )}`}
                                >
                                  {getStatusIcon(item.status)}
                                </div>
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  <span className="text-sm text-gray-500">
                                    {item.dueDate
                                      ? `Due: ${item.dueDate}`
                                      : "No due date"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                                  onClick={() =>
                                    handleButtonClick("edit-treatment", item)
                                  }
                                >
                                  <Edit3 className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                {item.status !== "inactive" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                                    onClick={() =>
                                      handleButtonClick("mark-inactive", item)
                                    }
                                  >
                                    Mark Inactive
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Medications Tab Content */}
                  <TabsContent value="medications">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-medium">
                        Current & Past Medications
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => handleButtonClick("add-medication")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Medication
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {medications.map((med) => (
                        <div
                          key={med.id}
                          className="p-3 rounded-md border flex justify-between items-center"
                        >
                          <div>
                            <div className="flex items-center mb-1">
                              <h4 className="font-medium">{med.name}</h4>
                              <span
                                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                  med.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {med.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {med.dosage}
                            </p>
                            <div className="flex text-xs text-gray-500 mt-1">
                              <span className="mr-3">
                                Refills: {med.refills}
                              </span>
                              <span>Prescribing doctor: {med.doctor}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleButtonClick("view-prescription", med)
                            }
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Diagnostics Tab Content */}
                  {/* <TabsContent value="diagnostics">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-medium">Lab & Imaging Results</h3>
                      <Button
                        size="sm"
                        onClick={() => handleButtonClick("add-diagnostic")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Result
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {diagnostics.map((diag) => (
                        <div
                          key={diag.id}
                          className="p-3 rounded-md border flex justify-between items-center"
                        >
                          <div>
                            <h4 className="font-medium">{diag.name}</h4>
                            <div className="flex text-sm text-gray-500">
                              <span className="mr-3">Date: {diag.date}</span>
                              <span>Result: {diag.result}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleButtonClick("view-result", diag)
                            }
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent> */}

                  {/* Diagnoses Tab Content */}
                  <TabsContent value="diagnoses">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-medium">Diagnoses History</h3>
                      <Button
                        size="sm"
                        onClick={() => handleButtonClick("add-diagnosis")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Diagnosis
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {diagnoses.map((diag) => (
                        <div
                          key={diag.id}
                          className="p-3 rounded-md border flex justify-between items-center"
                        >
                          <div>
                            <h4 className="font-medium">{diag.name}</h4>
                            <div className="flex text-sm text-gray-500">
                              <span className="mr-3">Date: {diag.date}</span>
                              <span>Doctor: {diag.doctor}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleButtonClick("view-record", diag)
                            }
                          >
                            View Record
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default HealthCard;
