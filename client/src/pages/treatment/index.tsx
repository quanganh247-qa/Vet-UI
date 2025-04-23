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
  MedicineTransactionRequest,
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
import InvoiceDialog from "@/components/InvoiceDialog";
import { useMedicalHistory } from "@/hooks/use-medical-history";
import { useCreateMedicalRecord } from "@/hooks/use-medical-record";
import { Switch } from "@/components/ui/switch";

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

  const { data: alergies, isLoading: isAlertsLoading } = useAllergiesData(
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

  // Utility function to build query parameters
  const buildUrlParams = (
    params: Record<string, string | number | null | undefined>
  ) => {
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        urlParams.append(key, String(value));
      }
    });

    const queryString = urlParams.toString();
    return queryString ? `?${queryString}` : "";
  };

  // Replace navigateToInvoice with openInvoiceDialog
  const openInvoiceDialog = (invoiceId: string) => {
    setCurrentInvoiceId(invoiceId);
    setIsInvoiceDialogOpen(true);
  };

  // Common PDF generation function to reduce code duplication
  const generatePDF = async (elementId: string, action: 'print' | 'download', fileName?: string) => {
    const element = document.getElementById(elementId);

    if (!element) {
      toast({
        title: "Error",
        description: `Could not find content to ${action === 'print' ? 'print' : 'export'}.`,
        variant: "destructive",
      });
      return;
    }

    // Hide the buttons during capturing
    const actionButtons = element.querySelector(".print\\:hidden");
    if (actionButtons) {
      actionButtons.classList.add("hidden");
    }

    toast({
      title: action === 'print' ? "Preparing Print" : "Generating PDF",
      description: action === 'print'
        ? "Preparing your invoice for printing..."
        : "Please wait while we generate your invoice PDF...",
    });

    try {
      // Use html2canvas to capture the invoice element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff" // Ensure white background
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

      if (action === 'print') {
        // Print the PDF
        pdf.autoPrint();
        window.open(pdf.output('bloburl'), '_blank');

        toast({
          title: "Print Ready",
          description: "Your invoice has been prepared for printing.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        // Generate filename with invoice ID
        const outputFileName = fileName || (invoiceData ? `Invoice_${invoiceData.invoiceId}.pdf` : "Invoice.pdf");

        // Save the PDF
        pdf.save(outputFileName);

        toast({
          title: "Download Complete",
          description: "Your invoice has been saved as PDF.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      }
    } catch (error) {
      console.error(`Error generating PDF for ${action}:`, error);

      toast({
        title: "Error",
        description: `There was a problem ${action === 'print' ? 'preparing the print' : 'generating the PDF'}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      // Always show buttons again in case of success or error
      if (actionButtons) {
        actionButtons.classList.remove("hidden");
      }
    }
  };

  // Handle printing the invoice
  const handlePrintInvoice = () => {
    generatePDF("invoice-pdf-content", 'print');
  };

  // Handle downloading the invoice as PDF
  const handleDownloadInvoice = () => {
    generatePDF("invoice-pdf-content", 'download');
  };

  // Handle sharing the invoice
  const handleShareInvoice = () => {
    // In a real implementation, you would open a share dialog
    toast({
      title: "Share Options",
      description: "Invoice sharing options are being prepared.",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
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
    if (name === "start_date" && !value) {
      return "Start date is required";
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

  // State for new medical history record after medicine assignment
  const [createHistoryAfterAssign, setCreateHistoryAfterAssign] = useState(true);
  const [createPrescriptionAfterHistory, setCreatePrescriptionAfterHistory] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMedicineAssignmentSuccess, setIsMedicineAssignmentSuccess] = useState(false);
  const [assignedMedicinesForHistory, setAssignedMedicinesForHistory] = useState<any[]>([]);
  const [historyRecord, setHistoryRecord] = useState({
    condition: "",
    diagnosis_date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    notes: ""
  });

  const createMedicalHistoryMutation = useCreateMedicalRecord(petId ? parseInt(petId) : 0);
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
  const displayMedicines =
    medicineSearchTerm.length > 0 ? searchResults ?? [] : allMedicines ?? [];

  // Assign medicine to phase mutation
  const assignMedicineMutation = useAssignMedicine(
    selectedTreatment?.id || "",
    selectedPhaseId?.toString() || ""
  );
  const isMedicineAssigning = assignMedicineMutation.isPending;

  // New state for medicine assignment
  const [medicineAssignment, setMedicineAssignment] = useState({
    medicine_id: 0,
    medicine_name: "",
    description: "",
    type: "",
    side_effects: "",
    usage: "",
    dosage: "",
    frequency: "",
    notes: "",
    duration: "",
  });

  // Handle medicine selection
  const handleMedicineSelect = (medicine: any) => {
    const alreadySelected = selectedMedicines.some((m) => m.id === medicine.id);

    if (!alreadySelected) {
      setSelectedMedicines([...selectedMedicines, medicine]);
      setMedicineSearchTerm("");
    }
  };

  // Handle medicine removal
  const handleRemoveMedicine = (medicineId: number) => {
    setSelectedMedicines(selectedMedicines.filter((m) => m.id !== medicineId));
  };

  // Handle opening medicine modal for a specific phase
  const handleOpenMedicineModal = (phaseId: number) => {
    setSelectedPhaseId(phaseId);
    // Reset selected medicines when opening the modal
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
        frequency: medicine.frequency,
        notes: medicine.notes || "",
        duration: medicine.duration || "",
      }));

      // Submit the array of assignments at once
      await assignMedicineMutation.mutateAsync(assignmentData);

      // Explicitly refetch phase medicines data
      if (selectedPhaseId) {
        await refetchPhaseMedicines();
        // Also refetch phases to update medication counts
        await refetchPhases();
      }

      // Prepare and export each medicine transaction
      const exportPromises = selectedMedicines.map((medicine) => {
        // Map selected medicine to MedicineTransactionRequest
        // Ensure all required fields are available in selectedMedicines
        const transactionData: MedicineTransactionRequest = {
          medicine_id: medicine.id,
          quantity: medicine.quantity || 1, // Make sure this field exists
          transaction_type: "export", // Or get from medicine/state
          unit_price: medicine.unit_price, // Make sure this field exists
          supplier_id: medicine.supplier_id, // Make sure this field exists
          expiration_date: medicine.expiration_date, // Make sure this field exists
          notes: medicine.notes || "",
          prescription_id: medicine.prescription_id || 0, // Adjust as needed
          appointment_id: medicine.appointment_id || 0, // Adjust as needed
        };
        return exportMedicineMutateAsync(transactionData);
      });

      await Promise.all(exportPromises);

      toast({
        title: "Success",
        description: `${selectedMedicines.length} medications assigned successfully`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Store the assigned medicines for medical history record
      setAssignedMedicinesForHistory(selectedMedicines);

      // Set flag to indicate medicine assignment was successful
      setIsMedicineAssignmentSuccess(true);

      // If create history after assignment is enabled, show the history modal
      if (createHistoryAfterAssign) {
        // Pre-populate the history record condition based on treatment information
        setHistoryRecord({
          condition: selectedTreatment?.name || "Treatment phase medication",
          diagnosis_date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          notes: `Medicines prescribed as part of treatment plan: ${selectedTreatment?.name || ""}. Phase: ${phases?.find((p: any) => p.id === selectedPhaseId)?.phase_name || ""}.\n\nMedications:\n${selectedMedicines.map(m => `- ${m.medicine_name}: ${m.dosage}, ${m.frequency}, ${m.duration}`).join('\n')}`
        });

        // Close medicine modal and open history modal
        setIsMedicineModalOpen(false);
        setTimeout(() => setIsHistoryModalOpen(true), 300);
      } else {
        // Just close the medicine modal
        setIsMedicineModalOpen(false);

        // Toggle phase view to refresh display
        if (selectedPhaseId) {
          setExpandedPhases((prev) => ({
            ...prev,
            [selectedPhaseId]: true,
          }));
        }
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

  // Handle creating medical history record
  const handleSubmitMedicalHistory = async () => {
    if (!petId) {
      toast({
        title: "Error",
        description: "Pet ID is required to create a medical history record",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the medical history record
      const result = await createMedicalHistoryMutation.mutateAsync(historyRecord);

      // Get the created medical history ID
      const historyId = result?.data?.id || result?.id;

      toast({
        title: "Success",
        description: "Medical history record created successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // If prescription creation is enabled, proceed to create it
      if (createPrescriptionAfterHistory && historyId && assignedMedicinesForHistory.length > 0) {
        try {
          // Check if we have doctor information
          if (!appointmentData?.doctor?.doctor_id) {
            throw new Error("Doctor information is not available");
          }

          // Prepare prescription request with medicines from assigned medicines
          const prescriptionRequest = {
            medical_history_id: historyId,
            examination_id: 0, // This might need to come from an examination if available
            prescription_date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            doctor_id: parseInt(appointmentData.doctor.doctor_id),
            notes: `Prescription created from treatment: ${selectedTreatment?.name || ""}`,
            medications: assignedMedicinesForHistory.map(med => ({
              medicine_id: med.id,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.notes || ""
            }))
          };

          // Use the hook we imported
          const { createPrescription } = useMedicalHistory();
          await createPrescription.mutateAsync(prescriptionRequest);

          toast({
            title: "Success",
            description: "Prescription created successfully",
            className: "bg-green-50 border-green-200 text-green-800",
          });

          // Ask user if they want to go to medical records page
          const confirmed = window.confirm("Would you like to navigate to the medical records page to see the created records?");
          if (confirmed) {
            // Navigate to medical records with the pet ID and appointment ID as query parameters
            const params = new URLSearchParams();
            if (appointmentId) params.append("appointmentId", appointmentId);
            if (petId) params.append("petId", petId);
            setLocation(`/medical-records?${params.toString()}`);
            return;
          }
        } catch (error) {
          console.error("Error creating prescription:", error);
          toast({
            title: "Warning",
            description: "Medical history created but failed to create prescription",
            variant: "destructive",
          });
        }
      }

      // Close history modal
      setIsHistoryModalOpen(false);

      // Toggle phase view to refresh display
      if (selectedPhaseId) {
        setExpandedPhases((prev) => ({
          ...prev,
          [selectedPhaseId]: true,
        }));
      }
    } catch (error) {
      console.error("Error creating medical history:", error);
      toast({
        title: "Error",
        description: "Failed to create medical history record",
        variant: "destructive",
      });
    }
  };

  // Handle exporting treatment as invoice
  const handleExportTreatment = async () => {
    try {
      if (!appointmentData || !treatments || treatments.length === 0) {
        toast({
          title: "Export Failed",
          description: "No treatment data available to export",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Processing",
        description: "Creating invoice from treatment plan...",
      });

      // Collect all medicine IDs that need to be fetched
      const medicineCache = new Map();
      const medicineIds = [];
      const medicineItems = [];

      // Calculate treatment base costs and collect medicine data
      let totalAmount = 0;
      const invoiceItems = [];

      // First pass - add treatments and collect medicine IDs
      for (const treatment of treatments) {
        // Add base treatment cost
        const treatmentCost = 50; // Example base cost for a treatment
        totalAmount += treatmentCost;

        // Add treatment as an invoice item
        invoiceItems.push({
          name: `${treatment.type}: ${treatment.name}`,
          price: treatmentCost,
          quantity: 1
        });

        // Collect medicine IDs from phases
        if (treatment.phases) {
          for (const phase of treatment.phases) {
            if (phase.medications && phase.medications.length > 0) {
              for (const med of phase.medications) {
                if (!medicineCache.has(med.medicine_id)) {
                  medicineIds.push(med.medicine_id);
                  medicineCache.set(med.medicine_id, null); // Placeholder until we fetch the data
                }
                medicineItems.push({
                  id: med.medicine_id,
                  name: med.medicine_name,
                  phaseName: phase.phase_name,
                  quantity: med.quantity || 1
                });
              }
            }
          }
        }
      }

      // Fetch all medicine data in parallel
      if (medicineIds.length > 0) {
        try {
          // Fetch all medicines in parallel
          const medicinePromises = medicineIds.map(id => getMedicineById(id));
          const medicineResults = await Promise.all(medicinePromises);

          // Store results in cache
          medicineIds.forEach((id, index) => {
            if (medicineResults[index]) {
              medicineCache.set(id, medicineResults[index]);
            }
          });
        } catch (error) {
          console.error("Error fetching medicines:", error);
          // Continue with default values if fetching fails
        }
      }

      // Second pass - add medicine items with data from cache
      for (const item of medicineItems) {
        const medicineData = medicineCache.get(item.id);
        const medPrice = medicineData?.unit_price || 10; // Default price if data not available
        const medQuantity = item.quantity;

        totalAmount += (medPrice * medQuantity);

        invoiceItems.push({
          name: `${item.name} (${item.phaseName})`,
          price: medPrice,
          quantity: medQuantity
        });
      }

      // Generate invoice number
      const invoiceNumber = `INV-TRT-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      // Create the invoice request
      const invoiceRequest = {
        invoice_number: invoiceNumber,
        amount: totalAmount,
        date: format(new Date(), 'yyyy-MM-dd'),
        due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
        status: 'pending',
        description: `Complete treatment plan for ${patientData?.name || 'pet'}`,
        customer_name: appointmentData.owner?.owner_name || 'Patient',
        items: invoiceItems
      };


      // Submit invoice creation request
      const response = await createInvoiceMutation.mutateAsync(invoiceRequest);

      // If successful, open the invoice dialog
      if (response && response.id) {
        toast({
          title: "Success",
          description: `Invoice #${invoiceNumber} created successfully`,
          className: "bg-green-50 border-green-200 text-green-800",
        });

        // Open the invoice dialog with the newly created invoice ID
        setCurrentInvoiceId(response.id.toString());
        setIsInvoiceDialogOpen(true);

        return {
          invoiceId: response.id,
          invoiceNumber: invoiceNumber
        };
      }
      return null;
    } catch (error) {
      console.error("Error exporting treatment as invoice:", error);
      toast({
        title: "Export Failed",
        description: "Failed to create invoice from treatment plan",
        variant: "destructive",
      });
      return null;
    }
  };

  // Handle completing a treatment and exporting as invoice
  const handleCompleteTreatment = async () => {
    if (!selectedTreatment) {
      toast({
        title: "Error",
        description: "No treatment selected",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Processing",
        description: "Completing treatment and generating invoice...",
      });

      // Here you would normally update the treatment status to "Completed" in your API
      // For example:
      // await updateTreatmentStatus(selectedTreatment.id, "Completed");

      // Then export the treatment as invoice
      await handleExportTreatment();

      // Refetch treatments to update UI
      await refetchTreatments();

      // Optionally, navigate back to list view
      setActiveView("list");
      setSelectedTreatmentId(null);

    } catch (error) {
      console.error("Error completing treatment:", error);
      toast({
        title: "Error",
        description: "Failed to complete treatment",
        variant: "destructive",
      });
    }
  };

  // Get the invoice data for the dialog
  const { data: invoiceData, isLoading: isInvoiceLoading } = useInvoiceData(currentInvoiceId || "");

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
              {/* <p className="text-indigo-100 text-sm">
                Manage treatment plans and protocols
              </p> */}
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
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
                onClick={() => setActiveView("new")}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                <span>New Treatment</span>
              </Button>
            )}

            {/* invoice button */}
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
              onClick={() => openInvoiceDialog(selectedTreatment?.id?.toString() || "")}
            >
              <FileText className="h-4 w-4 mr-1" />
              <span>Medical Records</span>
            </Button>
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
                  onClick={handleExportTreatment}
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

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          <Badge
                            className={`mr-2 ${treatment.status === "Completed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : treatment.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : treatment.status === "Not Started"
                                    ? "bg-gray-100 text-gray-800 border-gray-200"
                                    : "bg-indigo-100 text-indigo-800 border-indigo-200"
                              }`}
                          >
                            {treatment.status}
                          </Badge>
                          <span>{treatment.name}</span>
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

                {/* Add Complete & Export button */}
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleCompleteTreatment}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                    disabled={selectedTreatment.status === "Completed"}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Complete & Export</span>
                  </Button>
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
                    onClick={() => setIsAddPhaseModalOpen(true)}
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
                        className={`px-5 py-3 border-b flex justify-between items-center cursor-pointer ${phase.status === "Completed"
                            ? "bg-gradient-to-r from-green-50 to-white"
                            : phase.status === "In Progress"
                              ? "bg-gradient-to-r from-blue-50 to-white"
                              : "bg-gradient-to-r from-gray-50 to-white"
                          }`}
                        onClick={() => togglePhaseExpansion(phase.id)}
                      >
                        <div className="flex items-center">
                          <div
                            className={`p-1.5 rounded-lg mr-3 ${phase.status === "Completed"
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
                            className={`text-gray-400 transition-transform ${expandedPhases[phase.id] ? "rotate-180" : ""
                              }`}
                          />
                        </div>
                      </div>

                      {expandedPhases[phase.id] && (
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Medications Section */}
                            <div className="rounded-lg border border-gray-200">
                              <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                                  <Pill className="mr-2 h-4 w-4 text-indigo-600" />
                                  Medications
                                </h3>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 py-1 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                  onClick={() =>
                                    handleOpenMedicineModal(phase.id)
                                  }
                                >
                                  <Plus size={14} className="mr-1" />
                                  Add Medicine
                                </Button>
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
                                            <Badge
                                              variant="outline"
                                              className="bg-white border-indigo-200 text-indigo-800"
                                            >
                                              {med.dosage}
                                            </Badge>
                                          </div>
                                          <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-3">
                                            <div className="flex items-center gap-1">
                                              <Clock
                                                size={12}
                                                className="text-gray-400"
                                              />
                                              <span>{med.frequency}</span>
                                            </div>
                                            {med.duration && (
                                              <div className="flex items-center gap-1">
                                                <Calendar
                                                  size={12}
                                                  className="text-gray-400"
                                                />
                                                <span>{med.duration}</span>
                                              </div>
                                            )}
                                            {med.notes && (
                                              <div className="flex items-center gap-1">
                                                <FileText
                                                  size={12}
                                                  className="text-gray-400"
                                                />
                                                <span>{med.notes}</span>
                                              </div>
                                            )}
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
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-indigo-600" />
                    Treatment Information
                  </div>

                  {/* Simple step indicator */}
                  <div className="flex items-center gap-2 text-sm bg-white p-2 rounded-md shadow-sm">
                    <span
                      className={`px-3 py-1 rounded-full font-medium ${formStep === 0
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      1
                    </span>
                    <span className="text-gray-300">→</span>
                    <span
                      className={`px-3 py-1 rounded-full font-medium ${formStep === 1
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      2
                    </span>
                    <span className="text-gray-300">→</span>
                    <span
                      className={`px-3 py-1 rounded-full font-medium ${formStep === 2
                          ? "bg-indigo-600 text-white"
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
                      formStep === 0 ? "text-indigo-600 font-medium" : ""
                    }
                  >
                    Basic Info
                  </span>
                  <span
                    className={
                      formStep === 1 ? "text-indigo-600 font-medium" : ""
                    }
                  >
                    Timeline & Status
                  </span>
                  <span
                    className={
                      formStep === 2 ? "text-indigo-600 font-medium" : ""
                    }
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
                          className="text-sm font-medium text-gray-700"
                        >
                          Treatment Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="treatment-name"
                          placeholder="Enter treatment name"
                          className={`h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 ${formTouched.name && formErrors.name
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
                          placeholder="e.g., Surgery Recovery, Medication Protocol"
                          className={`h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 ${formTouched.type && formErrors.type
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
                          className="h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
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
                    <div className="space-y-6">
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
                            className="h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
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
                          className={`h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 ${formTouched.start_date && formErrors.start_date
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
                        <Label
                          htmlFor="notes"
                          className="text-sm font-medium text-gray-700"
                        >
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder="Any additional notes or instructions"
                          className="min-h-[80px] text-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
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
                        className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <ChevronRight size={18} className="ml-1" />
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <PlusCircle size={16} className="mr-1.5" />
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
        <DialogContent className="sm:max-w-[700px] rounded-lg bg-white">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <Layers className="mr-2 h-5 w-5 text-indigo-600" />
              Create Treatment Phase
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Add treatment phases and manage the sequence of execution
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
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
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 h-[500px] overflow-hidden">
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
                    <p className="text-gray-500 text-sm">No phases added yet</p>
                  </div>
                )}
              </ScrollArea>
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
        <DialogContent className="sm:max-w-[90%] max-h-[90vh] lg:max-w-[1000px] rounded-lg bg-white overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <Pill className="mr-2 h-5 w-5 text-indigo-600" />
              Add Medications to Phase
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Search and assign medications to this treatment phase
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Search bar */}
            <div className="flex items-center gap-3 px-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for medicine by name..."
                  className="pl-10 h-10 border-gray-300 w-full"
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
                        <TableHead className="w-[50%]">Medicine Name</TableHead>
                        <TableHead className="w-[35%]">Dosage</TableHead>
                        <TableHead className="w-[15%] text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>

                  <ScrollArea className="h-[450px]">
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
                                    : "hover:bg-gray-50"
                                }
                              >
                                <TableCell className="font-medium py-2">
                                  {medicine.medicine_name}
                                </TableCell>
                                <TableCell className="py-2">
                                  {medicine.dosage}
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
                                    className={`h-8 ${selectedMedicines.some(
                                      (m) => m.id === medicine.id
                                    )
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                        : "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                      }`}
                                    onClick={() =>
                                      handleMedicineSelect(medicine)
                                    }
                                    disabled={selectedMedicines.some(
                                      (m) => m.id === medicine.id
                                    )}
                                  >
                                    {selectedMedicines.some(
                                      (m) => m.id === medicine.id
                                    ) ? (
                                      <CheckCircle size={16} className="mr-1" />
                                    ) : (
                                      <Plus size={16} className="mr-1" />
                                    )}
                                    {selectedMedicines.some(
                                      (m) => m.id === medicine.id
                                    )
                                      ? "Added"
                                      : "Add"}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={3}
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

                {/* Debug info */}
                <div className="px-4 py-2 text-xs text-gray-500 border-t">
                  Total medicines: {allMedicines?.length || 0} | Search results:{" "}
                  {searchResults?.length || 0} | Display count:{" "}
                  {displayMedicines?.length || 0}
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

                <ScrollArea className="h-[450px]">
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

                            <div className="grid grid-cols-3 gap-3 mb-3">
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
                                  className={`h-8 text-sm border-gray-200 ${medicine.errors?.dosage
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
                                  className={`h-8 text-sm border-gray-200 ${medicine.errors?.frequency
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
                                  className={`h-8 text-sm border-gray-200 ${medicine.errors?.duration
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

      {/* Medical History Record Creation Dialog */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] rounded-lg bg-white overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-indigo-600" />
              Create Medical History Record
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a medical history record for this treatment's medication
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="condition"
                  className="text-sm font-medium text-gray-700"
                >
                  Condition / Diagnosis <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="condition"
                  placeholder="Enter medical condition or diagnosis"
                  value={historyRecord.condition}
                  onChange={(e) => setHistoryRecord({
                    ...historyRecord,
                    condition: e.target.value
                  })}
                  className="mt-1 h-10 border-gray-200"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Specify the medical condition or diagnosis
                </p>
              </div>

              <div>
                <Label
                  htmlFor="diagnosis-date"
                  className="text-sm font-medium text-gray-700"
                >
                  Diagnosis Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="diagnosis-date"
                  type="datetime-local"
                  value={historyRecord.diagnosis_date.replace(" ", "T")}
                  onChange={(e) => setHistoryRecord({
                    ...historyRecord,
                    diagnosis_date: e.target.value.replace("T", " ")
                  })}
                  className="mt-1 h-10 border-gray-200"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  When the condition was diagnosed
                </p>
              </div>

              <div>
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Enter detailed notes about the condition, treatment, etc."
                  value={historyRecord.notes}
                  onChange={(e) => setHistoryRecord({
                    ...historyRecord,
                    notes: e.target.value
                  })}
                  className="mt-1 min-h-[120px] border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include any important details about the condition, symptoms, treatments, etc.
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mt-1 pt-4 border-t">
                <Switch
                  id="create-prescription"
                  checked={createPrescriptionAfterHistory}
                  onCheckedChange={setCreatePrescriptionAfterHistory}
                  className="data-[state=checked]:bg-indigo-600"
                />
                <Label htmlFor="create-prescription" className="text-sm font-medium text-gray-700">
                  Automatically create prescription with assigned medicines
                </Label>
                <div className="ml-2 px-2 py-1 bg-emerald-50 text-xs font-medium text-emerald-700 rounded border border-emerald-200">
                  Recommended
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 mt-2 border border-blue-100">
                <div className="flex items-start space-x-2">
                  <Receipt className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Medical Records Workflow
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Creating a medical history record allows you to document the condition being treated. 
                      When enabled, a prescription will also be created using the medicines you've assigned.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsHistoryModalOpen(false);
                // Toggle phase view to refresh display
                if (selectedPhaseId) {
                  setExpandedPhases((prev) => ({
                    ...prev,
                    [selectedPhaseId]: true,
                  }));
                }
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 h-11 px-6"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleSubmitMedicalHistory}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 shadow-md flex items-center gap-2"
              disabled={createMedicalHistoryMutation.isPending}
            >
              {createMedicalHistoryMutation.isPending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  <span>Create Medical Record</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add the InvoiceDialog component */}
      <InvoiceDialog
        invoice={invoiceData}
        isLoading={isInvoiceLoading}
        open={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        onPrint={handlePrintInvoice}
        onDownload={handleDownloadInvoice}
        onShare={handleShareInvoice}
      />
    </div>
  );
};

export default TreatmentManagement;
