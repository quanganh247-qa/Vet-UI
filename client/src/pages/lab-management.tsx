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
        console.log("Invoice created successfully:", invoiceResult);

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

  const handleBackToExamination= () => {
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

  if (allCategories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
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
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
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
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white flex items-center hover:bg-white/10 rounded-lg mr-4"
            onClick={handleBackToExamination}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Examination</span>
          </Button>
          <h1 className="text-white font-semibold text-lg">Lab Tests</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={selectedTestsCount === 0}
          className="bg-white text-indigo-600 hover:bg-white/90 flex items-center"
          onClick={() => setShowConfirmDialog(true)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          <span>Order ({selectedTestsCount})</span>
        </Button>
      </div>

      <div className="px-4 pt-3">
        <WorkflowNavigation
          appointmentId={effectiveAppointmentId}
          petId={patient?.pet_id?.toString()}
          currentStep="diagnostic"
        />
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests by name or description..."
            className="pl-10 w-full pr-4 py-2 border-gray-300 rounded-md"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Main content - Simplified List View */}
      <div className="p-4">
        {(() => {
          // Collect all tests from all categories with category info
          const allTests: Array<any> = [];
          
          allCategories.forEach((category: any) => {
            const filteredTests = filterTestsBySearch(category.tests);
            filteredTests.forEach((test: any) => {
              allTests.push({
                ...test,
                category: category.name,
                categoryIcon: category.icon
              });
            });
          });

          // No tests found message
          if (allTests.length === 0 && searchQuery) {
            return (
              <div className="py-12 text-center">
                <SearchX className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-gray-700 font-medium mb-1">No matching tests found</h3>
                <p className="text-gray-500">Try different keywords or browse by category</p>
              </div>
            );
          }

          return (
            <div className="space-y-6">
              {/* Test Counter */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {allTests.length} test{allTests.length !== 1 ? 's' : ''} available
                  {searchQuery ? ` for "${searchQuery}"` : ''}
                </span>
                {selectedTestsCount > 0 && (
                  <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                    {selectedTestsCount} selected
                  </Badge>
                )}
              </div>

              {/* Simple List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTests.map(test => (
                  <div 
                    key={test.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                      selectedTests[test.id] 
                        ? "border-indigo-500 bg-indigo-50" 
                        : "border-gray-200 hover:border-indigo-300"
                    )}
                    onClick={() => toggleTest(test.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        checked={selectedTests[test.id] || false}
                        onCheckedChange={() => toggleTest(test.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {test.categoryIcon}
                          <span className="text-xs font-medium text-gray-500">{test.category}</span>
                        </div>
                        <h3 className="font-medium text-gray-900">{test.name}</h3>
                        {test.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{test.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {test.price && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
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
          );
        })()}
      </div>

      {/* Action Footer */}
      {selectedTestsCount > 0 && (
        <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {selectedTestsCount} test{selectedTestsCount !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-gray-600">Total: {getTotalPrice().formatted}</p>
            </div>
            <Button
              onClick={() => setShowConfirmDialog(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Place Order
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle className="text-xl font-semibold">
              Confirm Test Order
            </DialogTitle>
            <DialogDescription>
              You're ordering {selectedTestsCount} test{selectedTestsCount !== 1 ? 's' : ''} for {patient.name}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6">
            <div className="mb-3 flex justify-between items-center">
              <h4 className="font-medium text-gray-700">Selected Tests</h4>
              <Badge className="bg-blue-100 text-blue-700">
                {getTotalPrice().formatted}
              </Badge>
            </div>

            <div className="max-h-[250px] overflow-y-auto border rounded-lg">
              <ul className="divide-y divide-gray-100">
                {getSelectedTestObjects().map((test) => (
                  <li key={test.id} className="p-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900">{test.name}</span>
                      {test.price && (
                        <span className="block text-sm text-gray-500">{test.price}</span>
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
              <Label htmlFor="notes" className="text-sm font-medium">Lab Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 h-20"
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
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 font-medium text-white flex items-center justify-center"
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
