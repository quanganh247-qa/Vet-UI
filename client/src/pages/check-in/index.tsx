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
  Heart,
  History,
  UtensilsCrossed,
  Home,
  Pill,
  Search,
  FileText,
  Activity,
  RotateCcw,
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

// Common pre-defined keys for subjective data organized by category
const MEDICAL_CATEGORIES = {
  "Chief Complaint": {
    icon: Heart,
    color: "bg-red-50 border-red-200 text-red-800",
    fields: ["Chief Complaint", "Primary Concern", "Main Issue"]
  },
  "History": {
    icon: History,
    color: "bg-blue-50 border-blue-200 text-blue-800", 
    fields: ["Duration", "Onset", "Previous Treatment"]
  },
  "Behavior & Diet": {
    icon: UtensilsCrossed,
    color: "bg-green-50 border-green-200 text-green-800",
    fields: ["Diet Changes", "Behavior Changes", "Appetite"]
  },
  "Environment": {
    icon: Home,
    color: "bg-purple-50 border-purple-200 text-purple-800",
    fields: ["Environmental Changes", "Living Situation", "Travel History"]
  },
  "Physical Signs": {
    icon: Search,
    color: "bg-indigo-50 border-indigo-200 text-indigo-800",
    fields: ["Observable Symptoms", "Physical Condition", "Mobility Issues"]
  }
};

// Quick templates for common scenarios
const QUICK_TEMPLATES = [
  {
    name: "General Checkup",
    icon: CheckCircle,
    fields: [
      { key: "Chief Complaint", value: "Routine health examination" },
      { key: "Duration", value: "Annual checkup" },
      { key: "Vaccination Status", value: "Up to date" },
      { key: "Behavior Changes", value: "Normal behavior reported" }
    ]
  },
  {
    name: "Sick Visit",
    icon: Activity,
    fields: [
      { key: "Chief Complaint", value: "" },
      { key: "Duration", value: "" },
      { key: "Onset", value: "" },
      { key: "Observable Symptoms", value: "" }
    ]
  },
  {
    name: "Follow-up",
    icon: RotateCcw,
    fields: [
      { key: "Previous Treatment", value: "" },
      { key: "Current Medications", value: "" },
      { key: "Progress Notes", value: "" }
    ]
  }
];

// Interface for subjective key-value pairs
interface SubjectiveEntry {
  id: string;
  key: string;
  value: string;
  category?: string;
}

// Component for professional medical note-taking
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
            key: "Additional Notes",
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customFieldName, setCustomFieldName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Update parent component when entries change
  useEffect(() => {
    const jsonData = JSON.stringify(entries);
    onChange(jsonData);
  }, [entries, onChange]);

  const addEntry = (key: string = "", defaultValue: string = "", category?: string) => {
    const newEntry: SubjectiveEntry = {
      id: crypto.randomUUID(),
      key: key || "Additional Notes",
      value: defaultValue,
      category: category
    };
    
    setEntries([...entries, newEntry]);
    setCustomFieldName("");
    setSelectedCategory("");
  };

  const updateEntry = (id: string, field: 'key' | 'value', newValue: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: newValue } : entry
    ));
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const applyTemplate = (template: any) => {
    const templateEntries = template.fields.map((field: any) => ({
      id: crypto.randomUUID(),
      key: field.key,
      value: field.value,
    }));
    setEntries(templateEntries);
    setShowTemplates(false);
  };

  const clearAll = () => {
    setEntries([]);
  };

  // Filter available fields based on search
  const getFilteredFields = () => {
    const allFields = Object.values(MEDICAL_CATEGORIES).flatMap(cat => 
      cat.fields.map(field => ({ field, category: cat }))
    );
    
    if (!searchTerm) return allFields;
    
    return allFields.filter(({ field }) => 
      field.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with templates and actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
          >
            <FileText className="h-4 w-4 mr-1" />
            Quick Templates
          </Button>
          {entries.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="bg-white hover:bg-red-50 border-red-200 text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        <div className="text-xs text-blue-600 font-medium">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      {/* Quick Templates */}
      {showTemplates && (
        <div className="p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
          <h4 className="font-medium text-sm mb-3 text-gray-700">Quick Start Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {QUICK_TEMPLATES.map((template, index) => {
              const IconComponent = template.icon;
              return (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  onClick={() => applyTemplate(template)}
                  className="h-auto p-3 text-left flex flex-col items-start hover:bg-blue-50 border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium text-sm">{template.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {template.fields.length} fields
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Existing Entries */}
      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="group border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 transition-colors">
              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-12 sm:col-span-4">
                  <Input
                    value={entry.key}
                    onChange={(e) => updateEntry(entry.id, 'key', e.target.value)}
                    className="font-medium text-gray-700 border-gray-200 focus:border-blue-500"
                    placeholder="Field name"
                  />
                </div>
                <div className="col-span-11 sm:col-span-7">
                  <Textarea
                    value={entry.value}
                    onChange={(e) => updateEntry(entry.id, 'value', e.target.value)}
                    placeholder="Enter details..."
                    className="resize-none min-h-[80px] border-gray-200 focus:border-blue-500"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                    className="h-8 w-8 opacity-60 hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Stethoscope className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 mb-2">No subjective data recorded yet</p>
          <p className="text-sm text-gray-500">Use quick templates or add fields below to start documenting</p>
        </div>
      )}

      {/* Add New Field Section */}
      <div className="border border-gray-200 rounded-lg bg-gray-50">
        <div className="p-4">
          <h4 className="font-medium text-sm mb-3 text-gray-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Medical Information
          </h4>
          
          {/* Custom Field */}
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="flex gap-2">
              <Input
                value={customFieldName}
                onChange={(e) => setCustomFieldName(e.target.value)}
                placeholder="Custom field name..."
                className="flex-1 border-gray-200 focus:border-blue-500"
              />
              <Button
                type="button"
                onClick={() => addEntry(customFieldName)}
                disabled={!customFieldName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckIn = () => {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
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
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Left Column - Patient Details & Check-in Form */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Combined Patient & Owner Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center p-6 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
                <div className="relative h-24 w-24 rounded-2xl shadow-sm overflow-hidden flex-shrink-0 border-2 border-white bg-blue-100 mr-4">
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
                        <PawPrint className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {patient.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className="bg-[#2C78E4]/10 text-[#2C78E4] border-[#2C78E4]/20 px-2 py-0.5 rounded-lg text-xs font-medium">
                          {patient.breed}
                        </Badge>
                        <span className="text-xs text-gray-500">ID: {patient.petid}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium text-gray-900">{appointment.owner.owner_name}</div>
                      <div className="text-xs text-gray-500">Owner</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combined content */}
              <div className="px-6 py-4 space-y-4">
                {/* Patient & Owner Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                      Owner Phone
                    </label>
                    <div className="font-medium text-gray-900 text-sm">
                      {appointment.owner.owner_phone}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                      Pet Type
                    </label>
                    <div className="font-medium text-gray-900 text-sm">
                      {patient.type}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                      Pet Age
                    </label>
                    <div className="font-medium text-gray-900 text-sm">
                      {patient.age} years
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <label className="block text-xs text-gray-500 uppercase font-medium mb-1">
                    Owner Address
                  </label>
                  <div className="font-medium text-gray-900 text-sm">
                    {appointment.owner.owner_address}
                  </div>
                </div>

                {/* Appointment Reason */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <label className="block text-xs text-blue-600 uppercase font-medium mb-1">
                    Appointment Reason
                  </label>
                  <div className="text-gray-800 font-medium text-sm">
                    {appointment.reason}
                  </div>
                </div>

                {/* Room Selection and Priority - Compact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <label className="block text-xs text-gray-500 uppercase font-medium mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      Select Room
                    </label>
                    <Select
                      value={selectedRoom}
                      onValueChange={setSelectedRoom}
                    >
                      <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-2 focus:ring-[#2C78E4] focus:border-[#2C78E4] rounded-lg h-9">
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

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <label className="block text-xs text-gray-500 uppercase font-medium mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-gray-500" />
                      Priority
                    </label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-2 focus:ring-[#2C78E4] focus:border-[#2C78E4] rounded-lg h-9">
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

            {/* Subjective Notes - Compact version */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-[#2C78E4]/10 to-white border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-800 flex items-center">
                  <Stethoscope className="mr-2 h-4 w-4 text-[#2C78E4]" />
                  Subjective Notes
                </h3>
              </div>
              <div className="p-4">
                <SubjectiveKeyValueEditor
                  value={subjective}
                  onChange={setSubjective}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-1.5 bg-white shadow-sm border-gray-200 hover:bg-gray-50 transition-colors rounded-xl px-4 py-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleCompleteCheckIn}
                className="bg-[#2C78E4] hover:bg-[#2C78E4]/90 text-white flex items-center gap-1.5 shadow-sm rounded-xl px-4 py-2"
              >
                <CheckCircle className="w-4 h-4" />
                Complete Check-in
              </Button>
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
