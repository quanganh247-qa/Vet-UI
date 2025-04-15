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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { QRCodeInformation } from "@/types";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "@/services/invoice-services";
import { useQR } from "@/hooks/use-payment";

// Default QR code information
const defaultQRInfo: QRCodeInformation = {
  accountNo: "220220222419",
  accountName: "DINH HUU QUANG ANH",
  acqId: "970422",
  amount: 0,
  addInfo: "Thank you for your payment",
  format: "text",
  template: "E4jYBZ1",
  order_id: 0
};

// Format currency for VND
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const BillingPage = () => {
  // Cargar facturas desde el backend
  const { data: invoicesData, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices
  });

  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "paypal">("vietqr");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  // Get the QR mutation hook at the component level
  const { mutate: generateQR } = useQR();

  // Establecer la primera factura como activa cuando cargan los datos
  useEffect(() => {
    if (invoicesData?.invoices && invoicesData.invoices.length > 0 && !activeInvoice) {
      setActiveInvoice(invoicesData.invoices[0]);
    }
  }, [invoicesData, activeInvoice]);

  // Generar URL del código QR cuando cambie la factura activa
  useEffect(() => {
    if (activeInvoice) {
      const qrInfo = {
        bank_id: "mbbank",
        account_no: "220220222419",
        template: "print",
        description: `Payment for ${activeInvoice.invoice_number}`,
        account_name: "DINH HUU QUANG ANH",
        order_id: 0,
        test_order_id: activeInvoice.id,
        amount: activeInvoice.amount
      };
      
      // Generate QR code
      generateQR(qrInfo, {
        onSuccess: (data) => {
          console.log("data", data);
          setQrUrl(data.image_url || ""); // Assuming data contains the QR URL
        },
        onError: (error) => {
          console.error("Error generating QR code:", error);
        }
      });
    }
  }, [activeInvoice, generateQR]);
  
  // Filtrar facturas según el estado y la búsqueda
  const filteredInvoices = invoicesData?.invoices ? invoicesData.invoices.filter((invoice: any) => {
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
        (invoice.customer_name && invoice.customer_name.toLowerCase().includes(lowerCaseQuery))
      );
    }
    
    return true;
  }) : [];
  
  const handlePayNow = () => {
    if (!activeInvoice) return;
    
    setPaymentStatus("processing");
    
    // Simular procesamiento de pago (esto debería ser una llamada a la API real)
    setTimeout(() => {
      setPaymentStatus("success");
      
      // Aquí deberías actualizar el estado de la factura mediante una llamada a la API
    }, 2000);
  };

  // Mostrar indicador de carga mientras se obtienen los datos
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-indigo-600 text-lg font-medium">Loading invoices...</span>
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
    <div className="container mx-auto py-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Billing & Payments</h1>
            <p className="text-indigo-100 text-sm">
              Manage invoices and payment methods
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Export History
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice List */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Invoices</span>
                <Badge className="ml-2">{filteredInvoices.length}</Badge>
              </CardTitle>
              <CardDescription>View and manage your invoices</CardDescription>
              
              <div className="mt-2 space-y-3">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 dark:placeholder:text-gray-500"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Select defaultValue="all" onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full border-gray-200 dark:border-gray-700 rounded-md h-10 bg-white dark:bg-gray-900/50">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All invoices</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <Separator className="dark:bg-gray-700" />
            
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvoices.map((invoice: any) => (
                  <div 
                    key={invoice.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors",
                      activeInvoice?.id === invoice.id && "bg-indigo-50 dark:bg-indigo-900/20"
                    )}
                    onClick={() => setActiveInvoice(invoice)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{invoice.invoice_number}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{invoice.description}</p>
                      </div>
                      <Badge
                        variant={invoice.status === "paid" ? "default" : "outline"}
                        className={cn(
                          invoice.status === "paid" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        )}
                      >
                        {invoice.status === "paid" ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(invoice.due_date), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(invoice.amount)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredInvoices.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
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
            <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Invoice Details</CardTitle>
                    <CardDescription>Invoice {activeInvoice.invoice_number}</CardDescription>
                  </div>
                  <Badge
                    variant={activeInvoice.status === "paid" ? "default" : "outline"}
                    className={cn(
                      activeInvoice.status === "paid" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    )}
                  >
                    {activeInvoice.status === "paid" ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
              </CardHeader>
              
              <Separator className="dark:bg-gray-700" />
              
              <CardContent className="py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{format(new Date(activeInvoice.date), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{format(new Date(activeInvoice.due_date), "MMM dd, yyyy")}</p>
                  </div>
                  <div className="md:text-right md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(activeInvoice.amount)}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Service Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <th className="pb-2">Description</th>
                          <th className="pb-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {activeInvoice.items.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                            <td className="py-3 text-sm text-gray-900 dark:text-gray-100 text-right">{formatCurrency(item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200 dark:border-gray-700">
                          <th className="pt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Total</th>
                          <th className="pt-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                            {formatCurrency(activeInvoice.amount)}
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                {activeInvoice.status === "unpaid" && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Payment Method</h3>
                    
                    <RadioGroup defaultValue="vietqr" className="mb-4" onValueChange={(value) => setPaymentMethod(value as "vietqr" | "paypal")}>
                      <div className="flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <RadioGroupItem value="vietqr" id="vietqr" />
                        <Label htmlFor="vietqr" className="flex items-center cursor-pointer">
                          <QrCode className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                          VietQR Gateway
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                          <CreditCardIcon className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                          PayPal Gateway
                        </Label>
                      </div>
                    </RadioGroup>
                    
                    <Tabs defaultValue="payment" className="mb-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="payment" className="text-center">Make Payment</TabsTrigger>
                        <TabsTrigger value="info" className="text-center">Payment Info</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="payment" className="space-y-4 mt-4">
                        {paymentMethod === "vietqr" ? (
                          <div className="flex flex-col items-center">
                            <div className="p-4 bg-white border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
                              <img src={qrUrl} alt="VietQR Code" className="w-64 h-64 mx-auto" />
                            </div>
                            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                              <p>Scan the QR code with your banking app to pay</p>
                              <p className="mt-1">Account name: <span className="font-medium text-gray-900 dark:text-gray-100">DINH HUU QUANG ANH</span></p>
                              <p>Account number: <span className="font-medium text-gray-900 dark:text-gray-100">220220222419</span></p>
                              <p>Bank: <span className="font-medium text-gray-900 dark:text-gray-100">MB Bank</span></p>
                              <p>Amount: <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(activeInvoice.amount)}</span></p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-blue-800 dark:text-blue-300 text-sm mb-4">
                              You'll be redirected to PayPal to complete your payment securely.
                            </div>
                            
                            <div className="flex flex-col space-y-3">
                              <div>
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name on card</Label>
                                <Input id="name" placeholder="John Doe" className="mt-1" />
                              </div>
                              
                              <div>
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email address</Label>
                                <Input id="email" type="email" placeholder="john@example.com" className="mt-1" />
                              </div>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="info" className="space-y-4 mt-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Payment Instructions</h3>
                          
                          {paymentMethod === "vietqr" ? (
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                              <p>1. Open your mobile banking app</p>
                              <p>2. Scan the VietQR code using your app's scanner</p>
                              <p>3. Verify payment details</p>
                              <p>4. Confirm payment</p>
                              <p>5. Wait for confirmation (usually instant)</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                For assistance, please contact our support at support@vetclinic.com or call 1900-1234
                              </p>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                              <p>1. Enter your payment details</p>
                              <p>2. Click "Pay Now" to be redirected to PayPal</p>
                              <p>3. Complete payment securely on PayPal's platform</p>
                              <p>4. You'll be redirected back after successful payment</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                PayPal provides buyer protection for secure transactions
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {format(new Date(activeInvoice.due_date), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={handlePayNow}
                        disabled={paymentStatus === "processing" || paymentStatus === "success"}
                        className="w-full md:w-auto"
                      >
                        {paymentStatus === "processing" ? (
                          <>
                            <span className="mr-2">Processing...</span>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                          </>
                        ) : paymentStatus === "success" ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Payment Complete
                          </>
                        ) : (
                          <>
                            Pay Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {paymentStatus === "success" && (
                      <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-green-800 dark:text-green-300 text-sm flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Payment successful!</p>
                          <p className="mt-1">Thank you for your payment. A receipt has been sent to your email address.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeInvoice.status === "paid" && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-green-800 dark:text-green-300 text-sm flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Invoice Paid</p>
                      <p className="mt-1">This invoice has been paid already. Thank you for your payment.</p>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Download className="mr-2 h-4 w-4" />
                        Download Receipt
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-0 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center px-6 py-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {activeInvoice.status === "paid" ? "Paid on " : "Created on "}
                  {format(new Date(activeInvoice.date), "MMMM dd, yyyy")}
                </div>
                <Button variant="ghost" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  View Full Invoice
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Card className="w-full p-8 text-center">
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-10">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700">No Invoice Selected</h3>
                    <p className="text-gray-500 mt-2">Please select an invoice from the list to view its details.</p>
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