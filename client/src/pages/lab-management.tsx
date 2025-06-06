import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  ShoppingCart,
  Check,
  Calendar,
  MoreHorizontal,
  Search,
  SearchX,
  Syringe,
  FlaskConical,
  Beaker,
  Tablet,
  ScanLine,
  Microscope,
  ClipboardList,
  X,
  Info,
  Clock,
  Stethoscope,
  ArrowUpRight,
  Save,
  AlertTriangle,
  Receipt,
  Filter,
  Plus,
  ListChecks,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCreateTest,
  useListTests,
  useCreateTestOrder,
} from "@/hooks/use-test";
import { createInvoice } from "@/services/invoice-services";
import { CreateInvoiceRequest, InvoiceItem } from "@/types";
import { usePatientData } from "@/hooks/use-pet";
import { useAppointmentData } from "@/hooks/use-appointment";
import { useGetTestByAppointmentID } from "@/hooks/use-test";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSaveVaccinationRecord } from "@/hooks/use-vaccine";
import { useScheduleNotification } from "@/hooks/use-noti";
import { Switch } from "@/components/ui/switch";
import { cp } from "fs";

interface Test {
  id: string;
  name: string;
  description: string;
  price?: string;
  turnaround_time?: string;
  batch_number?: string;
  expiration_date?: string;
  type?: string;
}

// Add interface for the API item
interface ApiItem {
  id: number;
  name: string;
  description?: string;
  price?: number;
  turnaround_time?: string;
  type?: string;
  batch_number?: string;
  expiration_date?: string;
}

// Interface for a Test Category
interface TestCategory {
  id: string;
  name: string;
  description: string;
  items: Test[];
}

// Add new interface for vaccination dialog
interface VaccinationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vaccine: Test | null;
  appointmentId: string;
  patient: any;
}

// Add VaccinationDialog component
const VaccinationDialog: React.FC<VaccinationDialogProps> = ({
  isOpen,
  onClose,
  vaccine,
  appointmentId,
  patient,
}) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [scheduleReminder, setScheduleReminder] = useState(true);
  const [batchNumber, setBatchNumber] = useState("");
  const [vaccineProvider, setVaccineProvider] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: saveVaccination, isPending: isSavingVaccination } = useSaveVaccinationRecord();
  const { mutate: scheduleNotification } = useScheduleNotification();
  const { data: appointment } = useAppointmentData(appointmentId);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen && vaccine) {
      setBatchNumber(vaccine.batch_number || "");
      setVaccineProvider(vaccine.type || "");
      setNotes("");
      setNextDueDate(vaccine.expiration_date || "");
    } else if (!isOpen) {
      // Reset form when dialog closes
      setBatchNumber("");
      setVaccineProvider("");
      setNotes("");
      setNextDueDate("");
      setScheduleReminder(true);
    }
  }, [isOpen, vaccine]);


  const validateForm = () => {
    if (!vaccine || !appointmentId || !patient) {
      toast({
        title: "Missing information",
        description: "Required vaccination information is missing.",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    if (!batchNumber.trim()) {
      toast({
        title: "Batch number required",
        description: "Please enter the vaccine batch number.",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    
    if (!vaccineProvider.trim()) {
      toast({
        title: "Vaccine provider required",
        description: "Please enter the vaccine provider/manufacturer.",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Format dates properly for API
      const formatDateForAPI = (dateString: string): string => {
        if (!dateString) return '';
        return `${dateString}T00:00:00Z`;
      };

      const vaccinationData = {
        pet_id: Number(patient.petid),
        vaccine_name: vaccine?.name || "",
        date_administered: formatDateForAPI(new Date().toISOString().split("T")[0]),
        next_due_date: formatDateForAPI(nextDueDate),
        vaccine_provider: vaccineProvider.trim(),
        batch_number: batchNumber.trim(),
        notes: notes.trim(),
        appointment_id: appointmentId.toString(),
      };

      console.log("Submitting vaccination data:", vaccinationData);

      await saveVaccination(vaccinationData);

      // Schedule reminder notification if requested
      if (scheduleReminder && nextDueDate && vaccine) {
        try {
          const nextDueDateObj = new Date(nextDueDate);
          const reminderDate = new Date(nextDueDateObj);
          reminderDate.setDate(reminderDate.getDate() - 7); // 1 week before next due date
          
          // Create a cron expression for the reminder date (at 9:00 AM)
          const cronExpression = `0 9 ${reminderDate.getDate()} ${reminderDate.getMonth() + 1} *`;
          const scheduleId = `vaccine_reminder_${patient.petid}_${Date.now()}`;
          
          // Make sure we have a valid user ID
          const userId = Number(appointment.owner?.owner_id);
          if (isNaN(userId)) {
            console.warn("Invalid user ID for notification:", patient);
            return;
          }
          
          await scheduleNotification({
            user_id: userId,
            title: "Vaccination Due Soon",
            body: `Vaccination reminder: ${vaccine.name} is due for ${patient.name} on ${nextDueDateObj.toLocaleDateString()}`,
            cronExpression,
            schedule_id: scheduleId,
            end_date: nextDueDateObj.toISOString(),
          });
        } catch (notificationError) {
          console.warn("Failed to schedule reminder notification:", notificationError);
          // Don't fail the vaccination recording if reminder fails
        }
      }

      toast({
        title: "Vaccination recorded",
        description: "The vaccination has been successfully administered and recorded.",
        className: "bg-green-50 border-green-200 text-green-800",
        duration: 3000,
      });

      onClose();
    } catch (error) {
      console.error("Failed to save vaccination:", error);
      toast({
        title: "Error",
        description: "Failed to record vaccination. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-[#2C78E4]" />
            Administer Vaccine
          </DialogTitle>
          <DialogDescription>
            Record vaccination details for {patient?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#2C78E4]/10">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{vaccine?.name}</span>
                <Badge variant="outline" className="bg-[#F0F7FF] text-[#2C78E4]">
                  {vaccine?.price}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{vaccine?.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch_number">
                Batch Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="batch_number"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="Enter vaccine batch number"
                className="bg-white border-[#2C78E4]/20"
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="vaccine_provider">
                Vaccine Provider <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vaccine_provider"
                value={vaccineProvider}
                onChange={(e) => setVaccineProvider(e.target.value)}
                placeholder="Enter provider/manufacturer"
                className="bg-white border-[#2C78E4]/20"
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="administration_date">Administration Date</Label>
              <Input
                id="administration_date"
                type="date"
                value={new Date().toISOString().split("T")[0]}
                disabled
                className="bg-gray-50 border-[#2C78E4]/20"
              />
              <p className="text-xs text-gray-500">Automatically set to today</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_due_date">Next Due Date</Label>
              <Input
                id="next_due_date"
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="bg-white border-[#2C78E4]/20"
              />
              <p className="text-xs text-gray-500">When is the next dose due?</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any observations, reactions, or additional notes..."
              className="min-h-[100px] bg-white border-[#2C78E4]/20"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 bg-[#F9FAFB] rounded-lg p-3 border border-[#2C78E4]/10">
            <Switch
              id="schedule-reminder"
              checked={scheduleReminder}
              onCheckedChange={setScheduleReminder}
              className="data-[state=checked]:bg-[#2C78E4]"
            />
            <div>
              <Label htmlFor="schedule-reminder" className="text-sm font-medium">
                Schedule reminder notification
              </Label>
              <p className="text-xs text-gray-500">
                Send a reminder to pet owner 1 week before next vaccination due date
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#2C78E4]/20"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isSavingVaccination}
            className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white"
          >
            {isSubmitting || isSavingVaccination ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Recording...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Record Vaccination
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const LabManagement: React.FC = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTests, setSelectedTests] = useState<Record<string, boolean>>(
    {}
  );
  const [priority, setPriority] = useState("normal");
  const [notes, setNotes] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Add search query state
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);

  // Quản lý tham số workflow
  const [workflowParams, setWorkflowParams] = useState<{
    appointmentId: string | null;
    petId: string | null;
  }>({
    appointmentId: null,
    petId: null,
  });

  // Xử lý các tham số từ URL một cách nhất quán
  useEffect(() => {
    // Lấy tất cả các query params từ URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    const urlPetId = searchParams.get("petId");

    // Thiết lập appointmentId và petId theo thứ tự ưu tiên
    let appointmentIdValue = urlAppointmentId || routeId || null;
    let petIdValue = urlPetId || null;

    setWorkflowParams({
      appointmentId: appointmentIdValue,
      petId: petIdValue,
    });
  }, [routeId]);

  // Sử dụng appointmentId từ workflowParams
  const effectiveAppointmentId = workflowParams.appointmentId || "";

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

  // Get appointment and patient data
  const { data: appointment, isLoading: isAppointmentLoading } =
    useAppointmentData(effectiveAppointmentId);
  const { data: patient, isLoading: isPatientLoading } = usePatientData(
    appointment?.pet?.pet_id
  );


  // Fetch all items (tests and vaccines) with type="all"
  const { data: apiItems, isLoading: isItemsLoading } = useListTests("all");
  
  // Create test mutations
  const createTest = useCreateTest();
  const createTestOrders = useCreateTestOrder();

  // Transform API items to categorized structure
  const testCategories = React.useMemo(() => {
    if (!apiItems) return [];

    // Handle different response formats - apiItems should be an array of categories
    const categories = Array.isArray(apiItems) ? apiItems : [apiItems];
    
    const transformed = categories.map(category => ({
      id: category.id || 'unknown',
      name: category.name || 'Unknown Category',
      description: category.description || '',
      items: (category.items || []).map((item: ApiItem) => {
        console.log("Transforming item:", item);
        return {
          id: item.id.toString(),
          name: item.name,
          description: item.description || "",
          price: item.price ? `${item.price.toLocaleString("vi-VN")} đ` : undefined,
          turnaround_time: item.turnaround_time,
          batch_number: item.batch_number,
          expiration_date: item.expiration_date,
          type: item.type
        };
      })
    }));

    console.log("Transformed test categories:", transformed);
    return transformed;
  }, [apiItems]);

  // Get all tests in a flat array for selection logic
  const allTests = React.useMemo(() => {
    return testCategories.flatMap(category => category.items);
  }, [testCategories]);

  // Filter categories based on search query
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) return testCategories;

    const query = searchQuery.toLowerCase();
    return testCategories.map((category: TestCategory) => ({
      ...category,
      items: category.items.filter((item: Test) => 
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.id.toLowerCase().includes(query)
      )
    })).filter((category: TestCategory) => 
      category.items.length > 0 || 
      category.name.toLowerCase().includes(query) || 
      searchQuery === ""
    );
  }, [testCategories, searchQuery]);

  // Count selected tests
  const selectedTestsCount =
    Object.values(selectedTests).filter(Boolean).length;

  // Get all selected test objects
  const getSelectedTestObjects = () => {
    return allTests.filter(test => selectedTests[test.id]);
  };

  const getTotalPrice = () => {
    // Hàm tính tổng tiền
    const calculateTotal = () => {
      return getSelectedTestObjects().reduce((total, test) => {
        if (!test.price) return total;

        // Chuyển đổi giá trị sang string và loại bỏ tất cả ký tự không phải số
        const cleanedPrice = String(test.price).replace(/\D/g, "");

        // Chuyển đổi sang number và cộng vào tổng
        return total + parseInt(cleanedPrice || "0", 10);
      }, 0);
    };

    // Hàm định dạng hiển thị VND
    const formatVND = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        currencyDisplay: "symbol",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const total = calculateTotal();
    return {
      raw: total, // Giá trị số: 150000
      formatted: formatVND(total), // Định dạng: "150.000 ₫"
    };
  };

  // Toggle test selection
  const toggleTest = (testId: string) => {
    setSelectedTests((prev) => ({
      ...prev,
      [testId]: !prev[testId],
    }));
  };

  // Order the selected tests
  const orderTests = async () => {
    if (!effectiveAppointmentId) {
      toast({
        title: "Error",
        description: "Missing required information to order tests",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const selectedTestObjects = getSelectedTestObjects();
    if (selectedTestObjects.length === 0) {
      toast({
        title: "No tests selected",
        description: "Please select at least one test to order",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      const petId = patient?.petid || 0;
      const doctorId = appointment?.doctor?.doctor_id || 0;

      // Get all selected test IDs
      const testIDs = selectedTestObjects.map((test) => test.id);

      // Determine if we're ordering tests or vaccines
      const isVaccineOrder = selectedTestObjects.some(test => test.type === "vaccine");

      const payload = {
        appointmentID: parseInt(effectiveAppointmentId),
        itemIDs: testIDs.map(Number),
        notes: notes,
        test_type: isVaccineOrder ? "vaccine" : "test",
      };

      // Create all test orders in a single batch request
      const orderResult = await createTestOrders.mutateAsync(payload);

      // Save current session state to localStorage for resuming later
      const sessionData = {
        appointmentId: effectiveAppointmentId,
        petId: patient?.petid,
        doctorId: doctorId,
        lastScreen: "lab-management",
        timestamp: new Date().toISOString(),
        patientName: patient?.name,
        lastAction: isVaccineOrder ? "vaccine-order" : "lab-order",
        notes: notes,
      };

      // Save session data to localStorage
      localStorage.setItem(
        `appointment_session_${effectiveAppointmentId}`,
        JSON.stringify(sessionData)
      );

      // Create invoice for the ordered tests/vaccines
      try {
        // Create invoice items from selected tests with proper details
        const invoiceItems: InvoiceItem[] = selectedTestObjects.map((test) => {
          // Extract numeric price from formatted price string
          const priceString = test.price || "0 đ";
          const numericPrice = parseInt(
            priceString.replace(/[^\d]/g, "") || "0"
          );

          return {
            name: test.name,
            price: numericPrice,
            quantity: 1,
            description:
              test.description ||
              `${isVaccineOrder ? "Vaccine" : "Test"} - ${test.name}`,
          };
        });

        // Calculate total amount
        const totalAmount = invoiceItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Generate invoice number with timestamp and type for uniqueness
        const timestamp = Date.now().toString().slice(-6);
        const invoiceNumber = isVaccineOrder
          ? `INV-VAC-${timestamp}`
          : `INV-LAB-${timestamp}`;

        // Prepare invoice request with complete information
        const invoiceRequest: CreateInvoiceRequest = {
          invoice_number: invoiceNumber,
          amount: totalAmount,
          date: new Date().toISOString(), // Use ISO format (RFC3339)
          due_date: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
          ).toISOString(), // 15 days from now in ISO format
          status: "unpaid",
          description: `${isVaccineOrder ? "Vaccines" : "Lab tests"} for ${
            patient?.name
          } - Appointment #${effectiveAppointmentId}`,
          customer_name: patient?.name || "Unknown Patient",
          type: isVaccineOrder ? "vaccine" : "test",
          test_order_id: orderResult?.data?.order_id,
          items: invoiceItems,
        };
        // Create invoice in the system
        const invoiceResult = await createInvoice(invoiceRequest);

        toast({
          title: `${
            isVaccineOrder ? "Vaccines" : "Tests"
          } ordered and invoice created`,
          description: `${selectedTestObjects.length} ${
            isVaccineOrder ? "vaccine(s)" : "test(s)"
          } have been ordered for ${
            patient?.name
          } and an invoice has been generated.`,
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } catch (invoiceError) {
        console.error("Error creating invoice:", invoiceError);

        // Still show success for test order even if invoice creation fails
        toast({
          title: `${
            isVaccineOrder ? "Vaccines" : "Tests"
          } ordered successfully`,
          description: `${selectedTestObjects.length} ${
            isVaccineOrder ? "vaccine(s)" : "test(s)"
          } have been ordered for ${
            patient?.name
          }, but there was an issue creating the invoice.`,
          className: "bg-yellow-50 border-yellow-200 text-yellow-800",
          duration: 3000,
        });
      }

    } catch (error) {
      console.error("Error ordering tests:", error);
      toast({
        title: "Failed to order tests",
        description:
          "An error occurred while ordering tests. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleBackToExamination = () => {
    // Navigate to patient page with query params
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: patient?.petid,
    };
    navigate(`/examination${buildUrlParams(params)}`);
  };

  const navigateToTreatment = () => {
    // Navigate to treatment page with query params
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: patient?.petid,
    };
    navigate(`/treatment${buildUrlParams(params)}`);
  };

  // Add new state for vaccination
  const [selectedVaccine, setSelectedVaccine] = useState<Test | null>(null);

  const [isVaccinationDialogOpen, setIsVaccinationDialogOpen] = useState(false);

  // Modify the table row to handle vaccine administration
  const handleVaccineAdminister = (test: Test, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection
    setSelectedVaccine(test);
    setIsVaccinationDialogOpen(true);
  };

  if (
    isAppointmentLoading ||
    isPatientLoading ||
    isItemsLoading ||
    !appointment ||
    !patient
  ) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-[#2C78E4] border-b-[#2C78E4] border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-[#2C78E4] font-medium">Loading data...</p>
        </div>
      </div>
    );
  }
  
  if (filteredCategories.length === 0 && !searchQuery) {
    return (
      <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
              onClick={handleBackToExamination}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back to Examination</span>
            </Button>
            <h1 className="text-white font-semibold text-lg">
              Laboratory Tests
            </h1>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Tests Available
          </h2>
          <p className="text-gray-600">
            There are no laboratory tests configured in the system.
            Please contact your administrator to set up tests.
          </p>
          <Button
            className="mt-6 bg-[#2C78E4] hover:bg-[#1E40AF] text-white"
            onClick={handleBackToExamination}
          >
            Return to Examination
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clinical Header */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-5 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
              onClick={handleBackToExamination}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back to Examination</span>
            </Button>
            <div>
              <h1 className="text-white font-bold text-xl">
                Lab Tests
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Lab Tests - {patient?.name} 
              </p>
            </div>
          </div>
        </div>
      </div>
      <WorkflowNavigation
        appointmentId={effectiveAppointmentId}
        petId={patient?.pet_id?.toString()}
        currentStep="diagnostic"
      />

    

      {/* Search Bar */}
      <div className="px-6 pb-4">
        <div className="relative max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests by name or description..."
            className="pl-10 w-full pr-4 py-2 h-11 border border-gray-200 rounded-lg shadow-sm focus:ring-[#2C78E4] focus:border-[#2C78E4]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Main content - Accordion-Based Category View */}
      <div className="px-6">
        {filteredCategories.length > 0 ? (
          <div className="space-y-4">
            {/* Test Counter */}
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span>
                {filteredCategories.reduce((total, category) => total + category.items.length, 0)} test
                {filteredCategories.reduce((total, category) => total + category.items.length, 0) !== 1 ? "s" : ""} available
                {searchQuery ? ` for "${searchQuery}"` : ""}
              </span>
            </div>

            {/* Accordion Layout */}
            <Accordion 
              type="single" 
              collapsible 
              className="w-full space-y-3"
              value={activeAccordionItem}
              onValueChange={setActiveAccordionItem}
            >
              {filteredCategories.map((category) => (
                <AccordionItem 
                  value={category.id} 
                  key={category.id} 
                  className="border border-[#2C78E4]/10 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="px-6 py-4 text-lg font-medium text-[#111827] hover:bg-[#F0F7FF] data-[state=open]:bg-[#E0F2FE] data-[state=open]:text-[#0C4A6E]">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Beaker className="h-5 w-5 mr-3 text-[#2C78E4]" /> 
                        {category.name}
                        <Badge variant="outline" className="ml-3 bg-white border-[#2C78E4]/30 text-[#2C78E4]">
                          {category.items.length} items
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pt-0 pb-2 bg-white">
                    {category.items.length > 0 ? (
                      <Table className="mt-0">
                        <TableHeader className="bg-[#F9FAFB]">
                          <TableRow>
                            <TableHead className="pl-6 w-12"></TableHead>
                            <TableHead className="font-semibold text-[#111827]">Test Name</TableHead>
                            <TableHead className="font-semibold text-[#111827]">Description</TableHead>
                            <TableHead className="font-semibold text-[#111827]">Price</TableHead>
                            {/* <TableHead className="font-semibold text-[#111827]">Turnaround</TableHead> */}
                            <TableHead className="font-semibold text-[#111827]">Type</TableHead>
                            {/* <TableHead className="font-semibold text-[#111827]">Action</TableHead> */}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {category.items.map((test: Test) => (
                            <TableRow 
                              key={test.id} 
                              className={cn(
                                "hover:bg-[#F9FAFB]/50 cursor-pointer transition-all",
                                selectedTests[test.id]
                                  ? "bg-[#F0F7FF] hover:bg-[#E3F2FD]"
                                  : ""
                              )}
                              onClick={() => toggleTest(test.id)}
                            >
                              <TableCell className="pl-6">
                                <Checkbox
                                  checked={selectedTests[test.id] || false}
                                  onCheckedChange={() => toggleTest(test.id)}
                                  className="border-gray-300 data-[state=checked]:bg-[#2C78E4] data-[state=checked]:border-[#2C78E4]"
                                />
                              </TableCell>
                              <TableCell className="font-medium text-[#111827]">
                                {test.name}
                              </TableCell>
                              <TableCell className="text-sm text-[#4B5563] max-w-xs truncate" title={test.description}>
                                {test.description || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm text-[#4B5563]">
                                {test.price || "N/A"}
                              </TableCell>
                              {/* <TableCell className="text-sm text-[#4B5563] flex items-center">
                                {test.turnaround_time && (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    {test.turnaround_time}
                                  </>
                                )}
                              </TableCell> */}
                              <TableCell className="text-sm text-[#4B5563]">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-gray-50 border-gray-200"
                                >
                                  {test.type || "Test"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {test.type === "vaccine" && (
                                  <Button
                                    onClick={(e) => handleVaccineAdminister(test, e)}
                                    className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white text-xs py-1 px-2 rounded-md"
                                  >
                                    <Syringe className="h-3 w-3 mr-1 inline-block" />
                                    Record Vaccine
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="px-6 py-4 text-sm text-gray-500">
                        No test items found in this category{searchQuery ? " matching your search" : ""}.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="py-12 text-center">
            <SearchX className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-gray-700 font-medium mb-1">
              No matching tests found
            </h3>
            <p className="text-gray-500">
              Try different keywords or clear your search
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {selectedTestsCount > 0 && (
        <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200 shadow-md z-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {selectedTestsCount} test{selectedTestsCount !== 1 ? "s" : ""} selected
                </span>
                <Badge className="bg-[#F0F7FF] text-[#2C78E4] hover:bg-[#E3F2FD]">
                  {getTotalPrice().formatted}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Click tests to add or remove them from your order
              </p>
            </div>
            <Button
              onClick={() => setShowConfirmDialog(true)}
              className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white px-6"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Place Order
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-xl">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle className="text-xl font-semibold">
              Confirm Test Order
            </DialogTitle>
            <DialogDescription>
              You're ordering {selectedTestsCount} test
              {selectedTestsCount !== 1 ? "s" : ""} for {patient.name}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6">
            <div className="mb-3 flex justify-between items-center">
              <h4 className="font-medium text-gray-700">Selected Tests</h4>
              <Badge className="bg-[#F0F7FF] text-[#2C78E4]">
                {getTotalPrice().formatted}
              </Badge>
            </div>

            <div className="max-h-[250px] overflow-y-auto border rounded-lg">
              <ul className="divide-y divide-gray-100">
                {getSelectedTestObjects().map((test) => (
                  <li
                    key={test.id}
                    className="p-3 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {test.name}
                      </span>
                      {test.price && (
                        <span className="block text-sm text-gray-500">
                          {test.price}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                      onClick={() => toggleTest(test.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <Label htmlFor="notes" className="text-sm font-medium">
                Lab Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 h-20 rounded-lg border-gray-200 focus:ring-[#2C78E4] focus:border-[#2C78E4]"
              />
            </div>
          </div>

          <div className="flex border-t mt-6">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 font-medium text-gray-700 flex items-center justify-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={orderTests}
              className="flex-1 py-4 bg-[#2C78E4] hover:bg-[#1E40AF] font-medium text-white flex items-center justify-center"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm Order
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Vaccination Dialog */}
      <VaccinationDialog
        isOpen={isVaccinationDialogOpen}
        onClose={() => setIsVaccinationDialogOpen(false)}
        vaccine={selectedVaccine}
        appointmentId={effectiveAppointmentId}
        patient={patient}
      />
    </div>
  );
};
export default LabManagement;
