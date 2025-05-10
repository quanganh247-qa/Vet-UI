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

const Examination: React.FC = () => {
  // Lấy params từ cả route params và query params
  const { id: routeId } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { doctor } = useAuth();

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
        primary: soap?.assessment || "",
        differentials: [],
        notes: ""
      };

      // Save to SOAP notes
      await updateSoapMutation.mutateAsync({
        appointmentID: effectiveAppointmentId,
        subjective: soap?.subjective || "", // This would be filled in the SOAP screen
        objective: objectiveData,
        assessment: assessmentData, // Now sending properly structured assessment data
        plan: soap?.plan || "", // changed from "" to 0
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
      await new Promise((resolve) => setTimeout(resolve, 300));

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

  // Navigate to patient page
  const navigateToPatient = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id,
    };
    navigate(`/patient${buildUrlParams(params)}`);
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

  // Keyboard shortcut handler - placed after all function declarations
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

  // Add a function to handle back navigation
  const navigateBack = () => {
    window.history.back();
  };

  if (isAppointmentLoading || isPatientLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">
            Loading examination details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
            onClick={navigateToPatient}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Patient</span>
          </Button>
          <h1 className="text-white font-semibold text-lg">
            Clinical Examination
          </h1>
        </div>
      </div>

      {/* Template Dialog */}
      <Dialog>
        <DialogContent className="sm:max-w-md">
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

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcutHelp} onOpenChange={setShowShortcutHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these shortcuts to work more efficiently
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">
                  Ctrl+S
                </kbd>
                <span>Quick Save</span>
              </div>
              <div className="flex items-center">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">
                  Alt+1
                </kbd>
                <span>Physical Exam Tab</span>
              </div>
              <div className="flex items-center">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">
                  Alt+2
                </kbd>
                <span>Systems Exam Tab</span>
              </div>
              <div className="flex items-center">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">
                  Alt+T
                </kbd>
                <span>Templates Menu</span>
              </div>
              <div className="flex items-center">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">
                  Alt+Enter
                </kbd>
                <span>Save & Continue</span>
              </div>
              <div className="flex items-center">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">
                  Esc
                </kbd>
                <span>Close Popup</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowShortcutHelp(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Navigation */}
      <div className="px-4 pt-3">
        <WorkflowNavigation
          appointmentId={effectiveAppointmentId}
          petId={patient?.pet_id?.toString()}
          currentStep="examination"
        />
      </div>

      {/* Main Content */}
      <div className="px-4 py-3">
        <Tabs
          defaultValue="physical"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <div className="border-b pb-2 mb-3 overflow-x-auto">
            <TabsList className="grid grid-cols-2 bg-gray-100 p-1 rounded-md w-full shadow-sm">
              <TabsTrigger
                value="physical"
                className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow py-1.5 px-2.5 text-xs font-medium transition-all"
              >
                <Thermometer className="h-3.5 w-3.5" />
                <span>Physical Examination</span>
              </TabsTrigger>
              <TabsTrigger
                value="systems"
                className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow py-1.5 px-2.5 text-xs font-medium transition-all"
              >
                <ScanLine className="h-3.5 w-3.5" />
                <span>Systems Examination</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="physical" className="mt-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-3">
                {/* Quick Actions Bar */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-3">
                  <div className="p-2 flex flex-wrap gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-indigo-50 border-indigo-100 text-indigo-700 text-xs h-7"
                            onClick={() => {
                              setWeight("");
                              setTemperature("");
                              setHeartRate("");
                              setRespiratoryRate("");
                              setGeneralNotes("");
                              setUnsavedChanges(true);
                            }}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
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

                    {/* Normal ranges reference button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 border-green-100 text-green-700 text-xs h-7"
                          >
                            <Table className="h-3 w-3 mr-1" />
                            Normal Ranges
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="w-64">
                          <div className="text-xs">
                            <p className="font-medium mb-1">
                              Normal Reference Ranges:
                            </p>
                            <ul className="space-y-1">
                              <li>
                                Temperature: 37.5-39.2°C (dog), 38.0-39.2°C
                                (cat)
                              </li>
                              <li>
                                Heart Rate: 70-120 bpm (dog), 140-220 bpm (cat)
                              </li>
                              <li>
                                Respiratory Rate: 10-30 rpm (dog), 20-40 rpm
                                (cat)
                              </li>
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Vital Signs */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <div className="flex justify-between items-center px-3 py-2 bg-gradient-to-r from-indigo-50 to-white border-b">
                    <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                      <Activity className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Vital Signs
                    </h3>
                    {/* Quick fill normal values for common species */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-indigo-600 hover:bg-indigo-50"
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
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-indigo-600 hover:bg-indigo-50"
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
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Weight (kg)
                        </label>
                        <Input
                          type="number"
                          value={weight}
                          onChange={handleInputChange(setWeight)}
                          placeholder="Enter weight in kg"
                          className="bg-white border-gray-200 text-sm h-8 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {patient?.weight && (
                          <p className="text-xs text-indigo-600 mt-1 flex items-center">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Previous: {patient.weight} kg
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 p-0 px-1 ml-1 text-[10px] text-indigo-600 hover:bg-indigo-50"
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
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Temperature (°C)
                        </label>
                        <Input
                          type="number"
                          value={temperature}
                          onChange={handleInputChange(setTemperature)}
                          placeholder="Enter temperature in °C"
                          className="bg-white border-gray-200 text-sm h-8 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            Normal: 37.5-39.2°C
                          </p>
                          {temperature && parseFloat(temperature) > 39.2 && (
                            <p className="text-xs text-amber-600 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              High temperature
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Heart Rate (bpm)
                        </label>
                        <Input
                          type="number"
                          value={heartRate}
                          onChange={handleInputChange(setHeartRate)}
                          placeholder="Enter heart rate in bpm"
                          className="bg-white border-gray-200 text-sm h-8 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            Normal:{" "}
                            {patient?.species?.toLowerCase() === "cat"
                              ? "140-220 bpm"
                              : "70-120 bpm"}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Respiratory Rate (rpm)
                        </label>
                        <Input
                          type="number"
                          value={respiratoryRate}
                          onChange={handleInputChange(setRespiratoryRate)}
                          placeholder="Enter respiratory rate in rpm"
                          className="bg-white border-gray-200 text-sm h-8 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            Normal:{" "}
                            {patient?.species?.toLowerCase() === "cat"
                              ? "20-40 rpm"
                              : "10-30 rpm"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-gray-500 uppercase font-medium">
                            General Notes
                          </label>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-indigo-600 hover:bg-indigo-50"
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
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Enhanced with patient info and actions */}
              <div className="space-y-3">
                {/* Patient Information Card with Quick Edit */}
                {patient && (
                  <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-white border-b flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                        <Stethoscope className="h-4 w-4 mr-1.5 text-indigo-600" />
                        Patient Information
                      </h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-indigo-600 hover:bg-indigo-50"
                          >
                            <span>Quick Edit</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white border-0 shadow-lg">
                          <DialogHeader className="bg-white">
                            <DialogTitle className="text-gray-900">
                              Update Patient Information
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Make quick updates to this patient's details
                            </DialogDescription>
                          </DialogHeader>

                          <QuickPatientEditForm patient={patient} />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="font-medium">
                            {patient.type || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Breed</p>
                          <p className="font-medium">
                            {patient.breed || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Age</p>
                          <p className="font-medium">
                            {patient.age || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Sex</p>
                          <p className="font-medium">
                            {patient.gender || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Weight</p>
                          <p className="font-medium">
                            {patient.weight
                              ? `${patient.weight} kg`
                              : "Unknown"}
                          </p>
                        </div>
                      </div>

                      {patient.medical_alerts && (
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">
                            Medical Alerts
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {patient.medical_alerts
                              .split(",")
                              .map((alert: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-red-50 border-red-200 text-red-700 text-xs"
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

                {/* Next Workflow */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-white border-b">
                    <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                      <Stethoscope className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Next Workflow
                    </h3>
                  </div>
                  <div className="p-3">
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">
                        Quick Actions
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-8"
                          onClick={navigateToLabManagement}
                        >
                          <FlaskConical className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                          Order Lab Tests
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-8"
                          onClick={navigateToSOAP}
                        >
                          <FileText className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                          SOAP Notes
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Button
                        onClick={saveExamination}
                        size="sm"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                        Save Examination
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="systems" className="mt-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-3">
                {/* Quick Actions Bar */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-3">
                  <div className="p-2 flex flex-wrap gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-indigo-50 border-indigo-100 text-indigo-700 text-xs h-7"
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
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Clear All
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Clear all system exam fields
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-50 border-green-100 text-green-700 text-xs h-7"
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
                      <Check className="h-3 w-3 mr-1" />
                      Fill All Normal
                    </Button>
                  </div>
                </div>

                {/* Cardiovascular and Respiratory */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-white border-b">
                    <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                      <Heart className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Cardiovascular & Respiratory
                    </h3>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-gray-500 uppercase font-medium">
                            Cardiovascular
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-indigo-600 hover:bg-indigo-50"
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
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-gray-500 uppercase font-medium">
                            Respiratory
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-indigo-600 hover:bg-indigo-50"
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
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digestive and Musculoskeletal */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-white border-b">
                    <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                      <Activity className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Gastrointestinal & Musculoskeletal
                    </h3>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-gray-500 uppercase font-medium">
                            Gastrointestinal
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-indigo-600 hover:bg-indigo-50"
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
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-gray-500 uppercase font-medium">
                            Musculoskeletal
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-indigo-600 hover:bg-indigo-50"
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
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remaining sections - Neurological, Skin, Eyes, Ears */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-white border-b">
                    <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                      <ScanLine className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Neurological & Skin
                    </h3>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-gray-500 uppercase font-medium">
                            Neurological
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-indigo-600 hover:bg-indigo-50"
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
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-gray-500 uppercase font-medium">
                            Skin/Coat
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-indigo-600 hover:bg-indigo-50"
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
                        <Textarea
                          value={skin}
                          onChange={handleInputChange(setSkin)}
                          placeholder="Lesions, parasites, etc."
                          rows={2}
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-white border-b">
                    <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                      <Eye className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Special Senses
                    </h3>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-gray-500 uppercase font-medium">
                            Eyes
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-indigo-600 hover:bg-indigo-50"
                            onClick={() => {
                              setEyes("Clear, no discharge or abnormalities.");
                              setUnsavedChanges(true);
                            }}
                          >
                            Normal
                          </Button>
                        </div>
                        <Textarea
                          value={eyes}
                          onChange={handleInputChange(setEyes)}
                          placeholder="Pupils, discharge, etc."
                          rows={2}
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-gray-500 uppercase font-medium">
                            Ears
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-indigo-600 hover:bg-indigo-50"
                            onClick={() => {
                              setEars("Clean, no inflammation or discharge.");
                              setUnsavedChanges(true);
                            }}
                          >
                            Normal
                          </Button>
                        </div>
                        <Textarea
                          value={ears}
                          onChange={handleInputChange(setEars)}
                          placeholder="Discharge, inflammation, etc."
                          rows={2}
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - same as in physical tab */}
              <div className="space-y-3">
                {/* Patient Information Card */}
                {patient && (
                  <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-white border-b">
                      <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                        <Stethoscope className="h-4 w-4 mr-1.5 text-indigo-600" />
                        Patient Information
                      </h3>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Species</p>
                          <p className="font-medium">
                            {patient.type || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Breed</p>
                          <p className="font-medium">
                            {patient.breed || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Age</p>
                          <p className="font-medium">
                            {patient.age || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Gender</p>
                          <p className="font-medium">
                            {patient.gender || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Weight (kg)</p>
                          <p className="font-medium">
                            {patient.weight || "Unknown"}
                          </p>
                        </div>
                      </div>

                      {patient.medical_alerts && (
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">
                            Medical Alerts
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {patient.medical_alerts
                              .split(",")
                              .map((alert: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-red-50 border-red-200 text-red-700 text-xs"
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

                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-white border-b">
                    <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                      <Stethoscope className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Next Workflow
                    </h3>
                  </div>
                  <div className="p-3">
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">
                        Quick Actions
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-8"
                          onClick={navigateToLabManagement}
                        >
                          <FlaskConical className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                          Order Lab Tests
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-8"
                          onClick={navigateToSOAP}
                        >
                          <FileText className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                          SOAP Notes
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Button
                        onClick={saveExamination}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 text-xs"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
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
  const [species, setSpecies] = useState(patient.species || "");
  const [breed, setBreed] = useState(patient.breed || "");
  const [age, setAge] = useState(patient.age?.toString() || "");
  const [weight, setWeight] = useState(patient.weight?.toString() || "");
  const [sex, setSex] = useState(patient.sex || "");
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
