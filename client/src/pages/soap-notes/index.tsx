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
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);

  const {
    data: appointment,
    isLoading: isAppointmentLoading,
    error: appointmentError,
  } = useAppointmentData(id);
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
      setLocalSoapData({
        subjective: soapData.subjective || "",
        objective: soapData.objective || {},
        assessment: soapData.assessment || "",
        plan: soapData.plan || "",
      });
    }
  }, [soapData]);

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

    let formattedText = "## CLINICAL EXAMINATION RESULTS\n\n";

    // Format vital signs
    if (data.vital_signs) {
      formattedText += "### Vital Signs\n";
      if (data.vital_signs.weight)
        formattedText += `- Weight: ${data.vital_signs.weight} kg\n`;
      if (data.vital_signs.temperature)
        formattedText += `- Temperature: ${data.vital_signs.temperature} °C\n`;
      if (data.vital_signs.heart_rate)
        formattedText += `- Heart Rate: ${data.vital_signs.heart_rate} bpm\n`;
      if (data.vital_signs.respiratory_rate)
        formattedText += `- Respiratory Rate: ${data.vital_signs.respiratory_rate} rpm\n`;
      if (data.vital_signs.general_notes)
        formattedText += `\n**General Notes:** ${data.vital_signs.general_notes}\n`;
      formattedText += "\n";
    }

    // Format systems examination
    if (data.systems) {
      formattedText += "### Systems Examination\n";

      const systemPairs = [
        { name: "Cardiovascular", value: data.systems.cardiovascular },
        { name: "Respiratory", value: data.systems.respiratory },
        { name: "Gastrointestinal", value: data.systems.gastrointestinal },
        { name: "Musculoskeletal", value: data.systems.musculoskeletal },
        { name: "Neurological", value: data.systems.neurological },
        { name: "Skin/Coat", value: data.systems.skin },
        { name: "Eyes", value: data.systems.eyes },
        { name: "Ears", value: data.systems.ears },
      ];

      systemPairs.forEach((system) => {
        if (system.value) {
          formattedText += `- **${system.name}:** ${system.value}\n`;
        }
      });
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
        setLocation(`/appointment/${appointment?.id}/lab-management`);
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
      // Then navigate to treatment page
      setLocation(`/appointment/${id}/patient/${patient.petid}/treatment`);
    }
  };

  const handleBackToPatient = () => {
    if (appointment) {
      setLocation(`/appointment/${appointment?.id}`);
    } else {
      setLocation("/appointment-flow");
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
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex items-center justify-between">
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
          <h1 className="text-white font-semibold text-lg">SOAP Notes</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1"
            onClick={handleProceedToTreatment}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Proceed to Treatment</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1"
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            <span>Save Notes</span>
          </Button>
        </div>
      </div>

      {/* Workflow Navigation */}
      <div className="px-4 pt-3">
        <WorkflowNavigation
          appointmentId={appointment?.id}
          petId={patient?.petid?.toString()}
          currentStep="soap"
        />
      </div>

      {/* Patient header */}
      <div className="bg-gradient-to-b from-indigo-50 to-white pt-8 pb-6 px-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Patient photo and basic info */}
          <div className="flex gap-6">
            <div className="relative">
              <div className="h-28 w-28 rounded-xl shadow-md overflow-hidden flex-shrink-0 border-4 border-white">
                <img
                  src={
                    patient?.data_image
                      ? `data:image/png;base64,${patient.data_image}`
                      : "/fallback-image.png"
                  }
                  alt={patient.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // target.src = "https://via.placeholder.com/100?text=Pet";
                  }}
                />
              </div>
              {patient.gender && (
                <div
                  className={`absolute bottom-0 right-0 h-7 w-7 rounded-full flex items-center justify-center text-white shadow-md ${
                    patient.gender === "Male" ? "bg-blue-500" : "bg-pink-500"
                  }`}
                >
                  {patient.gender === "Male" ? "♂" : "♀"}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.name}
                </h1>
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-2.5 py-0.5">
                  {patient.breed}
                </Badge>
              </div>
              <div className="mt-1 text-gray-500 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">ID:</span>{" "}
                  {patient.petid}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">Age:</span>{" "}
                  {patient.age}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">Weight:</span>{" "}
                  {patient.weight}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1.5 px-2 py-0.5">
                  <Calendar className="h-3 w-3" />
                  <span>{appointment.date}</span>
                </Badge>
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 flex items-center gap-1.5 px-2 py-0.5">
                  <Clock className="h-3 w-3" />
                  {/* <span>{formatTimeRange(appointment.time_slot.start_time, appointment.time_slot.end_time)}</span> */}
                </Badge>
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 flex items-center gap-1.5 px-2 py-0.5">
                  <Stethoscope className="h-3 w-3" />
                  <span>{appointment.doctor.doctor_name}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Visit reason */}
        {/* <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <FileText className="mr-2 h-4 w-4 text-indigo-500" />
            Reason for Visit
          </h3>
          <p className="mt-2 text-gray-600">{appointment.reason}</p>
        </div> */}
      </div>

      {/* Main content */}
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <NotebookText className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">
                Medical SOAP Notes
              </h2>
            </div>
            {/* <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRecording}
                className={cn(
                  "border-gray-200",
                  isRecording ? "text-red-600 border-red-200 bg-red-50" : ""
                )}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-1" /> Stop Dictation
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-1" /> Start Dictation
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
            </div> */}
          </div>

          {/* Guidance alert */}
          <div className="p-4 m-4 bg-blue-50 border border-blue-200 rounded-md">
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
              <TabsList className="inline-flex p-1 bg-gray-100 rounded-md">
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
                {/* <TabsTrigger 
                  value="plan" 
                  className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                >
                  Plan
                </TabsTrigger> */}
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
                {/* 
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileBarChart className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      P - Plan (Treatment & Next Steps)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter treatment plan, medications, follow-up instructions..."
                    className="min-h-[200px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                    value={localSoapData.plan}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("plan", e.target.value)
                    }
                  />
                </div> */}
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

              {/* Tab Plan */}
              {/* <TabsContent value="plan" className="py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileBarChart className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      P - Plan (Treatment & Next Steps)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter treatment plan, medications, follow-up instructions..."
                    className="min-h-[400px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                    value={localSoapData.plan}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("plan", e.target.value)
                    }
                  />
                </div>
              </TabsContent> */}
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
                onClick={handleSave}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Save className="h-4 w-4 mr-2" />
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
