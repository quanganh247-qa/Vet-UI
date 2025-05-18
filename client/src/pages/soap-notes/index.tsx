import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  Save,
  Mic,
  MicOff,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  FileText,
  Activity,
  CheckCircle,
  ClipboardEdit,
  NotebookText,
  FileBarChart,
  Info,
  FlaskConical,
  Bold,
  Italic,
  List,
  ListOrdered,
  Edit,
  Eye,
  X,
} from "lucide-react";
import { useGetSOAP, useUpdateSOAP } from "@/hooks/use-soap";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData } from "@/hooks/use-pet";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { toast } from "@/components/ui/use-toast";
import { ObjectiveData } from "@/types";
import { SOAPHistory } from "../soap-history/SOAPHistory";

// Define the SubjectiveEntry interface
interface SubjectiveEntry {
  id: string;
  key: string;
  value: string;
}

interface AssessmentEntry {
  primary: string;
  differentials: string[];
  notes: string;
}

// Component to display subjective data in key-value format
const SubjectiveKeyValueDisplay = ({
  data,
}: {
  data: string | SubjectiveEntry[] | null | undefined;
}) => {
  const parseSubjectiveData = (
    value: string | SubjectiveEntry[] | null | undefined
  ): SubjectiveEntry[] => {
    // Handle null or undefined
    if (!value) return [];

    // If already an array, return it directly
    if (Array.isArray(value)) {
      return value;
    }

    // Otherwise handle as string
    if (typeof value !== "string" || !value.trim()) return [];

    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === "object" && parsed !== null) {
        return Object.entries(parsed).map(([key, value]) => ({
          id: crypto.randomUUID(),
          key,
          value: String(value),
        }));
      }
    } catch (e) {
      // If not JSON, try to parse as text with key: value format
      const lines = value.split("\n").filter((line) => line.trim());
      const entries: SubjectiveEntry[] = [];

      for (const line of lines) {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          entries.push({
            id: crypto.randomUUID(),
            key: line.substring(0, colonIndex).trim(),
            value: line.substring(colonIndex + 1).trim(),
          });
        } else {
          entries.push({
            id: crypto.randomUUID(),
            key: "Note",
            value: line.trim(),
          });
        }
      }

      return entries;
    }

    return [];
  };

  const entries = parseSubjectiveData(data);

  if (!data || entries.length === 0) {
    return (
      <div className="p-4 text-gray-500 italic">
        No subjective data available.
      </div>
    );
  }

  console.log("entries: ", entries);

  return (
    <div className="p-3 space-y-3 bg-white rounded-xl">
      {entries.map((entry, index) => (
        <div
          key={entry.id || index}
          className="grid grid-cols-12 gap-3 items-start bg-[#F9FAFB] p-3 rounded-xl border border-gray-100"
        >
          <div className="col-span-3 text-gray-700 font-medium">
            {entry.key}:
          </div>
          <div className="col-span-9 text-gray-800">
            {entry.value || (
              <span className="text-gray-400 italic">No data</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Component to display objective data in key-value format
const ObjectiveDataDisplay = ({ data }: { data: any }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="p-4 text-gray-500 italic">
        No examination data available.
      </div>
    );
  }

  const renderVitalSigns = () => {
    if (!data.vital_signs) return null;

    const vitalSigns = [
      {
        name: "Weight",
        value: data.vital_signs.weight,
        unit: "kg",
        icon: <span className="h-4 w-4 mr-2">⚖️</span>,
      },
      {
        name: "Temperature",
        value: data.vital_signs.temperature,
        unit: "°C",
        icon: <span className="h-4 w-4 mr-2">🌡️</span>,
      },
      {
        name: "Heart Rate",
        value: data.vital_signs.heart_rate,
        unit: "bpm",
        icon: <span className="h-4 w-4 mr-2">❤️</span>,
      },
      {
        name: "Respiratory Rate",
        value: data.vital_signs.respiratory_rate,
        unit: "rpm",
        icon: <span className="h-4 w-4 mr-2">🫁</span>,
      },
    ];

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-[#2C78E4]" />
          <h3 className="font-medium text-gray-700">VITAL SIGNS</h3>
        </div>
        <div className="space-y-3">
          {vitalSigns.map((sign, index) =>
            sign.value ? (
              <div
                key={index}
                className="bg-[#F0F7FF]/50 rounded-xl p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  {sign.icon}
                  <span className="text-gray-700 font-medium">{sign.name}</span>
                </div>
                <div className="ml-6 text-[#2C78E4] font-semibold">
                  {sign.value} {sign.unit}
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    );
  };

  const renderSystemsExamination = () => {
    if (!data.systems) return null;

    const systemPairs = [
      {
        name: "Cardiovascular",
        value: data.systems.cardiovascular,
        icon: <span className="text-[#2C78E4]">❤️</span>,
      },
      { 
        name: "Respiratory", 
        value: data.systems.respiratory, 
        icon: <span className="text-[#2C78E4]">🫁</span> 
      },
      {
        name: "Gastrointestinal",
        value: data.systems.gastrointestinal,
        icon: <span className="text-[#2C78E4]">🧠</span>,
      },
      {
        name: "Musculoskeletal",
        value: data.systems.musculoskeletal,
        icon: <span className="text-[#2C78E4]">🦴</span>,
      },
      { 
        name: "Neurological", 
        value: data.systems.neurological, 
        icon: <span className="text-[#2C78E4]">🧠</span> 
      },
      { 
        name: "Skin/Coat", 
        value: data.systems.skin, 
        icon: <span className="text-[#2C78E4]">🧥</span> 
      },
      { 
        name: "Eyes", 
        value: data.systems.eyes, 
        icon: <span className="text-[#2C78E4]">👁️</span> 
      },
      { 
        name: "Ears", 
        value: data.systems.ears, 
        icon: <span className="text-[#2C78E4]">👂</span> 
      },
    ];

    // Check if there's at least one system with data
    const hasSystemData = systemPairs.some((system) => system.value);

    if (!hasSystemData) return null;

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#2C78E4] text-lg">🩺</span>
          <h3 className="font-medium text-gray-700">SYSTEMS EXAMINATION</h3>
        </div>
        <div className="grid gap-3">
          {systemPairs.map((system, index) =>
            system.value ? (
              <div
                key={index}
                className="flex p-3 bg-[#F9FAFB] rounded-xl flex-col"
              >
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-200">
                  <span className="text-lg">{system.icon}</span>
                  <span className="text-gray-700 font-medium">
                    {system.name}
                  </span>
                </div>
                <p className="text-gray-600 whitespace-pre-line">
                  {system.value}
                </p>
              </div>
            ) : null
          )}
        </div>
      </div>
    );
  };

  const currentDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-4 space-y-6 bg-white">
      <div className="flex items-center mb-6">
        <div className="flex flex-col">
        
          <div className="text-sm text-gray-500 mt-1">
            {currentDate}
          </div>
        </div>
      </div>

      {renderVitalSigns()}
      {renderSystemsExamination()}
    </div>
  );
};

// Component for editing assessment data
const AssessmentEditor = ({
  value,
  onChange,
}: {
  value: AssessmentEntry | string | undefined;
  onChange: (value: AssessmentEntry) => void;
}) => {
  // Convert string or undefined to AssessmentEntry structure
  const [assessment, setAssessment] = useState<AssessmentEntry>(() => {
    if (!value) {
      return { primary: "", differentials: [], notes: "" };
    }

    if (typeof value === "string") {
      return {
        primary: value,
        differentials: [],
        notes: "",
      };
    }

    return value as AssessmentEntry;
  });

  // Handle input changes
  const handleInputChange = (
    field: keyof AssessmentEntry,
    value: string | string[]
  ) => {
    const newAssessment = {
      ...assessment,
      [field]: value,
    };
    setAssessment(newAssessment);
    onChange(newAssessment);
  };

  // Handle adding a new differential diagnosis
  const addDifferential = () => {
    const differentials = [...assessment.differentials, ""];
    handleInputChange("differentials", differentials);
  };

  // Handle changing a differential diagnosis
  const changeDifferential = (index: number, value: string) => {
    const differentials = [...assessment.differentials];
    differentials[index] = value;
    handleInputChange("differentials", differentials);
  };

  // Handle removing a differential diagnosis
  const removeDifferential = (index: number) => {
    const differentials = assessment.differentials.filter(
      (_, i) => i !== index
    );
    handleInputChange("differentials", differentials);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Diagnosis
        </label>
        <Textarea
          value={assessment.primary}
          onChange={(e) => handleInputChange("primary", e.target.value)}
          placeholder="Enter primary diagnosis"
          className="resize-none min-h-[100px] bg-white rounded-lg border-gray-200 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
        />
      </div>

      <div className="bg-[#F9FAFB] p-4 rounded-xl border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <Textarea
          value={assessment.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Enter additional notes about the diagnosis"
          className="resize-none min-h-[100px] bg-white rounded-lg border-gray-200 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
        />
      </div>
    </div>
  );
};

const SoapNotes = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true); // Set preview mode to true by default
  const { id: appointmentId } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();

  // Add state for assessment data
  const [assessmentData, setAssessmentData] = useState<AssessmentEntry>({
    primary: "",
    differentials: [],
    notes: "",
  });

  // Debug information
  console.log("Initial route params appointmentId:", appointmentId);

  // Get the query params from URL
  const searchParams = new URLSearchParams(window.location.search);
  const urlAppointmentId = searchParams.get("appointmentId");
  console.log("URL query param appointmentId:", urlAppointmentId);

  // Quản lý tham số workflow
  const [workflowParams, setWorkflowParams] = useState<{
    appointmentId: string | null;
    petId: string | null;
  }>({
    appointmentId: null,
    petId: null,
  });

  // Xử lý các tham số từ URL một cách nhất quán
  useEffect(() => {
    // Lấy tất cả các query params từ URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    const urlPetId = searchParams.get("petId");

    // Thiết lập appointmentId và petId theo thứ tự ưu tiên
    const appointmentIdValue = urlAppointmentId || appointmentId || null;
    const petIdValue = urlPetId || null;

    console.log("Setting workflowParams:", { appointmentIdValue, petIdValue });

    // IMPORTANT: Kiểm tra xem giá trị mới có khác giá trị cũ không
    // để tránh vòng lặp vô hạn của setState
    if (
      appointmentIdValue !== workflowParams.appointmentId ||
      petIdValue !== workflowParams.petId
    ) {
      setWorkflowParams({
        appointmentId: appointmentIdValue,
        petId: petIdValue,
      });
    }
  }, [appointmentId]);

  // Try to get appointmentId from different sources
  const effectiveAppointmentId =
    workflowParams.appointmentId || appointmentId || urlAppointmentId || "";

  const { data: soap, isLoading: isSoapLoading1 } = useGetSOAP(
    effectiveAppointmentId
  );

  console.log("soap", soap);


  // Initialize assessment data when soap data is loaded
  useEffect(() => {
    if (soap?.assessment) {
      // If assessment is an object with the right structure
      if (typeof soap.assessment === "object" && "primary" in soap.assessment) {
        setAssessmentData(soap.assessment as AssessmentEntry);
      } else {
        // If assessment is a string, convert it
        setAssessmentData({
          primary: String(soap.assessment || ""),
          differentials: [],
          notes: "",
        });
      }
    }
  }, [soap]);

  // Utility function to build query parameters
  const buildUrlParams = (
    params: Record<string, string | number | null | undefined>
  ) => {
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        urlParams.append(key, String(value));
      }
    });

    const queryString = urlParams.toString();
    return queryString ? `?${queryString}` : "";
  };

  const {
    data: appointment,
    isLoading: isAppointmentLoading,
    error: appointmentError,
  } = useAppointmentData(effectiveAppointmentId);
  const {
    data: patient,
    isLoading: isPatientLoading,
    error: patientError,
  } = usePatientData(appointment?.pet?.pet_id);

  const updateSoapMutation = useUpdateSOAP();

  // Format objective data into a readable format
  const formatObjectiveData = (data: any): string => {
    if (!data || Object.keys(data).length === 0) {
      return "No examination data available.";
    }

    // Start with a clear title and date
    let formattedText = `📋 CLINICAL EXAMINATION RESULTS\n`;
    formattedText += `📅 ${new Date().toLocaleDateString()}\n\n`;

    // Format vital signs with better visual structure
    if (data.vital_signs) {
      formattedText += `🔍 VITAL SIGNS\n${"─".repeat(30)}\n`;

      const vitalSigns = [
        {
          name: "Weight",
          value: data.vital_signs.weight,
          unit: "kg",
          icon: "⚖️",
        },
        {
          name: "Temperature",
          value: data.vital_signs.temperature,
          unit: "°C",
          icon: "🌡️",
        },
        {
          name: "Heart Rate",
          value: data.vital_signs.heart_rate,
          unit: "bpm",
          icon: "❤️",
        },
        {
          name: "Respiratory Rate",
          value: data.vital_signs.respiratory_rate,
          unit: "rpm",
          icon: "🫁",
        },
      ];

      vitalSigns.forEach((sign) => {
        if (sign.value) {
          formattedText += `${sign.icon} ${sign.name}: ${sign.value} ${sign.unit}\n`;
        }
      });
      formattedText += "\n";
    }

    // Format systems examination with better visual organization
    if (data.systems) {
      formattedText += `🩺 SYSTEMS EXAMINATION\n${"─".repeat(30)}\n`;

      const systemPairs = [
        {
          name: "Cardiovascular",
          value: data.systems.cardiovascular,
          icon: "❤️",
        },
        { name: "Respiratory", value: data.systems.respiratory, icon: "🫁" },
        {
          name: "Gastrointestinal",
          value: data.systems.gastrointestinal,
          icon: "🧠",
        },
        {
          name: "Musculoskeletal",
          value: data.systems.musculoskeletal,
          icon: "🦴",
        },
        { name: "Neurological", value: data.systems.neurological, icon: "🧠" },
        { name: "Skin/Coat", value: data.systems.skin, icon: "🧥" },
        { name: "Eyes", value: data.systems.eyes, icon: "👁️" },
        { name: "Ears", value: data.systems.ears, icon: "👂" },
      ];

      // First count how many systems have data
      const filledSystems = systemPairs.filter((system) => system.value).length;

      if (filledSystems === 0) {
        formattedText += "No systems examination data recorded.\n";
      } else {
        systemPairs.forEach((system) => {
          if (system.value) {
            formattedText += `${system.icon} ${system.name}:\n   ${system.value}\n\n`;
          }
        });
      }
    }

    // Add summary section if available
    if (data.vital_signs?.general_notes) {
      formattedText += `\n📋 SUMMARY\n${"─".repeat(30)}\n`;
      formattedText += `${data.vital_signs.general_notes}\n`;
    }

    return formattedText;
  };

  const handleSave = async () => {
    if (!appointment?.id) {
      toast({
        title: "Error",
        description: "Appointment not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current objective data or use default if not available
      const defaultObjective: ObjectiveData = {
        vital_signs: {
          weight: "",
          temperature: "",
          heart_rate: "",
          respiratory_rate: "",
          general_notes: "",
        },
        systems: {
          cardiovascular: "",
          respiratory: "",
          gastrointestinal: "",
          musculoskeletal: "",
          neurological: "",
          skin: "",
          eyes: "",
          ears: "",
        },
      };

      // Prepare subjective data
      let subjectiveData = soap?.subjective || "";
      // Save SOAP note
      await updateSoapMutation.mutateAsync({
        appointmentID: appointment.id,
        subjective: subjectiveData,
        objective: soap?.objective || defaultObjective,
        assessment: assessmentData, // Use the local state for assessment
        plan: typeof soap?.plan === "number" ? soap.plan : 0,
      });

      toast({
        title: "Save Success",
        description: "SOAP notes saved successfully.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Navigate to lab-management
      const params = {
        appointmentId: effectiveAppointmentId,
        petId: appointment?.pet?.pet_id,
      };
      setLocation(`/lab-management${buildUrlParams(params)}`);
    } catch (error) {
      console.error("Error saving SOAP notes:", error);
      toast({
        title: "Save Failed",
        description: "An error occurred while saving SOAP notes.",
        variant: "destructive",
      });
    }
  };

  const handleProceedToTreatment = () => {
    if (patient) {
      // Save notes first
      handleSave();

      // Then navigate to treatment page with query params
      const params = {
        appointmentId: effectiveAppointmentId,
        petId: patient.petid,
      };
      setLocation(`/treatment${buildUrlParams(params)}`);
    }
  };

  const handleBackToPatient = () => {
    if (appointment) {
      // Navigate to patient page with query params
      const params = {
        appointmentId: effectiveAppointmentId,
        petId: appointment?.pet?.pet_id,
      };
      setLocation(`/patient${buildUrlParams(params)}`);
    } else {
      setLocation("/appointment-flow");
    }
  };

  const navigateToLabManagement = () => {
    if (patient) {
      // Navigate to lab management page with query params
      const params = {
        appointmentId: effectiveAppointmentId,
        petId: patient.petid,
      };
      setLocation(`/lab-management${buildUrlParams(params)}`);
    }
  };

  if (isAppointmentLoading || isPatientLoading || !appointment || !patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">
            Loading patient details...
          </p>
        </div>
      </div>
    );
  }

  // Format the objective data - KEEP FOR BACKWARD COMPATIBILITY
  const formattedObjectiveText = soap?.objective
    ? formatObjectiveData(soap.objective)
    : "";

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 md:px-8 md:py-5 rounded-xl shadow-md mb-6 text-white">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
            onClick={handleBackToPatient}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </Button>
          <div>
            <h1 className="text-white font-semibold text-lg">SOAP Notes</h1>
          </div>
        </div>
      </div>

      {/* Workflow Navigation */}
      <WorkflowNavigation
        appointmentId={effectiveAppointmentId}
        petId={patient?.petid?.toString()}
        currentStep="soap"
      />

      {/* Main content */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#F0F7FF] to-white border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <NotebookText className="h-5 w-5 text-[#2C78E4] mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">
                Medical SOAP Notes
              </h2>
            </div>
          </div>
          <div className="p-6">
            <Tabs defaultValue="all" className="w-full">
              <div className="mb-4">
                <TabsList className="inline-flex p-1 bg-[#F9FAFB] rounded-xl mb-4">
                  <TabsTrigger
                    value="all"
                    className="px-4 py-2 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#2C78E4]"
                  >
                    All Sections
                  </TabsTrigger>
                  <TabsTrigger
                    value="subjective"
                    className="px-4 py-2 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#2C78E4]"
                  >
                    Subjective
                  </TabsTrigger>
                  <TabsTrigger
                    value="objective"
                    className="px-4 py-2 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#2C78E4]"
                  >
                    Objective
                  </TabsTrigger>
                  <TabsTrigger
                    value="assessment"
                    className="px-4 py-2 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#2C78E4]"
                  >
                    Assessment
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="px-4 py-2 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#2C78E4]"
                  >
                    History
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="space-y-6 py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-[#2C78E4]" />
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      S - Subjective (Owner's Report)
                    </label>
                  </div>
                  <SubjectiveKeyValueDisplay data={soap?.subjective} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-[#2C78E4]" />
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      O - Objective (Clinical Findings)
                    </label>
                    <span className="text-sm text-gray-500">May 18, 2025</span>
                  </div>
                  <div className="border rounded-xl overflow-hidden">
                    <ObjectiveDataDisplay data={soap?.objective} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardEdit className="h-4 w-4 text-[#2C78E4]" />
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      A - Assessment (Diagnosis)
                    </label>
                  </div>
                  <AssessmentEditor
                    value={assessmentData}
                    onChange={setAssessmentData}
                  />
                </div>
              </TabsContent>

              {/* Tab Subjective */}
              <TabsContent value="subjective" className="py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-[#2C78E4]" />
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      S - Subjective (Owner's Report)
                    </label>
                  </div>
                  <SubjectiveKeyValueDisplay data={soap?.subjective} />
                </div>
              </TabsContent>

              {/* Tab Objective - read-only */}
              <TabsContent value="objective" className="py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-[#2C78E4]" />
                    <label className="text-sm font-medium text-gray-700">
                      O - Objective (Clinical Findings)
                    </label>
                  </div>
                  <div className="border rounded-xl overflow-hidden">
                    <ObjectiveDataDisplay data={soap?.objective} />
                  </div>
                </div>
              </TabsContent>

              {/* Tab Assessment - Main diagnostic tab */}
              <TabsContent value="assessment" className="py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardEdit className="h-4 w-4 text-[#2C78E4]" />
                    <label className="text-sm font-medium text-gray-700">
                      A - Assessment (Diagnosis)
                    </label>
                  </div>
                  <AssessmentEditor
                    value={assessmentData}
                    onChange={setAssessmentData}
                  />
                </div>
              </TabsContent>

              {/* Tab History - SOAP history for this patient */}
              <TabsContent value="history" className="py-4">
                <div>
                  <SOAPHistory petId={patient?.petid?.toString() || ""} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleSave}
                className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF]"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Diagnosis
              </Button>

              <Button
                variant="outline"
                onClick={navigateToLabManagement}
                className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF]"
              >
                <FlaskConical className="h-4 w-4 mr-2" />
                Labs
              </Button>

              <Button
                onClick={handleProceedToTreatment}
                className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Proceed to Treatment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoapNotes;
