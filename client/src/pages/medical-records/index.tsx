import React, { useState, useEffect, useMemo } from "react";
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
import {
  useMedicalRecord,
  useCreateMedicalRecord,
} from "@/hooks/use-medical-record";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';


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

// Helper function to format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const badgeClass = useMemo(() => {
    switch (status) {
      case "Recovered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default: // For Chronic
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  }, [status]);

  return <Badge className={badgeClass}>{status}</Badge>;
};

// Medical History Card Component
const MedicalHistoryCard = ({ 
  history, 
  onClick 
}: { 
  history: MedicalHistory; 
  onClick: () => void 
}) => (
  <div
    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
    onClick={onClick}
  >
    <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-gray-800">{history.condition}</h3>
        <div className="text-sm text-gray-600 mt-1 flex items-center">
          <Calendar size={14} className="mr-1.5 text-gray-400" />
          Diagnosed: {formatDate(history.diagnosis_date)}
        </div>
      </div>
      <StatusBadge status={history.status} />
    </div>

    <div className="p-5">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase font-medium">Notes</div>
        <div className="text-sm text-gray-700 mt-1 line-clamp-3">
          {history.notes}
        </div>
      </div>

      <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
        <Button className="bg-indigo-600 hover:bg-indigo-700" size="sm">
          View Details
        </Button>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ onCreateNew }: { onCreateNew: () => void }) => (
  <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
    <h3 className="text-lg font-medium text-gray-700 mb-1">
      No Medical History Records
    </h3>
    <p className="text-gray-500 mb-4">
      There are no medical history records for this patient.
    </p>
    <Button onClick={onCreateNew}>
      <Plus className="h-4 w-4 mr-2" />
      Add First Record
    </Button>
  </div>
);

// Form Field Component
const FormField = ({ 
  id, 
  label, 
  type = "text",
  value, 
  onChange, 
  error, 
  touched,
  required = false,
  placeholder = "",
  description = "",
  onBlur
}: { 
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched: boolean;
  required?: boolean;
  placeholder?: string;
  description?: string;
  onBlur?: () => void;
}) => (
  <div className="space-y-2">
    <Label
      htmlFor={id}
      className="text-sm font-medium text-gray-700"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    {type === "textarea" ? (
      <Textarea
        id={id}
        placeholder={placeholder}
        className={`min-h-[120px] text-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 ${
          touched && error ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    ) : (
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 ${
          touched && error ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
        value={type === "datetime-local" ? value.replace(" ", "T") : value}
        onChange={(e) => onChange(type === "datetime-local" ? e.target.value.replace("T", " ") : e.target.value)}
        required={required}
        onBlur={onBlur}
      />
    )}
    {touched && error && (
      <p className="text-xs text-red-500 mt-1">{error}</p>
    )}
    {description && (
      <p className="text-xs text-gray-500">{description}</p>
    )}
  </div>
);

// Main Component
const MedicalRecordManagement: React.FC = () => {
  // State for active view
  const [activeView, setActiveView] = useState<"list" | "detail" | "new">("list");
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();

  const { petId } = useParams<{ petId?: string }>();
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

    setWorkflowParams({
      appointmentId: urlAppointmentId || id || null,
      petId: urlPetId || petId || null,
    });
  }, [id, petId]);

  // Get effective pet ID
  const effectivePetId = workflowParams.petId || petId || "";
  const petIdNumber = effectivePetId ? parseInt(effectivePetId, 10) : 0;

  // Fetch data
  const { data: patientData, isLoading: isPatientLoading } = usePatientData(effectivePetId);
  const { data: allergies, isLoading: isAllergiesLoading } = useAllergiesData(effectivePetId);
  const { data: medicalRecords, isLoading: isLoadingMedicalRecords } = useMedicalRecord(parseInt(effectivePetId || '0'));

  
  const createMedicalRecord = useCreateMedicalRecord(petIdNumber);

  // Medical history data from API
  const medicalHistory = useMemo(() => {
    if (!medicalRecords) return [];
    // Handle both possible API response structures
    return Array.isArray(medicalRecords) ? medicalRecords : 
           (medicalRecords.data ? medicalRecords.data : []);
  }, [medicalRecords]);

  const selectedHistory = useMemo(() => 
    medicalHistory.find((h: MedicalHistory) => h.id === selectedHistoryId),
    [medicalHistory, selectedHistoryId]
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
    diagnosis_date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
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
    if (!effectivePetId) {
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
    
    console.log(newHistory);
    
    const diagnosis_date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    // Use the mutation hook to create a new record
    createMedicalRecord.mutate({
      ...newHistory,
      diagnosis_date
    }, {
      onSuccess: () => {
        // Reset form
        setNewHistory({
          condition: "",
          diagnosis_date: diagnosis_date,
          notes: "",
        });

        // Show success toast
        toast({
          title: "Success",
          description: "Medical record created successfully",
          variant: "default",
        });

        // Back to list view
        setActiveView("list");
      },
    });
  };

  // Render Header
  const renderHeader = () => (
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
  );

  // Render List View
  const renderListView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <History className="mr-2 h-5 w-5 text-indigo-600" />
          Medical History Records
        </h2>
      </div>

      {/* Loading state */}
      {isLoadingMedicalRecords && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading medical records...</p>
          </div>
        </div>
      )}

      {/* Medical History Cards */}
      {!isLoadingMedicalRecords && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {medicalHistory.length === 0 ? (
            <EmptyState onCreateNew={() => setActiveView("new")} />
          ) : (
            medicalHistory.map((history: MedicalHistory) => (
              <MedicalHistoryCard
                key={history.id}
                history={history}
                onClick={() => handleSelectHistory(history.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedHistory) return null;
    
    return (
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
              <StatusBadge status={selectedHistory.status} />

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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-indigo-600"
                  >
                    View
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                  <div className="flex items-center">
                    <FileSymlink size={16} className="text-indigo-500 mr-2" />
                    <span>Treatment Plan</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-indigo-600"
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Form View
  const renderFormView = () => (
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
              <FormField
                id="condition"
                label="Condition / Diagnosis"
                placeholder="Enter medical condition or diagnosis"
                value={newHistory.condition}
                onChange={(value) => handleInputChange("condition", value)}
                error={formErrors.condition}
                touched={formTouched.condition}
                required={true}
                onBlur={() => setFormTouched({ ...formTouched, condition: true })}
                description="Specify the medical condition or diagnosis"
              />

              <FormField
                id="diagnosis-date"
                label="Diagnosis Date"
                type="datetime-local"
                value={newHistory.diagnosis_date}
                onChange={(value) => handleInputChange("diagnosis_date", value)}
                error={formErrors.diagnosis_date}
                touched={formTouched.diagnosis_date}
                required={true}
                onBlur={() => setFormTouched({ ...formTouched, diagnosis_date: true })}
                description="Specify when the condition was diagnosed"
              />

              <FormField
                id="notes"
                label="Notes"
                type="textarea"
                placeholder="Enter detailed notes about the condition, treatment, etc."
                value={newHistory.notes}
                onChange={(value) => handleInputChange("notes", value)}
                touched={false}
                description="Include any important details about the condition, symptoms, treatments, or recommendations"
              />
            </div>

            <div className="flex items-center justify-end pt-6 mt-6 border-t-2 border-gray-100">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-md hover:shadow-lg transition-all"
                disabled={createMedicalRecord.isPending}
              >
                <div className="flex items-center">
                  {createMedicalRecord.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      <span className="font-medium text-white">Creating...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} className="mr-1.5" />
                      <span className="font-medium text-white">Create Medical Record</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container max-w-screen-xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
      {/* Header */}
      {renderHeader()}

      {/* Workflow Navigation */}
      <div className="mb-4">
        <WorkflowNavigation
          appointmentId={workflowParams.appointmentId || undefined}
          petId={effectivePetId}
          currentStep="records"
        />
      </div>

      {/* Main Content */}
      <div className="w-full px-6 py-6">
        {activeView === "list" && renderListView()}
        {activeView === "detail" && renderDetailView()}
        {activeView === "new" && renderFormView()}
      </div>
    </div>
  );
};

export default MedicalRecordManagement;
