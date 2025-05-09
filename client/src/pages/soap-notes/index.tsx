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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetSOAP, useUpdateSOAP } from "@/hooks/use-soap";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData } from "@/hooks/use-pet";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ObjectiveData } from "@/types";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { SOAPHistory } from "@/components/soap/SOAPHistory";
import { cn } from "@/lib/utils";

type InputChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;

// Enhanced rich text editor with preview capability
const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  minHeight = "150px",
  externalPreviewMode
}: { 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  externalPreviewMode?: boolean;
}) => {
  const [internalPreviewMode, setInternalPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use external preview mode if provided, otherwise use internal state
  const isPreviewMode = externalPreviewMode !== undefined ? externalPreviewMode : internalPreviewMode;

  // Function to insert formatting around selected text
  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    // Check if selection is already formatted
    const beforeSelection = value.substring(
      Math.max(0, start - prefix.length),
      start
    );
    const afterSelection = value.substring(
      end,
      Math.min(value.length, end + suffix.length)
    );

    if (beforeSelection === prefix && afterSelection === suffix) {
      // Remove formatting
      const newValue =
        value.substring(0, start - prefix.length) +
        selectedText +
        value.substring(end + suffix.length);
      onChange(newValue);

      // Adjust cursor position
      setTimeout(() => {
        textarea.focus();
        const newPosition = start - prefix.length;
        textarea.setSelectionRange(
          newPosition,
          newPosition + selectedText.length
        );
      }, 0);
    } else {
      // Add formatting
      const newValue =
        value.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        value.substring(end);
      onChange(newValue);

      // Put cursor inside formatting marks if no text was selected
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + prefix.length;
        const selectionLength = selectedText.length || 0;
        textarea.setSelectionRange(newPosition, newPosition + selectionLength);
      }, 0);
    }
  };

  // Function to apply list formatting
  const insertList = (prefix: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (selectedText) {
      // Format each line of the selected text
      const lines = selectedText.split("\n");
      let formattedText: string;

      if (prefix === "1. ") {
        // For numbered lists
        formattedText = lines
          .map((line, i) => (line.trim() ? `${i + 1}. ${line}` : line))
          .join("\n");
      } else {
        // For bullet lists
        formattedText = lines
          .map((line) => (line.trim() ? `${prefix}${line}` : line))
          .join("\n");
      }

      const newValue =
        value.substring(0, start) + formattedText + value.substring(end);

      onChange(newValue);
    } else {
      // If no text is selected, insert list marker at cursor position
      const cursorPos = start;
      const newValue =
        value.substring(0, cursorPos) + prefix + value.substring(cursorPos);

      onChange(newValue);

      // Place cursor after the list marker
      setTimeout(() => {
        textarea.focus();
        const newPosition = cursorPos + prefix.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "bold":
        insertFormatting("**");
        break;
      case "italic":
        insertFormatting("*");
        break;
      case "bulletList":
        insertList("• ");
        break;
      case "numberedList":
        insertList("1. ");
        break;
      default:
        break;
    }
  };

  // Get HTML preview from markdown
  const getPreviewHtml = () => {
    if (!value) return placeholder || "";

    let html = value
      // Convert bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Convert italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Convert bullet lists (match across multiple lines)
      .replace(/^[•●] (.+)$/gm, "<li>$1</li>")
      // Convert numbered lists
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      // Wrap consecutive list items in ul/ol tags
      .replace(
        /((?:<li>.*<\/li>\n?)+)/g,
        "<ul class='pl-6 list-disc space-y-1'>$1</ul>"
      )
      // Add paragraph tags to text blocks
      .replace(/^([^<\n].+)$/gm, "<p>$1</p>")
      // Fix nested paragraph tags
      .replace(/<p><li>/g, "<li>")
      .replace(/<\/li><\/p>/g, "</li>")
      // Remove empty paragraphs
      .replace(/<p><\/p>/g, "");

    return html;
  };
  
  return (
    <div className={`border rounded overflow-hidden ${className || ''}`}>
      <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction("bold")}
            className={cn("h-8 w-8 p-0", !isPreviewMode && "hover:bg-gray-100")}
            disabled={isPreviewMode}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction("italic")}
            className={cn("h-8 w-8 p-0", !isPreviewMode && "hover:bg-gray-100")}
            disabled={isPreviewMode}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction("bulletList")}
            className={cn("h-8 w-8 p-0", !isPreviewMode && "hover:bg-gray-100")}
            disabled={isPreviewMode}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleToolbarAction("numberedList")}
            className={cn("h-8 w-8 p-0", !isPreviewMode && "hover:bg-gray-100")}
            disabled={isPreviewMode}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
        {externalPreviewMode === undefined && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setInternalPreviewMode(!internalPreviewMode)}
            className={cn(
              "text-xs px-2 py-1 h-7",
              isPreviewMode ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-100"
            )}
          >
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
        )}
      </div>

      {isPreviewMode ? (
        <div
          className="p-3"
          style={{ minHeight }}
        >
          <MarkdownRenderer markdown={value || placeholder || ""} />
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-0 rounded-none resize-none p-3"
          style={{ minHeight }}
        />
      )}
    </div>
  );
};

const SoapNotes = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true); // Set preview mode to true by default
  const { id: appointmentId } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();

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

  // Sử dụng appointmentId từ workflowParams
  const effectiveAppointmentId = workflowParams.appointmentId || "";

  // Utility function to build query parameters
  const buildUrlParams = (params: Record<string, string | number | null | undefined>) => {
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
    data: soapData = {
      subjective: "",
      objective: {},
      assessment: "",
      plan: "",
    },
    isLoading: isSoapLoading,
    error: soapError,
  } = useGetSOAP(appointment?.id);

  const {
    data: patient,
    isLoading: isPatientLoading,
    error: patientError,
  } = usePatientData(appointment?.pet?.pet_id);

  const updateSoapMutation = useUpdateSOAP();

  const [localSoapData, setLocalSoapData] = useState({
    subjective: "",
    objective: {},
    assessment: "",
    plan: "",
  });

  // Initialize local state when remote data loads
  useEffect(() => {
    if (soapData) {
      // Use explicit checks for individual fields instead of comparing entire objects
      const shouldUpdate =
        soapData.subjective !== localSoapData.subjective ||
        soapData.assessment !== localSoapData.assessment ||
        soapData.plan !== localSoapData.plan ||
        // For objective, just check if it exists and is different than current
        JSON.stringify(soapData.objective || {}) !==
          JSON.stringify(localSoapData.objective || {});

      if (shouldUpdate) {
        setLocalSoapData({
          subjective: soapData.subjective || "",
          objective: soapData.objective || {},
          assessment: soapData.assessment || "",
          plan: soapData.plan || "",
        });
      }
    }
  }, [soapData]); // Only depend on soapData, not localSoapData

  const handleInputChange = (
    field: keyof typeof localSoapData,
    value: string
  ) => {
    setLocalSoapData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
        { name: "Weight", value: data.vital_signs.weight, unit: "kg", icon: "⚖️" },
        { name: "Temperature", value: data.vital_signs.temperature, unit: "°C", icon: "🌡️" },
        { name: "Heart Rate", value: data.vital_signs.heart_rate, unit: "bpm", icon: "❤️" },
        { name: "Respiratory Rate", value: data.vital_signs.respiratory_rate, unit: "rpm", icon: "🫁" },
      ];

      vitalSigns.forEach((sign) => {
        if (sign.value) {
          formattedText += `${sign.icon} ${sign.name}: ${sign.value} ${sign.unit}\n`;
        }
      });

      if (data.vital_signs.general_notes) {
        formattedText += `\n📝 General Notes:\n${data.vital_signs.general_notes}\n`;
      }
      formattedText += "\n";
    }

    // Format systems examination with better visual organization
    if (data.systems) {
      formattedText += `🩺 SYSTEMS EXAMINATION\n${"─".repeat(30)}\n`;

      const systemPairs = [
        { name: "Cardiovascular", value: data.systems.cardiovascular, icon: "❤️" },
        { name: "Respiratory", value: data.systems.respiratory, icon: "🫁" },
        { name: "Gastrointestinal", value: data.systems.gastrointestinal, icon: "🧠" },
        { name: "Musculoskeletal", value: data.systems.musculoskeletal, icon: "🦴" },
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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement speech-to-text functionality here
  };

  const handleSave = async () => {
    if (!appointment?.id) return;

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

    try {
      // Ensure we don't overwrite the objective data
      const currentData = soapData || {
        subjective: "",
        objective: defaultObjective,
        assessment: "",
        plan: "",
      };

      await updateSoapMutation.mutateAsync({
        appointmentID: appointment.id,
        subjective: localSoapData.subjective,
        objective: currentData.objective, // Keep the original objective data
        assessment: localSoapData.assessment,
        plan: Number(localSoapData.plan) || 0,
      });
      if (updateSoapMutation.isSuccess) {
        toast({
          title: "Save Success",
          description: "SOAP notes saved successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });

        // Điều hướng đến lab-management với query params
        const params = {
          appointmentId: effectiveAppointmentId,
          petId: appointment?.pet?.pet_id,
        };
        setLocation(`/lab-management${buildUrlParams(params)}`);
      }
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

  // Format the objective data
  const formattedObjectiveText = formatObjectiveData(localSoapData.objective);

  return (
    <div className="space-y-6">
    {/* Header with gradient background */}
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">

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
            <h1 className="text-white font-semibold text-lg">SOAP Notes</h1>
          </div>
        </div>
      </div>

      {/* Workflow Navigation */}
      <div className="px-4 pt-3">
        <WorkflowNavigation
          appointmentId={effectiveAppointmentId}
          petId={patient?.petid?.toString()}
          currentStep="soap"
        />
      </div>

      {/* Main content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <NotebookText className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">
                Medical SOAP Notes
              </h2>
            </div>
          </div>

          {/* Guidance alert */}
          <div className="p-4 mx-6 my-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-blue-700">Diagnostic Guidance</h3>
            </div>
            <p className="text-blue-600 text-sm mt-1">
              The "Subjective" and "Objective" sections have been updated from
              previous information gathering. Please focus on the "Assessment"
              section to provide your professional diagnosis based on the
              symptoms and examination results.
            </p>
          </div>

          <div className="p-6">
            <Tabs defaultValue="all" className="w-full">
              <div className="mb-4">
                <TabsList className="inline-flex p-1 bg-gray-100 rounded-md mb-4">
                  <TabsTrigger
                    value="all"
                    className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                  >
                    All Sections
                  </TabsTrigger>
                  <TabsTrigger
                    value="subjective"
                    className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                  >
                    Subjective
                  </TabsTrigger>
                  <TabsTrigger
                    value="objective"
                    className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                  >
                    Objective
                  </TabsTrigger>
                  <TabsTrigger
                    value="assessment"
                    className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                  >
                    Assessment
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                  >
                    History
                  </TabsTrigger>
                </TabsList>
                <div className="flex justify-end mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="text-xs flex items-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  >
                    {isPreviewMode ? <Edit className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                    {isPreviewMode ? "Switch to Edit Mode" : "Switch to Preview Mode"}
                  </Button>
                </div>
              </div>

              <TabsContent value="all" className="space-y-6 py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      S - Subjective (Owner's Report)
                    </label>
                  </div>
                  <RichTextEditor
                    value={localSoapData.subjective}
                    onChange={(value) => handleInputChange("subjective", value)}
                    placeholder="Enter owner's description of the problem..."
                    minHeight="150px"
                    externalPreviewMode={isPreviewMode}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      O - Objective (Clinical Findings)
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                        Read-only
                      </Badge>
                    </label>
                  </div>
                  <Textarea
                    placeholder="Physical examination findings, vital signs, test results..."
                    className="min-h-[200px] resize-none bg-gray-50 border-gray-200 font-mono whitespace-pre-wrap"
                    value={formattedObjectiveText}
                    readOnly
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardEdit className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      A - Assessment (Diagnosis)
                      <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                        Update here
                      </Badge>
                      <Badge className="ml-2 bg-indigo-100 text-indigo-800 border-indigo-200">
                        {isPreviewMode ? "Preview Mode" : "Edit Mode"}
                      </Badge>
                    </label>
                  </div>
                  <RichTextEditor
                    value={localSoapData.assessment}
                    onChange={(value) => handleInputChange("assessment", value)}
                    placeholder="Enter diagnosis or assessment of the condition..."
                    className="bg-indigo-50"
                    minHeight="200px"
                    externalPreviewMode={isPreviewMode}
                  />
                </div>
              </TabsContent>

              {/* Tab Subjective */}
              <TabsContent value="subjective" className="py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      S - Subjective (Owner's Report)
                    </label>
                  </div>
                  <RichTextEditor
                    value={localSoapData.subjective}
                    onChange={(value) => handleInputChange("subjective", value)}
                    placeholder="Enter owner's description of the problem..."
                    minHeight="400px"
                    externalPreviewMode={isPreviewMode}
                  />
                </div>
              </TabsContent>

              {/* Tab Objective - read-only */}
              <TabsContent value="objective" className="py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      O - Objective (Clinical Findings)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Physical examination findings, vital signs, test results..."
                    className="min-h-[400px] resize-none bg-gray-50 border-gray-200 font-mono whitespace-pre-wrap"
                    value={formattedObjectiveText}
                    readOnly
                  />
                </div>
              </TabsContent>

              {/* Tab Assessment - Main diagnostic tab */}
              <TabsContent value="assessment" className="py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardEdit className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      A - Assessment (Diagnosis)
                      <Badge className="ml-2 bg-indigo-100 text-indigo-800 border-indigo-200">
                        {isPreviewMode ? "Preview Mode" : "Edit Mode"}
                      </Badge>
                    </label>
                  </div>
                  <RichTextEditor
                    value={localSoapData.assessment}
                    onChange={(value) => handleInputChange("assessment", value)}
                    placeholder="Enter diagnosis or assessment of the condition..."
                    className="bg-indigo-50"
                    minHeight="400px"
                    externalPreviewMode={isPreviewMode}
                  />
                </div>
              </TabsContent>

              {/* Tab History - SOAP history for this patient */}
              <TabsContent value="history" className="py-4">
                <div>
                  {/* <Alert className="mb-4 bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">
                      Patient's SOAP History
                    </AlertTitle>
                    <AlertDescription className="text-blue-700">
                      View the complete history of SOAP notes for this patient to track their progress over time.
                    </AlertDescription>
                  </Alert> */}
                  <SOAPHistory petId={patient?.petid?.toString() || ""} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleSave}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Diagnosis
              </Button>

              <Button
                variant="outline"
                onClick={navigateToLabManagement}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <FlaskConical className="h-4 w-4 mr-2" />
                Labs
              </Button>

              <Button
                onClick={handleProceedToTreatment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
