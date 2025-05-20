import { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Calendar,
  Receipt,
  Clock,
  Download,
  QrCode,
  CreditCardIcon,
  FileText,
  Filter,
  Search,
  FlaskConical,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { QRCodeInformation, QuickLinkRequest } from "@/types";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "@/services/invoice-services";
import {
  useQR,
  useConfirmPayment,
  useCreateCashPayment,
} from "@/hooks/use-payment";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateInvoiceStatus } from "@/hooks/use-invoice";

// Default QR code information
const defaultQRInfo: QRCodeInformation = {
  accountNo: "220220222419",
  accountName: "DINH HUU QUANG ANH",
  acqId: "970422",
  amount: 0,
  addInfo: "Thank you for your payment",
  format: "text",
  template: "E4jYBZ1",
  order_id: 0,
};

// Format currency for VND
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const BillingPage = () => {
  // Cargar facturas desde el backend
  const {
    data: invoicesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "cash">(
    "vietqr"
  );
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrError, setQrError] = useState("");
  const { toast } = useToast();
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashChange, setCashChange] = useState<number>(0);
  const [paymentID, setPaymentID] = useState<number>(0);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // Get the QR mutation hook at the component level
  const { mutate: generateQR } = useQR();
  const { mutate: confirmPaymentHook, isPending: isConfirmingPayment } =
    useConfirmPayment();
  const { mutate: createCashPayment } = useCreateCashPayment();
  const { mutate: updateInvoiceStatus } = useUpdateInvoiceStatus();
  // Establecer la primera factura como activa cuando cargan los datos
  useEffect(() => {
    if (
      invoicesData?.invoices &&
      invoicesData.invoices.length > 0 &&
      !activeInvoice
    ) {
      setActiveInvoice(invoicesData.invoices[0]);
    }
  }, [invoicesData, activeInvoice]);

  // Remove the automatic QR code generation effect and replace with a function
  const handleGenerateQR = () => {
    if (!activeInvoice) return;

    setIsGeneratingQR(true);
    setQrError("");
    setQrUrl(""); // Reset QR URL when generating a new one

    try {
      // Determine the invoice type and prepare appropriate QR info
      let qrInfo;

      // Check the invoice type based on available properties
      if (activeInvoice.type === "test" || activeInvoice.test_id) {
        // For test orders, use test_order_id
        qrInfo = {
          bank_id: "mbbank",
          account_no: "220220222419",
          template: "compact",
          description: `Payment for Test: ${activeInvoice.invoice_number}`,
          account_name: "DINH HUU QUANG ANH",
          order_id: 0,
          test_order_id: activeInvoice.test_order_id,
          amount: activeInvoice.amount,
        };
      } else if (activeInvoice.type === "medicine" ) {
        // For medicine invoices, use medicine_order_id
        qrInfo = {
          bank_id: "mbbank",
          account_no: "220220222419",
          template: "compact",
          description: `Payment for Medicine: ${activeInvoice.invoice_number}`,
          account_name: "DINH HUU QUANG ANH",
          order_id: 0,
          test_order_id: 0,
          amount: activeInvoice.amount,
        };
      } else if (activeInvoice.type === "service" ){
        // For service invoices
        qrInfo = {
          bank_id: "mbbank",
          account_no: "220220222419",
          template: "compact",
          description: `Payment for Service: ${activeInvoice.invoice_number}`,
          account_name: "DINH HUU QUANG ANH",
          order_id: activeInvoice.id, // Use order_id directly for services
          amount: activeInvoice.amount,
        };

      } 
      else if (activeInvoice.type === "vaccine" ){
        // For service invoices
        qrInfo = {
          bank_id: "mbbank",
          account_no: "220220222419",
          template: "compact",
          description: `Payment for Vaccine: ${activeInvoice.invoice_number}`,
          account_name: "DINH HUU QUANG ANH",
          test_order_id: activeInvoice.test_order_id,
          amount: activeInvoice.amount,
        };
      } else {
        // Generic fallback for other invoice types
        qrInfo = {
          bank_id: "mbbank",
          account_no: "220220222419",
          template: "compact",
          description: `Payment for ${activeInvoice.invoice_number}`,
          account_name: "DINH HUU QUANG ANH",
          order_id: activeInvoice.id,
          amount: activeInvoice.amount,
        };
      }

      // Generate QR code with error handling
      generateQR(qrInfo as QuickLinkRequest, {
        onSuccess: (data) => {
          if (!data) {
            setIsGeneratingQR(false);
            handleFallbackPaymentInfo("No data received from payment server");
            return;
          }
          
          setIsGeneratingQR(false);
          if (data && data.image_url) {
            setQrUrl(data.image_url);
            setPaymentID(data.payment_id || 0);
          } else if (data && data.url) {
            // Fallback to URL if image_url is not available
            setQrUrl(data.url);
            setPaymentID(data.payment_id || 0);
          } else if (data && data.data_url) {
            // Another fallback
            setQrUrl(data.data_url);
            setPaymentID(data.payment_id || 0);
          } else {
            // Use fallback payment info
            handleFallbackPaymentInfo("QR code API response was incomplete");
          }
        },
        onError: (error) => {
          setIsGeneratingQR(false);
          console.error("Error generating QR code:", error);
          handleFallbackPaymentInfo(
            error instanceof Error 
              ? error.message 
              : "Unable to generate QR code. Please use manual payment information below."
          );
        },
      });
    } catch (err) {
      setIsGeneratingQR(false);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Error in QR generation process:", errorMessage);
      handleFallbackPaymentInfo("An unexpected error occurred. Please use manual payment information below.");
    }
  };
  
  // Helper function to handle fallback payment info display
  const handleFallbackPaymentInfo = (errorMessage: string) => {
    setQrError(errorMessage);
    
    // Generate a fallback payment ID for manual verification
    setPaymentID(Date.now());
    
    toast({
      title: "Payment Information Ready",
      description: "Using manual payment information instead of QR code",
      variant: "default",
    });
  };

  // Calculate cash change when cash amount changes
  useEffect(() => {
    if (activeInvoice && cashAmount) {
      const change = cashAmount - activeInvoice.amount;
      setCashChange(change >= 0 ? change : 0);
    }
  }, [cashAmount, activeInvoice]);

  // Filtrar facturas según el estado y la búsqueda
  const filteredInvoices = invoicesData?.invoices
    ? invoicesData.invoices.filter((invoice: any) => {
        // Filtrar por estado
        if (filterStatus !== "all" && invoice.status !== filterStatus) {
          return false;
        }

        // Filtrar por término de búsqueda
        if (searchQuery) {
          const lowerCaseQuery = searchQuery.toLowerCase();
          return (
            invoice.invoice_number.toLowerCase().includes(lowerCaseQuery) ||
            invoice.description.toLowerCase().includes(lowerCaseQuery) ||
            (invoice.customer_name &&
              invoice.customer_name.toLowerCase().includes(lowerCaseQuery))
          );
        }

        return true;
      })
    : [];

  // Payment confirmation handler
  const handleConfirmPayment = () => {
    if (!activeInvoice) return;

    // Prepare confirmation payload
    const payload = {
      payment_id: paymentID,
      payment_status: "successful",
      notes: `Payment confirmed for invoice ${activeInvoice.invoice_number}`,
      appointment_id: activeInvoice.appointment_id || 0,
    };

    confirmPaymentHook(payload, {
      onSuccess: () => {
        // Update the local invoice status
        if (invoicesData?.invoices) {
          const updatedInvoices = invoicesData.invoices.map((invoice: any) => {
            if (invoice.id === activeInvoice.id) {
              return { ...invoice, status: "paid" };
            }
            return invoice;
          });

          // Update the active invoice
          setActiveInvoice({ ...activeInvoice, status: "paid" });

          // Reset payment status
          setPaymentStatus("idle");

          toast({
            title: "Payment Confirmed",
            description: "Payment has been confirmed successfully",
            className: "bg-green-500 text-white ",
          });
        }
      },
      onError: () => {
        toast({
          title: "Confirmation Failed",
          description: "Failed to confirm payment. Please try again.",
          variant: "destructive",
        });
      },
    });
    updateInvoiceStatus({ id: activeInvoice.id, data: { status: "paid" } });
    
  };

  // Mostrar indicador de carga mientras se obtienen los datos
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-indigo-600 text-lg font-medium">
            Loading invoices...
          </span>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error si hay problema al cargar
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load invoices. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Billing & Payments</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice List */}
        <div className="lg:col-span-1">
          <Card className="shadow-md border border-[#F9FAFB] rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between text-[#111827]">
                <span>Invoices</span>
                <Badge className="ml-2 bg-[#F9FAFB] text-[#2C78E4] border-[#2C78E4]/20">{filteredInvoices.length}</Badge>
              </CardTitle>
              <CardDescription className="text-[#4B5563]">View and manage your invoices</CardDescription>

              <div className="mt-2 space-y-3">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4B5563] h-4 w-4" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#4B5563]" />
                  <Select defaultValue="all" onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full border-[#2C78E4]/20 rounded-2xl h-10 bg-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="border-[#2C78E4]/20 rounded-2xl">
                      <SelectItem value="all">All invoices</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <Separator className="bg-[#F9FAFB]" />

            <CardContent className="p-0 max-h-[990px] overflow-y-auto">
              <div className="grid grid-cols-1 divide-y divide-[#F9FAFB]">
                {filteredInvoices.map((invoice: any) => (
                  <div
                    key={invoice.id}
                    className={cn(
                      "p-4 hover:bg-[#F9FAFB] cursor-pointer transition-colors rounded-2xl mx-1 my-0.5",
                      activeInvoice?.id === invoice.id &&
                        "bg-[#F9FAFB]"
                    )}
                    onClick={() => setActiveInvoice(invoice)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-[#111827]">
                          {invoice.invoice_number}
                        </h3>
                        <p className="text-sm text-[#4B5563] mt-0.5">
                          {invoice.description}
                        </p>
                      </div>
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" : "outline"
                        }
                        className={cn(
                          "rounded-full",
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-[#FFA726]/10 text-[#FFA726] border-[#FFA726]/20"
                        )}
                      >
                        {invoice.status === "paid" ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1 text-[#4B5563]">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="font-medium text-[#111827]">
                        {formatCurrency(invoice.amount)}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredInvoices.length === 0 && (
                  <div className="p-8 text-center text-[#4B5563]">
                    No invoices found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Details and Payment */}
        <div className="lg:col-span-2">
          {activeInvoice ? (
            <Card className="shadow-md border border-[#F9FAFB] rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-[#111827]">Invoice Details</CardTitle>
                    <CardDescription className="text-[#4B5563]">
                      Invoice {activeInvoice.invoice_number}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      activeInvoice.status === "paid" ? "default" : "outline"
                    }
                    className={cn(
                      "rounded-full",
                      activeInvoice.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-[#FFA726]/10 text-[#FFA726] border-[#FFA726]/20"
                    )}
                  >
                    {activeInvoice.status === "paid" ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
              </CardHeader>

              <Separator className="bg-[#F9FAFB]" />

              <CardContent className="py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-[#4B5563]">
                      Invoice Date
                    </p>
                    <p className="font-medium text-[#111827]">
                      {format(new Date(activeInvoice.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#4B5563]">
                      Due Date
                    </p>
                    <p className="font-medium text-[#111827]">
                      {format(new Date(activeInvoice.due_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="md:text-right md:col-span-2">
                    <p className="text-sm text-[#4B5563]">
                      Total Amount
                    </p>
                    <p className="text-lg font-semibold text-[#111827]">
                      {formatCurrency(activeInvoice.amount)}
                    </p>
                  </div>
                </div>

                <div className="bg-[#F9FAFB] rounded-2xl p-4 mb-6">
                  <h3 className="font-medium text-[#111827] mb-3">
                    Service Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-[#4B5563] uppercase tracking-wider">
                          <th className="pb-2">Description</th>
                          <th className="pb-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F9FAFB]">
                        {activeInvoice.items.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 text-sm text-[#111827]">
                              {item.name}
                            </td>
                            <td className="py-3 text-sm text-[#111827] text-right">
                              {formatCurrency(item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-[#F9FAFB]">
                          <th className="pt-3 text-sm font-semibold text-[#111827]">
                            Total
                          </th>
                          <th className="pt-3 text-sm font-semibold text-[#111827] text-right">
                            {formatCurrency(activeInvoice.amount)}
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {activeInvoice.status === "unpaid" && (
                  <div>
                    <h3 className="font-medium text-[#111827] mb-3">
                      Payment Method
                    </h3>

                    <RadioGroup
                      defaultValue="vietqr"
                      className="mb-4"
                      onValueChange={(value) =>
                        setPaymentMethod(value as "vietqr" | "cash")
                      }
                    >
                      <div className="flex items-center space-x-2 rounded-2xl border border-[#F9FAFB] p-3 hover:bg-[#F9FAFB]">
                        <RadioGroupItem value="vietqr" id="vietqr" />
                        <Label
                          htmlFor="vietqr"
                          className="flex items-center cursor-pointer"
                        >
                          <QrCode className="h-4 w-4 mr-2 text-[#2C78E4]" />
                          VietQR Gateway
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-2xl border border-[#F9FAFB] p-3 hover:bg-[#F9FAFB] mt-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label
                          htmlFor="cash"
                          className="flex items-center cursor-pointer"
                        >
                          <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                          Cash Payment
                        </Label>
                      </div>
                    </RadioGroup>

                    <Tabs defaultValue="payment" className="mb-4">
                      <TabsList className="grid w-full grid-cols-2 bg-[#F9FAFB] p-1 rounded-2xl">
                        <TabsTrigger value="payment" className="text-center rounded-2xl data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] data-[state=active]:shadow-sm">
                          Make Payment
                        </TabsTrigger>
                        <TabsTrigger value="info" className="text-center rounded-2xl data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] data-[state=active]:shadow-sm">
                          Payment Info
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="payment" className="space-y-4 mt-4">
                        {paymentMethod === "vietqr" ? (
                          <div className="flex flex-col items-center">
                            {qrUrl ? (
                              <div className="p-4 bg-white border border-[#F9FAFB] rounded-2xl mb-4">
                                <img
                                  src={qrUrl}
                                  alt="VietQR Code"
                                  className="w-64 h-64 mx-auto"
                                  onError={(e) => {
                                    // Handle image loading errors gracefully
                                    console.error("QR image failed to load, using fallback");
                                    handleFallbackPaymentInfo("QR image could not be loaded. Please use manual payment information.");
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                {qrError && (
                                  <div className="mt-2 p-3 bg-[#F9FAFB] border border-[#2C78E4]/20 rounded-2xl text-center">
                                    <p className="text-[#4B5563] text-sm">{qrError}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-4 bg-[#F9FAFB] border border-[#F9FAFB] rounded-2xl mb-4 flex items-center justify-center w-64 h-64 mx-auto">
                                <div className="text-center">
                                  <QrCode className="h-12 w-12 mx-auto mb-4 text-[#2C78E4]/50" />
                                  <p className="text-[#4B5563]">
                                    Click the button below to generate payment information
                                  </p>
                                </div>
                              </div>
                            )}

                            <Button
                              onClick={handleGenerateQR}
                              disabled={isGeneratingQR}
                              className="mb-4 bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white rounded-2xl"
                            >
                              {isGeneratingQR ? (
                                <>
                                  <span className="mr-2">Generating...</span>
                                  <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                                </>
                              ) : qrUrl ? (
                                <>
                                  <QrCode className="mr-2 h-4 w-4" />
                                  Regenerate Payment Info
                                </>
                              ) : (
                                <>
                                  <QrCode className="mr-2 h-4 w-4" />
                                  Generate Payment Info
                                </>
                              )}
                            </Button>

                            <div className="text-center text-sm text-[#4B5563] mb-4 p-4 bg-[#F9FAFB] border border-[#F9FAFB] rounded-2xl w-full">
                              <h4 className="font-medium text-[#111827] mb-2">Manual Payment Information</h4>
                              <p>
                                Account name:{" "}
                                <span className="font-medium text-[#2C78E4]">
                                  DINH HUU QUANG ANH
                                </span>
                              </p>
                              <p>
                                Account number:{" "}
                                <span className="font-medium text-[#2C78E4]">
                                  220220222419
                                </span>
                              </p>
                              <p>
                                Bank:{" "}
                                <span className="font-medium text-[#2C78E4]">
                                  MB Bank
                                </span>
                              </p>
                              <p>
                                Amount:{" "}
                                <span className="font-medium text-[#2C78E4]">
                                  {formatCurrency(activeInvoice.amount)}
                                </span>
                              </p>
                              <p className="mt-2 text-xs text-[#4B5563]">
                                Please include invoice number <span className="font-medium">{activeInvoice.invoice_number}</span> in the payment description
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="bg-green-50 rounded-2xl p-4 text-green-800 text-sm mb-4">
                              Enter the cash amount received from the customer.
                            </div>

                            <div className="flex flex-col space-y-3">
                              <div>
                                <Label
                                  htmlFor="invoiceAmount"
                                  className="text-sm font-medium text-[#111827]"
                                >
                                  Invoice amount
                                </Label>
                                <Input
                                  id="invoiceAmount"
                                  value={activeInvoice.amount}
                                  disabled
                                  className="mt-1 bg-[#F9FAFB] border-[#F9FAFB] rounded-2xl"
                                />
                              </div>

                              <div>
                                <Label
                                  htmlFor="cashReceived"
                                  className="text-sm font-medium text-[#111827]"
                                >
                                  Cash received
                                </Label>
                                <Input
                                  id="cashReceived"
                                  type="number"
                                  placeholder="Enter amount received"
                                  className="mt-1 border-[#2C78E4]/20 focus:border-[#2C78E4] rounded-2xl"
                                  value={cashAmount || ""}
                                  onChange={(e) =>
                                    setCashAmount(Number(e.target.value))
                                  }
                                />
                              </div>

                              <div>
                                <Label
                                  htmlFor="cashChange"
                                  className="text-sm font-medium text-[#111827]"
                                >
                                  Change to return
                                </Label>
                                <Input
                                  id="cashChange"
                                  value={formatCurrency(cashChange)}
                                  disabled
                                  className="mt-1 bg-[#F9FAFB] border-[#F9FAFB] rounded-2xl"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="info" className="space-y-4 mt-4">
                        <div className="bg-[#F9FAFB] rounded-2xl p-4">
                          <h3 className="font-medium text-[#111827] mb-2">
                            Payment Instructions
                          </h3>

                          {paymentMethod === "vietqr" ? (
                            <div className="text-sm text-[#4B5563] space-y-2">
                              <p>1. Open your mobile banking app</p>
                              <p>
                                2. Scan the VietQR code using your app's scanner
                              </p>
                              <p>3. Verify payment details</p>
                              <p>4. Confirm payment</p>
                              <p>5. Wait for confirmation (usually instant)</p>
                              <p className="text-xs text-[#4B5563] mt-2">
                                For assistance, please contact our support at
                                support@vetclinic.com or call 1900-1234
                              </p>
                            </div>
                          ) : (
                            <div className="text-sm text-[#4B5563] space-y-2">
                              <p>1. Collect cash payment from customer</p>
                              <p>2. Enter the cash amount received</p>
                              <p>3. Verify the change amount to be returned</p>
                              <p>
                                4. Click "Confirm Payment" to record the
                                transaction
                              </p>
                              <p>
                                5. Give the change and receipt to the customer
                              </p>
                              <p className="text-xs text-[#4B5563] mt-2">
                                Always count the cash carefully before
                                confirming the payment
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="text-sm text-[#4B5563]">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Due:{" "}
                            {format(
                              new Date(activeInvoice.due_date),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        {paymentMethod === "vietqr" && qrUrl ? (
                          <Button
                            onClick={handleConfirmPayment}
                            disabled={isConfirmingPayment}
                            className="w-full md:w-auto flex-1 bg-green-600 hover:bg-green-700 rounded-2xl"
                          >
                            {isConfirmingPayment ? (
                              <>
                                <span className="mr-2">Confirming...</span>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm Payment
                              </>
                            )}
                          </Button>
                        ) : paymentMethod === "cash" ? (
                          <Button
                            onClick={handleConfirmPayment}
                            disabled={
                              isConfirmingPayment ||
                              cashAmount <= 0 ||
                              cashAmount < activeInvoice.amount
                            }
                            className="w-full md:w-auto flex-1 bg-green-600 hover:bg-green-700 rounded-2xl"
                          >
                            {isConfirmingPayment ? (
                              <>
                                <span className="mr-2">Confirming...</span>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm Payment
                              </>
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {activeInvoice.status === "paid" && (
                  <div className="bg-green-50 rounded-2xl p-4 text-green-800 text-sm flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Invoice Paid</p>
                      <p className="mt-1">
                        This invoice has been paid already. Thank you for your
                        payment.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 rounded-2xl border-green-200 text-green-600 hover:bg-green-50">
                        <Download className="mr-2 h-4 w-4" />
                        Download Receipt
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Card className="w-full p-8 text-center border border-[#F9FAFB] rounded-2xl">
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-10">
                    <FileText className="h-16 w-16 text-[#2C78E4]/30 mb-4" />
                    <h3 className="text-xl font-medium text-[#111827]">
                      No Invoice Selected
                    </h3>
                    <p className="text-[#4B5563] mt-2">
                      Please select an invoice from the list to view its
                      details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
