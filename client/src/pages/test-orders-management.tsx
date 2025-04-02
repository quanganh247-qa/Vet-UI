import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  FileText,
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  FlaskConical,
  CheckCircle2,
  XCircle,
  InfoIcon,
  Calendar,
  User,
  CreditCard,
  Plus,
  ChevronDown,
  ChevronRight,
  Beaker,
  Clipboard,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { useAllTestOrders } from "@/hooks/use-test";
import { createInvoice } from "@/services/invoice-services";
import { useCreateInvoice } from "@/hooks/use-invoice";

// Thêm đoạn CSS này vào component để ghi đè lên style mặc định của checkbox
const checkboxStyles = {
  checkbox:
    "h-5 w-5 rounded border-2 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white",
  appointmentCheckbox:
    "h-6 w-6 rounded border-2 border-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white",
};

const TestOrdersManagement: React.FC = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [expandedAppointments, setExpandedAppointments] = useState<number[]>(
    []
  );
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  // Mover el hook useCreateInvoice aquí, al nivel superior del componente
  const { mutate: createInvoiceMutation, isPending } = useCreateInvoice();

  const { data: testOrders } = useAllTestOrders();
  console.log("testOrders", testOrders);
  // Extract all tests from all appointments and orders
  const allTests = useMemo(() => {
    const tests: any[] = [];

    testOrders?.forEach((appointment: any) => {
      appointment?.orders?.forEach((order: any) => {
        order?.tests?.forEach((test: any) => {
          tests.push({
            ...test,
            appointment_id: appointment.appointment_id,
            pet_name: appointment.pet_name,
            species: appointment.species,
            appointment_date: appointment.appointment_date,
            order_id: order.order_id,
            order_date: order.order_date,
            order_status: order.status,
          });
        });
      });
    });

    return tests;
  }, [testOrders]);

  // Filter and search logic
  const filteredTests = useMemo(() => {
    if (!allTests) return [];

    return allTests.filter((test) => {
      // Status filter
      if (
        statusFilter !== "all" &&
        test.status.toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }

      // Date filter
      if (dateFilter === "today") {
        const today = new Date().toISOString().split("T")[0];
        if (!test.order_date.includes(today)) {
          return false;
        }
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const orderDate = new Date(test.order_date);
        if (orderDate < weekAgo) {
          return false;
        }
      }

      // Search term
      const searchLower = searchTerm.toLowerCase();
      if (
        searchTerm &&
        !(
          (test.pet_name &&
            test.pet_name.toLowerCase().includes(searchLower)) ||
          (test.test_name &&
            test.test_name.toLowerCase().includes(searchLower)) ||
          (test.test_id && test.test_id.toLowerCase().includes(searchLower)) ||
          (test.order_id && test.order_id.toString().includes(searchLower))
        )
      ) {
        return false;
      }

      return true;
    });
  }, [allTests, searchTerm, statusFilter, dateFilter]);

  // Get unique statuses for filter options
  const uniqueStatuses = useMemo(() => {
    if (!allTests || allTests.length === 0) return [];
    const statuses = new Set(allTests.map((test) => test.status));
    return Array.from(statuses) as string[];
  }, [allTests]);

  // Calculate statistics
  const stats = useMemo(() => {
    const tests = allTests || [];

    const today = new Date().toISOString().split("T")[0];

    return {
      total: tests.length,
      pending: tests.filter((test) => test.status === "pending").length,
      completed: tests.filter((test) => test.status === "completed").length,
      processing: tests.filter((test) => test.status === "processing").length,
      today: tests.filter((test) => test.order_date.includes(today)).length,
    };
  }, [allTests]);

  // Toggle appointment expansion
  const toggleAppointment = (appointmentId: number) => {
    setExpandedAppointments((prev) =>
      prev.includes(appointmentId)
        ? prev.filter((id) => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  // Toggle order expansion
  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Handle refresh button
  const handleRefresh = () => {
    setIsLoading(true);
    // In a real app, you would fetch fresh data here
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Refreshed",
        description: "Test orders list has been updated.",
      });
    }, 500);
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let badgeClass = "";

    switch (status.toLowerCase()) {
      case "completed":
        badgeClass = "bg-green-100 text-green-800 border-green-200 font-medium";
        break;
      case "pending":
        badgeClass = "bg-amber-100 text-amber-800 border-amber-200 font-medium";
        break;
      case "processing":
        badgeClass = "bg-blue-100 text-blue-800 border-blue-200 font-medium";
        break;
      case "cancelled":
        badgeClass = "bg-red-100 text-red-800 border-red-200 font-medium";
        break;
      default:
        badgeClass = "bg-gray-100 text-gray-800 border-gray-200 font-medium";
    }

    return <Badge className={badgeClass}>{status}</Badge>;
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle checkbox selection
  const handleTestSelection = (testId: string) => {
    setSelectedTests((prev) => {
      if (prev.includes(testId)) {
        return prev.filter((id) => id !== testId);
      } else {
        return [...prev, testId];
      }
    });
  };

  // Handle create invoice
  const handleCreateInvoice = () => {
    if (selectedTests.length === 0) {
      toast({
        title: "No tests selected",
        description: "Please select at least one test to create an invoice.",
        variant: "destructive",
      });
      return;
    }

    setIsPaymentDialogOpen(true);
  };


  const generateInvoiceNumber = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}`;
    const appointment_id = selectedTests[0].split("-")[1];
    return `INV-${dateStr}-#${appointment_id}`;
  };


  // Handle confirmation to proceed to billing
  const handleProceedToBilling = async () => {
    toast({
      title: "Invoice created",
      description: `Created invoice for ${selectedTests.length} test(s)`,
      className: "bg-green-50 border-green-200 text-green-800",
    });

    // Create invoice
    const invoice = {
      invoice_number: generateInvoiceNumber(),
      amount: totalSelectedPrice,
      date: new Date().toISOString(),
      due_date: new Date(
        new Date().getTime() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: "unpaid",
      description: "Payment for tests",
      customer_name: testOrders?.find(
        (a: any) => a.appointment_id === selectedTests[0].split("-")[1]
      )?.pet_name ? testOrders.find((a: any) => a.appointment_id === selectedTests[0].split("-")[1]).pet_name : "Unknown Customer",
      items: selectedTestsDetails.map((test) => ({
        name: test.test_name,
        price: test.price,
        quantity: 1,
      })),
    };

    // Usar la función mutate desde el hook que fue declarado arriba
    createInvoiceMutation(invoice);
    
    // Close dialog and navigate to billing page
    setIsPaymentDialogOpen(false);
    navigate("/billing");
  };

  // Get selected tests details
  const selectedTestsDetails = useMemo(() => {
    if (!allTests) return [];

    return allTests.filter((test) =>
      selectedTests.includes(`${test.test_id}-${test.order_id}`)
    );
  }, [allTests, selectedTests]);

  // Calculate total price of selected tests
  const totalSelectedPrice = useMemo(() => {
    return selectedTestsDetails.reduce((sum, test) => {
      return sum + (test.price || 0);
    }, 0);
  }, [selectedTestsDetails]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Thêm hàm chọn appointment
  const handleAppointmentSelection = (appointmentId: number) => {
    const allTestIdsInAppointment: string[] = [];

    // Tìm appointment trong testOrders
    const appointment = testOrders?.find(
      (a: any) => a.appointment_id === appointmentId
    );

    // Thu thập tất cả test IDs từ appointment này
    appointment?.orders?.forEach((order: any) => {
      order.tests.forEach((test: any) => {
        allTestIdsInAppointment.push(`${test.test_id}-${order.order_id}`);
      });
    });

    // Kiểm tra xem đã chọn tất cả tests trong appointment chưa
    const allSelected = allTestIdsInAppointment.every((testId) =>
      selectedTests.includes(testId)
    );

    setSelectedTests((prev) => {
      if (allSelected) {
        // Nếu tất cả đã được chọn, bỏ chọn tất cả
        return prev.filter((id) => !allTestIdsInAppointment.includes(id));
      } else {
        // Nếu chưa chọn tất cả, thêm tất cả vào selection
        const newSelection = [...prev];
        allTestIdsInAppointment.forEach((testId) => {
          if (!newSelection.includes(testId)) {
            newSelection.push(testId);
          }
        });
        return newSelection;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-indigo-600 text-lg font-medium">
            Loading test orders...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load test orders. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Laboratory Test Orders
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage and monitor all pet laboratory test orders
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/billing">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            >
              <CreditCard className="h-4 w-4" />
              Go to Billing
            </Button>
          </Link>
          <Button
            onClick={handleCreateInvoice}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={selectedTests.length === 0}
          >
            <CreditCard className="h-4 w-4" />
            Create Invoice
          </Button>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-white hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-indigo-700">
                  Total Tests
                </p>
                <p className="text-4xl font-bold mt-1 text-indigo-900">
                  {stats.total}
                </p>
              </div>
              <Beaker className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-amber-700">Pending</p>
                <p className="text-4xl font-bold mt-1 text-amber-900">
                  {stats.pending}
                </p>
              </div>
              <Clock className="h-10 w-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Processing
                </p>
                <p className="text-4xl font-bold mt-1 text-blue-900">
                  {stats.processing}
                </p>
              </div>
              <FlaskConical className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-green-700">
                  Completed
                </p>
                <p className="text-4xl font-bold mt-1 text-green-900">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedTests.length > 0 && (
        <div className="bg-blue-100 rounded-lg border border-blue-300 p-4 mb-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-700" />
            <span className="font-semibold text-blue-900 text-lg">
              {selectedTests.length} test{selectedTests.length > 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <Button
            variant="outline"
            className="text-blue-700 border-blue-300 hover:bg-blue-200 hover:text-blue-900 font-medium"
            onClick={() => setSelectedTests([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-100 to-white border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-600" />
            Filters & Search
          </h2>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search by pet name, test name, or order ID..."
                  className="pl-10 text-base py-6"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:w-2/5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map((status: string) => (
                      <SelectItem key={status} value={status.toLowerCase()}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tests List View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <Tabs defaultValue="all" className="w-full">
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <TabsList className="inline-flex p-1 bg-gray-100 rounded-md">
              <TabsTrigger
                value="all"
                className="px-4 py-2 text-base rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 data-[state=active]:font-medium"
              >
                All Tests
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="pt-0">
            {filteredTests.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-12 py-4">
                        <span className="sr-only">Select</span>
                      </TableHead>
                      <TableHead className="py-4 text-base">
                        Test Name
                      </TableHead>
                      <TableHead className="py-4 text-base">Pet Info</TableHead>
                      <TableHead className="py-4 text-base">Order ID</TableHead>
                      <TableHead className="py-4 text-base">
                        Order Date
                      </TableHead>
                      <TableHead className="py-4 text-base">Status</TableHead>
                      <TableHead className="py-4 text-base">Price</TableHead>
                      <TableHead className="py-4 text-base">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.map((test) => (
                      <TableRow
                        key={`${test.test_id}-${test.order_id}`}
                        className="hover:bg-gray-50 border-b"
                      >
                        <TableCell className="py-4">
                          <Checkbox
                            id={`test-${test.test_id}-${test.order_id}`}
                            checked={selectedTests.includes(
                              `${test.test_id}-${test.order_id}`
                            )}
                            onCheckedChange={() =>
                              handleTestSelection(
                                `${test.test_id}-${test.order_id}`
                              )
                            }
                            aria-label={`Select test ${test.test_name}`}
                            className={checkboxStyles.checkbox}
                          />
                        </TableCell>
                        <TableCell className="font-medium py-4">
                          <div className="flex items-center gap-2">
                            <Beaker className="h-5 w-5 text-indigo-600" />
                            <span className="text-base">{test.test_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <div className="font-medium text-base">
                              {test.pet_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {test.species}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-base font-medium">
                          #{test.order_id}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <span className="text-sm">
                              {formatDate(test.order_date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {renderStatusBadge(test.status)}
                        </TableCell>
                        <TableCell className="py-4 text-base font-medium">
                          {formatCurrency(test.price || 0)}
                        </TableCell>
                        <TableCell className="py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 font-medium border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            View Results
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <InfoIcon className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900">
                  No tests found
                </h3>
                <p className="text-gray-600 text-center max-w-md mt-2 text-base">
                  There are no laboratory tests matching your search criteria.
                  Try adjusting your filters or search term.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="pt-0">
            {/* Similar structure filtered to pending tests */}
          </TabsContent>

          <TabsContent value="processing" className="pt-0">
            {/* Similar structure filtered to processing tests */}
          </TabsContent>

          <TabsContent value="completed" className="pt-0">
            {/* Similar structure filtered to completed tests */}
          </TabsContent>
        </Tabs>
      </div>

      {/* Hierarchical View of Appointments and Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-100 to-white border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-indigo-600" />
            Appointments & Test Orders
          </h2>
        </div>

        {testOrders?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {testOrders?.map((appointment: any) => (
              <div
                key={appointment.appointment_id}
                className="hover:bg-gray-50"
              >
                <div
                  className="flex items-center p-5 cursor-pointer"
                  onClick={() => toggleAppointment(appointment.appointment_id)}
                >
                  <div className="flex items-center mr-2">
                    {expandedAppointments.includes(
                      appointment.appointment_id
                    ) ? (
                      <ChevronDown className="h-6 w-6 text-indigo-500" />
                    ) : (
                      <ChevronRight className="h-6 w-6 text-indigo-500" />
                    )}
                  </div>

                  <div className="flex items-center mr-3">
                    <Checkbox
                      id={`appointment-${appointment.appointment_id}`}
                      className={checkboxStyles.appointmentCheckbox}
                      checked={appointment?.orders?.some((order: any) =>
                        order.tests.some((test: any) =>
                          selectedTests.includes(
                            `${test.test_id}-${order.order_id}`
                          )
                        )
                      )}
                      onCheckedChange={() => {
                        handleAppointmentSelection(appointment.appointment_id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select appointment ${appointment.appointment_id}`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg text-gray-900">
                        Appointment #{appointment.appointment_id}
                      </span>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-sm px-3 py-1">
                        {appointment.species}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(appointment.appointment_date)}
                      </span>
                    </div>
                    <div className="text-base text-gray-600 mt-1">
                      Pet:{" "}
                      <span className="font-medium">
                        {appointment.pet_name}
                      </span>{" "}
                      •
                      {appointment?.orders?.length > 0
                        ? ` ${appointment.orders.reduce(
                            (total: number, order: any) =>
                              total + order.tests.length,
                            0
                          )} tests`
                        : " No test orders"}
                    </div>
                  </div>

                  {appointment?.orders?.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/appointments/${appointment.appointment_id}`);
                      }}
                    >
                      View Details
                    </Button>
                  )}
                </div>

                {expandedAppointments.includes(appointment.appointment_id) &&
                  appointment.orders.length > 0 && (
                    <div className="pl-10 pr-4 pb-4">
                      <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                        {appointment?.orders?.map((order: any) => (
                          <div key={order.order_id}>
                            <div
                              className="flex items-center p-4 cursor-pointer hover:bg-gray-100"
                              onClick={() => toggleOrder(order.order_id)}
                            >
                              <div className="flex items-center mr-2">
                                {expandedOrders.includes(order.order_id) ? (
                                  <ChevronDown className="h-5 w-5 text-indigo-500" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-indigo-500" />
                                )}
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-base">
                                    Order #{order.order_id}
                                  </span>
                                  {renderStatusBadge(order.status)}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {formatDate(order.order_date)} •
                                  {order?.tests?.length}{" "}
                                  {order?.tests?.length === 1
                                    ? "test"
                                    : "tests"}{" "}
                                  •
                                  <span className="font-medium">
                                    {formatCurrency(order.total_amount)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {expandedOrders.includes(order.order_id) && (
                              <div className="bg-white p-4 pl-9">
                                <div className="text-base font-medium text-gray-700 mb-3">
                                  Tests:
                                </div>
                                <div className="space-y-3">
                                  {order.tests.map((test: any) => (
                                    <div
                                      key={`${test.test_id}-${order.order_id}`}
                                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 hover:shadow-sm transition-shadow duration-150"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Checkbox
                                          id={`nest-test-${test.test_id}-${order.order_id}`}
                                          checked={selectedTests.includes(
                                            `${test.test_id}-${order.order_id}`
                                          )}
                                          onCheckedChange={() =>
                                            handleTestSelection(
                                              `${test.test_id}-${order.order_id}`
                                            )
                                          }
                                          aria-label={`Select test ${test.test_name}`}
                                          className={checkboxStyles.checkbox}
                                        />
                                        <div>
                                          <div className="font-medium text-gray-900 text-base">
                                            {test.test_name}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-5">
                                        {renderStatusBadge(test.status)}
                                        <span className="font-semibold text-base">
                                          {formatCurrency(test.price)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <InfoIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">
              No appointments found
            </h3>
            <p className="text-gray-600 text-center max-w-md mt-2 text-base">
              There are no appointments with laboratory tests in the system.
            </p>
          </div>
        )}
      </div>

      {/* Payment confirmation dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Create Invoice for Laboratory Tests
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-1">
              You are about to create an invoice for the selected laboratory
              tests.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-50 rounded-lg p-5 my-4 border border-gray-200">
            <h3 className="text-base font-medium text-gray-800 mb-3">
              Selected Tests
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedTestsDetails.map((test) => (
                <div
                  key={`${test.test_id}-${test.order_id}`}
                  className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-base font-medium text-gray-900">
                      {test.test_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Pet: {test.pet_name} • Order #{test.order_id}
                    </p>
                  </div>
                  <span className="text-base font-semibold text-gray-900">
                    {formatCurrency(test.price || 0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-200">
              <span className="font-semibold text-gray-900 text-lg">
                Total Amount:
              </span>
              <span className="font-bold text-xl text-indigo-700">
                {formatCurrency(totalSelectedPrice)}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex border border-blue-200">
            <InfoIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-base text-blue-800">
              Proceeding will create an invoice and redirect you to the billing
              page for payment processing.
            </p>
          </div>

          <DialogFooter className="flex sm:justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 text-base font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleProceedToBilling}
              className="bg-green-600 hover:bg-green-700 text-base font-medium"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Proceed to Billing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestOrdersManagement;
