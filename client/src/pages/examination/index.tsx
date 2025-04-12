import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData } from "@/hooks/use-pet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useUpdateSOAP } from "@/hooks/use-soap";
import { ObjectiveData } from "@/types";

const Examination: React.FC = () => {
  // Lấy params từ cả route params và query params
  const { id: routeId } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

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
    
    console.log("Examination URL Params:", { urlAppointmentId, urlPetId, routeId });
    
    // Thiết lập appointmentId và petId theo thứ tự ưu tiên
    let appointmentIdValue = urlAppointmentId || routeId || null;
    let petIdValue = urlPetId || null;
    
    setWorkflowParams({
      appointmentId: appointmentIdValue,
      petId: petIdValue
    });
    
    console.log("Examination Workflow Params Set:", { appointmentIdValue, petIdValue });
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

  const { data: appointment, isLoading: isAppointmentLoading } =
    useAppointmentData(effectiveAppointmentId);
    
  const { data: patient, isLoading: isPatientLoading } = usePatientData(
    appointment?.pet?.pet_id
  );

  const [activeTab, setActiveTab] = useState("physical");
  const [selectedRoom, setSelectedRoom] = useState("");

  // Form state for physical examination
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [mucousMembranes, setMucousMembranes] = useState("");
  const [hydration, setHydration] = useState("");
  const [lymphNodes, setLymphNodes] = useState("");
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

  // Inside the component, add the SOAP update mutation
  const updateSoapMutation = useUpdateSOAP();

  const transferToSOAP = async () => {
    if (!appointment?.id) {
      toast({
        title: "Error",
        description: "Appointment not found",
        variant: "destructive",
      });
      return;
    }

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

    try {
      await updateSoapMutation.mutateAsync({
        appointmentID: appointment.id,
        subjective: "",
        objective: objectiveData,
        assessment: "",
        plan: "",
      });

      toast({
        title: "Examination Saved",
        description: "Examination findings saved and transferred to SOAP.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Điều hướng đến trang SOAP với query params
      const params = {
        appointmentId: effectiveAppointmentId,
        petId: appointment?.pet?.pet_id
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

  // Save examination findings
  const saveExamination = () => {
    // Here you would typically save the data to your backend
    toast({
      title: "Examination Saved",
      description: "Examination findings have been saved successfully.",
      className: "bg-green-50 border-green-200 text-green-800",
    });

    // Proceed to SOAP notes
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id
    };
    navigate(`/soap${buildUrlParams(params)}`);
  };

  // Navigate to patient page
  const navigateToPatient = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id
    };
    navigate(`/patient${buildUrlParams(params)}`);
  };

  // Navigate to lab management
  const navigateToLabManagement = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id
    };
    navigate(`/lab-management${buildUrlParams(params)}`);
  };

  // Navigate to SOAP notes
  const navigateToSOAP = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id
    };
    navigate(`/soap${buildUrlParams(params)}`);
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
    <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex items-center justify-between">
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
          <h1 className="text-white font-semibold text-lg">Clinical Examination</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={saveExamination}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 text-xs"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Save & Proceed to SOAP</span>
          </Button>
        </div>
      </div>

      {/* Workflow Navigation */}
      <div className="px-4 pt-3">
        <WorkflowNavigation
          appointmentId={effectiveAppointmentId}
          petId={patient?.pet_id?.toString()}
          currentStep="examination"
        />
      </div>

      {/* Patient header */}
      <div className="bg-gradient-to-b from-indigo-50 to-white pt-4 pb-4 px-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Patient photo and basic info */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative mx-auto sm:mx-0">
              <div className="h-24 w-24 rounded-lg shadow overflow-hidden flex-shrink-0 border-2 border-white">
                <img
                  src={
                    patient?.data_image
                      ? `data:image/png;base64,${patient.data_image}`
                      : "/fallback-image.png"
                  }
                  alt={patient?.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // target.src = "https://via.placeholder.com/100?text=Pet";
                  }}
                />
              </div>
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900">
                {patient?.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-2 py-0.5 text-xs">
                  {patient?.breed}
                </Badge>
                <div className="text-gray-600 text-xs flex items-center gap-2 ml-1">
                  <span className="flex items-center">
                    <span className="font-medium text-gray-700">ID:</span>
                    <span className="ml-1">{patient?.petid}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons - right side */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-end mt-3 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-indigo-600 border-indigo-200 hover:bg-indigo-50 flex items-center gap-1.5 text-xs"
              onClick={() => transferToSOAP()}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Transfer to SOAP</span>
            </Button>
          </div>
        </div>
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
                {/* Vital Signs */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                  <div className="flex justify-between items-center px-3 py-2 bg-gradient-to-r from-indigo-50 to-white border-b">
                    <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                      <Activity className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Vital Signs
                    </h3>
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
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="Enter weight in kg"
                          className="bg-white border-gray-200 text-sm h-8 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Temperature (°C)
                        </label>
                        <Input
                          type="number"
                          value={temperature}
                          onChange={(e) => setTemperature(e.target.value)}
                          placeholder="Enter temperature in °C"
                          className="bg-white border-gray-200 text-sm h-8 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Heart Rate (bpm)
                        </label>
                        <Input
                          type="number"
                          value={heartRate}
                          onChange={(e) => setHeartRate(e.target.value)}
                          placeholder="Enter heart rate in bpm"
                          className="bg-white border-gray-200 text-sm h-8 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Respiratory Rate (rpm)
                        </label>
                        <Input
                          type="number"
                          value={respiratoryRate}
                          onChange={(e) => setRespiratoryRate(e.target.value)}
                          placeholder="Enter respiratory rate in rpm"
                          className="bg-white border-gray-200 text-sm h-8 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          General Notes
                        </label>
                        <Textarea
                          value={generalNotes}
                          onChange={(e) => setGeneralNotes(e.target.value)}
                          placeholder="Additional observations and notes"
                          rows={2}
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-3">
                {/* Room Assignment */}
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
                        Complete Examination
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
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Cardiovascular
                        </label>
                        <Textarea
                          value={cardiovascular}
                          onChange={(e) => setCardiovascular(e.target.value)}
                          placeholder="Heart sounds, pulses, etc."
                          rows={2}
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Respiratory
                        </label>
                        <Textarea
                          value={respiratory}
                          onChange={(e) => setRespiratory(e.target.value)}
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
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Gastrointestinal
                        </label>
                        <Textarea
                          value={gastrointestinal}
                          onChange={(e) => setGastrointestinal(e.target.value)}
                          placeholder="Abdomen, oral cavity, etc."
                          rows={2}
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Musculoskeletal
                        </label>
                        <Textarea
                          value={musculoskeletal}
                          onChange={(e) => setMusculoskeletal(e.target.value)}
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
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Neurological
                        </label>
                        <Textarea
                          value={neurological}
                          onChange={(e) => setNeurological(e.target.value)}
                          placeholder="Reflexes, responses, etc."
                          rows={2}
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Skin/Coat
                        </label>
                        <Textarea
                          value={skin}
                          onChange={(e) => setSkin(e.target.value)}
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
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Eyes
                        </label>
                        <Textarea
                          value={eyes}
                          onChange={(e) => setEyes(e.target.value)}
                          placeholder="Pupils, discharge, etc."
                          rows={2}
                          className="bg-white border-gray-200 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                          Ears
                        </label>
                        <Textarea
                          value={ears}
                          onChange={(e) => setEars(e.target.value)}
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
                        Complete Examination
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

export default Examination;
