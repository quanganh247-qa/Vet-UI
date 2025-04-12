import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, DownloadIcon, PrinterIcon, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import WorkflowNavigation from '@/components/WorkflowNavigation';
import InvoiceComponent, { InvoiceData } from '@/components/InvoiceComponent';
import { useToast } from '@/components/ui/use-toast';
import { usePatientData } from '@/hooks/use-pet';
import { useAppointmentData } from '@/hooks/use-appointment';

const PrescriptionInvoice: React.FC = () => {
  // Get the appointment ID and pet ID from the URL
  const { appointmentId: routeAppointmentId } = useParams<{ appointmentId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Quản lý tham số workflow
  const [workflowParams, setWorkflowParams] = useState<{
    appointmentId: string | null;
    petId: string | null;
  }>({
    appointmentId: null,
    petId: null
  });

  // Xử lý các tham số từ URL một cách nhất quán
  useEffect(() => {
    // Lấy tất cả các query params từ URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    const urlPetId = searchParams.get("petId");

        
    // Thiết lập appointmentId và petId theo thứ tự ưu tiên
    let appointmentIdValue = urlAppointmentId || routeAppointmentId || null;
    let petIdValue = urlPetId || null;
    
    setWorkflowParams({
      appointmentId: appointmentIdValue,
      petId: petIdValue
    });
    
    console.log("Invoice Workflow Params Set:", { appointmentIdValue, petIdValue });
  }, [routeAppointmentId]);

  // Sử dụng appointmentId từ workflowParams
  const effectiveAppointmentId = workflowParams.appointmentId || "";
  
  // Get patient data
  const { data: appointmentData, isLoading: isAppointmentLoading } = useAppointmentData(effectiveAppointmentId);

  // Lấy petId từ appointment data nếu không có trong URL
  const effectivePetId = workflowParams.petId || (appointmentData?.pet.pet_id ? appointmentData.pet.pet_id.toString() : "");
  const { data: patientData, isLoading: isPatientLoading } = usePatientData(effectivePetId);
  
  // State for invoice data
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Build URL params utility function
  const buildUrlParams = (params: Record<string, string | number | null | undefined>) => {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        urlParams.append(key, String(value));
      }
    });
    
    const queryString = urlParams.toString();
    return queryString ? `?${queryString}` : '';
  };
  
  // Mock function to load invoice data
  // In a real implementation, you would fetch this from your API
  useEffect(() => {
    // Simulate API call to get invoice data
    setTimeout(() => {
      if (patientData) {
        // Generate invoice ID based on date and random number
        const invoiceId = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        setInvoiceData({
          invoiceId,
          date: format(new Date(), 'MM-dd-yyyy'),
          total: 416.00,
          paymentStatus: 'Paid',
          paymentMethod: 'Card',
          client: {
            name: appointmentData?.client_name || 'Samuel Smith Junior',
            phone: appointmentData?.client_phone || '+1 212-334-1770',
          },
          patient: {
            name: patientData.name || 'Mika',
          },
          hospital: {
            name: 'All Animal Hospital',
            email: 'office@all-hospital.com',
            phone: '+1 158-156-1588',
            address: {
              street: '3251 20th Ave',
              city: 'San Francisco',
              zipCode: 'CA 94132',
              country: 'United States',
            },
          },
          items: [
            {
              id: '1',
              name: 'Comprehensive Physical Exam',
              quantity: 1,
              unitPrice: 68.00,
              tax: 0,
              total: 68.00,
            },
            {
              id: '2',
              name: 'TOTAL HEALTH PROFILE',
              quantity: 1,
              unitPrice: 163.00,
              tax: 0,
              total: 163.00,
            },
            {
              id: '3',
              name: 'Biohazard Fee',
              quantity: 1,
              unitPrice: 5.00,
              tax: 0,
              total: 5.00,
            },
            {
              id: '4',
              name: 'Blood Collection - Technician',
              quantity: 1,
              unitPrice: 19.00,
              tax: 0,
              total: 19.00,
            },
            {
              id: '5',
              name: 'Cystocentesis',
              quantity: 1,
              unitPrice: 19.00,
              tax: 0,
              total: 19.00,
            },
            {
              id: '6',
              name: 'URINALYSIS w/ CULTURE IF',
              quantity: 1,
              unitPrice: 142.00,
              tax: 0,
              total: 142.00,
            },
          ],
          subtotal: 416.00,
          tax: 0.00,
          amountPaid: 416.00,
          amountDue: 0.00,
        });
        setIsLoading(false);
      }
    }, 1000);
  }, [patientData, appointmentData]);

  // Handle printing the invoice
  const handlePrint = () => {
    window.print();
  };

  // Handle downloading the invoice as PDF
  const handleDownload = () => {
    // In a real implementation, you would generate and download a PDF
    toast({
      title: 'Download Started',
      description: 'Your invoice is being downloaded as PDF.',
      className: 'bg-green-50 border-green-200 text-green-800',
    });
  };

  // Handle sharing the invoice
  const handleShare = () => {
    // In a real implementation, you would open a share dialog
    toast({
      title: 'Share Options',
      description: 'Invoice sharing options are being prepared.',
      className: 'bg-blue-50 border-blue-200 text-blue-800',
    });
  };

  // Navigate back to the previous page
  const handleBack = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: effectivePetId
    };
    navigate(`/treatment${buildUrlParams(params)}`);
  };

  // Complete the appointment workflow
  const handleCompleteAppointment = () => {
    toast({
      title: 'Appointment Completed',
      description: 'The appointment has been successfully completed.',
      className: 'bg-green-50 border-green-200 text-green-800',
    });
    
    // Navigate to appointments page
    navigate('/appointments');
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
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
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-white font-semibold text-lg">Invoice</h1>
              <p className="text-indigo-100 text-xs hidden sm:block">View and manage invoice details</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center p-20">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-indigo-600 font-medium">Loading invoice...</p>
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
              <p className="text-indigo-100 text-xs hidden sm:block">View and manage invoice details</p>
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
            <p className="text-indigo-100 text-xs hidden sm:block">View and manage invoice details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1.5"
            onClick={handleCompleteAppointment}
          >
            <PrinterIcon className="h-4 w-4 mr-1" />
            <span>Print Invoice</span>
          </Button>
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

      {/* Patient Info */}
      <div className="bg-gradient-to-b from-indigo-50 to-white pt-6 pb-4 px-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-lg shadow-md overflow-hidden flex-shrink-0 border-2 border-white bg-indigo-100 flex items-center justify-center">
              <img
                src={
                  patientData?.data_image
                    ? `data:image/png;base64,${patientData.data_image}`
                    : "/fallback-image.png"
                }
                alt={patientData?.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  {patientData?.name || invoiceData.patient.name}
                </h2>
                <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1 px-2 py-0.5">
                  Invoice Ready
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-700">Invoice:</span>{" "}
                  <span>{invoiceData.invoiceId}</span>
                </span>
                <span className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1 text-gray-500" />
                  <span>{invoiceData.date}</span>
                </span>
                <span className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-700">Total:</span>{" "}
                  <span className="font-medium text-green-600">${invoiceData.total.toFixed(2)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Component */}
      <div className="p-6">
        <InvoiceComponent 
          invoice={invoiceData}
          onPrint={handlePrint}
          onDownload={handleDownload}
          onShare={handleShare}
        />
        
        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 print:hidden">
          <Button variant="outline" className="w-full md:w-auto" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Treatment
          </Button>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <PrinterIcon className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleCompleteAppointment}>
              Complete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionInvoice; 