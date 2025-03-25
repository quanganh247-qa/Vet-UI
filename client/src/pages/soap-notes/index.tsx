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
  FileBarChart
} from "lucide-react";
import {
  getAppointmentById,
  getPatientById,
  getDoctorById,
  type Appointment,
  type Patient,
  type Doctor,
} from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";
import QuickNotes from "@/components/medical-records/QuickNotes";
import { useGetSOAP, useUpdateSOAP } from "@/hooks/use-soap";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData } from "@/hooks/use-pet";
import { formatAppointmentTime, formatTimeRange, cn } from "@/lib/utils";
import WorkflowNavigation from "@/components/WorkflowNavigation";

type InputChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;

const SoapNotes = () => {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);

  const { data: appointment, isLoading: isAppointmentLoading, error: appointmentError } = useAppointmentData(id);
  const { data: soapData = { subjective: '', objective: '', assessment: '', plan: '' }, isLoading: isSoapLoading, error: soapError } = useGetSOAP(appointment?.id);
  const { data: patient, isLoading: isPatientLoading, error: patientError } = usePatientData(appointment?.pet?.pet_id);
  const updateSoapMutation = useUpdateSOAP();

  const [localSoapData, setLocalSoapData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  // Initialize local state when remote data loads
  useEffect(() => {
    if (soapData) {
      setLocalSoapData({
        subjective: soapData.subjective || '',
        objective: soapData.objective || '',
        assessment: soapData.assessment || '',
        plan: soapData.plan || '',
      });
    }
  }, [soapData]);

  const handleInputChange = (field: keyof typeof localSoapData, value: string) => {
    setLocalSoapData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement speech-to-text functionality here
  };

  const handleSave = async () => {
    if (!appointment?.id) return;
    
    try {
      await updateSoapMutation.mutateAsync({
        appointmentID: appointment.id,
        ...localSoapData
      });

      // alert("SOAP notes saved successfully!");
    } catch (error) {
      console.error("Error saving SOAP notes:", error);
      // alert("Failed to save SOAP notes. Please try again.");
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
                  src={patient.image_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"}
                  alt={patient.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/100?text=Pet";
                  }}
                />
              </div>
              {patient.gender && (
                <div
                  className={`absolute bottom-0 right-0 h-7 w-7 rounded-full flex items-center justify-center text-white shadow-md ${
                    patient.gender === "Male"
                      ? "bg-blue-500"
                      : "bg-pink-500"
                  }`}
                >
                  {patient.gender === "Male" ? "♂" : "♀"}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-2.5 py-0.5">{patient.breed}</Badge>
              </div>
              <div className="mt-1 text-gray-500 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">ID:</span> {patient.petid}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">Age:</span> {patient.age}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">Weight:</span> {patient.weight}
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
              <h2 className="text-lg font-semibold text-gray-800">Medical SOAP Notes</h2>
            </div>
            <div className="flex items-center gap-2">
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
            </div>
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
                <TabsTrigger 
                  value="plan" 
                  className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                >
                  Plan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6 py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      S - Subjective (Patient/Client Report)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter client's description of the problem..."
                    className="min-h-[100px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                    value={localSoapData.subjective}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("subjective", e.target.value)
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      O - Objective (Clinical Findings)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter physical exam findings, vital signs, test results..."
                    className="min-h-[100px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                    value={localSoapData.objective}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("objective", e.target.value)
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardEdit className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      A - Assessment (Diagnosis)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter diagnosis or assessment of the condition..."
                    className="min-h-[100px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                    value={localSoapData.assessment}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("assessment", e.target.value)
                    }
                  />
                </div>

                {/* <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileBarChart className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      P - Plan (Treatment & Next Steps)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter treatment plan, medications, follow-up instructions..."
                    className="min-h-[100px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                    value={localSoapData.plan}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("plan", e.target.value)
                    }
                  />
                </div> */}
              </TabsContent>

              <TabsContent value="subjective" className="py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      S - Subjective (Patient/Client Report)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter client's description of the problem..."
                    className="min-h-[300px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                    value={localSoapData.subjective}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("subjective", e.target.value)
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="objective" className="py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      O - Objective (Clinical Findings)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter physical exam findings, vital signs, test results..."
                    className="min-h-[300px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                    value={localSoapData.objective}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("objective", e.target.value)
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="assessment" className="py-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardEdit className="h-4 w-4 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">
                      A - Assessment (Diagnosis)
                    </label>
                  </div>
                  <Textarea
                    placeholder="Enter diagnosis or assessment of the condition..."
                    className="min-h-[300px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                    value={localSoapData.assessment}
                    onChange={(e: InputChangeEvent) =>
                      handleInputChange("assessment", e.target.value)
                    }
                  />
                </div>
              </TabsContent>

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
                    className="min-h-[300px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
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
                Save Notes
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
