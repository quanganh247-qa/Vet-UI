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
  History,
  FileSymlink,
} from "lucide-react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define interfaces for medical history
interface MedicalHistory {
  id: number;
  condition: string;
  diagnosis_date: string;
  notes: string;
  status: string;
}

interface MedicalHistoryRequest {
  condition: string;
  diagnosis_date: string;
  notes: string;
}

const MedicalRecordManagement: React.FC = () => {
  // State for active view
  const [activeView, setActiveView] = useState<"list" | "detail" | "new">(
    "list"
  );
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
    null
  );

  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();

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

  const { data: patientData, isLoading: isPatientLoading } = usePatientData(
    petId || ""
  );

  const { data: alergies, isLoading: isAlertsLoading } = useAllergiesData(
    petId || ""
  );

  // Mock medical history data
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([
    {
      id: 1,
      condition: "Canine Parvovirus",
      diagnosis_date: "2023-05-15 10:30:00",
      notes: "Severe dehydration, vomiting, and diarrhea. Treated with IV fluids and antibiotics.",
      status: "Recovered",
    },
    {
      id: 2,
      condition: "Ear Infection",
      diagnosis_date: "2023-08-22 14:45:00",
      notes: "Bacterial infection in left ear. Prescribed ear drops and oral antibiotics.",
      status: "Active",
    },
    {
      id: 3,
      condition: "Hip Dysplasia",
      diagnosis_date: "2023-10-10 09:15:00",
      notes: "Moderate hip dysplasia observed in x-rays. Recommended weight management and joint supplements.",
      status: "Chronic",
    },
  ]);

  const selectedHistory = medicalHistory.find(
    (h) => h.id === selectedHistoryId
  );

  // Handle selecting history for detailed view
  const handleSelectHistory = (historyId: number) => {
    setSelectedHistoryId(historyId);
    setActiveView("detail");
  };

  // Handle back button click
  const handleBackClick = () => {
    if (activeView === "detail") {
      setActiveView("list");
      setSelectedHistoryId(null);
    } else if (activeView === "new") {
      setActiveView("list");
    }
  };

  // State for new medical history record
  const [newHistory, setNewHistory] = useState<MedicalHistoryRequest>({
    condition: "",
    diagnosis_date: new Date().toISOString().slice(0, 16).replace("T", " "),
    notes: "",
  });

  // State for form validation
  const [formErrors, setFormErrors] = useState<{
    condition?: string;
    diagnosis_date?: string;
  }>({});
  const [formTouched, setFormTouched] = useState<{
    condition: boolean;
    diagnosis_date: boolean;
  }>({
    condition: false,
    diagnosis_date: false,
  });

  // Validate form field
  const validateField = (name: string, value: string) => {
    if (name === "condition" && !value) {
      return "Condition is required";
    }
    if (name === "diagnosis_date" && !value) {
      return "Diagnosis date is required";
    }
    return "";
  };

  // Validate all form fields
  const validateForm = () => {
    const errors = {
      condition: validateField("condition", newHistory.condition),
      diagnosis_date: validateField("diagnosis_date", newHistory.diagnosis_date),
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

    // Update the history state
    setNewHistory({
      ...newHistory,
      [name]: value,
    });

    // Validate and update errors
    const error = validateField(name, value);
    setFormErrors({
      ...formErrors,
      [name]: error,
    });
  };

  // Handle creating a new medical history record
  const handleCreateHistory = () => {
    if (!petId) {
      toast({
        title: "Error",
        description: "Pet ID is required to create a medical history record",
        variant: "destructive",
      });
      return;
    }

    // Validate all fields
    if (!validateForm()) {
      // Set all fields as touched to show errors
      setFormTouched({
        condition: true,
        diagnosis_date: true,
      });

      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    // Mock creating a new record
    const newRecord: MedicalHistory = {
      id: Math.max(0, ...medicalHistory.map(h => h.id)) + 1,
      condition: newHistory.condition,
      diagnosis_date: newHistory.diagnosis_date,
      notes: newHistory.notes,
      status: "Active",
    };

    setMedicalHistory([...medicalHistory, newRecord]);

    toast({
      title: "Success",
      description: "Medical history record created successfully",
      className: "bg-green-50 border-green-200 text-green-800",
    });

    // Reset form
    setNewHistory({
      condition: "",
      diagnosis_date: new Date().toISOString().slice(0, 16).replace("T", " "),
      notes: "",
    });

    // Back to list view
    setActiveView("list");
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                Medical History
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeView === "detail" && selectedHistory && (
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
                New Medical Record
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
          currentStep="records"
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
        {/* Medical History List View */}
        {activeView === "list" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <History className="mr-2 h-5 w-5 text-indigo-600" />
                Medical History Records
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

            {/* Medical History Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {medicalHistory.length === 0 ? (
                <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No Medical History Records</h3>
                  <p className="text-gray-500 mb-4">There are no medical history records for this patient.</p>
                  <Button onClick={() => setActiveView("new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Record
                  </Button>
                </div>
              ) : (
                medicalHistory.map((history) => (
                  <div
                    key={history.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                    onClick={() => handleSelectHistory(history.id)}
                  >
                    <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {history.condition}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1 flex items-center">
                          <Calendar
                            size={14}
                            className="mr-1.5 text-gray-400"
                          />
                          Diagnosed: {formatDate(history.diagnosis_date)}
                        </div>
                      </div>
                      <Badge
                        className={
                          history.status === "Recovered"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : history.status === "Active"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200" // For Chronic
                        }
                      >
                        {history.status}
                      </Badge>
                    </div>

                    <div className="p-5">
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 uppercase font-medium">
                          Notes
                        </div>
                        <div className="text-sm text-gray-700 mt-1 line-clamp-3">
                          {history.notes}
                        </div>
                      </div>

                      <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
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

        {/* Medical History Detail View */}
        {activeView === "detail" && selectedHistory && (
          <div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all mb-6">
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {selectedHistory.condition}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-4">
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1.5 text-gray-400" />
                      Diagnosed: {formatDate(selectedHistory.diagnosis_date)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Badge
                    className={
                      selectedHistory.status === "Recovered"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : selectedHistory.status === "Active"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200" // For Chronic
                    }
                  >
                    {selectedHistory.status}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase font-medium">
                      Condition
                    </div>
                    <div className="font-medium text-gray-800 mt-1">
                      {selectedHistory.condition}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase font-medium">
                      Status
                    </div>
                    <div className="font-medium text-gray-800 mt-1 flex items-center">
                      {selectedHistory.status === "Recovered" && (
                        <CheckCircle
                          size={14}
                          className="mr-1.5 text-green-600"
                        />
                      )}
                      {selectedHistory.status === "Active" && (
                        <Activity size={14} className="mr-1.5 text-blue-600" />
                      )}
                      {selectedHistory.status === "Chronic" && (
                        <Zap size={14} className="mr-1.5 text-yellow-600" />
                      )}
                      {selectedHistory.status}
                    </div>
                  </div>
                </div>

                <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-medium">
                    Detailed Notes
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    {selectedHistory.notes || "No detailed notes available."}
                  </div>
                </div>

                <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-medium">
                    Related Documents
                  </div>
                  <div className="text-sm text-gray-700 mt-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-center">
                        <FileSymlink size={16} className="text-indigo-500 mr-2" />
                        <span>Diagnosis Lab Results</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-indigo-600">View</Button>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-center">
                        <FileSymlink size={16} className="text-indigo-500 mr-2" />
                        <span>Treatment Plan</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-indigo-600">View</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Medical History Form */}
        {activeView === "new" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <PlusCircle className="mr-2 h-5 w-5 text-primary" />
                Create New Medical Record
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackClick}
                className="border-2 border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
            </div>

            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-indigo-600" />
                  Medical Record Information
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6">
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateHistory();
                  }}
                >
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="condition"
                        className="text-sm font-medium text-gray-700"
                      >
                        Condition / Diagnosis <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="condition"
                        placeholder="Enter medical condition or diagnosis"
                        className={`h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 ${
                          formTouched.condition && formErrors.condition
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                        value={newHistory.condition}
                        onChange={(e) =>
                          handleInputChange("condition", e.target.value)
                        }
                        required
                        onBlur={() =>
                          setFormTouched({ ...formTouched, condition: true })
                        }
                      />
                      {formTouched.condition && formErrors.condition && (
                        <p className="text-xs text-red-500 mt-1">
                          {formErrors.condition}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Specify the medical condition or diagnosis
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="diagnosis-date"
                        className="text-sm font-medium text-gray-700"
                      >
                        Diagnosis Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="diagnosis-date"
                        type="datetime-local"
                        className={`h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 ${
                          formTouched.diagnosis_date && formErrors.diagnosis_date
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                        value={newHistory.diagnosis_date.replace(" ", "T")}
                        onChange={(e) =>
                          handleInputChange("diagnosis_date", e.target.value.replace("T", " "))
                        }
                        required
                        onBlur={() =>
                          setFormTouched({ ...formTouched, diagnosis_date: true })
                        }
                      />
                      {formTouched.diagnosis_date && formErrors.diagnosis_date && (
                        <p className="text-xs text-red-500 mt-1">
                          {formErrors.diagnosis_date}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Specify when the condition was diagnosed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="notes"
                        className="text-sm font-medium text-gray-700"
                      >
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Enter detailed notes about the condition, treatment, etc."
                        className="min-h-[120px] text-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                        value={newHistory.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                      />
                      <p className="text-xs text-gray-500">
                        Include any important details about the condition, symptoms, treatments, or recommendations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-6 mt-6 border-t-2 border-gray-100">
                    <div>
                      <Button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center">
                          <PlusCircle size={16} className="mr-1.5" />
                          <span className="font-medium text-white">
                            Create Medical Record
                          </span>
                        </div>
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

export default MedicalRecordManagement;
