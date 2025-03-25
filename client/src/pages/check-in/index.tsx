import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useLocation } from 'wouter';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { useCreateSOAP } from '@/hooks/use-soap';
import {
  Textarea
} from '@/components/ui/textarea';
import {
  Button
} from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Check, 
  X, 
  AlertTriangle, 
  DoorOpen, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  CheckCircle,
  CalendarClock,
  Stethoscope,
  Receipt,
  Printer,
  Download,
  CreditCard,
  QrCode,
  Copy,
  CheckCheck
} from 'lucide-react';

import { checkInAppointment } from '@/services/appointment-services';
import { cn } from '@/lib/utils';
import { useRoomData } from '@/hooks/use-room';
import { useAppointmentData } from '@/hooks/use-appointment';
import { usePatientData } from '@/hooks/use-pet';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import WorkflowNavigation from '@/components/WorkflowNavigation';

const CheckIn = () => {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState('check-in');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [subjective, setSubjective] = useState('');
  const [copied, setCopied] = useState(false);
  const createSoapMutation = useCreateSOAP();
  const { toast } = useToast();

  const { data: appointment, error: appointmentError } = useAppointmentData(id);
  const { data: patient, error: patientError } = usePatientData(appointment?.pet?.pet_id);
  const { data: rooms = [] } = useRoomData(!!appointment?.service?.service_name);
  const availableRooms = rooms;
  if (!appointment || !patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading appointment details...</p>
      </div>
    );
  }

  // Mock billing data - in a real app this would come from the backend
  const billingItems = [
    {
      id: 1,
      description: appointment.service.service_name,
      quantity: 1,
      unitPrice: 350000,
      total: 350000
    },
    {
      id: 2,
      description: "Consultation Fee",
      quantity: 1,
      unitPrice: 150000,
      total: 150000
    }
  ];

  const subtotal = billingItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Mock PayOS data
  const paymentInfo = {
    accountNumber: "0987654321",
    bankName: "VPBank",
    accountHolder: "PET CARE CLINIC",
    amount: total,
    description: `Thanh toan cho ${patient.name} - ${appointment.service.service_name}`
  };

  // Format currency for VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleCompleteCheckIn = async () => {
    if (!id) return;
    if (!selectedRoom) {
      toast({
        title: "Room selection required",
        description: "Please select a room before completing check-in.",
        variant: "destructive",
      });
      return;
    }

    try {
      const roomId = availableRooms.find(room => room.name === selectedRoom)?.id;
      if (!roomId) {
        toast({
          title: "Invalid room selected",
          description: "The selected room is not available.",
          variant: "destructive",
        });
        return;
      }

      // First save the SOAP notes if there's subjective data
      if (subjective.trim()) {
        await createSoapMutation.mutateAsync({
          appointmentID: id,
          subjective: subjective.trim()
        });
      }

      // Then complete the check-in process
      await checkInAppointment(parseInt(id), roomId, priority);
      
      // Show success toast
      toast({
        title: "Check-in completed successfully",
        description: "Patient has been checked in and SOAP notes have been saved.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Navigate to appointment page for examination
      setLocation(`/appointment/${id}`);
    } catch (error) {
      console.error('Error completing check-in:', error);
      toast({
        title: "Error completing check-in",
        description: "There was a problem completing the check-in process. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    // In a real app, this would generate and download a PDF
    alert('Invoice download functionality would be implemented here');
  };

  const handleCancel = () => {
    setLocation('/appointment-flow');
  };

  const handleCopyPaymentInfo = () => {
    navigator.clipboard.writeText(paymentInfo.description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompletePayment = () => {
    alert('Payment processed successfully!');
    setLocation('/appointment-flow');
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50">
      <div className="container max-w-screen-xl mx-auto my-4 px-4">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 md:px-8 md:py-5 rounded-t-xl shadow-md mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                className="mr-2 h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setLocation('/appointment-flow')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-white">Patient Check-in</h1>
                <p className="text-indigo-100 text-sm">Room assignment and initial assessment</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleCompleteCheckIn}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Complete Check-in & Go to Exam
              </Button>
            </div>
          </div>
        </div>

        {/* Workflow Navigation */}
        <WorkflowNavigation 
          appointmentId={id} 
          petId={patient?.pet_id?.toString()}
          currentStep="check-in" 
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Left Column - Patient Details & Check-in Form */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Patient Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="flex items-center px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                <div className="h-14 w-14 rounded-lg shadow-sm overflow-hidden flex-shrink-0 border-2 border-white bg-indigo-100 mr-3">
                  <img
                    src={"https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"}
                    alt={patient.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/100?text=Pet";
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{patient.name}</h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-2.5 py-0.5">{patient.breed}</Badge>
                    <div className="text-gray-600 text-sm flex items-center gap-3 ml-1">
                      <span className="flex items-center">
                        <span className="font-medium text-gray-700">ID:</span> 
                        <span className="ml-1">{patient.petid}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="check-in" className="px-6 py-5" onValueChange={setSelectedTab} value={selectedTab}>
                <TabsList className="inline-flex p-1 bg-gray-100 rounded-md">
                  <TabsTrigger 
                    value="check-in" 
                    className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                  >
                    Check-in
                  </TabsTrigger>
                  <TabsTrigger 
                    value="soap-notes" 
                    className="px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                  >
                    SOAP Notes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="check-in" className="pt-5 space-y-6">
                  {/* Owner Information */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800 flex items-center">
                        <User className="mr-2 h-4 w-4 text-indigo-500" />
                        Owner Information
                      </h3>
                    </div>
                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Owner Name
                          </label>
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{appointment.owner.owner_name}</div>
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium border border-green-100">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                            Phone Number
                          </label>
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{appointment.owner.owner_phone}</div>
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium border border-green-100">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                          Address
                        </label>
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">{appointment.owner.owner_address}</div>
                          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium border border-green-100">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800 flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-indigo-500" />
                        Appointment Details
                      </h3>
                    </div>
                    <div className="p-5 space-y-5">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                          Appointment Reason
                        </label>
                        <div className="text-gray-700 font-medium">
                          {appointment.reason}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-500" />
                            Select Room
                          </label>
                          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                            <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                              <SelectValue placeholder="Choose a room" />
                            </SelectTrigger>
                            <SelectContent>
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {availableRooms.map(room => (
                                  <SelectItem
                                    key={room.id}
                                    value={room.name}
                                    disabled={room.status === 'occupied'}
                                    className={cn(
                                      'flex items-center justify-between py-2',
                                      room.status === 'occupied' ? 'opacity-50' : ''
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={cn(
                                        'w-2 h-2 rounded-full',
                                        room.status === 'available' ? 'bg-green-500' : 'bg-gray-400'
                                      )} />
                                      {room.name}
                                    </div>
                                    {room.status === 'occupied' && (
                                      <span className="text-xs text-gray-500">(Occupied)</span>
                                    )}
                                  </SelectItem>
                                ))}
                              </motion.div>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <label className="block text-xs text-gray-500 uppercase font-medium mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-gray-500" />
                            Priority
                          </label>
                          <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <SelectItem value="Normal" className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                  <span>Normal</span>
                                </SelectItem>
                                <SelectItem value="High" className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                  <span>High</span>
                                </SelectItem>
                                <SelectItem value="Urgent" className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-500" />
                                  <span>Urgent</span>
                                </SelectItem>
                              </motion.div>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="soap-notes" className="pt-5">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-800 flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-indigo-500" />
                        Subjective Notes
                      </h3>
                    </div>
                    <div className="p-5">
                      <Textarea
                        placeholder="Enter subjective information about the patient..."
                        className="min-h-[180px] resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200"
                        value={subjective}
                        onChange={(e) => setSubjective(e.target.value)}
                        onBlur={() => {
                          if (subjective.trim() && id) {
                            createSoapMutation.mutate({
                              appointmentID: id,
                              subjective: subjective.trim()
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>

                <div className="mt-8 flex justify-end space-x-3">
                  {selectedTab === 'check-in' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex items-center gap-1.5 bg-white shadow-sm border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </Tabs>
            </div>
          </div>

          {/* Right Column - Billing and Payment */}
          <div className="md:col-span-3 flex flex-col">
            {/* Billing Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-800 flex items-center">
                  <Receipt className="mr-2 h-4 w-4 text-indigo-500" />
                  Billing Information
                </h3>
              </div>
              <div className="p-5">
                <div className="print:visible" id="invoice">
                  {/* Invoice Header */}
                  <div className="flex justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Invoice Summary</h2>
                      <p className="text-xs text-gray-600">Invoice #INV-{id}-{new Date().getFullYear()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="overflow-hidden rounded-lg border border-gray-100 mb-4">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-left">
                        <tr>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {billingItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2">{item.description}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="mb-4">
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-gray-600">Tax (10%):</span>
                      <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-gray-200 font-bold text-base">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">Payment Options</h3>
                  
                  {/* PayOS Integration - QR Code */}
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 mb-4">
                    <div className="flex justify-center mb-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <QrCode className="w-32 h-32 text-indigo-600" />
                      </div>
                    </div>
                    <div className="text-center text-sm text-indigo-700 font-medium mb-1">
                      Scan to pay
                    </div>
                    <div className="text-center text-xs text-gray-500">
                      Use banking app to scan this QR code
                    </div>
                  </div>
                  
                  {/* Bank Transfer Information */}
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <label className="block text-xs text-gray-500 uppercase font-medium mb-1">Bank Account</label>
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{paymentInfo.accountNumber}</div>
                        <div className="text-xs text-gray-600">{paymentInfo.bankName}</div>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{paymentInfo.accountHolder}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <label className="block text-xs text-gray-500 uppercase font-medium mb-1">Payment Amount</label>
                      <div className="font-medium text-gray-900">{formatCurrency(paymentInfo.amount)}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <label className="block text-xs text-gray-500 uppercase font-medium mb-1">Description</label>
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 truncate">{paymentInfo.description}</div>
                        <button 
                          onClick={handleCopyPaymentInfo}
                          className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col gap-3">
                    <Button
                      onClick={handleCompletePayment}
                      className="bg-green-600 hover:bg-green-700 text-white w-full flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      Confirm Payment
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-1.5 border-gray-200"
                        onClick={handlePrintInvoice}
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-1.5 border-gray-200"
                        onClick={handleDownloadInvoice}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    </div>
  );
};

export default CheckIn;