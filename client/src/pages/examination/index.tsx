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
  Weight,
  Brain,
  AlertTriangle,
  Clock,
  Target,
  BookOpen,
  CheckSquare,
  TrendingUp,
  Zap,
  UserCheck,
  ArrowRight,
  Settings,
  Timer,
  Shield,
  Bone,
  Shirt,
  Wind,
  Circle,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

// Enhanced Chief Complaint Display for Clinical Context
const ChiefComplaintDisplay = ({
  data,
}: {
  data: string | SubjectiveEntry[] | null | undefined;
}) => {
  const parseSubjectiveData = (
    value: string | SubjectiveEntry[] | null | undefined
  ): SubjectiveEntry[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value !== "string" || !value.trim()) return [];

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "object" && parsed !== null) {
        return Object.entries(parsed).map(([key, value]) => ({
          id: crypto.randomUUID(),
          key,
          value: String(value),
        }));
      }
    } catch (e) {
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
            key: "Chief Complaint",
            value: line.trim(),
          });
        }
      }
      return entries;
    }
    return [];
  };

  const entries = parseSubjectiveData(data);

  // Find chief complaint
  const chiefComplaint = entries.find(
    (entry) =>
      entry.key.toLowerCase().includes("chief") ||
      entry.key.toLowerCase().includes("complaint") ||
      entry.key.toLowerCase().includes("presenting")
  );

  if (!data || entries.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            No presenting complaint available
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chiefComplaint && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 text-sm">
                Chief Complaint
              </h4>
              <p className="text-red-800 text-sm mt-1">
                {chiefComplaint.value}
              </p>
            </div>
          </div>
        </div>
      )}

      {entries.filter((e) => !e.key.toLowerCase().includes("chief")).length >
        0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Additional History
          </h4>
          <div className="space-y-2">
            {entries
              .filter((e) => !e.key.toLowerCase().includes("chief"))
              .map((entry) => (
                <div key={entry.id} className="flex gap-2 text-sm">
                  <span className="font-medium text-blue-700 min-w-[80px]">
                    {entry.key}:
                  </span>
                  <span className="text-blue-800">{entry.value}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Vital Signs Component with Clinical Ranges
const VitalSignsCard = ({
  weight,
  setWeight,
  temperature,
  setTemperature,
  heartRate,
  setHeartRate,
  respiratoryRate,
  setRespiratoryRate,
  generalNotes,
  setGeneralNotes,
  patient,
  handleInputChange,
  setUnsavedChanges,
}: any) => {
  const getVitalStatus = (vital: string, value: string, species: string) => {
    if (!value) return "missing";
    const numValue = parseFloat(value);
  };

  const vitals = [
    {
      name: "Weight",
      value: weight,
      setter: setWeight,
      unit: "kg",
      icon: <Weight className="h-5 w-5" />,
      normal: "Varies by species",
      color: "blue",
    },
    {
      name: "Temperature",
      value: temperature,
      setter: setTemperature,
      unit: "°C",
      icon: <Thermometer className="h-5 w-5" />,
      normal: "37.5-39.2°C",
      color: "red",
    },
    {
      name: "Heart Rate",
      value: heartRate,
      setter: setHeartRate,
      unit: "bpm",
      icon: <Heart className="h-5 w-5" />,
      normal:
        patient?.species?.toLowerCase() === "cat"
          ? "140-220 bpm"
          : "70-120 bpm",
      color: "pink",
    },
    {
      name: "Respiratory Rate",
      value: respiratoryRate,
      setter: setRespiratoryRate,
      unit: "rpm",
      icon: <Activity className="h-5 w-5" />,
      normal:
        patient?.species?.toLowerCase() === "cat" ? "20-40 rpm" : "10-30 rpm",
      color: "green",
    },
  ];

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg">Vital Signs Assessment</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTemperature("38.5");
                setHeartRate("100");
                setRespiratoryRate("20");
                setUnsavedChanges(true);
              }}
              className="h-8 text-xs"
            >
              Dog Normal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTemperature("38.0");
                setHeartRate("180");
                setRespiratoryRate("25");
                setUnsavedChanges(true);
              }}
              className="h-8 text-xs"
            >
              Cat Normal
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vitals.map((vital, index) => {
            const status =
              vital.name !== "Weight"
                ? getVitalStatus(vital.name, vital.value, patient?.species)
                : "normal";
            const hasValue = vital.value && vital.value.trim() !== "";

            return (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${
                  !hasValue
                    ? "border-gray-200 bg-gray-50"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`text-${vital.color}-600`}>
                      {vital.icon}
                    </div>
                    <span className="font-semibold text-gray-800">
                      {vital.name}
                    </span>
                  </div>
                </div>

                <Input
                  type="number"
                  value={vital.value}
                  onChange={handleInputChange(vital.setter)}
                  placeholder={`Enter ${vital.name.toLowerCase()}`}
                  className="mb-2 text-lg font-semibold"
                />

                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>Normal: {vital.normal}</span>
                  {patient?.weight && vital.name === "Weight" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 p-1 text-xs text-[#2C78E4]"
                      onClick={() => {
                        vital.setter(patient.weight?.toString() || "");
                        setUnsavedChanges(true);
                      }}
                    >
                      Use Previous: {patient.weight}kg
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Clinical Notes
          </label>
          <Textarea
            value={generalNotes}
            onChange={handleInputChange(setGeneralNotes)}
            placeholder="Overall clinical impression, hydration status, demeanor..."
            rows={3}
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Physical Examination Component
const PhysicalExaminationCard = ({
  cardiovascular,
  setCardiovascular,
  respiratory,
  setRespiratory,
  gastrointestinal,
  setGastrointestinal,
  musculoskeletal,
  setMusculoskeletal,
  neurological,
  setNeurological,
  skin,
  setSkin,
  eyes,
  setEyes,
  ears,
  setEars,
  handleInputChange,
  setUnsavedChanges,
}: any) => {
  const systemGroups = [
    {
      title: "Cardiopulmonary System",
      icon: <Heart className="h-5 w-5 text-red-500" />,
      color: "red",
      systems: [
        {
          name: "Cardiovascular",
          value: cardiovascular,
          setter: setCardiovascular,
          icon: <Heart className="h-4 w-4 text-red-500" />,
          normalText:
            "Normal heart sounds, no murmurs detected. Regular rhythm and rate.",
          quickFindings: [
            "Normal heart sounds",
            "Grade 1/6 murmur",
            "Grade 2/6 murmur",
            "Arrhythmia",
            "Weak pulses",
            "Strong pulses",
          ],
        },
        {
          name: "Respiratory",
          value: respiratory,
          setter: setRespiratory,
          icon: <Wind className="h-4 w-4 text-blue-500" />,
          normalText:
            "Normal respiratory sounds bilaterally. No crackles, wheezes, or stridor.",
          quickFindings: [
            "Clear lung sounds",
            "Mild crackles",
            "Wheezes",
            "Decreased sounds",
            "Harsh breathing",
            "Cough present",
          ],
        },
      ],
    },
    {
      title: "Digestive & Locomotor",
      icon: <Activity className="h-5 w-5 text-green-500" />,
      color: "green",
      systems: [
        {
          name: "Gastrointestinal",
          value: gastrointestinal,
          setter: setGastrointestinal,
          icon: <Circle className="h-4 w-4 text-orange-500" />,
          normalText:
            "Abdomen soft and non-painful on palpation. Normal bowel sounds.",
          quickFindings: [
            "Soft abdomen",
            "Mild distension",
            "Painful abdomen",
            "Mass palpated",
            "Normal dentition",
            "Dental disease",
          ],
        },
        {
          name: "Musculoskeletal",
          value: musculoskeletal,
          setter: setMusculoskeletal,
          icon: <Bone className="h-4 w-4 text-gray-600" />,
          normalText:
            "Normal gait and posture. No lameness or joint swelling detected.",
          quickFindings: [
            "Normal gait",
            "Mild lameness",
            "Moderate lameness",
            "Joint swelling",
            "Muscle atrophy",
            "Normal range of motion",
          ],
        },
      ],
    },
    {
      title: "Neurological & Integumentary",
      icon: <Brain className="h-5 w-5 text-purple-500" />,
      color: "purple",
      systems: [
        {
          name: "Neurological",
          value: neurological,
          setter: setNeurological,
          icon: <Brain className="h-4 w-4 text-purple-500" />,
          normalText: "Alert and responsive. Normal reflexes and coordination.",
          quickFindings: [
            "Alert and responsive",
            "Mild depression",
            "Ataxia",
            "Seizure activity",
            "Normal reflexes",
            "Decreased reflexes",
          ],
        },
        {
          name: "Integumentary",
          value: skin,
          setter: setSkin,
          icon: <Shirt className="h-4 w-4 text-green-500" />,
          normalText:
            "Good coat condition. No lesions, parasites, or abnormalities.",
          quickFindings: [
            "Good coat quality",
            "Poor coat quality",
            "Alopecia",
            "Erythema",
            "Pruritus",
            "Ectoparasites",
            "Lesions present",
          ],
        },
      ],
    },
    {
      title: "Special Senses",
      icon: <Eye className="h-5 w-5 text-blue-500" />,
      color: "blue",
      systems: [
        {
          name: "Ophthalmologic",
          value: eyes,
          setter: setEyes,
          icon: <Eye className="h-4 w-4 text-blue-600" />,
          normalText:
            "Eyes clear with no discharge. Normal pupillary light response.",
          quickFindings: [
            "Clear eyes",
            "Mild conjunctivitis",
            "Discharge present",
            "Corneal ulcer",
            "Cataracts",
            "Normal PLR",
          ],
        },
        {
          name: "Otic",
          value: ears,
          setter: setEars,
          icon: <Ear className="h-4 w-4 text-yellow-600" />,
          normalText: "Ears clean with no inflammation or discharge.",
          quickFindings: [
            "Clean ears",
            "Mild erythema",
            "Waxy discharge",
            "Purulent discharge",
            "Otitis externa",
            "Foreign body",
          ],
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {systemGroups.map((group, groupIndex) => {
        const hasFindings = group.systems.some((system) => system.value);

        return (
          <Card key={groupIndex}>
            <CardHeader
              className={`bg-gradient-to-r from-${group.color}-50 to-${group.color}-100 border-b`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {group.icon}
                  <CardTitle className="text-lg">{group.title}</CardTitle>
                </div>
                
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.systems.map((system, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{system.icon}</span>
                        <label className="font-semibold text-gray-800">
                          {system.name}
                        </label>
                      </div>
                      <Button   
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          system.setter(system.normalText);
                          setUnsavedChanges(true);
                        }}
                        className="h-8 text-xs text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Normal
                      </Button>
                    </div>

                    <Textarea
                      value={system.value}
                      onChange={handleInputChange(system.setter)}
                      placeholder={`Describe ${system.name.toLowerCase()} findings...`}
                      rows={3}
                      className="text-sm"
                    />

                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 font-medium">
                        Quick Select:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {system.quickFindings.map((finding, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            onClick={() => {
                              const currentValue = system.value;
                              const newValue = currentValue
                                ? `${currentValue}. ${finding}`
                                : finding;
                              system.setter(newValue);
                              setUnsavedChanges(true);
                            }}
                          >
                            + {finding}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const Examination: React.FC = () => {
  // Get params from both route params and query params
  const { id: routeId } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { doctor } = useAuth();

  // Workflow parameters
  const [workflowParams, setWorkflowParams] = useState<{
    appointmentId: string | null;
    petId: string | null;
  }>({
    appointmentId: null,
    petId: null,
  });

  // Handle URL parameters consistently
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    const urlPetId = searchParams.get("petId");

    console.log("Examination URL Params:", {
      urlAppointmentId,
      urlPetId,
      routeId,
    });

    let appointmentIdValue = urlAppointmentId || routeId || null;
    let petIdValue = urlPetId || null;

    setWorkflowParams({
      appointmentId: appointmentIdValue,
      petId: petIdValue,
    });
  }, [routeId]);

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

  const [activeTab, setActiveTab] = useState("vitals");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { data: soap, isLoading: isSoapLoading } = useGetSOAP(
    effectiveAppointmentId
  );

  console.log("soap-examination details:", {
    soap,
    type: soap ? typeof soap : "undefined",
    keys: soap ? Object.keys(soap) : [],
    subjective: soap?.subjective,
    subjectiveType: soap?.subjective ? typeof soap.subjective : "undefined",
    isEmptyArray:
      Array.isArray(soap?.subjective) && soap.subjective.length === 0,
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

  // Function to handle input changes and track unsaved changes
  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      setUnsavedChanges(true);
    };

  const updateSoapMutation = useUpdateSOAP();

  // Load examination data from SOAP when it's available
  useEffect(() => {
    if (soap?.objective) {
      // Set vital signs
      if (soap.objective.vital_signs) {
        if (soap.objective.vital_signs.weight)
          setWeight(soap.objective.vital_signs.weight);
        if (soap.objective.vital_signs.temperature)
          setTemperature(soap.objective.vital_signs.temperature);
        if (soap.objective.vital_signs.heart_rate)
          setHeartRate(soap.objective.vital_signs.heart_rate);
        if (soap.objective.vital_signs.respiratory_rate)
          setRespiratoryRate(soap.objective.vital_signs.respiratory_rate);
        if (soap.objective.vital_signs.general_notes)
          setGeneralNotes(soap.objective.vital_signs.general_notes);
      }

      // Set systems data
      if (soap.objective.systems) {
        if (soap.objective.systems.cardiovascular)
          setCardiovascular(soap.objective.systems.cardiovascular);
        if (soap.objective.systems.respiratory)
          setRespiratory(soap.objective.systems.respiratory);
        if (soap.objective.systems.gastrointestinal)
          setGastrointestinal(soap.objective.systems.gastrointestinal);
        if (soap.objective.systems.musculoskeletal)
          setMusculoskeletal(soap.objective.systems.musculoskeletal);
        if (soap.objective.systems.neurological)
          setNeurological(soap.objective.systems.neurological);
        if (soap.objective.systems.skin) setSkin(soap.objective.systems.skin);
        if (soap.objective.systems.eyes) setEyes(soap.objective.systems.eyes);
        if (soap.objective.systems.ears) setEars(soap.objective.systems.ears);
      }

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

    toast({
      title: "💾 Saving Clinical Data",
      description: "Updating examination findings and clinical records...",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });

    try {
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

      await updateSoapMutation.mutateAsync({
        appointmentID: effectiveAppointmentId,
        subjective: soap?.subjective || [],
        objective: objectiveData,
        assessment: assessmentData,
        plan: Number(soap?.plan) || 0,
      });

      setUnsavedChanges(false);

      toast({
        title: "✅ Clinical Data Saved",
        description:
          "Examination findings successfully documented in patient record.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      const params = {
        appointmentId: effectiveAppointmentId,
        petId: appointment?.pet?.pet_id,
      };
      navigate(`/soap${buildUrlParams(params)}`);
    } catch (error) {
      console.error("Error saving examination:", error);
      toast({
        title: "❌ Save Failed",
        description: "Unable to save examination data. Please try again.",
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

      const assessmentData = {
        primary: "",
        differentials: [],
        notes: "",
      };

      await updateSoapMutation.mutateAsync({
        appointmentID: effectiveAppointmentId,
        subjective: soap?.subjective || [],
        objective: objectiveData,
        assessment: assessmentData,
        plan: Number(soap?.plan) || 0,
      });

      setUnsavedChanges(false);

      toast({
        title: "💾 Quick Save",
        description: "Examination data saved successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error("Error saving examination:", error);
      toast({
        title: "❌ Save Failed",
        description: "Unable to save examination data.",
        variant: "destructive",
      });
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S for quick save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        quickSave();
      }

      // Alt+1 for Vitals tab
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        setActiveTab("vitals");
      }

      // Alt+2 for Physical tab
      if (e.altKey && e.key === "2") {
        e.preventDefault();
        setActiveTab("physical");
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

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const vitalFields = [
      weight,
      temperature,
      heartRate,
      respiratoryRate,
    ].filter(Boolean).length;
    const systemFields = [
      cardiovascular,
      respiratory,
      gastrointestinal,
      musculoskeletal,
      neurological,
      skin,
      eyes,
      ears,
    ].filter(Boolean).length;
    const totalFields = 12; // 4 vitals + 8 systems
    const completedFields = vitalFields + systemFields;
    return Math.round((completedFields / totalFields) * 100);
  };

  // Show loading state when data is being fetched
  if (isAppointmentLoading || isPatientLoading || isSoapLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-[#2C78E4] border-b-[#2C78E4] border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-[#2C78E4] font-medium">
            Loading clinical examination...
          </p>
          <p className="text-gray-500 text-sm text-center max-w-md">
            Preparing examination interface and patient data.
          </p>
        </div>
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Clinical Examination Header */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between">
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
            <div>
              <h1 className="text-white font-bold text-xl">
                Clinical Examination
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Physical Assessment - {patient?.name} |{" "}
                {appointment?.appointment_date}
              </p>
            </div>
          </div>

          {/* Examination Progress */}
        </div>
      </div>

      {/* Workflow Navigation */}
      <WorkflowNavigation
        appointmentId={effectiveAppointmentId}
        petId={patient?.pet_id?.toString()}
        currentStep="examination"
      />

      {/* Main Clinical Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Examination Area */}
          <div className="lg:col-span-3">
            <Tabs
              defaultValue="vitals"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className="grid grid-cols-2 bg-[#F9FAFB] p-1.5 rounded-xl w-full shadow-sm mb-6">
                <TabsTrigger
                  value="vitals"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] data-[state=active]:shadow-sm py-3 px-4 text-sm font-medium transition-all rounded-xl"
                >
                  <Activity className="h-4 w-4" />
                  <span>Vital Signs</span>
                  {[weight, temperature, heartRate, respiratoryRate].filter(
                    Boolean
                  ).length > 0 && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="physical"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] data-[state=active]:shadow-sm py-3 px-4 text-sm font-medium transition-all rounded-xl"
                >
                  <Stethoscope className="h-4 w-4" />
                  <span>Physical Examination</span>
                  {[
                    cardiovascular,
                    respiratory,
                    gastrointestinal,
                    musculoskeletal,
                    neurological,
                    skin,
                    eyes,
                    ears,
                  ].filter(Boolean).length > 0 && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vitals" className="space-y-6">
                <VitalSignsCard
                  weight={weight}
                  setWeight={setWeight}
                  temperature={temperature}
                  setTemperature={setTemperature}
                  heartRate={heartRate}
                  setHeartRate={setHeartRate}
                  respiratoryRate={respiratoryRate}
                  setRespiratoryRate={setRespiratoryRate}
                  generalNotes={generalNotes}
                  setGeneralNotes={setGeneralNotes}
                  patient={patient}
                  handleInputChange={handleInputChange}
                  setUnsavedChanges={setUnsavedChanges}
                />
              </TabsContent>

              <TabsContent value="physical" className="space-y-6">
                <PhysicalExaminationCard
                  cardiovascular={cardiovascular}
                  setCardiovascular={setCardiovascular}
                  respiratory={respiratory}
                  setRespiratory={setRespiratory}
                  gastrointestinal={gastrointestinal}
                  setGastrointestinal={setGastrointestinal}
                  musculoskeletal={musculoskeletal}
                  setMusculoskeletal={setMusculoskeletal}
                  neurological={neurological}
                  setNeurological={setNeurological}
                  skin={skin}
                  setSkin={setSkin}
                  eyes={eyes}
                  setEyes={setEyes}
                  ears={ears}
                  setEars={setEars}
                  handleInputChange={handleInputChange}
                  setUnsavedChanges={setUnsavedChanges}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Clinical Sidebar */}
          <div className="space-y-6">
            {/* Patient Summary Card */}
            {patient && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-[#F0F7FF] to-white border-b">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[#2C78E4]" />
                    <CardTitle className="text-base">
                      Patient Information
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-600">Species</p>
                        <p className="font-medium">
                          {patient.type || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Breed</p>
                        <p className="font-medium">
                          {patient.breed || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Age</p>
                        <p className="font-medium">
                          {patient.age || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gender</p>
                        <p className="font-medium">
                          {patient.gender || "Unknown"}
                        </p>
                      </div>
                    </div>

                    {patient.weight && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-600">Previous Weight</p>
                        <p className="font-semibold text-[#2C78E4]">
                          {patient.weight} kg
                        </p>
                      </div>
                    )}

                    {patient.medical_alerts && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-600 mb-2">Medical Alerts</p>
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
                </CardContent>
              </Card>
            )}

            {/* Chief Complaint Context */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#F0F7FF] to-white border-b">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-[#2C78E4]" />
                  <CardTitle className="text-base">
                    Presenting Complaint
                  </CardTitle>
                  {!isSoapLoading &&
                    soap?.subjective &&
                    Array.isArray(soap.subjective) && (
                      <Badge className="bg-[#E3F2FD] text-[#2C78E4] text-xs">
                        {soap.subjective.length} items
                      </Badge>
                    )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {isSoapLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 text-[#2C78E4] animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  <ChiefComplaintDisplay data={soap?.subjective} />
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#F0F7FF] to-white border-b">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#2C78E4]" />
                  <CardTitle className="text-base">Clinical Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToLabManagement}
                  className="w-full justify-start text-sm h-9"
                >
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Order Diagnostics
                </Button>

                <div className="pt-3 border-t border-gray-100">
                  <Button
                    onClick={saveExamination}
                    size="sm"
                    className="w-full bg-[#2C78E4] hover:bg-[#1E40AF] text-white h-10"
                    disabled={completionPercentage < 25}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Continue to Assessment
                  </Button>
                  {completionPercentage < 25 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Complete at least 25% of examination
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Clinical Guidelines */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base">Examination Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <CheckSquare className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Start with vital signs and general assessment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckSquare className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Use "Normal" buttons for quick documentation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckSquare className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Note any abnormal findings in detail</span>
                  </div>
                  
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default Examination;
