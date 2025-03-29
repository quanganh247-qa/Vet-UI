import React, { useState, useEffect } from "react";
import { 
  User,
  Bell,
  Search,
  Menu,
  Calendar,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  FileText,
  Clipboard,
  Pill,
  Activity,
  Zap,
  PlusCircle,
  Layers,
  List,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  CheckSquare,
  X,
  Filter,
  Download,
  Printer,
  Eye,
  RotateCcw,
  Settings,
  MessageSquare,
  Circle,
  Play,
} from "lucide-react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  useTreatmentPhasesData,
  useTreatmentsData,
} from "@/hooks/use-treatment";
import { PhaseMedicine, Treatment, TreatmentPhase } from "@/types";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData } from "@/hooks/use-pet";
import { useAllergiesData } from "@/hooks/use-allergy";
import WorkflowNavigation from "@/components/WorkflowNavigation";

const TreatmentManagement: React.FC = () => {
  // State for active view
  const [activeView, setActiveView] = useState<"list" | "detail" | "new">(
    "list"
  );
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number | null>(
    null
  );
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>(
    {}
  );
  const [aiSuggestionsVisible, setAiSuggestionsVisible] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();

  // const {appointmentID} = useParams<{appointmentID?: string}>();
  const { petId } = useParams<{ petId?: string }>();

  // Get appointment id from query params
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract appointmentId from URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get('appointmentId');
    if (urlAppointmentId) {
      setAppointmentId(urlAppointmentId);
      console.log("Found appointmentId in URL params:", urlAppointmentId);
    }
  }, []);

  const { data: treatments, isLoading: isTreatmentsLoading } = useTreatmentsData(petId || "");

  const { data: patientData, isLoading: isPatientLoading } = usePatientData( petId || "");

  const { data: alergies, isLoading: isAlertsLoading } = useAllergiesData( petId || "");

  const selectedTreatment = treatments && treatments.find((t: Treatment) => t.id === selectedTreatmentId);


  const { data: phases, isLoading: isPhasesLoading } = useTreatmentPhasesData(
    selectedTreatment?.id?.toString() || ""
  );

  console.log("phases", phases);
  console.log("isPhasesLoading", isPhasesLoading);
  
  // Toggle phase expansion
  const togglePhaseExpansion = (phaseId: number) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };
  
  // Handle selecting treatment for detailed view
  const handleSelectTreatment = (treatmentId: number) => {
    setSelectedTreatmentId(treatmentId);
    setActiveView("detail");
  };
  
  // Handle back button click
  const handleBackClick = () => {
    if (activeView === "detail") {
      setActiveView("list");
      setSelectedTreatmentId(null);
    } else if (activeView === "new") {
      setActiveView("list");
    }
  };
  
  // Toggle AI suggestions visibility
  const toggleAiSuggestions = () => {
    setAiSuggestionsVisible(!aiSuggestionsVisible);
  };
  
  // Handle applying an AI suggestion
  const handleApplyAiSuggestion = (suggestion: any) => {
    // In a real app, this would apply the suggestion to the current treatment
    console.log("Applying suggestion:", suggestion);
    setAiSuggestionsVisible(false);
  };
  
  // Apply AI medication dosage
  const handleApplyMedicationDosage = (medication: any) => {
    // In a real app, this would apply the medication to the current phase
    console.log("Applying medication:", medication);
  };
  
  // Calculate treatment progress
  const calculateProgress = (treatment: Treatment) => {
    if (!phases || phases.length === 0) return 0;
    
    const completedPhases = phases.filter(
      (phase: TreatmentPhase) => phase.status === "Completed"
    ).length;
    
    return Math.round((completedPhases / phases.length) * 100);
  };
  
  return (
    <div className="container max-w-screen-xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 -mx-6 -mt-6 md:-mx-8 md:-mt-8 px-6 py-4 md:px-8 md:py-5 mb-4 rounded-br-xl rounded-bl-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8 text-white hover:bg-white/20"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Treatment Management
              </h1>
              <p className="text-indigo-100 text-sm">
                Manage treatment plans and protocols
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeView === "detail" && selectedTreatment && (
              <Button 
                onClick={handleBackClick}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/20"
              >
                Back to List
              </Button>
            )}
            {activeView === "list" && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setActiveView("new")}
              >
                <PlusCircle size={16} className="mr-1" />
                New Treatment
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Navigation */}
      <div className="mb-4">
        <WorkflowNavigation 
          appointmentId={appointmentId || undefined} 
          petId={petId}
          currentStep="treatment" 
        />
      </div>
      
      {/* Patient Info */}
      <div className="bg-gradient-to-b from-indigo-50 to-white pt-6 pb-4 px-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-xl shadow-md overflow-hidden flex-shrink-0 border-2 border-white bg-indigo-100 flex items-center justify-center">
              <User size={28} className="text-indigo-400" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {patientData?.name}
                </h2>
                {alergies?.length > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1 px-2 py-1">
                    <AlertCircle size={14} className="mr-1" />
                    Medical Alerts
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-2.5 py-0.5">
                  {patientData?.type}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-2.5 py-0.5">
                  {patientData?.breed}
                </Badge>
                <div className="text-gray-600 text-sm flex items-center gap-3 ml-1">
                  <span className="flex items-center">
                    <span className="font-medium text-gray-700">Age:</span>{" "}
                    <span className="ml-1">{patientData?.age}</span>
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="flex items-center">
                    <span className="font-medium text-gray-700">Weight:</span>{" "}
                    <span className="ml-1">{patientData?.weight}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="bg-white shadow-sm flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <MessageSquare size={14} className="text-blue-500" />
              <span>Message Owner</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white shadow-sm flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Printer size={14} className="text-gray-500" />
              <span>Print Summary</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="w-full px-6 py-6">
        {/* Treatment List View */}
        {activeView === "list" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Clipboard className="mr-2 h-5 w-5 text-indigo-600" />
                Treatment Plans
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white shadow-sm flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Download size={14} className="text-gray-600" />
                  <span>Export</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white shadow-sm flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setAiSuggestionsVisible(!aiSuggestionsVisible)
                  }
                >
                  <Zap size={14} className="text-amber-500" />
                  <span>AI Assist</span>
                </Button>
              </div>
            </div>
            
            {/* Treatment Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {treatments === undefined ? (
                <div>Loading treatments...</div>
              ) : (
                treatments.map((treatment: Treatment) => (
                  <div
                    key={treatment.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                    onClick={() => handleSelectTreatment(treatment.id)}
                  >
                    <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {treatment.type}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1 flex items-center">
                          <Calendar
                            size={14}
                            className="mr-1.5 text-gray-400"
                          />
                          Started:{" "}
                          {new Date(
                            treatment.start_date
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        className={
                          treatment.status === "Completed"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : treatment.status === "In Progress"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : treatment.status === "Not Started"
                            ? "bg-gray-100 text-gray-800 border-gray-200"
                            : "bg-indigo-100 text-indigo-800 border-indigo-200" // For Ongoing
                        }
                      >
                        {treatment.status}
                      </Badge>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 uppercase font-medium">
                            Type
                          </div>
                          <div className="font-medium text-gray-800 mt-1">
                            {treatment.type}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-gray-500 uppercase font-medium">
                            Primary Vet
                          </div>
                          <div className="font-medium text-gray-800 mt-1">
                            {treatment.doctor_name}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 uppercase font-medium">
                          Description
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                          {treatment.description}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 uppercase font-medium flex justify-between items-center">
                          <span>Progress</span>
                          <span className="font-medium text-indigo-600">
                            {calculateProgress(treatment)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${calculateProgress(treatment)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          <span>{phases?.length} phases</span>
                          {" • "}
                          <span>
                            {
                              phases?.filter(
                                (p: TreatmentPhase) =>
                                  p.status === "Completed"
                              ).length
                            }{" "}
                            completed
                          </span>
                        </div>
                        
                        <Button 
                          className="bg-indigo-600 hover:bg-indigo-700"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Treatment Detail View */}
        {activeView === "detail" && selectedTreatment && (
          <div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all mb-6">
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {selectedTreatment.type}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-4">
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1.5 text-gray-400" />
                      Started:{" "}
                      {new Date(
                        selectedTreatment.start_date
                      ).toLocaleDateString()}
                    </span>
                    {selectedTreatment.end_date && (
                      <span className="flex items-center">
                        <Calendar
                          size={14}
                          className="mr-1.5 text-gray-400"
                        />
                        End:{" "}
                        {new Date(
                          selectedTreatment.end_date
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Badge
                    className={
                      selectedTreatment.status === "Completed"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : selectedTreatment.status === "In Progress"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : selectedTreatment.status === "Not Started"
                        ? "bg-gray-100 text-gray-800 border-gray-200"
                        : "bg-indigo-100 text-indigo-800 border-indigo-200" // For Ongoing
                    }
                  >
                    {selectedTreatment.status}
                  </Badge>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white border-gray-200"
                    >
                      <Edit size={14} className="text-gray-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white border-gray-200"
                    >
                      <Printer size={14} className="text-gray-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white border-gray-200"
                    >
                      <MoreHorizontal size={14} className="text-gray-600" />
                    </Button>
                  </div>
                </div>
              </div>
            
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase font-medium">
                      Type
                    </div>
                    <div className="font-medium text-gray-800 mt-1">
                      {selectedTreatment.type}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase font-medium">
                      Primary Veterinarian
                    </div>
                    <div className="font-medium text-gray-800 mt-1">
                      {selectedTreatment.doctor_name  }
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase font-medium">
                      Status
                    </div>
                    <div className="font-medium text-gray-800 mt-1 flex items-center">
                      {selectedTreatment.status === "Completed" && (
                        <CheckCircle
                          size={14}
                          className="mr-1.5 text-green-600"
                        />
                      )}
                      {selectedTreatment.status === "In Progress" && (
                        <Activity
                          size={14}
                          className="mr-1.5 text-blue-600"
                        />
                      )}
                      {selectedTreatment.status === "Not Started" && (
                        <Clock size={14} className="mr-1.5 text-gray-600" />
                      )}
                      {selectedTreatment.status === "Ongoing" && (
                        <Zap size={14} className="mr-1.5 text-indigo-600" />
                      )}
                      {selectedTreatment.status}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-medium">
                    Description
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    {selectedTreatment.description}
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="text-xs text-gray-500 uppercase font-medium flex justify-between items-center">
                    <span>Overall Progress</span>
                    <span className="font-medium text-indigo-600">
                      {calculateProgress(selectedTreatment)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${calculateProgress(selectedTreatment)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phases Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Layers className="mr-2 h-5 w-5 text-indigo-600" />
                  Treatment Phases
                </h2>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white shadow-sm flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors"
                    onClick={toggleAiSuggestions}
                  >
                    <Zap size={14} className="text-amber-500" />
                    <span>AI Suggestions</span>
                  </Button>
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
                    size="sm"
                  >
                    <PlusCircle size={14} className="mr-1" />
                    Add Phase
                  </Button>
                </div>
              </div>
              
              {isPhasesLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading phases...</p>
                </div>
              ) : phases && phases.length > 0 ? (
                <div className="space-y-4">
                  {phases.map((phase: TreatmentPhase) => (
                    <div
                      key={phase.id}
                      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div
                        className={`px-5 py-3 border-b flex justify-between items-center cursor-pointer ${
                          phase.status === "Completed"
                            ? "bg-gradient-to-r from-green-50 to-white"
                            : phase.status === "In Progress"
                            ? "bg-gradient-to-r from-blue-50 to-white"
                            : "bg-gradient-to-r from-gray-50 to-white"
                        }`}
                        onClick={() => togglePhaseExpansion(phase.id)}
                      >
                        <div className="flex items-center">
                          <div
                            className={`p-1.5 rounded-lg mr-3 ${
                              phase.status === "Completed"
                                ? "bg-green-100"
                                : phase.status === "In Progress"
                                ? "bg-blue-100"
                                : "bg-gray-100"
                            }`}
                          >
                            {phase.status === "Completed" ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : phase.status === "In Progress" ? (
                              <Activity className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {phase.phase_name}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-4">
                              <span className="flex items-center">
                                <Calendar
                                  size={12}
                                  className="mr-1.5 text-gray-400"
                                />
                                {new Date(
                                  phase.start_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              phase.status === "Completed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : phase.status === "In Progress"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {phase.status}
                          </Badge>
                          <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform ${
                              expandedPhases[phase.id] ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                      
                      {expandedPhases[phase.id] && (
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Medications Section */}
                            <div className="rounded-lg border border-gray-200">
                              <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b">
                                <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                                  <Pill className="mr-2 h-4 w-4 text-indigo-600" />
                                  Medications
                                </h3>
                              </div>
                              
                              <div className="p-4">
                                {phase.medications?.length > 0 ? (
                                  <div className="space-y-3">
                                    {phase.medications.map((med: PhaseMedicine) => (
                                      <div
                                        key={med.phase_id}
                                        className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/30"
                                      >
                                        <div className="flex justify-between">
                                          <div className="font-medium text-gray-900">{med.medicine_name}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4">No medications in this phase</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">No phases found for this treatment</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentManagement;