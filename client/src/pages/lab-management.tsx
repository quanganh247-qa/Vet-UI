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
  const { data: apiCategories, isLoading: isItemsLoading } =
    useListTests("all");
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

    // Add selected vaccinespl
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
        });
      }

      // // Navigate using the workflow parameters
      // const params = {
      //   appointmentId: effectiveAppointmentId,
      //   petId: patient?.petid,
      // };
      // navigate(`/soap${buildUrlParams(params)}`);
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
  const validTestCategories = testCategories.filter(
    (category) => category && category.tests && category.tests.length > 0
  );

  const allCategories =
    vaccineCategory && vaccineCategory.tests && vaccineCategory.tests.length > 0
      ? [...validTestCategories, vaccineCategory]
      : validTestCategories;

  if (allCategories.length === 0) {
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
            No Test Categories Available
          </h2>
          <p className="text-gray-600">
            There are no laboratory test categories configured in the system.
            Please contact your administrator to set up test categories.
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
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 md:px-8 md:py-5 rounded-xl shadow-md mb-6 text-white">
        <div className="flex justify-between items-center">
          {/* Left Section: Back Button + Title */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg mr-4"
              onClick={handleBackToExamination}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back</span>
            </Button>
            <h1 className="text-white font-semibold text-lg">Lab Tests</h1>
          </div>
        </div>
      </div>

      <WorkflowNavigation
        appointmentId={effectiveAppointmentId}
        petId={patient?.pet_id?.toString()}
        currentStep="diagnostic"
      />

      {/* Header with title and actions */}
      <div className="px-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Available Tests</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-gray-700 border-gray-200 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2 text-gray-500" />
            Filter
          </Button>
          <Button 
            size="sm"
            className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Test Plan
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 pb-4">
        <div className="relative max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests by name, category or description..."
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

      {/* Main content - Modern Card-Based View */}
      <div className="px-6">
        {allCategories.length > 0 && (
          <React.Fragment>
            {/* Collect tests and filter them */}
            {(() => {
              // Collect all tests from all categories with category info
              const allTests: Array<any> = [];

              allCategories.forEach((category: any) => {
                const filteredTests = filterTestsBySearch(category.tests);
                filteredTests.forEach((test: any) => {
                  allTests.push({
                    ...test,
                    category: category.name,
                    categoryIcon: category.icon,
                  });
                });
              });

              // Store the result for reference in the JSX below
              return (
                <>
                  {/* No tests found message */}
                  {allTests.length === 0 && searchQuery ? (
                    <div className="py-12 text-center">
                      <SearchX className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">
                        No matching tests found
                      </h3>
                      <p className="text-gray-500">
                        Try different keywords or browse by category
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Test Counter */}
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span>
                          {allTests.length} test{allTests.length !== 1 ? "s" : ""} available
                          {searchQuery ? ` for "${searchQuery}"` : ""}
                        </span>
                      </div>

                      {/* Modern Card Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allTests.map((test) => (
                          <div
                            key={test.id}
                            className={cn(
                              "border rounded-xl p-4 cursor-pointer transition-all bg-white",
                              selectedTests[test.id]
                                ? "border-[#2C78E4] ring-1 ring-[#2C78E4]/20 bg-[#F0F7FF]"
                                : "border-gray-200 hover:border-[#2C78E4] hover:shadow-sm"
                            )}
                            onClick={() => toggleTest(test.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={selectedTests[test.id] || false}
                                onCheckedChange={() => toggleTest(test.id)}
                                className="mt-1 border-gray-300 data-[state=checked]:bg-[#2C78E4] data-[state=checked]:border-[#2C78E4]"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {test.categoryIcon}
                                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {test.category}
                                  </span>
                                </div>
                                <h3 className="font-medium text-gray-900 mb-1">
                                  {test.name}
                                </h3>
                                {test.description && (
                                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                    {test.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-3 mt-1">
                                  {test.price && (
                                    <span className="text-xs font-medium text-[#2C78E4] px-2 py-1 rounded-full bg-[#F0F7FF]">
                                      {test.price}
                                    </span>
                                  )}
                                  {test.turnaroundTime && (
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {test.turnaroundTime}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </React.Fragment>
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
    </div>
  );
};
export default LabManagement;
