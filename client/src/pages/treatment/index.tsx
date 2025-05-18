import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  ArrowUpRight,
  Receipt,
  Syringe,
  Lock,
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
  useUpdateTreatmentPhaseStatus,
  useUpdateTreatmentStatus,
} from "@/hooks/use-treatment";
import {
  PhaseMedicine,
  Treatment,
  TreatmentPhase,
  CreateTreatmentPhaseRequest,
  AssignMedicineRequest,
  CreateTreatmentRequest,
  MedicineTransactionRequest,
  CreateInvoiceRequest,
  Appointment,
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
import { useExportMedicine, useGetMedicineById } from "@/hooks/use-medicine";
import Invoice from "../prescription/invoice";
import { useCreateInvoice } from "@/hooks/use-invoice";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getMedicineById } from "@/services/medicine-services";
import { useInvoiceData } from "@/hooks/use-invoice";
import InvoiceDialog from "@/components/invoice/InvoiceDialog";
import { useMedicalHistory } from "@/hooks/use-medical-history";
import { useCreateMedicalRecord } from "@/hooks/use-medical-record";
import { Switch } from "@/components/ui/switch";
import { useUpdateSOAP, useGetSOAP } from "@/hooks/use-soap";
import { ReadonlyMarkdownView } from "@/components/ui/readonly-markdown-view";
import { updateAppointmentById } from "@/services/appointment-services";
// Import component PrescriptionPDF mới tạo
import PrescriptionPDF from "@/components/prescription/PrescriptionPDF";

const TreatmentManagement: React.FC = () => {
  const [, navigate] = useLocation();
  const createInvoiceMutation = useCreateInvoice();
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);

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
  // Inside your component, get the mutate function from the hook
  const { mutateAsync: exportMedicineMutateAsync } = useExportMedicine();

  // New state for phase modal
  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState(false);
  const [phaseList, setPhaseList] = useState<CreateTreatmentPhaseRequest[]>([]);
  const [currentPhase, setCurrentPhase] = useState<CreateTreatmentPhaseRequest>(
    {
      phase_name: "",
      description: "",
      start_date: new Date().toISOString().split("T")[0],
      status: "Not Started",
    }
  );
  const [phaseFormErrors, setPhaseFormErrors] = useState<{
    phase_name?: string;
    description?: string;
    start_date?: string;
  }>({});

  // Add the useAddTreatment hook
  const addTreatmentMutation = useAddTreatment();
  const isSubmitting = addTreatmentMutation.isPending;
  const isError = addTreatmentMutation.isError;
  const error = addTreatmentMutation.error;

  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();

  // Get appointment id from query params
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  const { data: appointmentData, isLoading: isAppointmentLoading } =
    useAppointmentData(appointmentId || "");

  const petId = appointmentData?.pet.pet_id;

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

  const {
    data: treatments,
    isLoading: isTreatmentsLoading,
    refetch: refetchTreatments,
  } = useTreatmentsData(petId || "");

  const { data: patientData, isLoading: isPatientLoading } = usePatientData(
    petId || ""
  );

  const selectedTreatment =
    treatments &&
    treatments.find((t: Treatment) => t.id === selectedTreatmentId);

  const {
    data: phases,
    isLoading: isPhasesLoading,
    refetch: refetchPhases,
  } = useTreatmentPhasesData(selectedTreatment?.id?.toString() || "");

  // Add the useAddTreatmentPhase hook after phases is loaded
  const addTreatmentPhaseMutation = useAddTreatmentPhase(
    selectedTreatment?.id?.toString() || ""
  );
  const isPhaseSubmitting = addTreatmentPhaseMutation.isPending;

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
    if (name === "start_date") {
      if (!value) {
        return "Start date is required";
      }
      // Validate that start date is not in the past
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Remove time component for date comparison
      
      if (selectedDate < today) {
        return "Start date cannot be in the past";
      }
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

  // Modifica la función que maneja el cambio en el campo de enfermedad
  const handleDiseaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiseaseName(value);
    // También actualiza el objeto newTreatment
    setNewTreatment({
      ...newTreatment,
      diseases: value,
    });
  };

  // Handle creating a new treatment
  const updateSoapMutation = useUpdateSOAP();
  const { data: soapData } = useGetSOAP(appointmentId || "");

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
      // Add non-required fields from form (these will be added to the treatment on the server)
      const fullTreatmentData = {
        name: newTreatment.name,
        type: newTreatment.type,
        diseases: diseaseName,
        doctor_id: parseInt(appointmentData?.doctor?.doctor_id || "0"),
        pet_id: parseInt(petId),
        start_date: newTreatment.start_date,
        status: newTreatment.status || "Active",
        notes: newTreatment.notes || "",
      };

      // Call the mutation
      await addTreatmentMutation.mutateAsync(fullTreatmentData);

      // Explicitly refetch treatments to update UI
      await refetchTreatments();

      // Find the newly created treatment (by name/type or last one)
      let newTreatmentId = null;
      if (treatments && treatments.length > 0) {
        // Try to find by name/type
        const found = treatments.find(
          (t: Treatment) =>
            t.name === fullTreatmentData.name &&
            t.type === fullTreatmentData.type
        );
        newTreatmentId = found
          ? found.id
          : treatments[treatments.length - 1].id;
      }

      // Update SOAP note plan field with new treatment ID
      if (appointmentId && newTreatmentId && soapData) {
        await updateSoapMutation.mutateAsync({
          appointmentID: appointmentId,
          subjective: soapData.subjective || "",
          objective: soapData.objective || {},
          assessment: soapData.assessment || "",
          plan: newTreatmentId,
        });
      }

      toast({
        title: "Success",
        description: "Treatment plan created successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Reset new treatment form
      setNewTreatment({
        ...newTreatment,
        type: "",
        name: "",
        pet_id: parseInt(petId),
        status: "Active",
        start_date: new Date().toISOString().split("T")[0],
        diseases: "",
        doctor_id: parseInt(appointmentData?.doctor?.doctor_id || "0"),
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

  // Add phase form validation
  const validatePhaseField = (name: string, value: string) => {
    if (name === "phase_name" && !value) {
      return "Phase name is required";
    }
    if (name === "start_date") {
      if (!value) {
        return "Start date is required";
      }
      
      // Validate that start date is not in the past
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Remove time component for date comparison
      
      if (selectedDate < today) {
        return "Start date cannot be in the past";
      }
    }
    return "";
  };

  const validatePhaseForm = () => {
    const errors = {
      phase_name: validatePhaseField("phase_name", currentPhase.phase_name),
      start_date: validatePhaseField("start_date", currentPhase.start_date),
    };

    setPhaseFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  const handlePhaseInputChange = (name: string, value: string) => {
    setCurrentPhase({
      ...currentPhase,
      [name]: value,
    });

    const error = validatePhaseField(name, value);
    setPhaseFormErrors({
      ...phaseFormErrors,
      [name]: error,
    });
  };

  const handleAddPhaseToList = () => {
    if (!validatePhaseForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    // Add the phase to the list
    setPhaseList([...phaseList, currentPhase]);

    // Reset the form for another entry
    setCurrentPhase({
      phase_name: "",
      description: "",
      start_date: new Date().toISOString().split("T")[0],
      status: "Not Started",
    });
  };

  const handleRemovePhase = (index: number) => {
    const updatedPhases = [...phaseList];
    updatedPhases.splice(index, 1);
    setPhaseList(updatedPhases);
  };

  const handleSubmitPhases = async () => {
    if (!selectedTreatment?.id) {
      toast({
        title: "Error",
        description: "No treatment selected",
        variant: "destructive",
      });
      return;
    }

    if (phaseList.length === 0) {
      toast({
        title: "Warning",
        description: "Please add at least one phase",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTreatmentPhaseMutation.mutateAsync(phaseList);

      // Explicitly refetch phases to update UI
      await refetchPhases();

      toast({
        title: "Success",
        description: `${phaseList.length} phases added successfully`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Reset state and close modal
      setPhaseList([]);
      setIsAddPhaseModalOpen(false);
    } catch (err) {
      console.error("Error adding phases:", err);
      toast({
        title: "Error",
        description: "Failed to add phases. Please try again.",
        variant: "destructive",
      });
    }
  };

  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>([]);
  const [medicineFormErrors, setMedicineFormErrors] = useState<{
    medicine_id?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    notes?: string;
    side_effects?: string;
    usage?: string;
  }>({});

  const [isMedicineAssignmentSuccess, setIsMedicineAssignmentSuccess] =
    useState(false);
  const [assignedMedicinesForHistory, setAssignedMedicinesForHistory] =
    useState<any[]>([]);
  const [historyRecord, setHistoryRecord] = useState({
    condition: "",
    diagnosis_date: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    notes: "",
  });

  const createMedicalHistoryMutation = useCreateMedicalRecord(
    petId ? parseInt(petId) : 0
  );
  // State for medicine assignment

  // Get medicines by phase
  const { data: phaseMedicines, refetch: refetchPhaseMedicines } =
    useGetMedicinesByPhase(
      selectedTreatment?.id || "",
      selectedPhaseId?.toString() || ""
    );

  // Search for medicines - use the hook correctly
  const {
    searchResults,
    allMedicines,
    setQuery: setMedicineQuery,
    isLoading: isMedicineSearchLoading,
  } = useMedicineSearch();

  // Handle medicine search input changes
  const handleMedicineSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setMedicineSearchTerm(value);
    setMedicineQuery(value);
  };

  // Determine which medicines to display (search results if searching, otherwise all medicines)
  const displayMedicines = useMemo(() => {
    const medicines = medicineSearchTerm.length > 0 ? searchResults ?? [] : allMedicines ?? [];
    // Filter out medicines with quantity <= 0
    return medicines.filter(med => med.quantity > 0);
  }, [medicineSearchTerm, searchResults, allMedicines]);

  // Assign medicine to phase mutation
  const assignMedicineMutation = useAssignMedicine(
    selectedTreatment?.id || "",
    selectedPhaseId?.toString() || ""
  );
  const isMedicineAssigning = assignMedicineMutation.isPending;

  // Handle medicine selection
  const handleMedicineSelect = (medicine: any) => {
    // Validate medication quantity
    if (medicine.quantity <= 0) {
      toast({
        title: "Cannot add medication",
        description: "This medicine is out of stock (quantity <= 0)",
        variant: "destructive",
      });
      return;
    }

    const alreadySelected = selectedMedicines.some((m) => m.id === medicine.id);

    if (!alreadySelected) {
      // Initialize with quantity = 1 when adding a medicine
      setSelectedMedicines([
        ...selectedMedicines,
        {
          ...medicine,
          quantity: "1", // Always initialize as a string "1" for consistency with form input
        },
      ]);
      setMedicineSearchTerm("");
    }
  };

  // Handle medicine removal
  const handleRemoveMedicine = (medicineId: number) => {
    setSelectedMedicines(selectedMedicines.filter((m) => m.id !== medicineId));
  };

  // Handle opening medicine modal for a specific phase
  const handleOpenMedicineModal = (phaseId: number) => {
    // Find the phase to check if it's completed
    const phase = phases?.find((p: TreatmentPhase) => p.id === phaseId);

    // If phase is completed, show a toast message and don't open the modal
    if (phase?.status === "Completed") {
      toast({
        title: "Phase Locked",
        description: "Cannot add medications to a completed phase",
        variant: "destructive",
      });
      return;
    }

    setSelectedPhaseId(phaseId);
    setSelectedMedicines([]);
    setMedicineSearchTerm("");
    setIsMedicineModalOpen(true);
  };

  // Handle medicine form input changes
  const handleMedicineInputChange = (
    medicine: any,
    field: string,
    value: string
  ) => {
    const updatedMedicines = selectedMedicines.map((m) => {
      if (m.id === medicine.id) {
        return { ...m, [field]: value };
      }
      return m;
    });

    setSelectedMedicines(updatedMedicines);
  };

  // Validate medicine assignment
  const validateMedicineAssignment = (medicine: any) => {
    const errors: {
      dosage?: string;
      frequency?: string;
      duration?: string;
      quantity?: string;
    } = {};

    if (!medicine.dosage) {
      errors.dosage = "Dosage is required";
    }
    if (!medicine.frequency) {
      errors.frequency = "Frequency is required";
    }
    if (!medicine.duration) {
      errors.duration = "Duration is required";
    }
    if (!medicine.quantity) {
      errors.quantity = "Quantity is required";
    } else {
      const quantityNum = parseInt(medicine.quantity, 10);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        errors.quantity = "Quantity must be a positive number";
      }
      
      // Check if the requested quantity exceeds available stock
      const availableMedicine = allMedicines?.find(m => m.id === medicine.id);
      if (availableMedicine && quantityNum > availableMedicine.quantity) {
        errors.quantity = `Cannot exceed available stock (${availableMedicine.quantity})`;
      }
    }

    return errors;
  };

  // Handle submitting medicine assignments
  const handleSubmitMedicines = async () => {
    if (selectedMedicines.length === 0) {
      toast({
        title: "Warning",
        description: "Please select at least one medicine",
        variant: "destructive",
      });
      return;
    }

    // Validate all medicines
    let hasErrors = false;
    const validatedMedicines = selectedMedicines.map((medicine) => {
      const errors = validateMedicineAssignment(medicine);
      if (Object.keys(errors).length > 0) {
        hasErrors = true;
      }
      return { ...medicine, errors };
    });

    if (hasErrors) {
      setSelectedMedicines(validatedMedicines);
      toast({
        title: "Validation Error",
        description: "Please fill all required fields for each medicine",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare all medicine assignments as an array
      const assignmentData = selectedMedicines.map((medicine) => ({
        medicine_id: medicine.id,
        dosage: medicine.dosage,
        appointment_id: parseInt(appointmentId || "0", 10),
        quantity: parseInt(medicine.quantity || "1", 10), // Convert to number
        frequency: medicine.frequency,
        notes: medicine.notes || "",
        duration: medicine.duration || "",
      }));

      // Submit the array of assignments at once
      await assignMedicineMutation.mutateAsync(assignmentData);

      // Explicitly refetch phase medicines data
      if (selectedPhaseId) {
        await refetchPhaseMedicines();
        await refetchPhases();
      }
      toast({
        title: "Success",
        description: `${selectedMedicines.length} medications assigned successfully`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Store the assigned medicines for medical history record
      setAssignedMedicinesForHistory(selectedMedicines);

      // Set flag to indicate medicine assignment was successful
      setIsMedicineAssignmentSuccess(true);

      // Close medicine modal
      setIsMedicineModalOpen(false);

      // Toggle phase view to refresh display
      if (selectedPhaseId) {
        setExpandedPhases((prev) => ({
          ...prev,
          [selectedPhaseId]: true,
        }));
      }
    } catch (err) {
      console.error("Error assigning medicines:", err);
      toast({
        title: "Error",
        description: "Failed to assign medicines. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle completing a treatment and exporting as invoice
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Handle initiating the complete treatment process
  const handleInitiateCompletion = () => {
    if (!appointmentId) {
      toast({
        title: "Error",
        description: "No appointment selected",
        variant: "destructive",
      });
      return;
    }

    setShowCompletionDialog(true);
  };

  // Handle completing a treatment and exporting as invoice
  const handleCompleteTreatment = async () => {
    setIsCompleting(true);
    setShowCompletionDialog(false);

    try {
      toast({
        title: "Processing",
        description: "Completing treatment and updating appointment status...",
      });

      // Also update the appointment status to mark the examination as completed
      if (appointmentId) {
        await updateAppointmentById(parseInt(appointmentId), {
          state_id: 6, // Completed status
          notes: `Treatment and examination completed by ${
            appointmentData?.doctor?.doctor_name || "doctor"
          } on ${new Date().toLocaleString()}`,
        });

        toast({
          title: "Examination Completed",
          description:
            "The appointment has been marked as completed successfully",
          className: "bg-green-50 border-green-200 text-green-800",
          duration: 5000,
        });
      }
      // Refetch treatments to update UI
      await refetchTreatments();

      // Show a final success message
      toast({
        title: "Process Completed",
        description:
          "Treatment completed and appointment status updated successfully.",
        className: "bg-green-50 border-green-200 text-green-800",
        duration: 5000,
      });

      // Optionally, navigate back to list view
      setActiveView("list");
      // setSelectedTreatmentId(null);
    } catch (error) {
      console.error("Error completing treatment:", error);
      toast({
        title: "Error",
        description: "Failed to complete treatment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  // Get the invoice data for the dialog
  const { data: invoiceData, isLoading: isInvoiceLoading } = useInvoiceData(
    currentInvoiceId || ""
  );

  // Add these new state declarations and hooks
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdatingTreatmentStatus, setIsUpdatingTreatmentStatus] =
    useState(false);
  const [isUpdatingPhaseStatus, setIsUpdatingPhaseStatus] = useState(false);

  // Add the hooks for updating status
  const updateTreatmentStatusMutation = useUpdateTreatmentStatus();
  const updateTreatmentPhaseStatusMutation = useUpdateTreatmentPhaseStatus();

  // Add this handler for updating treatment status
  const handleUpdateTreatmentStatus = async (newStatus: string) => {
    if (!selectedTreatment?.id) {
      toast({
        title: "Error",
        description: "No treatment selected",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingTreatmentStatus(true);

    try {
      await updateTreatmentStatusMutation.mutateAsync({
        payload: { status: newStatus },
        treatment_id: selectedTreatment.id.toString(),
      });

      toast({
        title: "Success",
        description: `Treatment status updated to ${newStatus}`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Refetch treatments to update UI
      await refetchTreatments();
    } catch (error) {
      console.error("Error updating treatment status:", error);
      toast({
        title: "Error",
        description: "Failed to update treatment status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingTreatmentStatus(false);
    }
  };

  // Add state for toast confirmation dialog
  const [phaseToComplete, setPhaseToComplete] = useState<number | null>(null);
  
  // Add this handler for updating phase status
  const handleUpdatePhaseStatus = async (
    phaseId: number,
    newStatus: string
  ) => {
    if (!selectedTreatment?.id) {
      toast({
        title: "Error",
        description: "No treatment selected",
        variant: "destructive",
      });
      return;
    }

    // If changing to Completed, show a confirmation
    if (newStatus === "Completed") {
      toast({
        title: "Warning",
        description: "Once a phase is marked as Completed, you won't be able to add more medications to it.",
        variant: "destructive",
        duration: 5000,
      });
    }

    setIsUpdatingPhaseStatus(true);

    try {
      await updateTreatmentPhaseStatusMutation.mutateAsync({
        payload: { status: newStatus },
        treatment_id: selectedTreatment.id.toString(),
        phase_id: phaseId.toString(),
      });

      toast({
        title: "Success",
        description: `Phase status updated to ${newStatus}`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Refetch phases to update UI
      await refetchPhases();
    } catch (error) {
      console.error("Error updating phase status:", error);
      toast({
        title: "Error",
        description: "Failed to update phase status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPhaseStatus(false);
    }
  };

  // Thêm state cho medication prescription dialog
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] =
    useState(false);
  const [currentTreatmentForPrescription, setCurrentTreatmentForPrescription] =
    useState<Treatment | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Thêm lại hàm generatePDF
  const generatePDF = async (
    elementId: string,
    action: "print" | "download",
    fileName?: string
  ) => {
    const element = document.getElementById(elementId);

    if (!element) {
      toast({
        title: "Error",
        description: `Could not find content to ${
          action === "print" ? "print" : "export"
        }.`,
        variant: "destructive",
      });
      return;
    }

    setIsPdfGenerating(true);

    // Hide the buttons during capturing
    const actionButtons = element.querySelector(".print\\:hidden");
    if (actionButtons) {
      actionButtons.classList.add("hidden");
    }

    toast({
      title: action === "print" ? "Preparing Print" : "Generating PDF",
      description:
        action === "print"
          ? "Preparing your prescription for printing..."
          : "Please wait while we generate your prescription PDF...",
    });

    try {
      // Use html2canvas to capture the prescription element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff", // Ensure white background
      });

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      if (action === "print") {
        // Print the PDF
        pdf.autoPrint();
        window.open(pdf.output("bloburl"), "_blank");

        toast({
          title: "Print Ready",
          description: "Your prescription has been prepared for printing.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        // Generate filename with treatment information
        const outputFileName =
          fileName ||
          (currentTreatmentForPrescription
            ? `Prescription_${currentTreatmentForPrescription.id}_${format(
                new Date(),
                "yyyy-MM-dd"
              )}.pdf`
            : "Prescription.pdf");

        // Save the PDF
        pdf.save(outputFileName);

        toast({
          title: "Download Complete",
          description: "Your prescription has been saved as PDF.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      }
    } catch (error) {
      console.error(`Error generating PDF for ${action}:`, error);

      toast({
        title: "Error",
        description: `There was a problem ${
          action === "print" ? "preparing the print" : "generating the PDF"
        }. Please try again.`,
        variant: "destructive",
      });
    } finally {
      // Always show buttons again in case of success or error
      if (actionButtons) {
        actionButtons.classList.remove("hidden");
      }
      setIsPdfGenerating(false);
    }
  };

  // Cập nhật hàm xử lý xuất đơn thuốc thành PDF
  const handleGeneratePrescription = (treatment: Treatment) => {
    if (!treatment) {
      toast({
        title: "Error",
        description: "No treatment selected",
        variant: "destructive",
      });
      return;
    }

    // Đảm bảo rằng phases đã được tải
    if (!phases || phases.length === 0) {
      toast({
        title: "Warning",
        description: "This treatment doesn't have any medication phases",
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      });
    }

    setCurrentTreatmentForPrescription(treatment);

    // Set selected treatment và load phase data nếu cần
    if (selectedTreatmentId !== treatment.id) {
      setSelectedTreatmentId(treatment.id);
      refetchPhases(); // Đảm bảo có dữ liệu phases mới nhất
    }

    setIsPrescriptionDialogOpen(true);
  };

  // Cập nhật hàm xử lý in đơn thuốc
  const handlePrintPrescription = () => {
    generatePDF("prescription-pdf-content", "print");
  };

  // Cập nhật hàm xử lý tải xuống đơn thuốc dưới dạng PDF
  const handleDownloadPrescription = () => {
    // Tạo tên file bao gồm ID treatment và ngày hiện tại
    const fileName = currentTreatmentForPrescription
      ? `Prescription_${currentTreatmentForPrescription.id}_${format(
          new Date(),
          "yyyy-MM-dd"
        )}.pdf`
      : `Prescription_${format(new Date(), "yyyy-MM-dd")}.pdf`;

    generatePDF("prescription-pdf-content", "download", fileName);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 md:px-8 md:py-5 rounded-xl shadow-md mb-6 text-white">
        {/* Header Row */}
        <div className="flex justify-between items-center">
          {/* Left Section: Back Button + Title */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back</span>
            </Button>
            <h1 className="text-white font-semibold text-lg">
              Treatment Management
            </h1>
          </div>

          {/* Right Section: Action Buttons */}
          <div className="flex items-center gap-2">
            {activeView === "detail" && selectedTreatment && (
              <Button
                onClick={handleBackClick}
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back to List</span>
              </Button>
            )}
            {activeView === "list" && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
                onClick={() => setActiveView("new")}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                <span>New Treatment</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
              onClick={handleInitiateCompletion}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              <span>Complete Appointment</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
              onClick={() => {
                const params = new URLSearchParams();
                if (appointmentId || id)
                  params.append("appointmentId", appointmentId || id || "");
                if (petId) params.append("petId", petId.toString());
                navigate(`/vaccination?${params.toString()}`);
              }}
            >
              <Syringe className="h-4 w-4 mr-1" />
              <span>Go to Vaccination</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Workflow Navigation */}
      <WorkflowNavigation
        appointmentId={appointmentId || id || undefined}
        petId={petId}
        currentStep="treatment"
      />

      {/* Main Content */}
      <div className="p-4">
        {/* Treatment List View */}
        {activeView === "list" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Clipboard className="mr-2 h-5 w-5 text-[#2C78E4]" />
                Treatment Plans
              </h2>
              <Button
                variant="default"
                className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white"
                onClick={() => setActiveView("new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Treatment
              </Button>
            </div>

            {/* Treatment Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isTreatmentsLoading ? (
                <div className="col-span-2 py-8 flex justify-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-t-[#2C78E4] border-b-[#2C78E4] border-l-transparent border-r-transparent rounded-full animate-spin"></div>
                    <p className="text-[#2C78E4] font-medium">
                      Loading treatments...
                    </p>
                  </div>
                </div>
              ) : treatments && treatments.length > 0 ? (
                treatments.map((treatment: Treatment) => (
                  <div
                    key={treatment.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleSelectTreatment(treatment.id)}
                  >
                    <div className="px-6 py-5 flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {treatment.type}
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
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
                            : "bg-[#F0F7FF] text-[#2C78E4] border-[#2C78E4]/20" // For Active status
                        }
                      >
                        {treatment.status}
                      </Badge>
                    </div>

                    <div className="px-6 pb-5 pt-2">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-500 uppercase font-medium">
                            Type
                          </div>
                          <div className="text-sm font-medium mt-1 text-gray-800">
                            {treatment.type}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase font-medium">
                            Disease
                          </div>
                          <div className="text-sm font-medium mt-1 text-gray-800">
                            {treatment.diseases || "Not specified"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center text-sm text-[#2C78E4]">
                          <Layers className="h-4 w-4 mr-1.5" />
                          {treatment.phases
                            ? treatment.phases.length
                            : "0"}{" "}
                          Phase(s)
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-gray-500 hover:text-[#2C78E4] hover:bg-[#F0F7FF]"
                        >
                          <ArrowRight className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center p-10 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <Clipboard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="font-medium text-gray-700 mb-1">
                    No treatments found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    There are no active treatments for this patient
                  </p>
                  <Button
                    onClick={() => setActiveView("new")}
                    className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Treatment
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Treatment Detail View */}
        {activeView === "detail" && selectedTreatment && (
          <div className="space-y-6">
            {/* Main Treatment Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {selectedTreatment.type}
                    </h1>
                    <div className="flex items-center mt-1.5 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                      Started:{" "}
                      {new Date(
                        selectedTreatment.start_date
                      ).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Select
                      defaultValue={selectedTreatment.status}
                      onValueChange={handleUpdateTreatmentStatus}
                      disabled={isUpdatingTreatmentStatus}
                    >
                      <SelectTrigger
                        className={`h-10 w-40 ${
                          selectedTreatment.status === "Completed"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : selectedTreatment.status === "In Progress"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : selectedTreatment.status === "Not Started"
                            ? "bg-gray-100 text-gray-800 border-gray-200"
                            : "bg-[#F0F7FF] text-[#2C78E4] border-[#2C78E4]/20" // For Active status
                        }`}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() =>
                        handleGeneratePrescription(selectedTreatment)
                      }
                      variant="default"
                      className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Prescription
                    </Button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="px-6 pb-6">
                <div className="bg-[#F0F7FF]/30 p-4 rounded-xl border border-[#2C78E4]/10">
                  <h3 className="text-xs uppercase font-medium text-gray-500 mb-2">
                    DESCRIPTION
                  </h3>
                  <div className="text-sm text-gray-700">
                    {selectedTreatment.description ||
                      "No description provided for this treatment plan."}
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment Phases Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Layers className="mr-2 h-5 w-5 text-[#2C78E4]" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Treatment Phases
                  </h2>
                </div>

                <Button
                  className="bg-[#2C78E4] hover:bg-[#1E40AF] shadow-sm text-white"
                  onClick={() => setIsAddPhaseModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Phase
                </Button>
              </div>

              {isPhasesLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C78E4] mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading phases...</p>
                </div>
              ) : phases && phases.length > 0 ? (
                <div className="space-y-4">
                  {phases.map((phase: TreatmentPhase) => (
                    <div
                      key={phase.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <div
                        className={`px-6 py-4 border-b flex justify-between items-center cursor-pointer ${
                          phase.status === "Completed" ? "bg-green-50/50" : ""
                        }`}
                        onClick={() => togglePhaseExpansion(phase.id)}
                      >
                        <div className="flex items-center">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-lg mr-4 ${
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
                            <h3 className="font-medium text-gray-900 flex items-center">
                              {phase.phase_name}
                              {phase.status === "Completed" && (
                                <Badge className="ml-2 bg-green-100 text-green-800 border-0">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Locked
                                </Badge>
                              )}
                            </h3>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Calendar
                                size={12}
                                className="mr-1.5 text-gray-400"
                              />
                              {new Date(phase.start_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={phase.status}
                            onValueChange={(value) =>
                              handleUpdatePhaseStatus(phase.id, value)
                            }
                            disabled={isUpdatingPhaseStatus}
                          >
                            <SelectTrigger
                              className={`h-9 w-36 ${
                                phase.status === "Completed"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : phase.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }`}
                            >
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not Started">
                                Not Started
                              </SelectItem>
                              <SelectItem value="In Progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="Completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <ChevronDown
                            size={18}
                            className={`text-gray-400 transition-transform ${
                              expandedPhases[phase.id] ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {expandedPhases[phase.id] && (
                        <div className="p-5">
                          {/* Warning for completed phases */}
                          {phase.status === "Completed" && (
                            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
                              <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  Phase Completed
                                </p>
                                <p className="text-xs text-green-700 mt-1">
                                  This phase has been marked as completed and is
                                  now locked for further medication changes.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Medications Section */}
                          <div className="bg-white border border-gray-100 rounded-xl">
                            <div className="flex items-center justify-between px-5 py-3 border-b">
                              <div className="flex items-center">
                                <Pill className="mr-2 h-4 w-4 text-[#2C78E4]" />
                                <h3 className="text-sm font-medium text-gray-800">
                                  Medications
                                </h3>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 py-1 border-[#2C78E4]/20 bg-[#F0F7FF] text-[#2C78E4] hover:bg-[#E3F2FD] disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() =>
                                  handleOpenMedicineModal(phase.id)
                                }
                                disabled={phase.status === "Completed"}
                              >
                                <Plus size={14} className="mr-1" />
                                Add Medicine
                                {phase.status === "Completed" && " (Locked)"}
                              </Button>
                            </div>

                            <div className="p-5">
                              {phase.medications?.length > 0 ? (
                                <div className="space-y-3">
                                  {phase.medications.map(
                                    (med: PhaseMedicine, index: number) => (
                                      <div
                                        key={`${med.medicine_id}-${index}`}
                                        className="rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900 mb-1">
                                              {med.medicine_name}
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                              <div className="flex items-center">
                                                <Clock
                                                  size={14}
                                                  className="mr-1.5 text-gray-400"
                                                />
                                                <span>{med.frequency}</span>
                                              </div>
                                              {med.duration && (
                                                <div className="flex items-center">
                                                  <Calendar
                                                    size={14}
                                                    className="mr-1.5 text-gray-400"
                                                  />
                                                  <span>{med.duration}</span>
                                                </div>
                                              )}
                                              <div className="flex items-center">
                                                <Layers
                                                  size={14}
                                                  className="mr-1.5 text-gray-400"
                                                />
                                                Quantity: {med.quantity || 1}
                                              </div>
                                            </div>
                                          </div>
                                          <Badge className="ml-2 bg-[#F0F7FF] text-[#2C78E4] border-[#2C78E4]/20 px-3 py-1">
                                            {med.dosage}
                                          </Badge>
                                        </div>
                                        {med.notes && (
                                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                            <FileText
                                              size={14}
                                              className="inline-block mr-1.5 text-gray-400"
                                            />
                                            {med.notes}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-6 text-gray-500">
                                  No medications in this phase
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Layers className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-gray-700 font-medium mb-1">
                    No phases found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Add phases to organize this treatment plan
                  </p>
                  <Button
                    onClick={() => setIsAddPhaseModalOpen(true)}
                    className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Phase
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Treatment Form */}
        {activeView === "new" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Plus className="mr-2 h-5 w-5 text-[#2C78E4]" />
                Create New Treatment
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackClick}
                disabled={isSubmitting}
                className="border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>

            <Card className="shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-[#F0F7FF]/60 border-b px-6">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-[#2C78E4]" />
                    Treatment Information
                  </div>

                  {/* Step indicator */}
                  <div className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg shadow-sm">
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full font-medium ${
                        formStep === 0
                          ? "bg-[#2C78E4] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      1
                    </span>
                    <span className="text-gray-300">→</span>
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full font-medium ${
                        formStep === 1
                          ? "bg-[#2C78E4] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      2
                    </span>
                    <span className="text-gray-300">→</span>
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full font-medium ${
                        formStep === 2
                          ? "bg-[#2C78E4] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      3
                    </span>
                  </div>
                </CardTitle>

                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span
                    className={
                      formStep === 0 ? "text-[#2C78E4] font-medium" : ""
                    }
                  >
                    Basic Info
                  </span>
                  <span
                    className={
                      formStep === 1 ? "text-[#2C78E4] font-medium" : ""
                    }
                  >
                    Timeline & Status
                  </span>
                  <span
                    className={
                      formStep === 2 ? "text-[#2C78E4] font-medium" : ""
                    }
                  >
                    Details
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-6">
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
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="treatment-name"
                          className="text-sm font-medium text-gray-700"
                        >
                          Treatment Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="treatment-name"
                          placeholder="Enter treatment name"
                          className={`h-10 border-gray-200 rounded-lg focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
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
                          className="text-sm font-medium text-gray-700"
                        >
                          Treatment Type <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="treatment-type"
                          placeholder="e.g., Dental, Surgery Recovery, Medication Protocol"
                          className={`h-10 border-gray-200 rounded-lg focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
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
                          className="text-sm font-medium text-gray-700"
                        >
                          Disease/Condition
                        </Label>
                        <Input
                          id="disease"
                          placeholder="e.g., Arthritis, Diabetes"
                          className="h-10 rounded-lg border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]"
                          value={diseaseName}
                          onChange={handleDiseaseChange}
                        />
                        <p className="text-xs text-gray-500">
                          Indicate the primary condition being treated
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Timeline & Status */}
                  {formStep === 1 && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="treatment-status"
                          className="text-sm font-medium text-gray-700"
                        >
                          Status <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          defaultValue={newTreatment.status}
                          onValueChange={(value) =>
                            handleInputChange("status", value)
                          }
                        >
                          <SelectTrigger
                            id="treatment-status"
                            className="h-10 rounded-lg border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]"
                          >
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
                          className="text-sm font-medium text-gray-700"
                        >
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="start-date"
                          type="date"
                          className={`h-10 rounded-lg border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4] ${
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
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="notes"
                          className="text-sm font-medium text-gray-700"
                        >
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder="Any additional notes or instructions"
                          className="min-h-[120px] text-sm rounded-lg border-gray-200 focus:border-[#2C78E4] focus:ring-[#2C78E4]"
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

                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                    <div>
                      {formStep > 0 ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevStep}
                          disabled={isSubmitting}
                          className="flex items-center gap-1 h-10 px-4 border border-gray-200 hover:bg-gray-50"
                        >
                          <ChevronLeft size={16} />
                          <span className="font-medium">Back</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBackClick}
                          disabled={isSubmitting}
                          className="flex items-center gap-1 h-10 px-4 border border-gray-200 hover:bg-gray-50"
                        >
                          <span className="font-medium">Cancel</span>
                        </Button>
                      )}
                    </div>

                    <div>
                      <Button
                        type="submit"
                        className="bg-[#2C78E4] hover:bg-[#1E40AF] h-10 px-5 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span className="font-medium text-white">
                              Creating...
                            </span>
                          </div>
                        ) : formStep < 2 ? (
                          <div className="flex items-center">
                            <span className="font-medium text-white">Next</span>
                            <ChevronRight size={16} className="ml-2" />
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Plus size={16} className="mr-2" />
                            <span className="font-medium text-white">
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

      {/* Add New Phase Modal */}
      <Dialog open={isAddPhaseModalOpen} onOpenChange={setIsAddPhaseModalOpen}>
        <DialogContent className="sm:max-w-[95%] max-h-[95vh] lg:max-w-[1200px] rounded-lg bg-white overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <Layers className="mr-2 h-5 w-5 text-indigo-600" />
              Create Treatment Phase
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Add treatment phases and manage the sequence of execution
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 overflow-y-auto max-h-[calc(95vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
              {/* Phase Creation Form */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                    Treatment Phase Information
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phase-name" className="text-gray-700">
                        Phase Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phase-name"
                        placeholder="e.g., Preparation for Surgery"
                        value={currentPhase.phase_name}
                        onChange={(e) =>
                          handlePhaseInputChange("phase_name", e.target.value)
                        }
                        className="h-10 border-gray-300 focus:ring-2 focus:ring-indigo-200"
                      />
                      {phaseFormErrors.phase_name && (
                        <p className="text-xs text-red-500 mt-1">
                          {phaseFormErrors.phase_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phase-description"
                        className="text-gray-700"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="phase-description"
                        placeholder="e.g., Detailed description of the phase..."
                        value={currentPhase.description}
                        onChange={(e) =>
                          handlePhaseInputChange("description", e.target.value)
                        }
                        className="min-h-[100px] border-gray-300 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="phase-start-date"
                          className="text-gray-700"
                        >
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phase-start-date"
                          type="date"
                          value={currentPhase.start_date}
                          onChange={(e) =>
                            handlePhaseInputChange("start_date", e.target.value)
                          }
                          className="h-10 border-gray-300 focus:ring-2 focus:ring-indigo-200"
                        />
                        {phaseFormErrors.start_date && (
                          <p className="text-xs text-red-500 mt-1">
                            {phaseFormErrors.start_date}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phase-status" className="text-gray-700">
                          Status
                        </Label>
                        <Select
                          defaultValue={currentPhase.status}
                          onValueChange={(value) =>
                            handlePhaseInputChange("status", value)
                          }
                        >
                          <SelectTrigger className="h-10 border-gray-300 focus:ring-2 focus:ring-indigo-200">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="Not Started"
                              className="text-gray-700"
                            >
                              <Clock className="mr-2 h-4 w-4 text-gray-400" />
                              Not Started
                            </SelectItem>
                            <SelectItem
                              value="In Progress"
                              className="text-blue-600"
                            >
                              <Activity className="mr-2 h-4 w-4 text-blue-400" />
                              In Progress
                            </SelectItem>
                            <SelectItem
                              value="Completed"
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                              Completed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleAddPhaseToList}
                  className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 h-11 shadow-sm hover:shadow-md transition-all"
                >
                  <PlusCircle className="mr-2 h-5 w-5 text-indigo-600" />
                  Add to List
                </Button>
              </div>

              {/* Phase Preview Sidebar */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 h-[600px] overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide flex items-center">
                  <List className="mr-2 h-4 w-4 text-gray-500" />
                  Treatment Phase List
                  <Badge className="ml-2 bg-white border-gray-300 text-gray-700">
                    {phaseList.length}
                  </Badge>
                </h3>

                <ScrollArea className="h-[calc(100%-40px)] pr-3">
                  {phaseList.length > 0 ? (
                    <div className="space-y-2">
                      {phaseList.map((phase, index) => (
                        <div
                          key={index}
                          className="group bg-white rounded-md border border-gray-200 p-3 hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {phase.phase_name}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>
                                  {new Date(
                                    phase.start_date
                                  ).toLocaleDateString()}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={
                                    phase.status === "Completed"
                                      ? "bg-green-50 text-green-700 border-green-100"
                                      : phase.status === "In Progress"
                                      ? "bg-blue-50 text-blue-700 border-blue-100"
                                      : "bg-gray-100 text-gray-700 border-gray-200"
                                  }
                                >
                                  {phase.status}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemovePhase(index)}
                              className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {phase.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {phase.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Clipboard className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">
                        No phases added yet
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddPhaseModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPhases}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 shadow-md gap-2"
              disabled={phaseList.length === 0 || isPhaseSubmitting}
            >
              {isPhaseSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Save All</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Medicine to Phase Modal */}
      <Dialog open={isMedicineModalOpen} onOpenChange={setIsMedicineModalOpen}>
        <DialogContent className="sm:max-w-[95%] max-h-[95vh] lg:max-w-[1200px] rounded-lg bg-white overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <Pill className="mr-2 h-5 w-5 text-[#2C78E4]" />
              Add Medications to Phase
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Search and assign medications to this treatment phase
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 overflow-y-auto max-h-[calc(95vh-200px)]">
            {/* Search bar */}
            <div className="flex items-center gap-3 px-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for medicine by name..."
                  className="pl-10 h-10 rounded-lg border-gray-300 w-full focus:border-[#2C78E4] focus:ring-[#2C78E4]"
                  value={medicineSearchTerm}
                  onChange={handleMedicineSearchChange}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-10 flex items-center text-gray-600 border-gray-300"
                onClick={() => setMedicineSearchTerm("")}
              >
                <RotateCcw size={14} className="mr-1" />
                Clear
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
              {/* Medicine List */}
              <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 border-b flex justify-between items-center">
                  <span className="flex items-center">
                    <Pill className="mr-2 h-4 w-4 text-indigo-600" />
                    {medicineSearchTerm
                      ? "Search Results"
                      : "Available Medicines"}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-white border-gray-200 text-gray-600"
                  >
                    {displayMedicines?.length || 0} medicines
                  </Badge>
                </div>

                <div className="overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-[40%]">Medicine Name</TableHead>
                        <TableHead className="w-[30%]">Dosage</TableHead>
                        <TableHead className="w-[15%]">Quantity</TableHead>
                        <TableHead className="w-[15%] text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>

                  <ScrollArea className="h-[600px]">
                    {isMedicineSearchLoading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mr-3"></div>
                        <p className="text-gray-500">Searching...</p>
                      </div>
                    ) : (
                      <Table>
                        <TableBody>
                          {displayMedicines?.length > 0 ? (
                            displayMedicines?.map((medicine: any) => (
                              <TableRow
                                key={medicine.id}
                                className={
                                  selectedMedicines.some(
                                    (m) => m.id === medicine.id
                                  )
                                    ? "bg-indigo-50/60"
                                    : medicine.quantity <= 0 
                                      ? "bg-gray-100 text-gray-400"
                                      : "hover:bg-gray-50"
                                }
                              >
                                <TableCell className="font-medium py-2">
                                  {medicine.medicine_name}
                                  {medicine.quantity <= 5 && medicine.quantity > 0 && (
                                    <Badge variant="outline" className="ml-2 text-amber-600 bg-amber-50 border-amber-200">
                                      Low Stock: {medicine.quantity}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="py-2">
                                  {medicine.dosage}
                                </TableCell>
                                <TableCell className="py-2">
                                  {medicine.quantity}
                                </TableCell>
                                <TableCell className="text-right py-2">
                                  <Button
                                    size="sm"
                                    variant={
                                      selectedMedicines.some(
                                        (m) => m.id === medicine.id
                                      )
                                        ? "default"
                                        : "ghost"
                                    }
                                    className={`h-8 ${
                                      selectedMedicines.some(
                                        (m) => m.id === medicine.id
                                      )
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                        : medicine.quantity <= 0
                                          ? "text-gray-400 cursor-not-allowed"
                                          : "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                    }`}
                                    onClick={() => handleMedicineSelect(medicine)}
                                    disabled={
                                      selectedMedicines.some(
                                        (m) => m.id === medicine.id
                                      ) || 
                                      medicine.quantity <= 0
                                    }
                                  >
                                    {selectedMedicines.some(
                                      (m) => m.id === medicine.id
                                    ) ? (
                                      <CheckCircle size={16} className="mr-1" />
                                    ) : medicine.quantity <= 0 ? (
                                      <X size={16} className="mr-1" />
                                    ) : (
                                      <Plus size={16} className="mr-1" />
                                    )}
                                    {selectedMedicines.some(
                                      (m) => m.id === medicine.id
                                    )
                                      ? "Added"
                                      : medicine.quantity <= 0
                                        ? "Out of Stock"
                                        : "Add"
                                    }
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-40 text-center text-gray-500"
                              >
                                {medicineSearchTerm
                                  ? `No medicines found matching "${medicineSearchTerm}"`
                                  : "No medicines available"}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                </div>
              </div>

              {/* Selected Medicines Area */}
              <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-indigo-50 px-4 py-3 text-sm font-medium text-gray-700 border-b flex justify-between items-center">
                  <span className="flex items-center">
                    <CheckSquare className="mr-2 h-4 w-4 text-indigo-600" />
                    Selected Medications
                  </span>
                  <Badge className="bg-white text-indigo-700 border-indigo-200">
                    {selectedMedicines.length} selected
                  </Badge>
                </div>

                <ScrollArea className="h-[600px]">
                  <div className="p-4">
                    {selectedMedicines.length > 0 ? (
                      <div className="space-y-4">
                        {selectedMedicines.map((medicine) => (
                          <div
                            key={medicine.id}
                            className="p-4 rounded-lg border border-indigo-100 bg-white hover:shadow-sm transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {medicine.medicine_name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {medicine.dosage}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveMedicine(medicine.id)
                                }
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                              >
                                <X size={16} />
                              </Button>
                            </div>

                            <div className="grid grid-cols-4 gap-3 mb-3">
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`dosage-${medicine.id}`}
                                  className="text-xs text-gray-700"
                                >
                                  Dosage <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`dosage-${medicine.id}`}
                                  placeholder="e.g., 500mg"
                                  value={medicine.dosage || ""}
                                  onChange={(e) =>
                                    handleMedicineInputChange(
                                      medicine,
                                      "dosage",
                                      e.target.value
                                    )
                                  }
                                  className={`h-8 text-sm border-gray-200 ${
                                    medicine.errors?.dosage
                                      ? "border-red-300 focus:ring-red-300"
                                      : ""
                                  }`}
                                />
                                {medicine.errors?.dosage && (
                                  <p className="text-xs text-red-500">
                                    {medicine.errors.dosage}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`quantity-${medicine.id}`}
                                  className="text-xs text-gray-700"
                                >
                                  Quantity{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`quantity-${medicine.id}`}
                                  type="number"
                                  min="1"
                                  placeholder="e.g., 30"
                                  value={medicine.quantity || ""}
                                  onChange={(e) =>
                                    handleMedicineInputChange(
                                      medicine,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  className={`h-8 text-sm border-gray-200 ${
                                    medicine.errors?.quantity
                                      ? "border-red-300 focus:ring-red-300"
                                      : ""
                                  }`}
                                />
                                {medicine.errors?.quantity && (
                                  <p className="text-xs text-red-500">
                                    {medicine.errors.quantity}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`frequency-${medicine.id}`}
                                  className="text-xs text-gray-700"
                                >
                                  Frequency{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`frequency-${medicine.id}`}
                                  placeholder="e.g., Twice daily"
                                  value={medicine.frequency || ""}
                                  onChange={(e) =>
                                    handleMedicineInputChange(
                                      medicine,
                                      "frequency",
                                      e.target.value
                                    )
                                  }
                                  className={`h-8 text-sm border-gray-200 ${
                                    medicine.errors?.frequency
                                      ? "border-red-300 focus:ring-red-300"
                                      : ""
                                  }`}
                                />
                                {medicine.errors?.frequency && (
                                  <p className="text-xs text-red-500">
                                    {medicine.errors.frequency}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`duration-${medicine.id}`}
                                  className="text-xs text-gray-700"
                                >
                                  Duration{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id={`duration-${medicine.id}`}
                                  placeholder="e.g., 7 days"
                                  value={medicine.duration || ""}
                                  onChange={(e) =>
                                    handleMedicineInputChange(
                                      medicine,
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  className={`h-8 text-sm border-gray-200 ${
                                    medicine.errors?.duration
                                      ? "border-red-300 focus:ring-red-300"
                                      : ""
                                  }`}
                                />
                                {medicine.errors?.duration && (
                                  <p className="text-xs text-red-500">
                                    {medicine.errors.duration}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label
                                htmlFor={`notes-${medicine.id}`}
                                className="text-xs text-gray-700"
                              >
                                Notes
                              </Label>
                              <Textarea
                                id={`notes-${medicine.id}`}
                                placeholder="Additional instructions..."
                                value={medicine.notes || ""}
                                onChange={(e) =>
                                  handleMedicineInputChange(
                                    medicine,
                                    "notes",
                                    e.target.value
                                  )
                                }
                                className="min-h-[40px] text-sm border-gray-200 py-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <Pill className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-gray-500 font-medium">
                          No medications selected yet
                        </p>
                        <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                          Select medicines from the list on the left to add them
                          to this phase
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsMedicineModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitMedicines}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 shadow-md flex items-center gap-2"
              disabled={selectedMedicines.length === 0 || isMedicineAssigning}
            >
              {isMedicineAssigning ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>
                    Assign {selectedMedicines.length} Medication
                    {selectedMedicines.length !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Treatment Completion Confirmation Dialog */}
      <Dialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Complete Treatment
            </DialogTitle>
            <DialogDescription className="mt-2">
              This action will mark the treatment as completed and update the
              appointment status to "Completed". This is the final step in the
              patient's current examination process.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Important Information
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Once completed, the appointment status will be updated, and
                  the patient's medical records will be finalized. This action
                  cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCompletionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isCompleting}
              onClick={handleCompleteTreatment}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Processing
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Completion
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Thêm dialog hiển thị đơn thuốc để xuất PDF */}
      <Dialog
        open={isPrescriptionDialogOpen}
        onOpenChange={setIsPrescriptionDialogOpen}
      >
        <DialogContent className="sm:max-w-[850px] max-h-[95vh] overflow-y-auto rounded-xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-[#2C78E4]" />
              Prescription
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Preview, print, or download the prescription as PDF. Select
              specific phases to include medications.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <PrescriptionPDF
              treatment={currentTreatmentForPrescription}
              phases={phases || []}
              patientData={patientData}
              appointmentData={appointmentData}
              onPrint={handlePrintPrescription}
              onDownload={handleDownloadPrescription}
              // onUpload={handleUploadPrescription}
              isPdfGenerating={isPdfGenerating}
            />
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsPrescriptionDialogOpen(false)}
              className="border-gray-300 text-gray-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreatmentManagement;
