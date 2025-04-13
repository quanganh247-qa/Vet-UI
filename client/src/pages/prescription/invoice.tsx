import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  DownloadIcon,
  PrinterIcon,
  Share2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import InvoiceComponent, { InvoiceData } from "@/components/InvoiceComponent";
import { useToast } from "@/components/ui/use-toast";
import { usePatientData } from "@/hooks/use-pet";
import { useAppointmentData } from "@/hooks/use-appointment";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useInvoiceData } from "@/hooks/use-invoice";

const PrescriptionInvoice: React.FC = () => {
  // Get the appointment ID and pet ID from the URL
  const { appointmentId: routeAppointmentId } = useParams<{
    appointmentId: string;
  }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Quản lý tham số workflow
  const [workflowParams, setWorkflowParams] = useState<{
    appointmentId: string | null;
    petId: string | null;
    invoiceId: string | null;
  }>({
    appointmentId: null,
    petId: null,
    invoiceId: null,
  });

  // Xử lý các tham số từ URL một cách nhất quán
  useEffect(() => {
    // Lấy tất cả các query params từ URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    const urlPetId = searchParams.get("petId");
    const urlInvoiceId = searchParams.get("invoiceId");

    // Thiết lập appointmentId và petId theo thứ tự ưu tiên
    let appointmentIdValue = urlAppointmentId || routeAppointmentId || null;
    let petIdValue = urlPetId || null;
    let invoiceIdValue = urlInvoiceId || null;

    setWorkflowParams({
      appointmentId: appointmentIdValue,
      petId: petIdValue,
      invoiceId: invoiceIdValue,
    });

    console.log("Invoice Workflow Params Set:", {
      appointmentIdValue,
      petIdValue,
      invoiceIdValue,
    });
  }, [routeAppointmentId]);

  // Sử dụng appointmentId và invoiceId từ workflowParams
  const effectiveAppointmentId = workflowParams.appointmentId || "";
  const effectiveInvoiceId = workflowParams.invoiceId || "";

  // Get patient data
  const { data: appointmentData, isLoading: isAppointmentLoading } =
    useAppointmentData(effectiveAppointmentId);

  // Lấy petId từ appointment data nếu không có trong URL
  const effectivePetId =
    workflowParams.petId ||
    (appointmentData?.pet.pet_id ? appointmentData.pet.pet_id.toString() : "");
  const { data: patientData, isLoading: isPatientLoading } =
    usePatientData(effectivePetId);

  const [isLoading, setIsLoading] = useState(true);

  // Build URL params utility function
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

  console.log("Effective Appointment ID:", effectiveAppointmentId);
  console.log("Effective Invoice ID:", effectiveInvoiceId);

  // Get invoice data - Prioritize using invoiceId if available, otherwise fall back to appointmentId
  const { data: invoiceData, isLoading: isInvoiceLoading } = useInvoiceData(
    effectiveInvoiceId || effectiveAppointmentId
  );

  useEffect(() => {
    // Update loading state
    setIsLoading(isAppointmentLoading || isPatientLoading || isInvoiceLoading);
  }, [isAppointmentLoading, isPatientLoading, isInvoiceLoading]);

  // Handle printing the invoice
  const handlePrint = () => {
    window.print();
  };

  // Handle downloading the invoice as PDF
  const handleDownload = () => {
    const invoiceElement = document.getElementById("invoice-container");
    
    if (!invoiceElement) {
      toast({
        title: "Error",
        description: "Could not find invoice element to export.",
        variant: "destructive",
      });
      return;
    }
    
    // Hide the buttons during capturing
    const actionButtons = invoiceElement.querySelector(".print\\:hidden");
    if (actionButtons) {
      actionButtons.classList.add("hidden");
    }
    
    toast({
      title: "Generating PDF",
      description: "Please wait while we generate your invoice PDF...",
    });
    
    // Use html2canvas to capture the invoice element
    html2canvas(invoiceElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      allowTaint: true,
    }).then((canvas) => {
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
      
      // Generate filename with invoice ID
      const fileName = invoiceData ? `Invoice_${invoiceData.invoiceId}.pdf` : "Invoice.pdf";
      
      // Save the PDF
      pdf.save(fileName);
      
      // Show buttons again
      if (actionButtons) {
        actionButtons.classList.remove("hidden");
      }
      
      toast({
        title: "Download Complete",
        description: "Your invoice has been saved as PDF.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }).catch(error => {
      console.error("Error generating PDF:", error);
      
      // Show buttons again in case of error
      if (actionButtons) {
        actionButtons.classList.remove("hidden");
      }
      
      toast({
        title: "Error",
        description: "There was a problem generating the PDF. Please try again.",
        variant: "destructive",
      });
    });
  };

  // Handle sharing the invoice
  const handleShare = () => {
    // In a real implementation, you would open a share dialog
    toast({
      title: "Share Options",
      description: "Invoice sharing options are being prepared.",
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
  };

  // Navigate back to the previous page
  const handleBack = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: effectivePetId,
    };
    navigate(`/treatment${buildUrlParams(params)}`);
  };

  // Complete the appointment workflow
  const handleCompleteAppointment = () => {
    toast({
      title: "Appointment Completed",
      description: "The appointment has been successfully completed.",
      className: "bg-green-50 border-green-200 text-green-800",
    });

    // Navigate to appointments page
    navigate("/appointments");
  };

  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

  if (isLoading || isPatientLoading || isAppointmentLoading) {
    return (
      <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
              onClick={navigateToDashboard}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back to Treatment</span>
            </Button>
            <div>
              <h1 className="text-white font-semibold text-lg">Invoice</h1>
              {/* <p className="text-indigo-100 text-xs hidden sm:block">View and manage invoice details</p> */}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center p-20">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-indigo-600 font-medium">
              Loading invoice...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
              onClick={navigateToDashboard}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-white font-semibold text-lg">Invoice</h1>
              {/* <p className="text-indigo-100 text-xs hidden sm:block">View and manage invoice details</p> */}
            </div>
          </div>
        </div>
        <div className="p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load invoice data. Please try again.
            </AlertDescription>
          </Alert>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
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
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Treatment</span>
          </Button>
          <div>
            <h1 className="text-white font-semibold text-lg">Invoice</h1>
            {/* <p className="text-indigo-100 text-xs hidden sm:block">View and manage invoice details</p> */}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
            onClick={handleCompleteAppointment}
          >
            <Share2 className="h-4 w-4 mr-1" />
            <span>Complete Appointment</span>
          </Button>
        </div>
      </div>

      {/* Workflow Navigation */}
      <div className="px-4 pt-3">
        <WorkflowNavigation
          appointmentId={effectiveAppointmentId}
          petId={effectivePetId}
          currentStep="invoice"
        />
      </div>

      {/* Invoice Component */}
      <div className="p-6">
        <InvoiceComponent
          invoice={invoiceData}
          onPrint={handlePrint}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      </div>
    </div>
  );
};

export default PrescriptionInvoice;
