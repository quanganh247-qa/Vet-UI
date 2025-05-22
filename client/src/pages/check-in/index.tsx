import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateSOAP } from "@/hooks/use-soap";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  CheckCheck,
  PawPrint,
  Bold,
  Italic,
  List,
  ListOrdered,
  DollarSign,
  Plus,
  Trash2,
} from "lucide-react";

import { checkInAppointment } from "@/services/appointment-services";
import { cn } from "@/lib/utils";
import { useRoomData } from "@/hooks/use-room";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData } from "@/hooks/use-pet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { useConfirmPayment, useQR } from "@/hooks/use-payment";
import { QRCodeInformation, QuickLinkRequest } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { CashPaymentDialog } from "@/components/payment";
import { set } from "lodash";

// Common pre-defined keys for subjective data
const COMMON_SUBJECTIVE_KEYS = [
  "Chief Complaint",
  "Duration",
  "Onset",
  "Previous Treatment",
  "Diet Changes",
  "Behavior Changes",
  "Environmental Changes",
  "Vaccination Status",
  "Current Medications",
  "Allergies",
];

// Interface for subjective key-value pairs
interface SubjectiveEntry {
  id: string;
  key: string;
  value: string;
}

// Component for key-value style subjective data entry
const SubjectiveKeyValueEditor = ({ 
  value, 
  onChange 
}: { 
  value: string;
  onChange: (value: string) => void;
}) => {
  // Parse existing data if in key-value format, otherwise start fresh
  const parseInitialData = (): SubjectiveEntry[] => {
    if (!value) return [];

    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // If not JSON, try to parse as text with key: value format
      const lines = value.split('\n').filter(line => line.trim());
      const entries: SubjectiveEntry[] = [];
      
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          entries.push({
            id: crypto.randomUUID(),
            key: line.substring(0, colonIndex).trim(),
            value: line.substring(colonIndex + 1).trim()
          });
        } else {
          // If no colon found, add as a note
          entries.push({
            id: crypto.randomUUID(),
            key: "Note",
            value: line.trim()
          });
        }
      }
      
      return entries;
    }
    
    // Default to empty array if parsing fails
    return [];
  };

  const [entries, setEntries] = useState<SubjectiveEntry[]>(parseInitialData());
  const [newKeyInput, setNewKeyInput] = useState("");
  const [isAddingCustomKey, setIsAddingCustomKey] = useState(false);

  // Update parent component when entries change
  useEffect(() => {
    // Convert entries to JSON string, maintaining the structured data
    const jsonData = JSON.stringify(entries);
    
    // Update the parent component with the JSON string
    onChange(jsonData);
  }, [entries, onChange]);

  const addEntry = (key: string = "") => {
    const newEntry: SubjectiveEntry = {
      id: crypto.randomUUID(),
      key: key || "Note",
      value: ""
    };
    
    setEntries([...entries, newEntry]);
    setIsAddingCustomKey(false);
    setNewKeyInput("");
  };

  const updateEntry = (id: string, field: 'key' | 'value', newValue: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: newValue } : entry
    ));
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  // Format entries for display in the UI (for debugging or previewing)
  const getFormattedText = () => {
    return entries
      .map(entry => `${entry.key}: ${entry.value}`)
      .join('\n\n');
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-4 space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No subjective data added yet. Use the buttons below to add information.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-12 gap-3 items-start group border border-gray-100 rounded-md p-3 bg-gray-50">
              <div className="col-span-4 lg:col-span-3">
                <Input
                  value={entry.key}
                  onChange={(e) => updateEntry(entry.id, 'key', e.target.value)}
                  className="font-medium text-gray-700"
                  placeholder="Category"
                />
              </div>
              <div className="col-span-7 lg:col-span-8">
                <Textarea
                  value={entry.value}
                  onChange={(e) => updateEntry(entry.id, 'value', e.target.value)}
                  placeholder="Enter details here..."
                  className="resize-none min-h-[80px] bg-white"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(entry.id)}
                  className="h-9 w-9 opacity-70 hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}

        {/* UI for adding a new custom key */}
        {isAddingCustomKey ? (
          <div className="flex items-center mt-2 space-x-2 p-3 border border-dashed border-indigo-200 rounded-md bg-indigo-50">
            <Input
              value={newKeyInput}
              onChange={(e) => setNewKeyInput(e.target.value)}
              placeholder="Enter custom category..."
              className="flex-1"
              autoFocus
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => addEntry(newKeyInput)}
              className="whitespace-nowrap bg-white"
              disabled={!newKeyInput.trim()}
            >
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsAddingCustomKey(false)}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingCustomKey(true)}
              className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 mb-2"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Custom Field
            </Button>
            
            <div className="flex flex-wrap gap-2">
              {COMMON_SUBJECTIVE_KEYS.map((key) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addEntry(key)}
                  className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>
        )}
      

   
      </div>
    </div>
  );
};



const CheckIn = () => {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("check-in");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [subjective, setSubjective] = useState("");
  const [copied, setCopied] = useState(false);
  const [isQRLoading, setIsQRLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [isCashPaymentOpen, setIsCashPaymentOpen] = useState(false);
  const createSoapMutation = useCreateSOAP();
  const [paymentID, setPaymentID] = useState(0);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  
  const { toast } = useToast();

  const { data: appointment, error: appointmentError } = useAppointmentData(id);
  const { data: patient, error: patientError } = usePatientData(
    appointment?.pet?.pet_id
  );
  const { data: rooms = [] } = useRoomData(
    !!appointment?.service?.service_name
  );

  const { mutate: confirmPayment, isPending: isConfirmingPayment } =
    useConfirmPayment();

  // Use the mutation hook with proper methods
  const qrMutation = useQR();

  useEffect(() => {
    if (qrMutation.data) {
      setQrImageUrl(qrMutation.data.url || qrMutation.data.quick_link || "");
      setPaymentID(qrMutation.data.payment_id);
    }
  }, [qrMutation.data]);

  const availableRooms = rooms;
  if (!appointment || !patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading appointment details...</p>
      </div>
    );
  }

  const handleConfirmPayment = () => {
    confirmPayment({
      appointment_id: parseInt(id || "0"),
      payment_id: paymentID,
      payment_status: "successful",
      notes: "Payment confirmed",
    }, {
      onSuccess: () => {
        setIsPaymentConfirmed(true);
        toast({
          title: "Payment Confirmed",
          description: "Payment has been successfully confirmed.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      }
    });
  };

  // Format currency for VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleCompleteCheckIn = async () => {
    if (!selectedRoom) {
      toast({
        title: "Error",
        description: "Please select an examination room",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    try {
      // First check in the appointment
      const roomId = availableRooms.find(
        (room) => room.name === selectedRoom
      )?.id;

      if (!roomId) {
        toast({
          title: "Invalid room",
          description: "The selected room is invalid",
          variant: "destructive",
        });
        return;
      }

      // Check in the appointment
      await checkInAppointment(parseInt(id), roomId, priority);

      // Create the SOAP note with the subjective information
      if (subjective.trim()) {
        await createSoapMutation.mutateAsync({
          appointmentID: id,
          subjective: subjective,
        });
      }

      toast({
        title: "Patient Checked In",
        description: `Successfully checked in to ${selectedRoom}`,
        className: "bg-green-50 border-green-200 text-green-800",
        
      });
      setLocation("/appointment-flow");

      // Redirect to the appointment flowboard rather than examination
    } catch (error) {
      console.error("Error checking in:", error);
      toast({
        title: "Check-in Failed",
        description: "An error occurred during check-in",
        variant: "destructive",
      });
    }
  };

  const total = appointment.service.service_amount;

  // Determine the appropriate QR code request based on appointment type
  const qrCodeInformation: QuickLinkRequest = {
    bank_id: "mbbank",
    account_no: "220220222419",
    template: "compact2",
    amount: total || 0,
    description: `Payment for ${
      appointment?.service?.service_name || "appointment"
    }`,
    account_name: "PET CARE CLINIC",
    order_id: 0,
    appointment_id: parseInt(id || "0"),
  };


  const handleCancel = () => {
    setLocation("/appointment-flow");
  };

  const handleGetQRCode = () => {
    setIsQRLoading(true);

    // Actually trigger the mutation
    qrMutation
      .mutateAsync(qrCodeInformation)
      .then((data) => {
        toast({
          title: "QR Code Generated",
          description: "Payment QR code has been generated successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      })
      .catch((error) => {
        console.error("Error generating QR code:", error);
        toast({
          title: "QR Code Generation Failed",
          description:
            "There was a problem generating the QR code. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsQRLoading(false);
      });
  };

  // Handle cash payment success
  const handlePaymentSuccess = (paymentData: any) => {
    if (paymentData && paymentData.payment_id) {
      setPaymentID(paymentData.payment_id);
    }
    
    toast({
      title: "Payment Successful",
      description: "Cash payment has been recorded successfully.",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 rounded-xl shadow-md mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-3 h-9 w-9 text-white hover:bg-white/20 rounded-full"
                onClick={() => setLocation("/appointment-flow")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Nurse Check-in
                </h1>
                <p className="text-white/90 text-sm mt-0.5">
                  Room assignment and initial assessment
                </p>
              </div>
            </div>

            {/* <div className="flex gap-3">
              <Button
                onClick={handleCompleteCheckIn}
                className="bg-white hover:bg-white/90 text-[#2C78E4] border-transparent font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Check-in
              </Button>
            </div> */}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Left Column - Patient Details & Check-in Form */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Patient Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center p-6 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
                <div className="relative h-28 w-28 rounded-2xl shadow-sm overflow-hidden flex-shrink-0 border-2 border-white bg-blue-100 mr-5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {patient.data_image ? (
                      <img
                        src={`data:image/png;base64,${patient.data_image}`}
                        alt={patient.name}
                        className="object-cover w-full h-full"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-[#2C78E4]/40">
                        <PawPrint className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {patient.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1">
                    <Badge className="bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20 px-3 py-0.5 rounded-xl text-sm font-medium">
                      {patient.breed}
                    </Badge>
                    <div className="text-gray-600 text-sm flex items-center gap-3 ml-1">
                      <span className="flex items-center">
                        <span className="font-medium text-gray-700">ID:</span>
                        <span className="ml-1">{patient.petid}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combined content without tabs */}
              <div className="px-6 py-5 space-y-6">
                {/* Owner Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-[#2C78E4]/10 to-white border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-800 flex items-center">
                      <User className="mr-2 h-4 w-4 text-[#2C78E4]" />
                      Owner Information
                    </h3>
                  </div>
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-[#2C78E4]/30 transition-colors">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                          Owner Name
                        </label>
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">
                            {appointment.owner.owner_name}
                          </div>
                
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-[#2C78E4]/30 transition-colors">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                          Phone Number
                        </label>
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">
                            {appointment.owner.owner_phone}
                          </div>
                        
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-[#2C78E4]/30 transition-colors">
                      <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                        Address
                      </label>
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">
                          {appointment.owner.owner_address}
                        </div>
                      
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-[#2C78E4]/10 to-white border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-800 flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-[#2C78E4]" />
                      Appointment Details
                    </h3>
                  </div>
                  <div className="p-5 space-y-5">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-[#2C78E4]/30 transition-colors">
                      <label className="block text-xs text-gray-500 uppercase font-medium mb-2">
                        Appointment Reason
                      </label>
                      <div className="text-gray-700 font-medium">
                        {appointment.reason}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-[#2C78E4]/30 transition-colors">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-2 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          Select Room
                        </label>
                        <Select
                          value={selectedRoom}
                          onValueChange={setSelectedRoom}
                        >
                          <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-2 focus:ring-[#2C78E4] focus:border-[#2C78E4] rounded-lg">
                            <SelectValue placeholder="Choose a room" />
                          </SelectTrigger>
                          <SelectContent>
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {availableRooms.map((room) => (
                                <SelectItem
                                  key={room.id}
                                  value={room.name}
                                  disabled={room.status === "occupied"}
                                  className={cn(
                                    "flex items-center justify-between py-2",
                                    room.status === "occupied"
                                      ? "opacity-50"
                                      : ""
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        room.status === "available"
                                          ? "bg-green-500"
                                          : "bg-gray-400"
                                      )}
                                    />
                                    {room.name}
                                  </div>
                                  {room.status === "occupied" && (
                                    <span className="text-xs text-gray-500">
                                      (Occupied)
                                    </span>
                                  )}
                                </SelectItem>
                              ))}
                            </motion.div>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-[#2C78E4]/30 transition-colors">
                        <label className="block text-xs text-gray-500 uppercase font-medium mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-gray-500" />
                          Priority
                        </label>
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-2 focus:ring-[#2C78E4] focus:border-[#2C78E4] rounded-lg">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <SelectItem
                                value="Normal"
                                className="flex items-center gap-2"
                              >
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Normal</span>
                              </SelectItem>
                              <SelectItem
                                value="High"
                                className="flex items-center gap-2"
                              >
                                <div className="w-2 h-2 rounded-full bg-[#FFA726]" />
                                <span>High</span>
                              </SelectItem>
                              <SelectItem
                                value="Urgent"
                                className="flex items-center gap-2"
                              >
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

                {/* Subjective Notes - Replace RichTextEditor with SubjectiveKeyValueEditor */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-3 bg-gradient-to-r from-[#2C78E4]/10 to-white border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-800 flex items-center justify-between">
                      <div className="flex items-center">
                        <Stethoscope className="mr-2 h-4 w-4 text-[#2C78E4]" />
                        Subjective Notes
                      </div>
                      
                    </h3>
                  </div>
                  <div className="p-5">
                    <SubjectiveKeyValueEditor
                      value={subjective}
                      onChange={setSubjective}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 bg-white shadow-sm border-gray-200 hover:bg-gray-50 transition-colors rounded-xl px-5"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCompleteCheckIn}
                    className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white flex items-center gap-1.5 shadow-sm rounded-xl px-5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Check-in
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Billing and Payment */}
          <div className="md:col-span-3 flex flex-col">
            {/* Billing Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="px-5 py-3 bg-gradient-to-r from-[#2C78E4]/10 to-white border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-800 flex items-center">
                  <Receipt className="mr-2 h-4 w-4 text-[#2C78E4]" />
                  Billing Information
                </h3>
              </div>
              <div className="p-5">
                <div className="print:visible" id="invoice">
                  {/* Invoice Header */}
                  <div className="flex justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        Invoice Summary
                      </h2>
                      <p className="text-xs text-gray-600">
                        Invoice #INV-{id}-{new Date().getFullYear()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="overflow-hidden rounded-xl border border-gray-100 mb-4">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-left">
                        <tr>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        <tr>
                          <td className="px-4 py-3">
                            {appointment.service.service_name}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(appointment.service.service_amount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="mb-4">
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(appointment.service.service_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 mt-1 border-t border-gray-200 font-bold text-base">
                      <span>Total:</span>
                      <span className="text-[#2C78E4]">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <h3 className="text-sm font-medium text-gray-800 mb-4">
                    Payment Options
                  </h3>

                  {/* Payment Buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {/* Get QR Code button */}
                    {!qrMutation.data && (
                      <Button
                        onClick={handleGetQRCode}
                        disabled={isQRLoading || qrMutation.isPending}
                        className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white flex items-center justify-center gap-1.5 shadow-sm rounded-xl py-2.5"
                      >
                        {isQRLoading || qrMutation.isPending ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Generating QR Code...
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4" />
                            QR Code
                          </>
                        )}
                      </Button>
                    )}

                    {/* Cash Payment button */}
                    <Button
                      onClick={() => setIsCashPaymentOpen(true)}
                      className="bg-[#FFA726] hover:bg-[#FFA726]/90 text-white flex items-center justify-center gap-1.5 shadow-sm rounded-xl py-2.5"
                    >
                      <DollarSign className="w-4 h-4" />
                      Cash Payment
                    </Button>
                  </div>

                  {/* PayOS Integration - Default QR placeholder */}
                  {!qrMutation.data &&
                    !isQRLoading &&
                    !qrMutation.isPending && (
                      <div className="bg-[#2C78E4]/5 rounded-lg p-6 border border-[#2C78E4]/20 mb-4">
                        <div className="flex justify-center mb-4">
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <QrCode className="w-32 h-32 text-[#2C78E4]" />
                          </div>
                        </div>
                        <div className="text-center text-sm text-[#2C78E4] font-medium mb-1">
                          Scan to pay
                        </div>
                        <div className="text-center text-xs text-gray-500">
                          Use banking app to scan this QR code
                        </div>
                      </div>
                    )}

                  {qrMutation.data && (
                    <div id="qrCode" className="space-y-3">
                      <div className="bg-[#2C78E4]/5 p-6 rounded-lg border border-[#2C78E4]/20 mb-4">
                        <label className="block text-xs text-gray-600 uppercase font-medium mb-3 text-center">
                          Payment QR Code
                        </label>
                        <div className="flex items-center justify-center">
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            {qrImageUrl ? (
                              <img
                                src={qrImageUrl}
                                alt="QR Code"
                                className="w-full h-auto"
                                onError={(e) => {
                                  console.error("Error loading QR image");
                                  e.currentTarget.src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOTA5MDkwIj5RUiBJbWFnZSBMb2FkIEVycm9yPC90ZXh0Pjwvc3ZnPg==";
                                }}
                              />
                            ) : (
                              <div className="w-full h-auto aspect-square flex items-center justify-center text-[#2C78E4]/30">
                                <QrCode className="w-32 h-32" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center text-sm text-[#2C78E4] font-medium mt-4 mb-1">
                          Scan to pay: {formatCurrency(total)}
                        </div>
                        <div className="text-center text-xs text-gray-500">
                          Use any banking app to scan and pay
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6">
                    <Button
                      onClick={handleConfirmPayment}
                      disabled={isConfirmingPayment || isPaymentConfirmed || !paymentID}
                      className={cn(
                        "w-full flex items-center justify-center gap-1.5 shadow-sm rounded-xl py-3 font-medium",
                        isPaymentConfirmed 
                          ? "bg-green-100 text-green-800 cursor-not-allowed"
                          : "bg-[#FDD835] hover:bg-[#FDD835]/90 text-gray-800"
                      )}
                    >
                      {isConfirmingPayment ? (
                        <>
                          Confirming...
                        </>
                      ) : isPaymentConfirmed ? (
                        <>
                          <CheckCheck className="w-4 h-4" />
                          Payment Confirmed
                        </>
                      ) : (
                        <>
                          <CheckCheck className="w-4 h-4" />
                          Confirm Payment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

        </div>
        <Toaster />
      </div>
      
      {/* Cash Payment Dialog */}
      <CashPaymentDialog
        open={isCashPaymentOpen}
        onOpenChange={setIsCashPaymentOpen}
        invoiceId={id || "0"}
        amount={total}
        appointmentId={parseInt(id || "0")}
        onSuccess={handlePaymentSuccess}
        isPaymentConfirmed={isPaymentConfirmed}
      />
    </div>
  );
};

export default CheckIn;
