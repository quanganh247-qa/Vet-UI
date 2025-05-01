import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  FlaskConical,
  Beaker,
  Tablet,
  ScanLine,
  Microscope,
  ClipboardList,
  X,
  Check,
  Info,
  Clock,
  Calendar,
  FileText,
  Stethoscope,
  ArrowUpRight,
  Save,
  ShoppingCart,
  AlertTriangle,
  Syringe,
  Receipt,
  Search,
  SearchX,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { usePatientData } from "@/hooks/use-pet";
import { useAppointmentData } from "@/hooks/use-appointment";
import {
  useCreateTest,
  useListTests,
  useCreateTestOrder,
} from "@/hooks/use-test";
import { createInvoice } from "@/services/invoice-services";
import { CreateInvoiceRequest, InvoiceItem } from "@/types";
import { format } from "date-fns";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { cn } from "@/lib/utils";

interface TestCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  tests: Test[];
}

interface Test {
  id: string;
  name: string;
  description: string;
  price?: string;
  turnaroundTime?: string;
}

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

  // Fetch all items (tests and vaccines) from API
  const { data: apiCategories, isLoading: isItemsLoading } = useListTests("test");

  console.log("API Categories:", apiCategories);
  // Create test mutations
  const createTest = useCreateTest();
  const createTestOrders = useCreateTestOrder();

  // Add useEffect to restore session if available
  React.useEffect(() => {
    if (effectiveAppointmentId) {
      // Try to restore previous session data if it exists
      const savedSessionData = localStorage.getItem(
        `appointment_session_${effectiveAppointmentId}`
      );

      if (savedSessionData) {
        try {
          const sessionData = JSON.parse(savedSessionData);

          // If we have notes from previous session and current notes are empty, restore them
          if (sessionData.notes && !notes) {
            setNotes(sessionData.notes);
          }

          // Log session resumption
          console.log(
            "Resuming previous session for appointment:",
            effectiveAppointmentId
          );

          // Show toast notification that session was restored
          toast({
            title: "Session restored",
            description: `Continuing work on ${sessionData.patientName}'s appointment`,
            className: "bg-blue-50 border-blue-200 text-blue-800",
          });
        } catch (e) {
          console.error("Error restoring session:", e);
        }
      }
    }
  }, [effectiveAppointmentId, notes, toast]);

  // Filter tests based on search query
  const filterTestsBySearch = (tests: Test[] = []): Test[] => {
    if (!searchQuery) return tests;

    const query = searchQuery.toLowerCase();
    return tests.filter(
      (test) =>
        test.name.toLowerCase().includes(query) ||
        (test.description && test.description.toLowerCase().includes(query))
    );
  };

  // Map API test categories to UI format with icons
  const testCategories = React.useMemo(() => {
    if (!apiCategories) return [];

    // Check if apiCategories is an array
    const categories = Array.isArray(apiCategories)
      ? apiCategories
      : [apiCategories];

    return categories.map((category: any) => {
      // Map icon_name to react component
      let icon;
      switch (category.icon) {
        case "blood":
          icon = <Beaker className="h-5 w-5 text-red-500" />;
          break;
        case "stool-urine":
          icon = <Microscope className="h-5 w-5 text-amber-500" />;
          break;
        case "imaging":
          icon = <ScanLine className="h-5 w-5 text-blue-500" />;
          break;
        case "quicktest":
          icon = <Tablet className="h-5 w-5 text-green-500" />;
          break;
        default:
          icon = <FlaskConical className="h-5 w-5 text-indigo-500" />;
      }

      // Get the items array and filter for type === 'test'
      const items = category.items || [];
      const testItems = items.filter((item: any) => item.type === "test");

      // Map test fields to match UI component expectations
      const mappedTests = testItems.map((test: any) => ({
        id: test.id.toString(),
        name: test.name,
        description: test.description,
        price: test.price
          ? `${test.price.toLocaleString("vi-VN")} đ`
          : undefined,
        turnaroundTime: test.turnaround_time,
      }));

      return {
        id: category.id,
        name: category.name,
        icon,
        description: category.description,
        tests: mappedTests,
      };
    });
  }, [apiCategories]);

  // Map API vaccines to UI format
  const vaccineCategory = React.useMemo(() => {
    if (!apiCategories) return null;

    // Check if apiCategories is an array
    const categories = Array.isArray(apiCategories)
      ? apiCategories
      : [apiCategories];

    // Collect all vaccine items from all categories
    const allVaccineItems: any[] = [];

    categories.forEach((category: any) => {
      const items = category.items || [];
      const vaccineItems = items.filter((item: any) => item.type === "vaccine");
      allVaccineItems.push(...vaccineItems);
    });

    console.log("All vaccine items:", allVaccineItems);

    if (allVaccineItems.length === 0) return null;

    // Map vaccines to match UI component expectations
    const mappedVaccines = allVaccineItems.map((vaccine: any) => ({
      id: vaccine.id.toString(),
      name: vaccine.name,
      description: vaccine.description || "Vaccine for preventative care",
      price: vaccine.price
        ? `${vaccine.price.toLocaleString("vi-VN")} đ`
        : undefined,
      turnaroundTime: vaccine.turnaround_time || "Immediate",
    }));

    return {
      id: "vaccines",
      name: "Vaccines",
      icon: <Syringe className="h-5 w-5 text-green-600" />,
      description: "Preventative vaccines for your pet",
      tests: mappedVaccines,
    };
  }, [apiCategories]);

  // Count selected tests
  const selectedTestsCount =
    Object.values(selectedTests).filter(Boolean).length;

  // Get all selected test objects
  const getSelectedTestObjects = () => {
    const result: Test[] = [];

    // Add selected tests from test categories
    testCategories.forEach((category: any) => {
      category.tests?.forEach((test: any) => {
        if (selectedTests[test.id]) {
          result.push(test);
        }
      });
    });

    // Add selected vaccines
    if (vaccineCategory) {
      vaccineCategory.tests.forEach((vaccine: any) => {
        if (selectedTests[vaccine.id]) {
          result.push(vaccine);
        }
      });
    }

    return result;
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
      });
      return;
    }

    const selectedTestObjects = getSelectedTestObjects();
    if (selectedTestObjects.length === 0) {
      toast({
        title: "No tests selected",
        description: "Please select at least one test to order",
        variant: "destructive",
      });
      return;
    }

    try {
      const petId = patient?.petid || 0;
      const doctorId = appointment?.doctor?.doctor_id || 0;

      // Get all selected test IDs
      const testIDs = selectedTestObjects.map((test) => test.id);

      // Determine if we're ordering tests or vaccines
      // The vaccineCategory has id 'vaccines', so we can check if any selected tests are from this category
      const isVaccineOrder =
        vaccineCategory &&
        selectedTestObjects.some((test) =>
          vaccineCategory.tests.some((vaccine) => vaccine.id === test.id)
        );

      const payload = {
        appointmentID: parseInt(effectiveAppointmentId),
        itemIDs: testIDs.map(Number),
        notes: notes,
        test_type: isVaccineOrder ? "vaccine" : "test",
      };

      console.log("Sending order payload:", payload);

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
          description: `${isVaccineOrder ? "Vaccines" : "Lab tests"} for ${patient?.name
            } - Appointment #${effectiveAppointmentId}`,
          customer_name: patient?.name || "Unknown Patient",
          items: invoiceItems,
        };

        console.log("Invoice request:", invoiceRequest);

        // Create invoice in the system
        const invoiceResult = await createInvoice(invoiceRequest);
        console.log("Invoice created successfully:", invoiceResult);

        toast({
          title: `${isVaccineOrder ? "Vaccines" : "Tests"
            } ordered and invoice created`,
          description: `${selectedTestObjects.length} ${isVaccineOrder ? "vaccine(s)" : "test(s)"
            } have been ordered for ${patient?.name
            } and an invoice has been generated.`,
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } catch (invoiceError) {
        console.error("Error creating invoice:", invoiceError);

        // Still show success for test order even if invoice creation fails
        toast({
          title: `${isVaccineOrder ? "Vaccines" : "Tests"
            } ordered successfully`,
          description: `${selectedTestObjects.length} ${isVaccineOrder ? "vaccine(s)" : "test(s)"
            } have been ordered for ${patient?.name
            }, but there was an issue creating the invoice.`,
          className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        });
      }

      // Close dialog and navigate back
      setShowConfirmDialog(false);

      // Navigate using the workflow parameters
      const params = {
        appointmentId: effectiveAppointmentId,
        petId: patient?.petid,
      };
      navigate(`/soap${buildUrlParams(params)}`);
    } catch (error) {
      console.error("Error ordering tests:", error);
      toast({
        title: "Failed to order tests",
        description:
          "An error occurred while ordering tests. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToPatient = () => {
    // Navigate to patient page with query params
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: patient?.petid,
    };
    navigate(`/patient${buildUrlParams(params)}`);
  };

  const navigateToTreatment = () => {
    // Navigate to treatment page with query params
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: patient?.petid,
    };
    navigate(`/treatment${buildUrlParams(params)}`);
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
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }
  const validTestCategories = testCategories.filter(
    (category) => category && category.tests && category.tests.length > 0
  );

  const allCategories =
    vaccineCategory && vaccineCategory.tests && vaccineCategory.tests.length > 0
      ? [...validTestCategories, vaccineCategory]
      : validTestCategories;

  console.log("allCategories", allCategories);

  if (allCategories.length === 0) {
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
            <h1 className="text-white font-semibold text-lg">
              Laboratory Tests
            </h1>
          </div>
        </div>
        <div className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Test Categories Available
          </h2>
          <p className="text-gray-600">
            There are no laboratory test categories configured in the system.
            Please contact your administrator to set up test categories.
          </p>
          <Button
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleBackToPatient}
          >
            Return to Patient
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
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
          <div>
            <h1 className="text-white font-semibold text-lg">
              Laboratory Tests
            </h1>
            <p className="text-indigo-100 text-xs hidden sm:block">
              Order and manage diagnostic tests
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedTestsCount === 0}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
            onClick={() => setShowConfirmDialog(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            <span>
              Place Order{" "}
              {selectedTestsCount > 0 ? `(${selectedTestsCount})` : ""}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
            onClick={navigateToTreatment}
          >
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>Proceed to treatment</span>
          </Button>
        </div>
      </div>

      {/* Workflow Navigation */}
      <div className="px-4 pt-3">
        <WorkflowNavigation
          appointmentId={effectiveAppointmentId}
          petId={patient?.petid?.toString()}
          currentStep="diagnostic"
        />
      </div>

      {/* Main content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <FlaskConical className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">
                Laboratory Test Selection
              </h2>
            </div>
            <div className="flex items-center text-sm text-indigo-600 font-medium">
              <Badge
                variant="outline"
                className="bg-indigo-50 text-indigo-700 border-indigo-200"
              >
                {selectedTestsCount} Test{selectedTestsCount !== 1 ? "s" : ""}{" "}
                Selected
              </Badge>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-6 py-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tests and vaccines..."
                className="pl-10 w-full"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Guidance alert */}
          <div className="p-4 m-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-700">
                  Diagnostic Testing Guidance
                </h3>
                <p className="text-blue-600 text-sm mt-1">
                  Select appropriate laboratory tests based on the patient's
                  symptoms and diagnosis. Consider starting with essential tests
                  before moving to more specialized ones.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <Tabs defaultValue={allCategories[0].id} className="w-full">
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                  <TabsList className="inline-flex p-1 bg-gray-100 rounded-md">
                    {allCategories.map((category: any) => (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 flex items-center gap-1.5"
                      >
                        {category.icon}
                        <span>{category.name}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="p-6">
                  {allCategories.map((category: any) => (
                    <TabsContent
                      key={category.id}
                      value={category.id}
                      className="mt-0 pt-3"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                          {category.icon}
                          {category.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {category.description}
                        </p>
                      </div>

                      {/* Apply search filter to tests */}
                      {(() => {
                        const filteredTests = filterTestsBySearch(category.tests);

                        if (filteredTests.length === 0 && searchQuery) {
                          return (
                            <div className="py-12 text-center">
                              <SearchX className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                              <p className="text-gray-600 mb-1">No matching tests found</p>
                              <p className="text-gray-500 text-sm">Try a different search term</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {filteredTests.map((test: any) => (
                              <div
                                key={test.id}
                                className={cn(
                                  "p-4 border rounded-lg transition-all cursor-pointer hover:border-indigo-300",
                                  selectedTests[test.id]
                                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                                    : "border-gray-200"
                                )}
                                onClick={() => toggleTest(test.id)}
                              >
                                <div className="flex items-start">
                                  <Checkbox
                                    id={test.id}
                                    checked={selectedTests[test.id] || false}
                                    onCheckedChange={() => toggleTest(test.id)}
                                    className="mt-1"
                                  />
                                  <div className="ml-3 flex-1">
                                    <Label
                                      htmlFor={test.id}
                                      className="font-medium cursor-pointer text-gray-800"
                                    >
                                      {test.name}
                                    </Label>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {test.description}
                                    </p>
                                    <div className="flex mt-3 items-center gap-4">
                                      {test.price && (
                                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                                          {test.price}
                                        </span>
                                      )}
                                      {test.turnaroundTime && (
                                        <span className="text-sm text-gray-600 flex items-center">
                                          <Clock className="h-3 w-3 mr-1 text-indigo-500" />
                                          {test.turnaroundTime}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-md border-indigo-100">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-indigo-600" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  {selectedTestsCount} test{selectedTestsCount !== 1 ? "s" : ""}{" "}
                  selected
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {selectedTestsCount > 0 ? (
                  <>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {getSelectedTestObjects().map((test) => (
                        <div
                          key={test.id}
                          className="flex justify-between items-center py-2 px-3 border-b border-gray-100"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {test.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {test.price}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-0.5" />
                                {test.turnaroundTime}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full hover:bg-red-50 hover:text-red-500"
                            onClick={() => toggleTest(test.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Notes section */}
                    <div className="mt-4">
                      <Label
                        htmlFor="notes"
                        className="text-sm font-medium text-gray-700"
                      >
                        Lab Notes (optional)
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Add special instructions or notes for the lab..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 h-20 text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 px-4">
                    <FlaskConical className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-700 font-medium">
                      No tests selected
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Select tests from the categories on the left to begin
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  disabled={selectedTestsCount === 0}
                  onClick={() => setShowConfirmDialog(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Place Test Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-semibold">
              Confirm Test Order
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              You are about to order {selectedTestsCount} test
              {selectedTestsCount !== 1 ? "s" : ""} for {patient.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6">
            <div className="mb-2 flex justify-between items-center">
              <h4 className="text-base font-medium text-gray-700">
                Selected Tests:
              </h4>
              <Badge className="bg-blue-100 text-blue-700 text-xs">
                Total: {getTotalPrice().formatted} VND
              </Badge>
            </div>

            <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
              <ul className="divide-y divide-gray-100">
                {getSelectedTestObjects().map((test) => (
                  <li key={test.id} className="p-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {test.name}
                      </span>
                      <div className="flex items-center gap-4 mt-1">
                        {test.price && (
                          <span className="text-sm text-gray-600">
                            {test.price}
                          </span>
                        )}
                        {test.turnaroundTime && (
                          <span className="text-sm text-gray-600 flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-gray-500" />
                            {test.turnaroundTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="my-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="font-medium text-amber-800">
                    Important Information
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    These tests will be sent to the laboratory for processing.
                    Results will appear in the patient's record once completed.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
              <div className="flex items-start">
                <Receipt className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="font-medium text-indigo-800">
                    Invoice will be created
                  </h3>
                  <p className="text-sm text-indigo-700 mt-1">
                    An invoice will be automatically generated for these tests.
                    You can view and manage this invoice in the Billing section.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-t border-gray-100 mt-2">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1 py-4 px-5 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-700 font-medium"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={orderTests}
              className="flex-1 py-4 px-5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white flex items-center justify-center font-medium"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm Order
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default LabManagement;
