import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData, useUpdatePet } from "@/hooks/use-pet";
import { updatePetRequest } from "@/services/pet-services";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateAppointmentById } from "@/services/appointment-services";
import { useAuth } from "@/context/auth-context";
import {
  Check,
  CheckCircle,
  ScanLine,
  Stethoscope,
  ArrowLeft,
  Thermometer,
  Heart,
  Activity,
  Eye,
  Ear,
  FlaskConical,
  FileText,
  Save,
  Clipboard,
  AlertCircle,
  Plus,
  RefreshCw,
  ChevronDown,
  Table,
  MousePointerClick,
  Keyboard,
  User,
  MessageCircle,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useGetSOAP, useUpdateSOAP } from "@/hooks/use-soap";
import { ObjectiveData } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define template data types
interface PhysicalTemplateData {
  weight?: string;
  temperature?: string;
  heartRate?: string;
  respiratoryRate?: string;
  generalNotes?: string;
}

interface SystemsTemplateData {
  cardiovascular?: string;
  respiratory?: string;
  gastrointestinal?: string;
  musculoskeletal?: string;
  neurological?: string;
  skin?: string;
  eyes?: string;
  ears?: string;
}

interface PhysicalTemplate {
  id: number;
  name: string;
  data: PhysicalTemplateData;
}

interface SystemsTemplate {
  id: number;
  name: string;
  data: SystemsTemplateData;
}

// Define SubjectiveEntry interface
interface SubjectiveEntry {
  id: string;
  key: string;
  value: string;
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
      <div className="p-4 text-gray-500 italic text-sm">
        No subjective data available.
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {entries.map((entry) => (
        <div key={entry.id} className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-4 text-gray-700 font-medium text-sm">
            {entry.key}:
          </div>
          <div className="col-span-8 text-gray-800 text-sm">
            {entry.value || (
              <span className="text-gray-400 italic">No data</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const Examination: React.FC = () => {
  // Lấy params từ cả route params và query params
  const { id: routeId } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { doctor } = useAuth();

  // Lấy tham số workflow
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

    console.log("Examination URL Params:", {
      urlAppointmentId,
      urlPetId,
      routeId,
    });

    // Thiết lập appointmentId và petId theo thứ tự ưu tiên
    let appointmentIdValue = urlAppointmentId || routeId || null;
    let petIdValue = urlPetId || null;

    setWorkflowParams({
      appointmentId: appointmentIdValue,
      petId: petIdValue,
    });
  }, [routeId]);

  // Sử dụng appointmentId từ workflowParams
  const effectiveAppointmentId = workflowParams.appointmentId || "";

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

  const { data: appointment, isLoading: isAppointmentLoading } =
    useAppointmentData(effectiveAppointmentId);

  const { data: patient, isLoading: isPatientLoading } = usePatientData(
    appointment?.pet?.pet_id
  );

  console.log("patient: ", patient);

  const [activeTab, setActiveTab] = useState("physical");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { data: soap, isLoading: isSoapLoading } = useGetSOAP(
    effectiveAppointmentId
  );

  console.log("soap-examination details:", {
    soap,
    type: soap ? typeof soap : 'undefined',
    keys: soap ? Object.keys(soap) : [],
    subjective: soap?.subjective,
    subjectiveType: soap?.subjective ? typeof soap.subjective : 'undefined', 
    isEmptyArray: Array.isArray(soap?.subjective) && soap.subjective.length === 0
  });

  // Template management with proper types
  const [templates, setTemplates] = useState<{
    physical: PhysicalTemplate[];
    systems: SystemsTemplate[];
  }>({
    physical: [
      {
        id: 1,
        name: "Normal Dog Vitals",
        data: {
          weight: "",
          temperature: "38.5",
          heartRate: "100",
          respiratoryRate: "20",
          generalNotes: "No abnormalities detected",
        },
      },
      {
        id: 2,
        name: "Normal Cat Vitals",
        data: {
          weight: "",
          temperature: "38.0",
          heartRate: "120",
          respiratoryRate: "24",
          generalNotes: "No abnormalities detected",
        },
      },
    ],
    systems: [
      {
        id: 1,
        name: "Normal Physical Exam",
        data: {
          cardiovascular: "Normal heart sounds, no murmurs",
          respiratory: "Normal respiratory sounds, no crackles or wheezes",
          gastrointestinal: "Normal abdomen on palpation",
          musculoskeletal: "Normal gait and posture",
          neurological: "Alert and responsive",
          skin: "Good coat condition",
          eyes: "Clear, no discharge",
          ears: "Clean, no inflammation",
        },
      },
      {
        id: 2,
        name: "Dental Check",
        data: {
          gastrointestinal: "Dental tartar grade 2/4. Mild gingivitis present.",
        },
      },
    ],
  });

  // Form state for physical examination
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");

  // System examination findings
  const [cardiovascular, setCardiovascular] = useState("");
  const [respiratory, setRespiratory] = useState("");
  const [gastrointestinal, setGastrointestinal] = useState("");
  const [musculoskeletal, setMusculoskeletal] = useState("");
  const [neurological, setNeurological] = useState("");
  const [skin, setSkin] = useState("");
  const [eyes, setEyes] = useState("");
  const [ears, setEars] = useState("");

  // Function to apply a template with fixed types
  const applyTemplate = (
    templateType: "physical" | "systems",
    templateId: number
  ) => {
    if (templateType === "physical") {
      const template = templates.physical.find((t) => t.id === templateId);
      if (!template) return;

      if (template.data.weight) setWeight(template.data.weight);
      if (template.data.temperature) setTemperature(template.data.temperature);
      if (template.data.heartRate) setHeartRate(template.data.heartRate);
      if (template.data.respiratoryRate)
        setRespiratoryRate(template.data.respiratoryRate);
      if (template.data.generalNotes)
        setGeneralNotes(template.data.generalNotes);
    } else {
      const template = templates.systems.find((t) => t.id === templateId);
      if (!template) return;

      if (template.data.cardiovascular)
        setCardiovascular(template.data.cardiovascular);
      if (template.data.respiratory) setRespiratory(template.data.respiratory);
      if (template.data.gastrointestinal)
        setGastrointestinal(template.data.gastrointestinal);
      if (template.data.musculoskeletal)
        setMusculoskeletal(template.data.musculoskeletal);
      if (template.data.neurological)
        setNeurological(template.data.neurological);
      if (template.data.skin) setSkin(template.data.skin);
      if (template.data.eyes) setEyes(template.data.eyes);
      if (template.data.ears) setEars(template.data.ears);
    }

    toast({
      title: "Template Applied",
      description: `Applied template: ${
        templateType === "physical"
          ? templates.physical.find((t) => t.id === templateId)?.name
          : templates.systems.find((t) => t.id === templateId)?.name
      }`,
      className: "bg-green-50 border-green-200 text-green-800",
    });

    setUnsavedChanges(true);
  };

  // Save a new template with fixed types
  const saveAsTemplate = (
    templateType: "physical" | "systems",
    name: string
  ) => {
    if (templateType === "physical") {
      const newTemplate: PhysicalTemplate = {
        id: Math.max(0, ...templates.physical.map((t) => t.id)) + 1,
        name,
        data: { weight, temperature, heartRate, respiratoryRate, generalNotes },
      };

      setTemplates({
        ...templates,
        physical: [...templates.physical, newTemplate],
      });
    } else {
      const newTemplate: SystemsTemplate = {
        id: Math.max(0, ...templates.systems.map((t) => t.id)) + 1,
        name,
        data: {
          cardiovascular,
          respiratory,
          gastrointestinal,
          musculoskeletal,
          neurological,
          skin,
          eyes,
          ears,
        },
      };

      setTemplates({
        ...templates,
        systems: [...templates.systems, newTemplate],
      });
    }

    toast({
      title: "Template Saved",
      description: `New template "${name}" saved successfully`,
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  // Function to handle input changes and track unsaved changes
  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      setUnsavedChanges(true);
    };

  // Inside the component, add the SOAP update mutation
  const updateSoapMutation = useUpdateSOAP();

  // Load examination data from SOAP when it's available
  useEffect(() => {
    if (soap?.objective) {
      // Set vital signs
      if (soap.objective.vital_signs) {
        if (soap.objective.vital_signs.weight) setWeight(soap.objective.vital_signs.weight);
        if (soap.objective.vital_signs.temperature) setTemperature(soap.objective.vital_signs.temperature);
        if (soap.objective.vital_signs.heart_rate) setHeartRate(soap.objective.vital_signs.heart_rate);
        if (soap.objective.vital_signs.respiratory_rate) setRespiratoryRate(soap.objective.vital_signs.respiratory_rate);
        if (soap.objective.vital_signs.general_notes) setGeneralNotes(soap.objective.vital_signs.general_notes);
      }
      
      // Set systems data
      if (soap.objective.systems) {
        if (soap.objective.systems.cardiovascular) setCardiovascular(soap.objective.systems.cardiovascular);
        if (soap.objective.systems.respiratory) setRespiratory(soap.objective.systems.respiratory);
        if (soap.objective.systems.gastrointestinal) setGastrointestinal(soap.objective.systems.gastrointestinal);
        if (soap.objective.systems.musculoskeletal) setMusculoskeletal(soap.objective.systems.musculoskeletal);
        if (soap.objective.systems.neurological) setNeurological(soap.objective.systems.neurological);
        if (soap.objective.systems.skin) setSkin(soap.objective.systems.skin);
        if (soap.objective.systems.eyes) setEyes(soap.objective.systems.eyes);
        if (soap.objective.systems.ears) setEars(soap.objective.systems.ears);
      }
      
      // Reset unsaved changes flag since we just loaded from the server
      setUnsavedChanges(false);
    }
  }, [soap]);

  // Save examination findings with enhanced feedback and SOAP transfer
  const saveExamination = async () => {
    if (!appointment?.id) {
      toast({
        title: "Error",
        description: "Appointment not found",
        variant: "destructive",
      });
      return;
    }

    // Show saving indicator
    toast({
      title: "Saving",
      description: "Saving examination findings and SOAP notes...",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });

    try {
      // First, create the objective data from examination findings
      const objectiveData: ObjectiveData = {
        vital_signs: {
          weight: weight || "",
          temperature: temperature || "",
          heart_rate: heartRate || "",
          respiratory_rate: respiratoryRate || "",
          general_notes: generalNotes || "",
        },
        systems: {
          cardiovascular: cardiovascular || "",
          respiratory: respiratory || "",
          gastrointestinal: gastrointestinal || "",
          musculoskeletal: musculoskeletal || "",
          neurological: neurological || "",
          skin: skin || "",
          eyes: eyes || "",
          ears: ears || "",
        },
      };

      // Create a properly structured assessment object
      const assessmentData = {
        primary: "",
        differentials: [],
        notes: "",
      };

      console.log("Current SOAP state:", {
        soap,
        subjective: soap?.subjective,
        objectiveData,
      });

      // Save to SOAP notes
      await updateSoapMutation.mutateAsync({
        appointmentID: effectiveAppointmentId,
        subjective: soap?.subjective || [], // Keep existing subjective data
        objective: objectiveData,
        assessment: assessmentData,
        plan: Number(soap?.plan) || 0,
      });

      setUnsavedChanges(false);

      toast({
        title: "Examination Saved",
        description:
          "Examination findings have been saved successfully to SOAP notes.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Proceed to SOAP notes if requested
      const params = {
        appointmentId: effectiveAppointmentId,
        petId: appointment?.pet?.pet_id,
      };
      navigate(`/soap${buildUrlParams(params)}`);
    } catch (error) {
      console.error("Error saving examination:", error);
      toast({
        title: "Save Failed",
        description: "An error occurred while saving examination data.",
        variant: "destructive",
      });
    }
  };

  // Navigate to patient page
  const navigateToPatient = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id,
    };
    navigate(`/health-card${buildUrlParams(params)}`);
  };

  // Navigate to lab management
  const navigateToLabManagement = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id,
    };
    navigate(`/lab-management${buildUrlParams(params)}`);
  };

  // Navigate to SOAP notes
  const navigateToSOAP = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id,
    };
    navigate(`/soap${buildUrlParams(params)}`);
  };

  // Navigate to health card
  const navigateToHealthCard = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id,
    };
    navigate(`/patient/health-card${buildUrlParams(params)}`);
  };

  // Quick save without navigation
  const quickSave = async () => {
    if (!appointment?.id) {
      toast({
        title: "Error",
        description: "Appointment not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the objective data from examination findings
      const objectiveData: ObjectiveData = {
        vital_signs: {
          weight: weight || "",
          temperature: temperature || "",
          heart_rate: heartRate || "",
          respiratory_rate: respiratoryRate || "",
          general_notes: generalNotes || "",
        },
        systems: {
          cardiovascular: cardiovascular || "",
          respiratory: respiratory || "",
          gastrointestinal: gastrointestinal || "",
          musculoskeletal: musculoskeletal || "",
          neurological: neurological || "",
          skin: skin || "",
          eyes: eyes || "",
          ears: ears || "",
        },
      };

      // Create a properly structured assessment object
      const assessmentData = {
        primary: "",
        differentials: [],
        notes: "",
      };

      // Save to SOAP notes without navigating away
      await updateSoapMutation.mutateAsync({
        appointmentID: effectiveAppointmentId,
        subjective: soap?.subjective || [], // Keep existing subjective data
        objective: objectiveData,
        assessment: assessmentData,
        plan: Number(soap?.plan) || 0,
      });

      setUnsavedChanges(false);

      toast({
        title: "Saved",
        description: "Examination data saved successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error("Error saving examination:", error);
      toast({
        title: "Save Failed",
        description: "An error occurred while saving examination data.",
        variant: "destructive",
      });
    }
  };

  // Add a function to handle back navigation
  const navigateBack = () => {
    window.history.back();
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S for quick save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        quickSave();
      }

      // Alt+1 for Physical tab
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        setActiveTab("physical");
      }

      // Alt+2 for Systems tab
      if (e.altKey && e.key === "2") {
        e.preventDefault();
        setActiveTab("systems");
      }

      // Alt+Enter for Save & Continue
      if (e.altKey && e.key === "Enter") {
        e.preventDefault();
        saveExamination();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickSave, saveExamination, setActiveTab]);

  // Show loading state when data is being fetched
  if (isAppointmentLoading || isPatientLoading || isSoapLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-[#2C78E4] border-b-[#2C78E4] border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-[#2C78E4] font-medium">Loading examination data...</p>
          <p className="text-gray-500 text-sm text-center max-w-md">
            Please wait while we fetch patient information and examination details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 md:px-8 md:py-5 rounded-xl shadow-md mb-6 text-white">
        {/* Header Row */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
            onClick={navigateToPatient}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </Button>
          <h1 className="text-white font-semibold text-lg">
            Clinical Examination
          </h1>
        </div>
      </div>

      {/* Workflow Navigation */}
      <WorkflowNavigation
        appointmentId={effectiveAppointmentId}
        petId={patient?.pet_id?.toString()}
        currentStep="examination"
      />

      {/* Template Dialog */}
      <Dialog>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Create a reusable template from the current examination values.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <Input
              id="templateName"
              placeholder="e.g., Normal Adult Cat Examination"
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" className="mr-2">
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#2C78E4] hover:bg-[#1E40AF]"
              onClick={() => {
                const input = document.getElementById(
                  "templateName"
                ) as HTMLInputElement;
                const templateName = input?.value;
                if (templateName) {
                  saveAsTemplate(
                    activeTab === "physical" ? "physical" : "systems",
                    templateName
                  );
                }
              }}
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="px-4 py-3">
        <Tabs
          defaultValue="physical"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid grid-cols-2 bg-[#F9FAFB] p-1.5 rounded-xl w-full shadow-sm">
            <TabsTrigger
              value="physical"
              className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] data-[state=active]:shadow-sm py-2 px-3 text-sm font-medium transition-all rounded-xl"
            >
              <Clipboard className="h-4 w-4" />
              <span>Physical Examination</span>
            </TabsTrigger>
            <TabsTrigger
              value="systems"
              className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] data-[state=active]:shadow-sm py-2 px-3 text-sm font-medium transition-all rounded-xl"
            >
              <ScanLine className="h-4 w-4" />
              <span>Systems Examination</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="physical" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-5">
                {/* Quick Actions Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3">
                  <div className="p-3 flex flex-wrap gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-gray-200 text-[#4B5563] text-xs h-8 rounded-lg"
                            onClick={() => {
                              setWeight("");
                              setTemperature("");
                              setHeartRate("");
                              setRespiratoryRate("");
                              setGeneralNotes("");
                              setUnsavedChanges(true);
                            }}
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Clear All
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Clear all physical exam fields
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Fill all normal button */}
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-gray-200 text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#2C78E4] text-xs h-8 rounded-lg"
                      onClick={() => {
                        setWeight("");
                        setTemperature("");
                        setHeartRate("");
                        setRespiratoryRate("");
                        setUnsavedChanges(true);
                      }}
                    >
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Fill All Normal
                    </Button> */}
                  </div>
                </div>

                {/* Vital Signs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-3 bg-[#F0F7FF] border-b border-gray-100">
                    <h3 className="font-medium text-[#111827] flex items-center text-sm">
                      <Activity className="h-4 w-4 mr-2 text-[#2C78E4]" />
                      Vital Signs
                    </h3>
                    {/* Quick fill normal values for common species */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs rounded-lg bg-white text-[#2C78E4] hover:bg-[#E3F2FD] border-gray-200"
                        onClick={() => {
                          setTemperature("38.5");
                          setHeartRate("100");
                          setRespiratoryRate("20");
                          setUnsavedChanges(true);
                        }}
                      >
                        Fill Dog Normal
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs rounded-lg bg-white text-[#2C78E4] hover:bg-[#E3F2FD] border-gray-200"
                        onClick={() => {
                          setTemperature("38.5");
                          setHeartRate("180");
                          setRespiratoryRate("25");
                          setUnsavedChanges(true);
                        }}
                      >
                        Fill Cat Normal
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <label className="block text-sm text-[#4B5563] uppercase font-medium mb-2">
                          Weight (kg)
                        </label>
                        <Input
                          type="number"
                          value={weight}
                          onChange={handleInputChange(setWeight)}
                          placeholder="Enter weight in kg"
                          className="bg-white border-gray-200 rounded-lg text-base h-11 focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />
                        {patient?.weight && (
                          <p className="text-sm text-[#2C78E4] mt-2 flex items-center">
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Previous: {patient.weight} kg
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 p-0 px-1.5 ml-1.5 text-xs text-[#2C78E4] hover:bg-[#E3F2FD]"
                              onClick={() => {
                                setWeight(patient.weight?.toString() || "");
                                setUnsavedChanges(true);
                              }}
                            >
                              Use
                            </Button>
                          </p>
                        )}
                      </div>
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <label className="block text-sm text-[#4B5563] uppercase font-medium mb-2">
                          Temperature (°C)
                        </label>
                        <Input
                          type="number"
                          value={temperature}
                          onChange={handleInputChange(setTemperature)}
                          placeholder="Enter temperature in °C"
                          className="bg-white border-gray-200 rounded-lg text-base h-11 focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />
                        <div className="flex justify-between mt-2">
                          <p className="text-sm text-[#4B5563]">
                            Normal: 37.5-39.2°C
                          </p>
                          {temperature && parseFloat(temperature) > 39.2 && (
                            <p className="text-sm text-amber-600 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              High temperature
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <label className="block text-sm text-[#4B5563] uppercase font-medium mb-2">
                          Heart Rate (bpm)
                        </label>
                        <Input
                          type="number"
                          value={heartRate}
                          onChange={handleInputChange(setHeartRate)}
                          placeholder="Enter heart rate in bpm"
                          className="bg-white border-gray-200 rounded-lg text-base h-11 focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />
                        <div className="flex justify-between mt-2">
                          <p className="text-sm text-[#4B5563]">
                            Normal:{" "}
                            {patient?.species?.toLowerCase() === "cat"
                              ? "140-220 bpm"
                              : "70-120 bpm"}
                          </p>
                        </div>
                      </div>
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <label className="block text-sm text-[#4B5563] uppercase font-medium mb-2">
                          Respiratory Rate (rpm)
                        </label>
                        <Input
                          type="number"
                          value={respiratoryRate}
                          onChange={handleInputChange(setRespiratoryRate)}
                          placeholder="Enter respiratory rate in rpm"
                          className="bg-white border-gray-200 rounded-lg text-base h-11 focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />
                        <div className="flex justify-between mt-2">
                          <p className="text-sm text-[#4B5563]">
                            Normal:{" "}
                            {patient?.species?.toLowerCase() === "cat"
                              ? "20-40 rpm"
                              : "10-30 rpm"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm text-[#4B5563] uppercase font-medium">
                            General Notes
                          </label>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-[#2C78E4] hover:bg-[#E3F2FD]"
                              onClick={() => {
                                setGeneralNotes(
                                  "Alert, responsive, and well-hydrated. No signs of distress."
                                );
                                setUnsavedChanges(true);
                              }}
                            >
                              Normal
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={generalNotes}
                          onChange={handleInputChange(setGeneralNotes)}
                          placeholder="Additional observations and notes"
                          rows={2}
                          className="bg-white border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Enhanced with patient info and actions */}
              <div className="space-y-5">
                {/* Patient Information Card with Quick Edit */}
                {patient && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 bg-[#F0F7FF] border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-medium text-[#111827] flex items-center text-base">
                        <User className="h-5 w-5 mr-2 text-[#2C78E4]" />
                        Patient Information
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-sm text-[#2C78E4] hover:bg-[#E3F2FD] border-gray-200"
                      >
                        <span>Quick Edit</span>
                      </Button>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-4 text-base">
                        <div>
                          <p className="text-sm text-[#4B5563]">Type</p>
                          <p className="font-medium text-[#111827]">
                            {patient.type || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563]">Breed</p>
                          <p className="font-medium text-[#111827]">
                            {patient.breed || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563]">Age</p>
                          <p className="font-medium text-[#111827]">
                            {patient.age || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563]">Sex</p>
                          <p className="font-medium text-[#111827]">
                            {patient.gender || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563]">Weight</p>
                          <p className="font-medium text-[#111827]">
                            {patient.weight
                              ? `${patient.weight} kg`
                              : "Unknown"}
                          </p>
                        </div>
                      </div>

                      {patient.medical_alerts && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <p className="text-sm text-[#4B5563] mb-2">
                            Medical Alerts
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {patient.medical_alerts
                              .split(",")
                              .map((alert: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-red-50 border-red-200 text-red-700 text-sm px-2.5 py-1"
                                >
                                  {alert.trim()}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Subjective Data from SOAP */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 bg-[#F0F7FF] border-b border-gray-100">
                    <h3 className="font-medium text-[#111827] flex items-center text-base">
                      <MessageCircle className="h-5 w-5 mr-2 text-[#2C78E4]" />
                      Patient Complaints
                      {!isSoapLoading && soap?.subjective && Array.isArray(soap.subjective) && (
                        <Badge className="ml-2 bg-[#E3F2FD] text-[#2C78E4] px-2 py-0.5 text-xs font-medium">
                          {soap.subjective.length} items
                        </Badge>
                      )}
                    </h3>
                  </div>
                  <div className="p-0">
                    {isSoapLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 text-[#2C78E4] animate-spin mr-2" />
                        <span className="text-sm text-gray-500">Loading patient complaints...</span>
                      </div>
                    ) : (
                      <SubjectiveKeyValueDisplay data={soap?.subjective} />
                    )}
                  </div>
                </div>

                {/* Next Workflow */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 bg-[#F0F7FF] border-b border-gray-100">
                    <h3 className="font-medium text-[#111827] flex items-center text-base">
                      <ChevronDown className="h-5 w-5 mr-2 text-[#2C78E4]" />
                      Next Workflow
                    </h3>
                  </div>
                  <div className="p-5">
                    <div>
                      <h4 className="text-sm font-medium text-[#4B5563] mb-3">
                        Quick Actions
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-sm h-9 text-[#2C78E4] hover:bg-[#E3F2FD] border-gray-200 rounded-lg"
                          onClick={navigateToHealthCard}
                        >
                          <Heart className="mr-2 h-4 w-4 text-[#2C78E4]" />
                          View Health Card
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-sm h-9 text-[#2C78E4] hover:bg-[#E3F2FD] border-gray-200 rounded-lg"
                          onClick={navigateToLabManagement}
                        >
                          <FlaskConical className="mr-2 h-4 w-4 text-[#2C78E4]" />
                          Order Lab Tests
                        </Button>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <Button
                        onClick={saveExamination}
                        size="sm"
                        className="w-full bg-[#2C78E4] hover:bg-[#1E40AF] text-white text-sm h-10 rounded-lg transition-colors"
                      >
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Save Examination
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="systems" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-5">
                {/* Quick Actions Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3">
                  <div className="p-4 flex flex-wrap gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-gray-200 text-[#4B5563] text-sm h-9 rounded-lg"
                            onClick={() => {
                              setCardiovascular("");
                              setRespiratory("");
                              setGastrointestinal("");
                              setMusculoskeletal("");
                              setNeurological("");
                              setSkin("");
                              setEyes("");
                              setEars("");
                              setUnsavedChanges(true);
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear All
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Clear all system exam fields
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-gray-200 text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#2C78E4] text-sm h-9 rounded-lg"
                      onClick={() => {
                        setCardiovascular(
                          "Normal heart sounds, no murmurs detected."
                        );
                        setRespiratory(
                          "Normal respiratory sounds, no crackles or wheezes."
                        );
                        setGastrointestinal(
                          "Normal abdomen on palpation, no signs of discomfort."
                        );
                        setMusculoskeletal(
                          "Normal gait and posture, no lameness observed."
                        );
                        setNeurological(
                          "Alert and responsive, no neurological deficits noted."
                        );
                        setSkin(
                          "Good coat condition, no lesions or parasites."
                        );
                        setEyes("Clear, no discharge or abnormalities.");
                        setEars("Clean, no inflammation or discharge.");
                        setUnsavedChanges(true);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Fill All Normal
                    </Button>
                  </div>
                </div>

                {/* Cardiovascular and Respiratory */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex justify-between items-center px-5 py-4 bg-[#F0F7FF] border-b border-gray-100">
                    <h3 className="font-medium text-[#111827] flex items-center text-base">
                      <Heart className="h-5 w-5 mr-2 text-[#2C78E4]" />
                      Cardiovascular & Respiratory
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm text-[#4B5563] uppercase font-medium">
                            Cardiovascular
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-sm text-[#2C78E4] hover:bg-[#E3F2FD]"
                            onClick={() => {
                              setCardiovascular(
                                "Normal heart sounds, no murmurs detected."
                              );
                              setUnsavedChanges(true);
                            }}
                          >
                            Normal
                          </Button>
                        </div>
                        <Textarea
                          value={cardiovascular}
                          onChange={handleInputChange(setCardiovascular)}
                          placeholder="Heart sounds, pulses, etc."
                          rows={2}
                          className="bg-white border-gray-200 rounded-lg text-base focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />
                      </div>
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm text-[#4B5563] uppercase font-medium">
                            Respiratory
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-sm text-[#2C78E4] hover:bg-[#E3F2FD]"
                            onClick={() => {
                              setRespiratory(
                                "Normal respiratory sounds, no crackles or wheezes."
                              );
                              setUnsavedChanges(true);
                            }}
                          >
                            Normal
                          </Button>
                        </div>
                        <Textarea
                          value={respiratory}
                          onChange={handleInputChange(setRespiratory)}
                          placeholder="Lung sounds, breathing pattern, etc."
                          rows={2}
                          className="bg-white border-gray-200 rounded-lg text-base focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digestive and Musculoskeletal */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex justify-between items-center px-5 py-4 bg-[#F0F7FF] border-b border-gray-100">
                    <h3 className="font-medium text-[#111827] flex items-center text-base">
                      <Activity className="h-5 w-5 mr-2 text-[#2C78E4]" />
                      Gastrointestinal & Musculoskeletal
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs text-[#4B5563] uppercase font-medium">
                            Gastrointestinal
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-[#2C78E4] hover:bg-[#E3F2FD]"
                            onClick={() => {
                              setGastrointestinal(
                                "Normal abdomen on palpation, no signs of discomfort."
                              );
                              setUnsavedChanges(true);
                            }}
                          >
                            Normal
                          </Button>
                        </div>
                        <Textarea
                          value={gastrointestinal}
                          onChange={handleInputChange(setGastrointestinal)}
                          placeholder="Abdomen, oral cavity, etc."
                          rows={2}
                          className="bg-white border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />
                      </div>
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs text-[#4B5563] uppercase font-medium">
                            Musculoskeletal
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-[#2C78E4] hover:bg-[#E3F2FD]"
                            onClick={() => {
                              setMusculoskeletal(
                                "Normal gait and posture, no lameness observed."
                              );
                              setUnsavedChanges(true);
                            }}
                          >
                            Normal
                          </Button>
                        </div>
                        <Textarea
                          value={musculoskeletal}
                          onChange={handleInputChange(setMusculoskeletal)}
                          placeholder="Gait, joints, muscles, etc."
                          rows={2}
                          className="bg-white border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remaining sections - Neurological, Skin, Eyes, Ears */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex justify-between items-center px-5 py-4 bg-[#F0F7FF] border-b border-gray-100">
                    <h3 className="font-medium text-[#111827] flex items-center text-base">
                      <ScanLine className="h-5 w-5 mr-2 text-[#2C78E4]" />
                      Neurological & Skin
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs text-[#4B5563] uppercase font-medium">
                            Neurological
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-[#2C78E4] hover:bg-[#E3F2FD]"
                            onClick={() => {
                              setNeurological(
                                "Alert and responsive, no neurological deficits noted."
                              );
                              setUnsavedChanges(true);
                            }}
                          >
                            Normal
                          </Button>
                        </div>
                        <Textarea
                          value={neurological}
                          onChange={handleInputChange(setNeurological)}
                          placeholder="Reflexes, responses, etc."
                          rows={2}
                          className="bg-white border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />
                      </div>
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs text-[#4B5563] uppercase font-medium">
                            Skin/Coat
                          </label>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-[#2C78E4] hover:bg-[#E3F2FD]"
                              onClick={() => {
                                setSkin(
                                  "Good coat condition, no lesions or parasites."
                                );
                                setUnsavedChanges(true);
                              }}
                            >
                              Normal
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={skin}
                          onChange={handleInputChange(setSkin)}
                          placeholder="Lesions, parasites, etc."
                          rows={2}
                          className="bg-white border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />

                        {/* Quick selection options for common skin findings */}
                        <div className="mt-3">
                          <p className="text-sm text-[#4B5563] mb-2">
                            Quick Selections:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Good coat quality",
                              "Poor coat quality",
                              "Alopecia",
                              "Erythema",
                              "Pruritus",
                              "Papules",
                              "Pustules",
                              "Crusts",
                              "Scales",
                              "Ectoparasites",
                              "Hot spot",
                              "Dermatitis",
                            ].map((finding, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-white border-gray-200 text-[#111827] text-sm px-2.5 py-1.5 cursor-pointer hover:bg-[#E3F2FD] hover:border-[#2C78E4] transition-colors"
                                onClick={() => {
                                  setSkin(
                                    skin ? `${skin}, ${finding}` : finding
                                  );
                                  setUnsavedChanges(true);
                                }}
                              >
                                {finding}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex justify-between items-center px-5 py-4 bg-[#F0F7FF] border-b border-gray-100">
                    <h3 className="font-medium text-[#111827] flex items-center text-base">
                      <Eye className="h-5 w-5 mr-2 text-[#2C78E4]" />
                      Special Senses
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs text-[#4B5563] uppercase font-medium">
                            Eyes
                          </label>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-[#2C78E4] hover:bg-[#E3F2FD]"
                              onClick={() => {
                                setEyes(
                                  "Clear, no discharge or abnormalities."
                                );
                                setUnsavedChanges(true);
                              }}
                            >
                              Normal
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={eyes}
                          onChange={handleInputChange(setEyes)}
                          placeholder="Pupils, discharge, etc."
                          rows={2}
                          className="bg-white border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />

                        {/* Quick selection options for common eye findings */}
                        <div className="mt-3">
                          <p className="text-sm text-[#4B5563] mb-2">
                            Quick Selections:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Clear conjunctiva",
                              "Mild conjunctivitis",
                              "Moderate conjunctivitis",
                              "Serous discharge",
                              "Mucopurulent discharge",
                              "Corneal ulcer",
                              "Corneal opacity",
                              "Cataracts",
                              "Nuclear sclerosis",
                              "Normal PLR",
                            ].map((finding, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-white border-gray-200 text-[#111827] text-sm px-2.5 py-1.5 cursor-pointer hover:bg-[#E3F2FD] hover:border-[#2C78E4] transition-colors"
                                onClick={() => {
                                  setEyes(
                                    eyes ? `${eyes}, ${finding}` : finding
                                  );
                                  setUnsavedChanges(true);
                                }}
                              >
                                {finding}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#F9FAFB] p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs text-[#4B5563] uppercase font-medium">
                            Ears
                          </label>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-[#2C78E4] hover:bg-[#E3F2FD]"
                              onClick={() => {
                                setEars("Clean, no inflammation or discharge.");
                                setUnsavedChanges(true);
                              }}
                            >
                              Normal
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          value={ears}
                          onChange={handleInputChange(setEars)}
                          placeholder="Discharge, inflammation, etc."
                          rows={2}
                          className="bg-white border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
                        />

                        {/* Quick selection options for common ear findings */}
                        <div className="mt-3">
                          <p className="text-sm text-[#4B5563] mb-2">
                            Quick Selections:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Clean canal",
                              "Mild erythema",
                              "Moderate erythema",
                              "Severe erythema",
                              "Waxy discharge",
                              "Purulent discharge",
                              "Otitis externa",
                              "Foreign body",
                            ].map((finding, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-white border-gray-200 text-[#111827] text-sm px-2.5 py-1.5 cursor-pointer hover:bg-[#E3F2FD] hover:border-[#2C78E4] transition-colors"
                                onClick={() => {
                                  setEars(
                                    ears ? `${ears}, ${finding}` : finding
                                  );
                                  setUnsavedChanges(true);
                                }}
                              >
                                {finding}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subjective Data from SOAP */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 bg-[#F0F7FF] border-b border-gray-100">
                    <h3 className="font-medium text-[#111827] flex items-center text-base">
                      <MessageCircle className="h-5 w-5 mr-2 text-[#2C78E4]" />
                      Patient Complaints
                      {!isSoapLoading && soap?.subjective && Array.isArray(soap.subjective) && (
                        <Badge className="ml-2 bg-[#E3F2FD] text-[#2C78E4] px-2 py-0.5 text-xs font-medium">
                          {soap.subjective.length} items
                        </Badge>
                      )}
                    </h3>
                  </div>
                  <div className="p-0">
                    {isSoapLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 text-[#2C78E4] animate-spin mr-2" />
                        <span className="text-sm text-gray-500">Loading patient complaints...</span>
                      </div>
                    ) : (
                      <SubjectiveKeyValueDisplay data={soap?.subjective} />
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar - same structure as the physical tab */}
              <div className="space-y-5">
                {/* Patient Information Card */}
                {patient && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 bg-[#F0F7FF] border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-medium text-[#111827] flex items-center text-base">
                        <User className="h-5 w-5 mr-2 text-[#2C78E4]" />
                        Patient Information
                      </h3>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-sm text-[#2C78E4] hover:bg-[#E3F2FD] border-gray-200"
                      >
                        <span>Quick Edit</span>
                      </Button> */}
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-4 text-base">
                        <div>
                          <p className="text-sm text-[#4B5563]">Type</p>
                          <p className="font-medium text-[#111827]">
                            {patient.type || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563]">Breed</p>
                          <p className="font-medium text-[#111827]">
                            {patient.breed || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563]">Age</p>
                          <p className="font-medium text-[#111827]">
                            {patient.age || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563]">Gender</p>
                          <p className="font-medium text-[#111827]">
                            {patient.gender || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#4B5563]">Weight</p>
                          <p className="font-medium text-[#111827]">
                            {patient.weight
                              ? `${patient.weight} kg`
                              : "Unknown"}
                          </p>
                        </div>
                      </div>

                      {patient.medical_alerts && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <p className="text-sm text-[#4B5563] mb-2">
                            Medical Alerts
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {patient.medical_alerts
                              .split(",")
                              .map((alert: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-red-50 border-red-200 text-red-700 text-sm px-2.5 py-1"
                                >
                                  {alert.trim()}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 bg-[#F0F7FF] border-b border-gray-100">
                    <h3 className="font-medium text-[#111827] flex items-center text-base">
                      <ChevronDown className="h-5 w-5 mr-2 text-[#2C78E4]" />
                      Next Workflow
                    </h3>
                  </div>
                  <div className="p-5">
                    <div>
                      <h4 className="text-sm font-medium text-[#4B5563] mb-3">
                        Quick Actions
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-sm h-9 text-[#2C78E4] hover:bg-[#E3F2FD] border-gray-200 rounded-lg"
                          onClick={navigateToHealthCard}
                        >
                          <Heart className="mr-2 h-4 w-4 text-[#2C78E4]" />
                          View Health Card
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-sm h-9 text-[#2C78E4] hover:bg-[#E3F2FD] border-gray-200 rounded-lg"
                          onClick={navigateToLabManagement}
                        >
                          <FlaskConical className="mr-2 h-4 w-4 text-[#2C78E4]" />
                          Order Lab Tests
                        </Button>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <Button
                        onClick={saveExamination}
                        size="sm"
                        className="w-full bg-[#2C78E4] hover:bg-[#1E40AF] text-white text-sm h-10 rounded-lg transition-colors"
                      >
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Save Examination
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Quick Patient Edit Form Component
const QuickPatientEditForm: React.FC<{ patient: any }> = ({ patient }) => {
  const [name, setName] = useState(patient.name || "");
  const [species, setSpecies] = useState(patient.type || "");
  const [breed, setBreed] = useState(patient.breed || "");
  const [age, setAge] = useState(patient.age?.toString() || "");
  const [weight, setWeight] = useState(patient.weight?.toString() || "");
  const [sex, setSex] = useState(patient.gender || "");
  const [birthDate, setBirthDate] = useState(patient.birth_date || "");
  const [microchipNumber, setMicrochipNumber] = useState(
    patient.microchip_number || ""
  );
  const [medicalAlerts, setMedicalAlerts] = useState(
    patient.medical_alerts || ""
  );

  const updatePetRequest: updatePetRequest = {
    name: name,
    type: species,
    breed: breed,
    age: parseInt(age) || 0,
    weight: parseFloat(weight) || 0,
    gender: sex,
    bod: birthDate,
    microchip_number: microchipNumber,
    healthnotes: medicalAlerts || "",
  };

  console.log(patient);
  // Set up the mutation
  const updatePatientMutation = useUpdatePet(patient.petid, updatePetRequest);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientMutation.mutate();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 py-4 bg-white text-gray-900"
    >
      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2 bg-white">
        <div className="bg-white">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pet name"
            className="w-full bg-white border-gray-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 bg-white">
          <div className="bg-white">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Species
            </label>
            <Select value={species} onValueChange={setSpecies}>
              <SelectTrigger className="w-full bg-white border-gray-300">
                <SelectValue placeholder="Select species" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Dog" className="text-gray-900">
                  Dog
                </SelectItem>
                <SelectItem value="Cat" className="text-gray-900">
                  Cat
                </SelectItem>
                <SelectItem value="Bird" className="text-gray-900">
                  Bird
                </SelectItem>
                <SelectItem value="Rabbit" className="text-gray-900">
                  Rabbit
                </SelectItem>
                <SelectItem value="Other" className="text-gray-900">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Breed
            </label>
            <Input
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Breed"
              className="w-full bg-white border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-white">
          <div className="bg-white">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Age
            </label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age in years"
              className="w-full bg-white border-gray-300"
            />
          </div>

          <div className="bg-white">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Weight (kg)
            </label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight in kg"
              className="w-full bg-white border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-white">
          <div className="bg-white">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Sex
            </label>
            <Select value={sex} onValueChange={setSex}>
              <SelectTrigger className="w-full bg-white border-gray-300">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Male" className="text-gray-900">
                  Male
                </SelectItem>
                <SelectItem value="Female" className="text-gray-900">
                  Female
                </SelectItem>
                <SelectItem value="Male (neutered)" className="text-gray-900">
                  Male (neutered)
                </SelectItem>
                <SelectItem value="Female (spayed)" className="text-gray-900">
                  Female (spayed)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Birth Date
            </label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-white border-gray-300"
            />
          </div>
        </div>

        <div className="bg-white">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Microchip Number
          </label>
          <Input
            value={microchipNumber}
            onChange={(e) => setMicrochipNumber(e.target.value)}
            placeholder="Microchip ID"
            className="w-full bg-white border-gray-300"
          />
        </div>

        <div className="bg-white">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Health Notes
          </label>
          <Textarea
            value={medicalAlerts}
            onChange={(e) => setMedicalAlerts(e.target.value)}
            placeholder="Health conditions, allergies, etc."
            rows={3}
            className="w-full bg-white border-gray-300"
          />
        </div>
      </div>

      <DialogFooter className="bg-white border-t border-gray-100 pt-4">
        <Button
          type="submit"
          disabled={updatePatientMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {updatePatientMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default Examination;
