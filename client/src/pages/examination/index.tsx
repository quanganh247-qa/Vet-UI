import React, { useState } from "react";
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
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: appointment, isLoading: isAppointmentLoading } =
    useAppointmentData(id);
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
      }
    };

    console.log("objectiveData", JSON.stringify(objectiveData, null, 2));
    
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

      navigate(`/appointment/${id}/soap`);
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
    // navigate(`/appointment/${id}/soap`);
  };

  if (isAppointmentLoading || isPatientLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
    <div className="flex justify-center min-h-screen bg-gray-50">
      <div className="container max-w-screen-xl mx-auto my-4 px-4">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 h-8 w-8 text-white hover:bg-white/20"
                onClick={() => navigate(`/appointment/${id}`)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Patient Examination
                </h1>
                <p className="text-indigo-100 text-sm">
                  Record physical findings and system examination
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={saveExamination}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Save & Proceed to SOAP
              </Button>
            </div>
          </div>
        </div>

        {/* Workflow Navigation */}
        <WorkflowNavigation
          appointmentId={id}
          petId={patient?.pet_id?.toString()}
          currentStep="examination"
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Left Column - Patient Details & Examination Form */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Patient Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="flex items-center px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                <div className="h-14 w-14 rounded-lg shadow-sm overflow-hidden flex-shrink-0 border-2 border-white bg-indigo-100 mr-3">
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
                      target.src = "https://via.placeholder.com/100?text=Pet";
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {patient?.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-2.5 py-0.5">
                      {patient?.breed}
                    </Badge>
                    <div className="text-gray-600 text-sm flex items-center gap-3 ml-1">
                      <span className="flex items-center">
                        <span className="font-medium text-gray-700">ID:</span>
                        <span className="ml-1">{patient?.petid}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs
                defaultValue="physical"
                className="px-6 py-5"
                onValueChange={setActiveTab}
                value={activeTab}
              >
                <TabsList className="inline-flex p-1 bg-gray-100 rounded-md">
                  <TabsTrigger
                    value="physical"
                    className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                  >
                    <Thermometer className="w-4 h-4 mr-2" />
                    Physical Examination
                  </TabsTrigger>
                  <TabsTrigger
                    value="systems"
                    className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                  >
                    <ScanLine className="w-4 h-4 mr-2" />
                    Systems Examination
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="physical" className="pt-5 space-y-6">
                  {/* Vital Signs */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800 flex items-center">
                        <Activity className="mr-2 h-4 w-4 text-indigo-500" />
                        Vital Signs
                      </h3>
                    </div>
                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Weight (kg)
                          </label>
                          <Input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="Enter weight in kg"
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Temperature (°C)
                          </label>
                          <Input
                            type="number"
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                            placeholder="Enter temperature in °C"
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Heart Rate (bpm)
                          </label>
                          <Input
                            type="number"
                            value={heartRate}
                            onChange={(e) => setHeartRate(e.target.value)}
                            placeholder="Enter heart rate in bpm"
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Respiratory Rate (rpm)
                          </label>
                          <Input
                            type="number"
                            value={respiratoryRate}
                            onChange={(e) => setRespiratoryRate(e.target.value)}
                            placeholder="Enter respiratory rate in rpm"
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            General Notes
                          </label>
                          <Textarea
                            value={generalNotes}
                            onChange={(e) => setGeneralNotes(e.target.value)}
                            placeholder="Additional observations and notes"
                            rows={3}
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="systems" className="pt-5 space-y-6">
                  {/* Cardiovascular and Respiratory */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800 flex items-center">
                        <Heart className="mr-2 h-4 w-4 text-indigo-500" />
                        Cardiovascular & Respiratory
                      </h3>
                    </div>
                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Cardiovascular
                          </label>
                          <Textarea
                            value={cardiovascular}
                            onChange={(e) => setCardiovascular(e.target.value)}
                            placeholder="Heart sounds, pulses, etc."
                            rows={3}
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Respiratory
                          </label>
                          <Textarea
                            value={respiratory}
                            onChange={(e) => setRespiratory(e.target.value)}
                            placeholder="Lung sounds, breathing pattern, etc."
                            rows={3}
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Digestive and Musculoskeletal */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800 flex items-center">
                        <Activity className="mr-2 h-4 w-4 text-indigo-500" />
                        Gastrointestinal & Musculoskeletal
                      </h3>
                    </div>
                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Gastrointestinal
                          </label>
                          <Textarea
                            value={gastrointestinal}
                            onChange={(e) =>
                              setGastrointestinal(e.target.value)
                            }
                            placeholder="Abdomen, oral cavity, etc."
                            rows={3}
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Musculoskeletal
                          </label>
                          <Textarea
                            value={musculoskeletal}
                            onChange={(e) => setMusculoskeletal(e.target.value)}
                            placeholder="Gait, joints, muscles, etc."
                            rows={3}
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Neurological and Integumentary */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800 flex items-center">
                        <ScanLine className="mr-2 h-4 w-4 text-indigo-500" />
                        Neurological & Skin
                      </h3>
                    </div>
                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Neurological
                          </label>
                          <Textarea
                            value={neurological}
                            onChange={(e) => setNeurological(e.target.value)}
                            placeholder="Reflexes, responses, etc."
                            rows={3}
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Skin/Coat
                          </label>
                          <Textarea
                            value={skin}
                            onChange={(e) => setSkin(e.target.value)}
                            placeholder="Lesions, parasites, etc."
                            rows={3}
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Eyes and Ears */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800 flex items-center">
                        <Eye className="mr-2 h-4 w-4 text-indigo-500" />
                        Special Senses
                      </h3>
                    </div>
                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Eyes
                          </label>
                          <Textarea
                            value={eyes}
                            onChange={(e) => setEyes(e.target.value)}
                            placeholder="Pupils, discharge, etc."
                            rows={3}
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Ears
                          </label>
                          <Textarea
                            value={ears}
                            onChange={(e) => setEars(e.target.value)}
                            placeholder="Discharge, inflammation, etc."
                            rows={3}
                            className="bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Column - Room assignment and quick actions */}
          <div className="md:col-span-3 flex flex-col gap-6">
            {/* Room Assignment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-800 flex items-center">
                  <Stethoscope className="mr-2 h-4 w-4 text-indigo-500" />
                  Examination Room
                </h3>
              </div>
              <div className="p-5">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                  <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                    Current Room
                  </label>
                  <div className="text-gray-700 font-medium bg-white p-2 rounded border border-gray-200">
                    {appointment?.room_name}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Quick Actions
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() =>
                        navigate(`/appointment/${id}/lab-management`)
                      }
                    >
                      <FlaskConical className="mr-2 h-4 w-4 text-indigo-500" />
                      Order Lab Tests
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => navigate(`/appointment/${id}/soap`)}
                    >
                      <FileText className="mr-2 h-4 w-4 text-indigo-500" />
                      SOAP Notes
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start col-span-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                      onClick={() => transferToSOAP()}
                    >
                      <Activity className="mr-2 h-4 w-4 text-indigo-600" />
                      Transfer to SOAP Objective
                    </Button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Button
                    onClick={saveExamination}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Examination
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Examination;
