import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Clock,
  User,
  Heart,
  Thermometer,
  Weight,
  Stethoscope,
  Brain,
  Target,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  UserCheck,
  Loader2,
  ArrowRight,
  Ear,
  PawPrint,
  Circle,
  Bone,
  Shirt,
  Wind,
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
  severity?: string;
  confidence?: string;
}

// Chief Complaint Component
const ChiefComplaintSection = ({
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

  // Find history items
  const historyItems = entries.filter(
    (entry) =>
      !entry.key.toLowerCase().includes("chief") &&
      !entry.key.toLowerCase().includes("complaint")
  );

  if (!data || entries.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            No presenting complaint documented
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chief Complaint - Highlighted */}
      {chiefComplaint && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                Chief Complaint
              </h3>
              <p className="text-red-800 font-medium">{chiefComplaint.value}</p>
            </div>
          </div>
        </div>
      )}

      {/* History of Present Illness */}
      {historyItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">
              History of Present Illness
            </h3>
          </div>
          <div className="space-y-3">
            {historyItems.map((entry, index) => (
              <div
                key={entry.id || index}
                className="bg-white rounded-lg p-3 border border-blue-100"
              >
                <div className="flex gap-3">
                  <div className="font-medium text-blue-700 min-w-[120px]">
                    {entry.key}:
                  </div>
                  <div className="text-gray-800 flex-1">
                    {entry.value || (
                      <span className="text-gray-400 italic">No data</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Vital Signs Display
const VitalSignsDisplay = ({ data }: { data: any }) => {
  if (!data?.vital_signs) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <Stethoscope className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No vital signs recorded</p>
      </div>
    );
  }

  const vitalSigns = [
    {
      name: "Weight",
      value: data.vital_signs.weight,
      unit: "kg",
      icon: <Weight className="h-5 w-5" />,
      color: "blue",
      normal: "Normal: 2-50kg (varies by species)",
    },
    {
      name: "Temperature",
      value: data.vital_signs.temperature,
      unit: "°C",
      icon: <Thermometer className="h-5 w-5" />,
      color: "red",
      normal: "Normal: 38-39°C",
    },
    {
      name: "Heart Rate",
      value: data.vital_signs.heart_rate,
      unit: "bpm",
      icon: <Heart className="h-5 w-5" />,
      color: "pink",
      normal: "Normal: 60-160 bpm",
    },
    {
      name: "Respiratory Rate",
      value: data.vital_signs.respiratory_rate,
      unit: "rpm",
      icon: <Activity className="h-5 w-5" />,
      color: "green",
      normal: "Normal: 10-30 rpm",
    },
  ];

  const getVitalStatus = (name: string, value: string) => {
    if (!value) return "missing";
    const numValue = parseFloat(value);

    switch (name.toLowerCase()) {
      case "temperature":
        return numValue >= 38 && numValue <= 39 ? "normal" : "abnormal";
      case "heart rate":
        return numValue >= 60 && numValue <= 160 ? "normal" : "abnormal";
      case "respiratory rate":
        return numValue >= 10 && numValue <= 30 ? "normal" : "abnormal";
      default:
        return "normal";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vitalSigns.map((sign, index) => {
          const status = getVitalStatus(sign.name, sign.value);
          const hasValue = sign.value && sign.value.trim() !== "";

          return (
            <div
              key={index}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                !hasValue
                  ? "border-gray-200 bg-gray-50"
                  : status === "abnormal"
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`text-${sign.color}-600`}>{sign.icon}</div>
                  <span className="font-medium text-gray-700">{sign.name}</span>
                </div>
                {hasValue && (
                  <Badge
                    variant={status === "abnormal" ? "destructive" : "default"}
                    className={
                      status === "abnormal"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }
                  >
                    {status === "abnormal" ? "ABNORMAL" : "NORMAL"}
                  </Badge>
                )}
              </div>

              {hasValue ? (
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {sign.value} {sign.unit}
                  </div>
                  <div className="text-xs text-gray-500">{sign.normal}</div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <span className="text-gray-400 italic">Not recorded</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced Physical Examination Display
const PhysicalExaminationDisplay = ({ data }: { data: any }) => {
  if (!data?.systems) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <Stethoscope className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No physical examination findings</p>
      </div>
    );
  }

  const systemGroups = [
    {
      title: "Cardiovascular & Respiratory",
      icon: <Heart className="h-5 w-5 text-red-500" />,
      systems: [
        {
          name: "Cardiovascular",
          value: data.systems.cardiovascular,
          icon: <Heart className="h-4 w-4 text-red-500" />,
        },
        {
          name: "Respiratory",
          value: data.systems.respiratory,
          icon: <Wind className="h-4 w-4 text-blue-500" />,
        },
      ],
    },
    {
      title: "Neurological & Musculoskeletal",
      icon: <Brain className="h-5 w-5 text-purple-500" />,
      systems: [
        {
          name: "Neurological",
          value: data.systems.neurological,
          icon: <Brain className="h-4 w-4 text-purple-500" />,
        },
        {
          name: "Musculoskeletal",
          value: data.systems.musculoskeletal,
          icon: <Bone className="h-4 w-4 text-gray-600" />,
        },
      ],
    },
    {
      title: "Gastrointestinal & Integumentary",
      icon: <Activity className="h-5 w-5 text-green-500" />,
      systems: [
        {
          name: "Gastrointestinal",
          value: data.systems.gastrointestinal,
          icon: <Circle className="h-4 w-4 text-orange-500" />,
        },
        {
          name: "Skin/Coat",
          value: data.systems.skin,
          icon: <Shirt className="h-4 w-4 text-green-500" />,
        },
      ],
    },
    {
      title: "Special Senses",
      icon: <Eye className="h-5 w-5 text-blue-500" />,
      systems: [
        {
          name: "Eyes",
          value: data.systems.eyes,
          icon: <Eye className="h-4 w-4 text-blue-600" />,
        },
        {
          name: "Ears",
          value: data.systems.ears,
          icon: <Ear className="h-4 w-4 text-yellow-600" />,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {systemGroups.map((group, groupIndex) => {
        const hasAnyFindings = group.systems.some((system) => system.value);

        return (
          <div
            key={groupIndex}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#F0F7FF] to-white px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                {group.icon}
                <h3 className="font-semibold text-gray-800">{group.title}</h3>
                {!hasAnyFindings && (
                  <Badge variant="outline" className="text-xs">
                    No findings
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-4">
              {hasAnyFindings ? (
                <div className="space-y-4">
                  {group.systems.map((system, index) =>
                    system.value ? (
                      <div
                        key={index}
                        className="bg-[#F9FAFB] border border-gray-100 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{system.icon}</span>
                          <span className="font-medium text-gray-700">
                            {system.name}
                          </span>
                        </div>
                        <div className="ml-8">
                          <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                            {system.value}
                          </p>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <span className="italic">
                    No abnormal findings documented
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Enhanced Assessment Editor with Clinical Structure
const ClinicalAssessmentEditor = ({
  value,
  onChange,
}: {
  value: AssessmentEntry | string | undefined;
  onChange: (value: AssessmentEntry) => void;
}) => {
  const [assessment, setAssessment] = useState<AssessmentEntry>(() => {
    if (!value) {
      return {
        primary: "",
        differentials: [],
        notes: "",
        severity: "",
        confidence: "",
      };
    }

    if (typeof value === "string") {
      return {
        primary: value,
        differentials: [],
        notes: "",
        severity: "",
        confidence: "",
      };
    }

    return value as AssessmentEntry;
  });

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

  const addDifferential = () => {
    const differentials = [...assessment.differentials, ""];
    handleInputChange("differentials", differentials);
  };

  const changeDifferential = (index: number, value: string) => {
    const differentials = [...assessment.differentials];
    differentials[index] = value;
    handleInputChange("differentials", differentials);
  };

  const removeDifferential = (index: number) => {
    const differentials = assessment.differentials.filter(
      (_, i) => i !== index
    );
    handleInputChange("differentials", differentials);
  };

  const severityOptions = ["Mild", "Moderate", "Severe", "Critical"];
  const confidenceOptions = ["Low", "Moderate", "High", "Definitive"];

  return (
    <div className="space-y-6">
      {/* Primary Diagnosis */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-red-600" />
          <label className="text-lg font-semibold text-red-900">
            Primary Diagnosis
          </label>
          <Badge className="bg-red-100 text-red-700">Required</Badge>
        </div>
        <Textarea
          value={assessment.primary}
          onChange={(e) => handleInputChange("primary", e.target.value)}
          placeholder="Enter the most likely diagnosis based on clinical findings..."
          className="resize-none min-h-[120px] bg-white rounded-lg border-red-200 focus:ring-red-400 focus:border-red-400 text-lg"
        />


      </div>

      {/* Differential Diagnoses */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-blue-600" />
            <label className="text-lg font-semibold text-blue-900">
              Differential Diagnoses
            </label>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              Optional
            </Badge>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDifferential}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Differential
          </Button>
        </div>

        {assessment?.differentials?.length > 0 ? (
          <div className="space-y-3">
            {assessment.differentials.map((differential, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={differential}
                    onChange={(e) => changeDifferential(index, e.target.value)}
                    placeholder={`Differential diagnosis ${index + 1}...`}
                    className="bg-white border-blue-200 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeDifferential(index)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-blue-600 bg-white rounded-lg border border-blue-200">
            <List className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <p className="italic">No differential diagnoses added</p>
          </div>
        )}
      </div>

      {/* Clinical Notes */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <NotebookText className="h-5 w-5 text-gray-600" />
          <label className="text-lg font-semibold text-gray-700">
            Clinical Notes & Reasoning
          </label>
        </div>
        <Textarea
          value={assessment.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Document your clinical reasoning, supporting evidence, or additional considerations..."
          className="resize-none min-h-[100px] bg-white rounded-lg border-gray-200 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
        />
      </div>
    </div>
  );
};

const SoapNotes = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRecording, setIsRecording] = useState(false);
  const { id: appointmentId } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();

  // Add state for assessment data
  const [assessmentData, setAssessmentData] = useState<AssessmentEntry>({
    primary: "",
    differentials: [],
    notes: "",
    severity: "",
    confidence: "",
  });

  // Debug information
  console.log("Initial route params appointmentId:", appointmentId);

  // Get the query params from URL
  const searchParams = new URLSearchParams(window.location.search);
  const urlAppointmentId = searchParams.get("appointmentId");
  console.log("URL query param appointmentId:", urlAppointmentId);

  // Workflow parameters management
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

    const appointmentIdValue = urlAppointmentId || appointmentId || null;
    const petIdValue = urlPetId || null;

    console.log("Setting workflowParams:", { appointmentIdValue, petIdValue });

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

  const { data: soap, isLoading: isSoapLoading1, refetch: refetchSoap } = useGetSOAP(
    effectiveAppointmentId
  );

  // Refetch SOAP data when appointmentId changes
  useEffect(() => {
    if (effectiveAppointmentId) {
      refetchSoap();
    }
  }, [effectiveAppointmentId, refetchSoap]);

  console.log("soap", soap);

  // Initialize assessment data when soap data is loaded
  useEffect(() => {
    if (soap?.assessment) {
      if (typeof soap.assessment === "object" && "primary" in soap.assessment) {
        setAssessmentData(soap.assessment as AssessmentEntry);
      } else {
        setAssessmentData({
          primary: String(soap.assessment || ""),
          differentials: [],
          notes: "",
          severity: "",
          confidence: "",
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

      let subjectiveData = soap?.subjective || "";

      await updateSoapMutation.mutateAsync({
        appointmentID: appointment.id,
        subjective: subjectiveData,
        objective: soap?.objective || defaultObjective,
        assessment: assessmentData,
        plan: typeof soap?.plan === "number" ? soap.plan : 0,
      });

      toast({
        title: "✅ SOAP Notes Saved",
        description: "Clinical documentation has been updated successfully.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      const params = {
        appointmentId: effectiveAppointmentId,
        petId: appointment?.pet?.pet_id,
      };
      setLocation(`/lab-management${buildUrlParams(params)}`);
    } catch (error) {
      console.error("Error saving SOAP notes:", error);
      toast({
        title: "❌ Save Failed",
        description: "Unable to save SOAP notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProceedToTreatment = () => {
    if (patient) {
      handleSave();

      const params = {
        appointmentId: effectiveAppointmentId,
        petId: patient.petid,
      };
      setLocation(`/treatment${buildUrlParams(params)}`);
    }
  };

  const handleBackToPatient = () => {
    if (appointment) {
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
          <div className="w-12 h-12 border-4 border-t-[#2C78E4] border-b-[#2C78E4] border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-[#2C78E4] font-medium">
            Loading clinical documentation...
          </p>
        </div>
      </div>
    );
  }

  // Get completion status
  const hasSubjective = soap?.subjective;
  const hasObjective =
    soap?.objective && Object.keys(soap.objective).length > 0;
  const hasAssessment = assessmentData.primary;
  const completionPercentage = Math.round(
    ([hasSubjective, hasObjective, hasAssessment].filter(Boolean).length / 3) *
      100
  );

  return (
    <div className="space-y-6">
      {/* Clinical Header */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
              onClick={handleBackToPatient}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back to Patient</span>
            </Button>
            <div>
              <h1 className="text-white font-bold text-xl">
                Clinical Documentation
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                SOAP Notes - {patient?.name} | {appointment?.appointment_date}
              </p>
            </div>
          </div>

          {/* Completion Status */}
        </div>
      </div>

      {/* Workflow Navigation */}
      <WorkflowNavigation
        appointmentId={effectiveAppointmentId}
        petId={patient?.petid?.toString()}
        currentStep="soap"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#F0F7FF] to-white border-b border-gray-200">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="inline-flex p-1 bg-[#F9FAFB] rounded-xl">
              <TabsTrigger
                value="overview"
                className="px-4 py-2 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#2C78E4]"
              >
                <FileText className="h-4 w-4 mr-2" />
                Clinical Overview
              </TabsTrigger>
              <TabsTrigger
                value="subjective"
                className="px-4 py-2 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#2C78E4]"
              >
                <User className="h-4 w-4 mr-2" />
                Subjective
                {hasSubjective && (
                  <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="objective"
                className="px-4 py-2 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#2C78E4]"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Objective
                {hasObjective && (
                  <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="assessment"
                className="px-4 py-2 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#2C78E4]"
              >
                <Target className="h-4 w-4 mr-2" />
                Assessment
                {hasAssessment && (
                  <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="px-4 py-2 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#2C78E4]"
              >
                <Calendar className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Clinical Overview Tab */}
            <TabsContent value="overview" className="space-y-8 py-6">
              {/* Subjective Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Subjective
                    </h2>
                   
                  </div>
               
                </div>
                <ChiefComplaintSection data={soap?.subjective} />
              </section>

              {/* Objective Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Objective
                    </h2>
                   
                  </div>
              
                </div>

                {/* Vital Signs */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-500" />
                    Vital Signs
                  </h3>
                  <VitalSignsDisplay data={soap?.objective} />
                </div>

                {/* Physical Examination */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-500" />
                    Physical Examination
                  </h3>
                  <PhysicalExaminationDisplay data={soap?.objective} />
                </div>
              </section>

              {/* Assessment Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Assessment
                    </h2>
                    
                  </div>
                  
                </div>
                <ClinicalAssessmentEditor
                  value={assessmentData}
                  onChange={setAssessmentData}
                />
              </section>
            </TabsContent>

            {/* Individual Section Tabs */}
            <TabsContent value="subjective" className="py-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Subjective Assessment
                    </h2>
                    <p className="text-gray-600">
                      Owner's report and presenting complaint
                    </p>
                  </div>
                </div>
                <ChiefComplaintSection data={soap?.subjective} />
              </div>
            </TabsContent>

            <TabsContent value="objective" className="py-6">
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Stethoscope className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Objective Findings
                    </h2>
                    <p className="text-gray-600">
                      Clinical examination and diagnostic results
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-500" />
                    Vital Signs Assessment
                  </h3>
                  <VitalSignsDisplay data={soap?.objective} />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-500" />
                    Systems Examination
                  </h3>
                  <PhysicalExaminationDisplay data={soap?.objective} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="py-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-100 p-3 rounded-xl">
                    <Target className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Clinical Assessment
                    </h2>
                    <p className="text-gray-600">
                      Diagnosis, differential diagnoses, and clinical reasoning
                    </p>
                  </div>
                </div>
                <ClinicalAssessmentEditor
                  value={assessmentData}
                  onChange={setAssessmentData}
                />
              </div>
            </TabsContent>

            <TabsContent value="history" className="py-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Medical History
                    </h2>
                    <p className="text-gray-600">
                      Previous SOAP notes and clinical records
                    </p>
                  </div>
                </div>
                <SOAPHistory petId={patient?.petid?.toString() || ""} />
              </div>
            </TabsContent>

            {/* Clinical Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserCheck className="h-4 w-4" />
                  <span>
                    Documenting for: Dr.{" "}
                    {appointment?.doctor?.doctor_name || "Unknown"}
                  </span>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Documentation
                  </Button>

                  <Button
                    variant="outline"
                    onClick={navigateToLabManagement}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <FlaskConical className="h-4 w-4 mr-2" />
                    Order Diagnostics
                  </Button>

                  <Button
                    onClick={handleProceedToTreatment}
                    className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white"
                    disabled={!hasAssessment}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Proceed to Treatment
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SoapNotes;
