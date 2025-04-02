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
  useAddTreatmentPhase,
  useAssignMedicine,
  useGetMedicinesByPhase,
  useMedicineSearch,
  useAddTreatment,
} from "@/hooks/use-treatment";
import {
  PhaseMedicine,
  Treatment,
  TreatmentPhase,
  CreateTreatmentPhaseRequest,
  AssignMedicineRequest,
  CreateTreatmentRequest,
} from "@/types";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData } from "@/hooks/use-pet";
import { useAllergiesData } from "@/hooks/use-allergy";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);

  // Add the useAddTreatment hook
  const addTreatmentMutation = useAddTreatment();
  const isSubmitting = addTreatmentMutation.isPending;
  const isError = addTreatmentMutation.isError;
  const error = addTreatmentMutation.error;

  const { id } = useParams<{ id?: string }>();
  const [,] = useLocation();

  // const {appointmentID} = useParams<{appointmentID?: string}>();
  const { petId } = useParams<{ petId?: string }>();

  // Get appointment id from query params
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    // Extract appointmentId from URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    if (urlAppointmentId) {
      setAppointmentId(urlAppointmentId);
    } else if (id) {
      // If no appointmentId in URL but we have an ID from route params, use it as fallback
      setAppointmentId(id);
    }
  }, [id]);

  const { data: treatments, isLoading: isTreatmentsLoading } =
    useTreatmentsData(petId || "");

  const { data: patientData, isLoading: isPatientLoading } = usePatientData(
    petId || ""
  );

  const { data: alergies, isLoading: isAlertsLoading } = useAllergiesData(
    petId || ""
  );


  const selectedTreatment =
    treatments &&
    treatments.find((t: Treatment) => t.id === selectedTreatmentId);

  const { data: phases, isLoading: isPhasesLoading } = useTreatmentPhasesData(
    selectedTreatment?.id?.toString() || ""
  );

  console.log("phases", phases);

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

  const { data: appointmentData, isLoading: isAppointmentLoading } =
    useAppointmentData(appointmentId || "");

  // Calculate treatment progress
  const calculateProgress = (treatment: Treatment) => {
    if (!phases || phases.length === 0) return 0;

    const completedPhases = phases.filter(
      (phase: TreatmentPhase) => phase.status === "Completed"
    ).length;

    return Math.round((completedPhases / phases.length) * 100);
  };

  // State for new treatment
  const [newTreatment, setNewTreatment] = useState<
    Partial<Treatment> & CreateTreatmentRequest
  >({
    pet_id: petId ? parseInt(petId) : 0,
    type: "",
    name: "",
    status: "Active",
    start_date: new Date().toISOString().split("T")[0],
    diseases: "",
    notes: "",
    doctor_id: 0,
  });

  // State for form steps
  const [formStep, setFormStep] = useState(0);

  // State for storing disease name (separate from the treatment object)
  const [diseaseName, setDiseaseName] = useState("");

  // State for form validation
  const [formErrors, setFormErrors] = useState<{
    type?: string;
    start_date?: string;
    name?: string;
  }>({});
  const [formTouched, setFormTouched] = useState<{
    type: boolean;
    start_date: boolean;
    name: boolean;
  }>({
    type: false,
    start_date: false,
    name: false,
  });

  // Validate form field
  const validateField = (name: string, value: string) => {
    if (name === "type" && !value) {
      return "Treatment type is required";
    }
    if (name === "start_date" && !value) {
      return "Start date is required";
    }
    if (name === "name" && !value) {
      return "Treatment name is required";
    }
    if (name === "diseases" && !value) {
      return "Diseases is required";
    }
    return "";
  };

  // Validate all form fields for current step
  const validateFormStep = () => {
    if (formStep === 0) {
      // Basic info validation
      const errors = {
        name: validateField("name", newTreatment.name || ""),
        type: validateField("type", newTreatment.type || ""),
      };

      setFormErrors(errors);
      return !Object.values(errors).some((error) => error);
    } else if (formStep === 1) {
      // Timeline validation
      const errors = {
        start_date: validateField("start_date", newTreatment.start_date),
      };

      setFormErrors(errors);
      return !Object.values(errors).some((error) => error);
    }

    return true;
  };

  // Handle next step in form
  const handleNextStep = () => {
    // Validate current step
    if (!validateFormStep()) {
      // Set fields as touched to show errors
      if (formStep === 0) {
        setFormTouched({
          ...formTouched,
          name: true,
          type: true,
        });
      } else if (formStep === 1) {
        setFormTouched({
          ...formTouched,
          start_date: true,
        });
      }

      return;
    }

    setFormStep((prev) => prev + 1);
  };

  // Handle previous step in form
  const handlePrevStep = () => {
    setFormStep((prev) => Math.max(0, prev - 1));
  };

  // Validate all form fields
  const validateForm = () => {
    const errors = {
      type: validateField("type", newTreatment.type || ""),
      start_date: validateField("start_date", newTreatment.start_date),
      name: validateField("name", newTreatment.name || ""),
    };

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  // Handle input changes with validation
  const handleInputChange = (name: string, value: string) => {
    // Update form touched state
    setFormTouched({
      ...formTouched,
      [name]: true,
    });

    // Update the treatment state
    setNewTreatment({
      ...newTreatment,
      [name]: value,
    });

    // Validate and update errors
    const error = validateField(name, value);
    setFormErrors({
      ...formErrors,
      [name]: error,
    });
  };

  // Handle creating a new treatment
  const handleCreateTreatment = async () => {
    if (!petId) {
      toast({
        title: "Error",
        description: "Pet ID is required to create a treatment",
        variant: "destructive",
      });
      return;
    }

    // Validate all fields
    if (!validateForm()) {
      // Set all fields as touched to show errors
      setFormTouched({
        type: true,
        start_date: true,
        name: true,
      });

      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    try {
      // Make sure pet_id is set correctly and prepare data according to API requirements
      const treatmentData: CreateTreatmentRequest = {
        pet_id: parseInt(petId),
        doctor_id: parseInt(appointmentData?.doctor_id || "0"),
        type: newTreatment.type,
        name: newTreatment.name,
        diseases: newTreatment.diseases || "",
        start_date: newTreatment.start_date,
        status: newTreatment.status || "Active",
        notes: newTreatment.notes || "",
      };

      // Add non-required fields from form (these will be added to the treatment on the server)
      const fullTreatmentData = {
        ...treatmentData,
        name: newTreatment.name,
        type: newTreatment.type,
        diseases: newTreatment.diseases || "",
        doctor_id: parseInt(appointmentData?.doctor_id || "0"),
        pet_id: parseInt(petId),
        start_date: newTreatment.start_date,
        status: newTreatment.status || "Active",
        notes: newTreatment.notes || "",
      };

      console.log("fullTreatmentData", fullTreatmentData);

      // Call the mutation to add the treatment - we pass the full data but the API will only use what's in the CreateTreatmentRequest interface
      // await addTreatmentMutation.mutateAsync(
      //   fullTreatmentData as CreateTreatmentRequest
      // );

      toast({
        title: "Success",
        description: "Treatment plan created successfully",
      });

      // Reset new treatment form
      setNewTreatment({
        ...newTreatment,
        type: "",
        name: "",
        status: "Active",
        start_date: new Date().toISOString().split("T")[0],
        diseases: "",
        doctor_id: 0,
      });
      setDiseaseName("");
      setFormStep(0);

      // Redirect to the list view to see the new treatment
      setActiveView("list");
    } catch (err) {
      console.error("Error creating treatment:", err);
      toast({
        title: "Error",
        description: "Failed to create treatment. Please try again.",
        variant: "destructive",
      });
    }
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
          appointmentId={appointmentId || id || undefined}
          petId={petId}
          currentStep="treatment"
        />
      </div>

      {/* Patient Info */}
      <div className="bg-gradient-to-b from-indigo-50 to-white pt-6 pb-4 px-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-xl shadow-md overflow-hidden flex-shrink-0 border-2 border-white bg-indigo-100 flex items-center justify-center">
              <img
                src={
                  patientData?.data_image
                    ? `data:image/png;base64,${patientData.data_image}`
                    : "/fallback-image.png"
                }
                alt={patientData?.name}
                className="w-full h-full object-cover rounded-xl"
              />
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
                          {new Date(treatment.start_date).toLocaleDateString()}
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
                                (p: TreatmentPhase) => p.status === "Completed"
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
                    {/* {selectedTreatment.end_date && (
                      <span className="flex items-center">
                        <Calendar size={14} className="mr-1.5 text-gray-400" />
                        End:{" "}
                        {new Date(
                          selectedTreatment.end_date
                        ).toLocaleDateString()}
                      </span>
                    )} */}
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
                      {selectedTreatment.doctor_name}
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
                        <Activity size={14} className="mr-1.5 text-blue-600" />
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
                                    {phase.medications.map(
                                      (med: PhaseMedicine) => (
                                        <div
                                          key={med.phase_id}
                                          className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/30"
                                        >
                                          <div className="flex justify-between">
                                            <div className="font-medium text-gray-900">
                                              {med.medicine_name}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-4">
                                    No medications in this phase
                                  </div>
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
                <div className="text-center py-6 text-gray-500">
                  No phases found for this treatment
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Treatment Form */}
        {activeView === "new" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <PlusCircle className="mr-2 h-5 w-5 text-primary" />
                Create New Treatment
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackClick}
                disabled={isSubmitting}
                className="border-2 border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
            </div>

            <Card className="shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    Treatment Information
                  </div>

                  {/* Simple step indicator */}
                  <div className="flex items-center gap-2 text-sm bg-white p-2 rounded-md shadow-sm">
                    <span
                      className={`px-3 py-1 rounded-full font-medium ${
                        formStep === 0
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      1
                    </span>
                    <span className="text-gray-300">→</span>
                    <span
                      className={`px-3 py-1 rounded-full font-medium ${
                        formStep === 1
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      2
                    </span>
                    <span className="text-gray-300">→</span>
                    <span
                      className={`px-3 py-1 rounded-full font-medium ${
                        formStep === 2
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      3
                    </span>
                  </div>
                </CardTitle>

                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span
                    className={formStep === 0 ? "text-primary font-medium" : ""}
                  >
                    Basic Info
                  </span>
                  <span
                    className={formStep === 1 ? "text-primary font-medium" : ""}
                  >
                    Timeline & Status
                  </span>
                  <span
                    className={formStep === 2 ? "text-primary font-medium" : ""}
                  >
                    Details
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (formStep === 2) {
                      handleCreateTreatment();
                    } else {
                      handleNextStep();
                    }
                  }}
                >
                  {/* Step 1: Basic Info */}
                  {formStep === 0 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="treatment-name"
                          className="text-sm font-medium"
                        >
                          Treatment Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="treatment-name"
                          placeholder="Enter treatment name"
                          className={`h-10 ${
                            formTouched.name && formErrors.name
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          value={newTreatment.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          required
                          onBlur={() =>
                            setFormTouched({ ...formTouched, name: true })
                          }
                        />
                        {formTouched.name && formErrors.name && (
                          <p className="text-xs text-red-500 mt-1">
                            {formErrors.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Give a clear and descriptive name for this treatment
                          plan
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="treatment-type"
                          className="text-sm font-medium"
                        >
                          Treatment Type <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="treatment-type"
                          placeholder="e.g., Surgery Recovery, Medication Protocol"
                          className={`h-10 ${
                            formTouched.type && formErrors.type
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          value={newTreatment.type}
                          onChange={(e) =>
                            handleInputChange("type", e.target.value)
                          }
                          required
                          onBlur={() =>
                            setFormTouched({ ...formTouched, type: true })
                          }
                        />
                        {formTouched.type && formErrors.type && (
                          <p className="text-xs text-red-500 mt-1">
                            {formErrors.type}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Specify the type of treatment being administered
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="disease"
                          className="text-sm font-medium"
                        >
                          Disease/Condition
                        </Label>
                        <Input
                          id="disease"
                          placeholder="e.g., Arthritis, Diabetes"
                          className="h-10"
                          value={diseaseName}
                          onChange={(e) => {
                            setDiseaseName(e.target.value);
                          }}
                        />
                        <p className="text-xs text-gray-500">
                          Indicate the primary condition being treated
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Timeline & Status */}
                  {formStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="treatment-status"
                          className="text-sm font-medium"
                        >
                          Status <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          defaultValue={newTreatment.status}
                          onValueChange={(value) =>
                            handleInputChange("status", value)
                          }
                        >
                          <SelectTrigger id="treatment-status" className="h-10">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Not Started">
                              Not Started
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Current status of this treatment plan
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="start-date"
                          className="text-sm font-medium"
                        >
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="start-date"
                          type="date"
                          className={`h-10 ${
                            formTouched.start_date && formErrors.start_date
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          value={newTreatment.start_date}
                          onChange={(e) =>
                            handleInputChange("start_date", e.target.value)
                          }
                          required
                          onBlur={() =>
                            setFormTouched({ ...formTouched, start_date: true })
                          }
                        />
                        {formTouched.start_date && formErrors.start_date && (
                          <p className="text-xs text-red-500 mt-1">
                            {formErrors.start_date}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          When the treatment began or will begin
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Additional Details */}
                  {formStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium">
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder="Any additional notes or instructions"
                          className="min-h-[80px] text-sm"
                          value={newTreatment.notes}
                          onChange={(e) =>
                            handleInputChange("notes", e.target.value)
                          }
                        />
                        <p className="text-xs text-gray-500">
                          Include any special instructions or reminders
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 mt-6 border-t-2 border-gray-100">
                    <div>
                      {formStep > 0 ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevStep}
                          disabled={isSubmitting}
                          className="flex items-center gap-1 h-11 px-5 border-2 border-gray-300 hover:bg-gray-100"
                        >
                          <ChevronLeft size={18} />
                          <span className="font-medium">Back</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackClick}
                          disabled={isSubmitting}
                          className="flex items-center gap-1 h-11 px-5 border-2 border-gray-300 hover:bg-gray-100"
                        >
                          <span className="font-medium">Cancel</span>
                        </Button>
                      )}
                    </div>

                    <div>
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 h-11 px-6 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span className="font-medium text-black">
                              Creating...
                            </span>
                          </div>
                        ) : formStep < 2 ? (
                          <div className="flex items-center">
                            <span className="font-medium text-black">Next</span>
                            <ChevronRight size={18} className="ml-1" />
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <PlusCircle size={16} className="mr-1.5" />
                            <span className="font-medium text-black">
                              Create Treatment
                            </span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentManagement;
