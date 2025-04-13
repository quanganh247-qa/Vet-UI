import { useState, useEffect } from "react";
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
  Calendar,
  FileText,
  Activity,
  Stethoscope,
  Clock,
  CheckCircle,
  ClipboardEdit,
  Printer,
  NotebookText,
  FileBarChart,
  Info,
  FlaskConical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetSOAP, useUpdateSOAP } from "@/hooks/use-soap";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData } from "@/hooks/use-pet";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ObjectiveData } from "@/types";

type InputChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;

const SoapNotes = () => {
  // Lấy params từ cả route params và query params
  const { id: routeId } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  
  // Quản lý tham số workflow
  const [workflowParams, setWorkflowParams] = useState<{
    appointmentId: string | null;
    petId: string | null;
  }>({
    appointmentId: null,
    petId: null
  });
  
  // Xử lý các tham số từ URL một cách nhất quán
  useEffect(() => {
    // Lấy tất cả các query params từ URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    const urlPetId = searchParams.get("petId");
    
    // Thiết lập appointmentId và petId theo thứ tự ưu tiên
    const appointmentIdValue = urlAppointmentId || routeId || null;
    const petIdValue = urlPetId || null;
    
    // IMPORTANT: Kiểm tra xem giá trị mới có khác giá trị cũ không
    // để tránh vòng lặp vô hạn của setState
    if (appointmentIdValue !== workflowParams.appointmentId || 
        petIdValue !== workflowParams.petId) {
      setWorkflowParams({
        appointmentId: appointmentIdValue,
        petId: petIdValue
      });
      
    }
  }, [routeId]);
  
  // Sử dụng appointmentId từ workflowParams
  const effectiveAppointmentId = workflowParams.appointmentId || "";
  
  // Utility function to build query parameters
  const buildUrlParams = (params: Record<string, string | number | null | undefined>) => {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        urlParams.append(key, String(value));
      }
    });
    
    const queryString = urlParams.toString();
    return queryString ? `?${queryString}` : '';
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
        (JSON.stringify(soapData.objective || {}) !== JSON.stringify(localSoapData.objective || {}));
      
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
        { name: "Respiratory Rate", value: data.vital_signs.respiratory_rate, unit: "rpm", icon: "🫁" }
      ];
      
      vitalSigns.forEach(sign => {
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
      const filledSystems = systemPairs.filter(system => system.value).length;
      
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
        plan: localSoapData.plan,
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
          petId: appointment?.pet?.pet_id
        };
        navigate(`/lab-management${buildUrlParams(params)}`);
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
        petId: patient.petid
      };
      navigate(`/treatment${buildUrlParams(params)}`);
    }
  };

  const handleBackToPatient = () => {
    if (appointment) {
      // Navigate to patient page with query params
      const params = {
        appointmentId: effectiveAppointmentId,
        petId: appointment?.pet?.pet_id
      };
      navigate(`/patient${buildUrlParams(params)}`);
    } else {
      navigate("/appointment-flow");
    }
  };

  const navigateToLabManagement = () => {
    if (patient) {
      // Navigate to lab management page with query params
      const params = {
        appointmentId: effectiveAppointmentId,
        petId: patient.petid
      };
      navigate(`/lab-management${buildUrlParams(params)}`);
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
    <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
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
            {/* <p className="text-indigo-100 text-xs hidden sm:block">Subjective, Objective, Assessment, Plan</p> */}
          </div>
        </div>
        {/* <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
            onClick={handleProceedToTreatment}
          >
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>Proceed to Treatment</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-1" />
            <span>Save Notes</span>
          </Button>
        </div> */}
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
              </TabsList>

              <TabsContent value="all" className="space-y-6 py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      S - Subjective (Owner's Report)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter owner's description of the problem..."
                    className="min-h-[150px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                    value={localSoapData.subjective}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("subjective", e.target.value)
                    }
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
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter diagnosis or assessment of the condition..."
                    className="min-h-[200px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-indigo-200 bg-indigo-50"
                    value={localSoapData.assessment}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("assessment", e.target.value)
                    }
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
                  <Textarea
                    placeholder="Enter owner's description of the problem..."
                    className="min-h-[400px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                    value={localSoapData.subjective}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("subjective", e.target.value)
                    }
                  />
                </div>
              </TabsContent>

              {/* Tab Objective - read-only */}
              <TabsContent value="objective" className="py-4">
                <div>
                  <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Note</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      Clinical examination information can only be updated in
                      the Examination section. Here you can only view the
                      results.
                    </AlertDescription>
                  </Alert>
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
                  <Alert className="mb-4 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">
                      Make Your Diagnosis
                    </AlertTitle>
                    <AlertDescription className="text-green-700">
                      Based on the information collected from the client and
                      clinical examination results, record your diagnosis here.
                      This is critical for determining the treatment plan.
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardEdit className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      A - Assessment (Diagnosis)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter diagnosis or assessment of the condition..."
                    className="min-h-[400px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-indigo-200 bg-indigo-50"
                    value={localSoapData.assessment}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("assessment", e.target.value)
                    }
                  />
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
