import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Edit,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  FileText,
  Clipboard,
  Users,
  Settings,
  AlertCircle,
  RefreshCw,
  List,
  Columns,
  Layers,
  UserPlus,
  Play,
  ExternalLink,
  X,
  DollarSign,
  Flag,
  ArrowRight,
  PanelRightClose,
  PanelRight,
  ArrowRightCircle,
  Stethoscope,
  FlaskConical,
  Tablets,
  Receipt,
  UserCircle,
  CalendarClock,
  Clock,
  Tag,
  Bell,
  PawPrint,
  User,
  Activity,
  ClipboardCheck,
  Circle,
  Search,
  Filter,
} from "lucide-react";
import { Appointment, Doctor, Room, QueueItem } from "@/types";
import {
  useAppointmentData,
  useListAppointmentsQueue,
  useUpdateAppointmentStatus,
} from "@/hooks/use-appointment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAppointmentById } from "@/services/appointment-services";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { usePatientData } from "@/hooks/use-pet";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface EnhancedAppointmentFlowboardProps {
  appointments: Appointment[];
  doctors: Doctor[];
  rooms: Room[];
  // staff: Staff[];
  onAppointmentUpdate: (appointment: Appointment) => void;
  onAppointmentCreate: (appointment: Omit<Appointment, "id">) => void;
  onAppointmentDelete: (id: number) => void;
  selectedDate: Date;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

interface AppointmentWithWorkflowData extends Appointment {
  workflow_progress?: string;
  lab_results?: any[];
  soap_note?: any[];
}

// Define status IDs as a constant to avoid magic numbers
const statusIds = {
  scheduled: 1,
  checked_in: 2,
  in_progress: 5,
  completed: 6,
  cancelled: 3,
  no_show: 4,
};

// Memoized formatter functions for reuse across components
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// Memoized color utility functions
const getStatusColorClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-[#E3F2FD] text-[#1976D2] border-[#2C78E4]/20";
    case "checked in":
      return "bg-[#2C78E4] text-white border-[#2C78E4]";
    case "in progress":
      return "bg-[#7C3AED] text-white border-[#7C3AED]";
    case "waiting":
      return "bg-[#FDD835] text-[#594D26] border-[#FDD835]/30";
    case "completed":
      return "bg-[#4CAF50] text-white border-[#4CAF50]";
    case "scheduled":
      return "bg-[#E3F2FD] text-[#1976D2] border-[#2C78E4]/20";
    case "cancelled":
      return "bg-gray-500 text-white border-gray-500";
    default:
      return "bg-gray-200 text-gray-800 border-gray-200";
  }
};

const getTypeColorClass = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "check-up":
      return "bg-[#E8F5E9] text-[#2E7D32]";
    case "surgery":
      return "bg-[#FFEBEE] text-[#C62828]";
    case "sick visit":
      return "bg-[#FFF8E1] text-[#F57F17]";
    case "vaccination":
      return "bg-[#E3F2FD] text-[#1565C0]";
    case "grooming":
      return "bg-[#FFF3E0] text-[#E65100]";
    case "new patient":
      return "bg-[#F3E5F5] text-[#6A1B9A]";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColorClass = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return "bg-[#FFEBEE] text-[#C62828] border-[#C62828]/20";
    case "high":
      return "bg-[#FFF3E0] text-[#E65100] border-[#E65100]/20";
    case "medium":
      return "bg-[#FFF8E1] text-[#F57F17] border-[#F57F17]/20";
    case "low":
      return "bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/20";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Enhanced appointment card component with better styling
const AppointmentCard = memo(
  ({
    appointment,
    onClick,
    onStatusChange,
    onCheckIn,
    formatTime,
  }: {
    appointment: Appointment;
    onClick: (id: number) => void;
    onStatusChange: (
      id: number,
      statusId: number,
      navigateToDetail?: boolean
    ) => void;
    onCheckIn: (
      id: number,
      statusId: number,
      navigateToDetail?: boolean
    ) => void;
    formatTime: (date: Date | string) => string;
    getStatusColorClass: (status: string) => string;
    getTypeColorClass: (type: string) => string;
    getPriorityColorClass: (priority: string) => string;
  }) => {
    const handleClick = useCallback(() => {
      onClick(appointment.id);
    }, [appointment.id, onClick]);

    // Handle action button click based on status
    const handleActionClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();

        // Different actions based on the appointment state
        if (appointment.state === "Scheduled") {
          // Confirm appointment (change status to Confirmed - status_id: 2)
          onStatusChange(appointment.id, 2, false);
        } else if (appointment.state === "Confirmed") {
          // Check-in appointment
          onCheckIn(appointment.id, 2, false);
        } else if (
          appointment.state === "Checked In" ||
          appointment.state === "Waiting"
        ) {
          // Start exam (change status to In Progress - status_id: 5)
          onStatusChange(appointment.id, 5, true);
        } else if (appointment.state === "In Progress") {
          // Do nothing or show a disabled button
          return;
        } else {
          // For other states
          onStatusChange(appointment.id, 2, false);
        }
      },
      [appointment.id, appointment.state, onStatusChange, onCheckIn]
    );

    // Get button text based on status
    const getActionButtonText = () => {
      switch (appointment.state) {
        case "Scheduled":
          return "Confirm";
        case "Confirmed":
          return "Check-in";
        case "Checked In":
        case "Waiting":
          return appointment.service?.service_name?.toString() ===
            "Body Grooming"
            ? "Start Service"
            : "Start Exam";
        case "In Progress":
          return "In Progress";
        default:
          return "Check-out";
      }
    };

    // Get button style based on status
    const getActionButtonStyle = () => {
      switch (appointment.state) {
        case "Scheduled":
          return "bg-[#2C78E4] text-white border-[#2C78E4] hover:bg-[#2C78E4]/90 shadow-sm";
        case "Confirmed":
          return "bg-[#10B981] text-white border-[#10B981] hover:bg-[#10B981]/90 shadow-sm";
        case "Checked In":
        case "Waiting":
          return "bg-[#7C3AED] text-white border-[#7C3AED] hover:bg-[#7C3AED]/90 shadow-sm";
        case "In Progress":
          return "bg-gray-400 text-white border-gray-400 hover:bg-gray-400/90 cursor-not-allowed";
        default:
          return "border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm";
      }
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    // Get service type color class
    const getServiceBgColor = () => {
      const serviceName = appointment.service?.service_name?.toLowerCase();

      if (serviceName?.includes("radiology")) return "bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB]";
      if (serviceName?.includes("check-up")) return "bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]";
      if (serviceName?.includes("surgery")) return "bg-gradient-to-br from-[#FFEBEE] to-[#FFCDD2]";
      if (serviceName?.includes("lab")) return "bg-gradient-to-br from-[#F3E5F5] to-[#E1BEE7]";
      if (serviceName?.includes("dental")) return "bg-gradient-to-br from-[#FFF8E1] to-[#FFF176]";
      if (serviceName?.includes("grooming")) return "bg-gradient-to-br from-[#FFF3E0] to-[#FFCC80]";

      return "bg-gradient-to-br from-[#F0F7FF] to-[#E3F2FD]"; // Default
    };

    // Get service text color
    const getServiceTextColor = () => {
      const serviceName = appointment.service?.service_name?.toLowerCase();

      if (serviceName?.includes("radiology")) return "text-[#1565C0]";
      if (serviceName?.includes("check-up")) return "text-[#2E7D32]";
      if (serviceName?.includes("surgery")) return "text-[#C62828]";
      if (serviceName?.includes("lab")) return "text-[#6A1B9A]";
      if (serviceName?.includes("dental")) return "text-[#F57F17]";
      if (serviceName?.includes("grooming")) return "text-[#E65100]";

      return "text-[#2C78E4]"; // Default
    };

    return (
      <div
        className={`${getServiceBgColor()} rounded-xl shadow-sm border border-white/50 p-3 mb-3 hover:shadow-md transition-all duration-200 cursor-pointer backdrop-blur-sm`}
        onClick={handleClick}
      >
        {/* Header with service and time */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start flex-1">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-current mr-2 opacity-60"></div>
              <span
                className={`text-sm font-semibold truncate max-w-[140px] ${getServiceTextColor()}`}
              >
                {appointment.service?.service_name || "Service"}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 font-medium bg-white/60 px-2 py-1 rounded-lg">
            {formatDate(appointment.date || "")}
          </div>
        </div>

        {/* Pet info */}
        <div className="mb-3">
          <div className="flex items-center">
            <PawPrint className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
            <span className="text-sm font-medium text-gray-800">
              {appointment.pet?.pet_name}
            </span>
          </div>
        </div>

        {/* Action button and time */}
        <div className="flex justify-between items-center mb-3">
          <button
            className={`text-xs px-3 py-1.5 border rounded-lg font-medium transition-colors ${getActionButtonStyle()}`}
            onClick={handleActionClick}
            disabled={appointment.state === "In Progress"}
          >
            {getActionButtonText()}
          </button>
          <div className="text-xs font-semibold text-gray-700 bg-white/60 px-2 py-1 rounded-lg">
            {formatTime(appointment.time_slot?.start_time || "")}
          </div>
        </div>

        {/* Doctor section */}
        <div className="flex items-center bg-white/40 rounded-lg p-2 border border-white/30">
          <div className="w-6 h-6 rounded-full bg-[#2C78E4]/10 flex items-center justify-center text-[#2C78E4] text-xs font-semibold border border-[#2C78E4]/20">
            {appointment.doctor?.doctor_name
              ? appointment.doctor.doctor_name.charAt(0).toUpperCase()
              : "D"}
          </div>
          <span className="text-xs text-gray-700 font-medium ml-2 truncate">
            Dr. {appointment.doctor?.doctor_name}
          </span>
        </div>
      </div>
    );
  }
);

AppointmentCard.displayName = "AppointmentCard";

const EnhancedAppointmentFlowboard: React.FC<EnhancedAppointmentFlowboardProps> =
  memo(
    ({
      appointments,
      doctors,
      rooms,
      // staff,
      onAppointmentUpdate,
      onAppointmentCreate,
      onAppointmentDelete,
      selectedDate,
      onDateChange,
      onPreviousDay,
      onNextDay,
      onToday,
    }) => {
      // State for managing views, filters, and selected appointments
      const [viewMode, setViewMode] = useState<"columns" | "timeline" | "list">(
        "columns"
      );
      const [filterStatus, setFilterStatus] = useState("all");
      const [filterDoctor, setFilterDoctor] = useState("all");
      const [filterType, setFilterType] = useState("all");
      const [showSidebar, setShowSidebar] = useState(true);
      const [sidebarContent, setSidebarContent] = useState<
        "queue" | "details" | "new"
      >("queue");
      const [selectedAppointmentId, setSelectedAppointmentId] = useState<
        number | null
      >(null);
      const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
      const [showResourceManagement, setShowResourceManagement] =
        useState(false);
      const [searchTerm, setSearchTerm] = useState("");

      const queryClient = useQueryClient();

      // Queue data (patients waiting, estimated times)
      const { data: queueData } = useListAppointmentsQueue();

      // Log the structure to help with debugging
      // Memoize the found queue item to prevent unnecessary calculations
      const queueItem = useMemo(
        () =>
          queueData?.find(
            (item: QueueItem) => item.id === selectedAppointmentId
          ),
        [queueData, selectedAppointmentId]
      );

      // Add location for navigation
      const [, setLocation] = useLocation();

      // Refresh queue data periodically and when appointments change
      useEffect(() => {
        // Refresh queue data when component mounts
        queryClient.invalidateQueries({ queryKey: ["appointmentsQueue"] });
        queryClient.invalidateQueries({ queryKey: ["appointments"] });

        // Set up an interval to refresh queue data every 30 seconds
        const interval = setInterval(() => {
          queryClient.invalidateQueries({ queryKey: ["appointmentsQueue"] });
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
        }, 30000);

        // Clean up interval on component unmount
        return () => clearInterval(interval);
      }, [queryClient]);

      // Memoize expensive calculations and formatting functions
      const formatTime = useCallback((time: Date | string): string => {
        if (!time) return "";

        // If it already has a simple time format like "10:20", just return it
        if (typeof time === "string" && /^\d{1,2}:\d{2}$/.test(time)) {
          return time;
        }

        // If time includes full date, parse it as Date
        if (typeof time === "string" && time.includes("-")) {
          const date = new Date(time);
          return isNaN(date.getTime())
            ? time
            : timeFormatter.format(date).replace(/^24:/, "00:");
        }

        // If it's just a time string with seconds (like "15:04:00"), return without seconds
        if (typeof time === "string" && time.includes(":")) {
          // Remove seconds if present
          const parts = time.split(":");
          if (parts.length > 1) {
            return `${parts[0]}:${parts[1]}`;
          }
          return time;
        }

        // Handle Date objects
        return timeFormatter.format(time as Date).replace(/^24:/, "00:");
      }, []);

      // Filter appointments based on selected filters
      const filteredAppointments = useMemo(() => {
        return appointments.filter((appointment) => {
          const statusMatch =
            filterStatus === "all" ||
            appointment.state.toLowerCase() === filterStatus.toLowerCase();
          const doctorMatch =
            filterDoctor === "all" ||
            appointment.doctor.doctor_name === filterDoctor;
          const typeMatch =
            filterType === "all" ||
            appointment.service.service_name.toLowerCase() ===
              filterType.toLowerCase();
          const searchMatch = searchTerm
            ? appointment.pet?.pet_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              appointment.doctor?.doctor_name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              (appointment.service?.service_name || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            : true;

          return statusMatch && doctorMatch && typeMatch && searchMatch;
        });
      }, [appointments, filterStatus, filterDoctor, filterType, searchTerm]);

      // Group appointments by status for column view
      const groupedAppointments = useMemo(
        () => ({
          scheduled: filteredAppointments.filter(
            (a) => a.state === "Scheduled"
          ),
          confirmed: filteredAppointments.filter(
            (a) => a.state === "Confirmed"
          ),
          arrived: filteredAppointments.filter(
            (a) => a.state === "Checked In" || a.state === "Waiting"
          ),
          inProgress: filteredAppointments.filter(
            (a) => a.state === "In Progress"
          ),
          completed: filteredAppointments.filter(
            (a) => a.state === "Completed"
          ),
        }),
        [filteredAppointments]
      );

      // Get the selected appointment details
      const selectedAppointment = useMemo(
        () => appointments.find((a) => a.id === selectedAppointmentId),
        [appointments, selectedAppointmentId]
      );

      const { data: patientData } = usePatientData(
        selectedAppointment?.pet?.pet_id.toString() || ""
      );

      // Handle appointment click
      const handleAppointmentClick = useCallback((id: number) => {
        setSelectedAppointmentId(id);
        setSidebarContent("details");
        setShowSidebar(true);
      }, []);

      // Create a single mutation at the component level
      const updateStatusMutation = useMutation({
        mutationFn: (params: { id: number; state_id: number }) =>
          updateAppointmentById(params.id, { state_id: params.state_id }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["appointmentsQueue"] });
        },
        onError: (error) => {
          console.error("Error updating appointment status:", error);
        },
      });

      // Refresh queue when an appointment status changes
      const handleStatusChange = useCallback(
        async (
          appointmentId: number,
          newStatus: number,
          navigateToDetail: boolean = false
        ) => {
          const appointment = appointments.find((a) => a.id === appointmentId);

          if (appointment) {
            try {
              await updateStatusMutation.mutateAsync(
                { id: appointmentId, state_id: newStatus },
                {
                  onSuccess: () => {
                    // Update local state
                    const updatedAppointment = {
                      ...appointment,
                      state_id: newStatus,
                    };
                    onAppointmentUpdate(updatedAppointment);
                  },
                }
              );
              
              // Navigate after successful status update
              if (navigateToDetail) {
                // Include both appointmentId and petId for health card
                const petId = appointment.pet?.pet_id;
                if (petId) {
                  setLocation(`/patient/health-card?appointmentId=${appointmentId}&petId=${petId}`);
                } else {
                  setLocation(`/patient/health-card?appointmentId=${appointmentId}`);
                }
              }
            } catch (error) {
              console.error('Error updating appointment status:', error);
            }
          }
        },
        [appointments, onAppointmentUpdate, setLocation, updateStatusMutation]
      );

      // Refresh queue when an appointment status changes
      const handleCheckIn = useCallback(
        (appointmentId: number) => {
          setLocation(`/appointment/${appointmentId}/check-in`);
        },
        [setLocation]
      );

      // Handle showing new appointment form
      const handleNewAppointment = useCallback(() => {
        setSelectedAppointmentId(null);
        setSidebarContent("new");
        setShowSidebar(true);
      }, []);

      // Memoize the appointment card rendering function
      const renderAppointmentCard = useCallback(
        (appointment: Appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onClick={handleAppointmentClick}
            onStatusChange={handleStatusChange}
            onCheckIn={handleCheckIn}
            formatTime={formatTime}
            getStatusColorClass={getStatusColorClass}
            getTypeColorClass={getTypeColorClass}
            getPriorityColorClass={getPriorityColorClass}
          />
        ),
        [handleAppointmentClick, handleStatusChange, handleCheckIn, formatTime]
      );

      // Thêm hàm để xác định bước workflow hiện tại của cuộc hẹn
      const getCurrentWorkflowStep = (appointment: Appointment) => {
        // Mặc định bắt đầu với patient-details
        let currentStep = "patient-details";

        // Type casting appointment
        const appointmentWithWorkflow =
          appointment as AppointmentWithWorkflowData;

        // Logic đơn giản để xác định bước hiện tại dựa trên trạng thái
        if (appointment.state === "In Progress") {
          // Kiểm tra workflow progress (field mới, giả định tạm)
          if (appointmentWithWorkflow.workflow_progress) {
            currentStep = appointmentWithWorkflow.workflow_progress;
          } else if (
            appointmentWithWorkflow.lab_results &&
            appointmentWithWorkflow.lab_results.length > 0
          ) {
            currentStep = "diagnostic";
          } else if (
            appointmentWithWorkflow.soap_note &&
            appointmentWithWorkflow.soap_note.length > 0
          ) {
            currentStep = "soap";
          } else {
            currentStep = "examination";
          }
        }

        return currentStep;
      };

      // Thêm hàm để xác định label của bước workflow hiện tại
      const getWorkflowStepLabel = (step: string) => {
        switch (step) {
          case "patient-details":
            return "Patient Details";
          case "examination":
            return "Clinical Examination";
          case "soap":
            return "SOAP Note";
          case "diagnostic":
            return "Diagnostic";
          case "treatment":
            return "Treatment";
          case "prescription":
            return "Prescription";
          case "follow-up":
            return "Follow-up";
          default:
            return "Patient Details";
        }
      };

      // Thêm hàm để xác định icon của bước workflow hiện tại
      const getWorkflowStepIcon = (step: string) => {
        switch (step) {
          case "examination":
            return <Stethoscope className="h-4 w-4 mr-2" />;
          case "soap":
            return <FileText className="h-4 w-4 mr-2" />;
          case "diagnostic":
            return <FlaskConical className="h-4 w-4 mr-2" />;
          case "treatment":
            return <Tablets className="h-4 w-4 mr-2" />;
          case "prescription":
            return <Receipt className="h-4 w-4 mr-2" />;
          case "follow-up":
            return <CalendarClock className="h-4 w-4 mr-2" />;
          default:
            return <UserCircle className="h-4 w-4 mr-2" />;
        }
      };

      const handleCompleteAppointment = (appointmentId: number) => {
        // Cập nhật trạng thái thành "Completed"
        handleStatusChange(appointmentId, 6, false);
      };

      return (
        <div className="flex flex-col h-screen max-w-full w-full overflow-hidden bg-[#F9FAFB]">
          {/* Enhanced Toolbar */}
          <div className="bg-white border-b border-gray-100 shadow-sm">
            <div className="px-6 py-4">
              {/* Top row - Date navigation and title */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </h2>
                  <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                    <button
                      onClick={onPreviousDay}
                      className="p-2 text-gray-600 hover:bg-white hover:text-[#2C78E4] hover:shadow-sm rounded-l-xl transition-all duration-200"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={onToday}
                      className="px-4 py-2 text-gray-600 hover:bg-white hover:text-[#2C78E4] hover:shadow-sm transition-all duration-200 flex items-center border-x border-gray-200"
                    >
                      <Calendar size={16} className="mr-2" />
                      <span className="text-sm font-medium">Today</span>
                    </button>
                    <button
                      onClick={onNextDay}
                      className="p-2 text-gray-600 hover:bg-white hover:text-[#2C78E4] hover:shadow-sm rounded-r-xl transition-all duration-200"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* View mode toggle */}
                <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                  <button
                    className={cn(
                      "px-4 py-2 text-sm font-medium flex items-center rounded-lg transition-all duration-200",
                      viewMode === "columns"
                        ? "bg-[#2C78E4] text-white shadow-sm"
                        : "text-gray-600 hover:bg-white hover:text-[#2C78E4]"
                    )}
                    onClick={() => setViewMode("columns")}
                  >
                    <Columns size={16} className="mr-2" />
                    Columns
                  </button>
                  <button
                    className={cn(
                      "px-4 py-2 text-sm font-medium flex items-center rounded-lg transition-all duration-200",
                      viewMode === "list"
                        ? "bg-[#2C78E4] text-white shadow-sm"
                        : "text-gray-600 hover:bg-white hover:text-[#2C78E4]"
                    )}
                    onClick={() => setViewMode("list")}
                  >
                    <List size={16} className="mr-2" />
                    List
                  </button>
                </div>
              </div>

              {/* Bottom row - Search and filters */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C78E4]/20 focus:border-[#2C78E4] transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                  <select
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C78E4]/20 focus:border-[#2C78E4] transition-colors"
                    value={filterDoctor}
                    onChange={(e) => setFilterDoctor(e.target.value)}
                  >
                    <option value="all">All Doctors</option>
                    {doctors?.map((doctor: any) => (
                      <option key={doctor.doctor_id} value={doctor.doctor_name}>
                        Dr. {doctor.doctor_name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2C78E4]/20 focus:border-[#2C78E4] transition-colors"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked in">Checked In</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  {/* Sidebar toggle */}
                  <button
                    className="p-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#2C78E4] hover:border-[#2C78E4]/30 transition-all duration-200"
                    onClick={() => setShowSidebar(!showSidebar)}
                  >
                    {showSidebar ? (
                      <PanelRightClose size={18} />
                    ) : (
                      <PanelRight size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Appointments Area */}
            <div
              className={cn(
                "flex-1 overflow-hidden transition-all duration-300",
                showSidebar ? "w-2/3" : "w-full"
              )}
            >
              {/* Column View (Enhanced Kanban) */}
              {viewMode === "columns" && (
                <div className="h-full overflow-x-auto bg-[#F9FAFB]">
                  <div className="flex gap-6 h-full p-6 min-w-max">
                    {/* Scheduled Column */}
                    <div className="flex-1 min-w-[280px] max-w-[320px]">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800 flex items-center">
                              <Calendar className="h-4 w-4 text-[#2C78E4] mr-2" />
                              Scheduled
                            </h3>
                            <span className="bg-[#2C78E4]/10 text-[#2C78E4] text-xs font-semibold px-2.5 py-1 rounded-full">
                              {groupedAppointments.scheduled.length}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                          {groupedAppointments.scheduled.length > 0 ? (
                            groupedAppointments.scheduled.map((appointment) =>
                              renderAppointmentCard(appointment)
                            )
                          ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <div className="text-sm font-medium">No scheduled appointments</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Confirmed Column */}
                    <div className="flex-1 min-w-[280px] max-w-[320px]">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB]/30">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-[#1976D2] flex items-center">
                              <CheckCircle className="h-4 w-4 text-[#1976D2] mr-2" />
                              Confirmed
                            </h3>
                            <span className="bg-[#1976D2]/10 text-[#1976D2] text-xs font-semibold px-2.5 py-1 rounded-full">
                              {groupedAppointments.confirmed.length}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                          {groupedAppointments.confirmed.length > 0 ? (
                            groupedAppointments.confirmed.map((appointment) =>
                              renderAppointmentCard(appointment)
                            )
                          ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <div className="text-sm font-medium">No confirmed appointments</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Waiting Column */}
                    <div className="flex-1 min-w-[280px] max-w-[320px]">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#EBF5FF] to-[#DBEAFE]/30">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-[#1E40AF] flex items-center">
                              <Clock className="h-4 w-4 text-[#2C78E4] mr-2" />
                              Waiting
                            </h3>
                            <span className="bg-[#2C78E4]/10 text-[#2C78E4] text-xs font-semibold px-2.5 py-1 rounded-full">
                              {groupedAppointments.arrived.length}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                          {groupedAppointments.arrived.length > 0 ? (
                            groupedAppointments.arrived.map((appointment) =>
                              renderAppointmentCard(appointment)
                            )
                          ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <div className="text-sm font-medium">No patients waiting</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="flex-1 min-w-[280px] max-w-[320px]">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#F3E8FF] to-[#E9D5FF]/30">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-[#6B21A8] flex items-center">
                              <Stethoscope className="h-4 w-4 text-[#7C3AED] mr-2" />
                              In Progress
                            </h3>
                            <span className="bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-semibold px-2.5 py-1 rounded-full">
                              {groupedAppointments.inProgress.length}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                          {groupedAppointments.inProgress.length > 0 ? (
                            groupedAppointments.inProgress.map((appointment) =>
                              renderAppointmentCard(appointment)
                            )
                          ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                              <Stethoscope className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <div className="text-sm font-medium">No appointments in progress</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Completed Column */}
                    <div className="flex-1 min-w-[280px] max-w-[320px]">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#ECFDF5] to-[#A7F3D0]/30">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-[#065F46] flex items-center">
                              <CheckCircle className="h-4 w-4 text-[#10B981] mr-2" />
                              Completed
                            </h3>
                            <span className="bg-[#10B981]/10 text-[#10B981] text-xs font-semibold px-2.5 py-1 rounded-full">
                              {groupedAppointments.completed.length}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                          {groupedAppointments.completed.length > 0 ? (
                            groupedAppointments.completed.map((appointment) =>
                              renderAppointmentCard(appointment)
                            )
                          ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <div className="text-sm font-medium">No completed appointments</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="h-full overflow-auto p-6 bg-[#F9FAFB]">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Time
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Service
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Doctor
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredAppointments
                            .sort((a, b) => {
                              // Sort by time
                              const timeA = a.time_slot.start_time;
                              const timeB = b.time_slot.start_time;
                              return timeA.localeCompare(timeB);
                            })
                            .map((appointment) => (
                              <tr
                                key={appointment.id}
                                className={cn(
                                  "hover:bg-gray-50 cursor-pointer transition-colors",
                                  selectedAppointmentId === appointment.id && "bg-[#2C78E4]/5"
                                )}
                                onClick={() => handleAppointmentClick(appointment.id)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {!appointment.time_slot ||
                                    !appointment.time_slot.start_time ||
                                    appointment.time_slot.start_time === "00:00" ? (
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                        <span>Walk-in</span>
                                      </div>
                                    ) : (
                                      `${formatTime(appointment.time_slot.start_time)} - ${formatTime(appointment.time_slot.end_time)}`
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#2C78E4]/10 flex items-center justify-center mr-3">
                                      <PawPrint className="h-4 w-4 text-[#2C78E4]" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-gray-900">
                                        {appointment.pet.pet_name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {appointment.pet.pet_breed}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-full",
                                    getTypeColorClass(appointment.service.service_name)
                                  )}>
                                    {appointment.service.service_name}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  Dr. {appointment.doctor.doctor_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-full",
                                    getStatusColorClass(appointment.state)
                                  )}>
                                    {appointment.state}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <button
                                    className="text-[#2C78E4] hover:text-[#2C78E4]/80 text-sm font-medium"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAppointmentClick(appointment.id);
                                    }}
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredAppointments.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <div className="text-lg font-medium">No appointments found</div>
                        <div className="text-sm">Try adjusting your filters or search criteria</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            {showSidebar && (
              <div className="border-l border-gray-200 bg-white w-1/3 min-w-[360px] max-w-[420px] flex flex-col overflow-hidden shadow-sm">
                {/* Sidebar Header */}
                <div className="bg-white border-b border-gray-100 px-4 py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          sidebarContent === "queue"
                            ? "bg-[#2C78E4] text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-[#2C78E4]"
                        )}
                        onClick={() => setSidebarContent("queue")}
                      >
                        <Users size={18} />
                      </button>
                      <span className="text-sm font-medium text-gray-700">
                        {sidebarContent === "queue" ? "Patient Queue" : "Appointment Details"}
                      </span>
                    </div>
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setShowSidebar(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
                  {sidebarContent === "queue" && (
                    <div className="p-4">
                      <div className="mb-4 flex justify-between items-center">
                        <h4 className="font-semibold text-lg flex items-center text-gray-900">
                          <Clock className="h-5 w-5 text-[#2C78E4] mr-2" />
                          Waiting Queue
                        </h4>
                        <span className="bg-[#2C78E4] text-white text-sm px-3 py-1 rounded-full font-medium">
                          {queueData?.length || 0}
                        </span>
                      </div>

                      {queueData?.length > 0 ? (
                        <div className="space-y-4">
                          {queueData
                            .sort((a: QueueItem, b: QueueItem) => {
                              if (
                                a.priority === "high" &&
                                b.priority !== "high"
                              )
                                return -1;
                              if (
                                a.priority !== "high" &&
                                b.priority === "high"
                              )
                                return 1;
                              return (a.position || 0) - (b.position || 0);
                            })
                            .map((queueItem: QueueItem) => {
                              // Find matching appointment
                              const appointment = appointments.find(
                                (a) => a.id === queueItem.id
                              );

                              // If no matching appointment is found, create a fallback display with queue data
                              if (!appointment) {
                                return (
                                  <div
                                    key={queueItem.id}
                                    className={cn(
                                      "rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md border",
                                      queueItem.priority === "high" ||
                                      queueItem.priority === "Urgent"
                                        ? "border-red-200 bg-red-50"
                                        : "border-gray-200 bg-white"
                                    )}
                                  >
                                    <div className={cn(
                                      "px-4 py-3 flex justify-between items-center",
                                      queueItem.priority === "high" ||
                                      queueItem.priority === "Urgent"
                                        ? "bg-gradient-to-r from-red-100 to-red-50 border-b border-red-200"
                                        : "bg-gradient-to-r from-gray-50 to-white border-b border-gray-100"
                                    )}>
                                      <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-[#2C78E4]/10 flex items-center justify-center mr-3">
                                          <PawPrint className="h-5 w-5 text-[#2C78E4]" />
                                        </div>
                                        <div>
                                          <div className="font-semibold text-gray-900">
                                            {queueItem.patientName}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {queueItem.appointmentType}
                                          </div>
                                        </div>
                                      </div>
                                      <span
                                        className={cn(
                                          "text-xs px-2.5 py-1 rounded-full flex items-center font-medium",
                                          getPriorityColorClass(queueItem.priority)
                                        )}
                                      >
                                        <Flag className="h-3 w-3 mr-1" />
                                        {queueItem.priority
                                          ? queueItem.priority
                                              .charAt(0)
                                              .toUpperCase() +
                                            queueItem.priority.slice(1)
                                          : "Normal"}
                                      </span>
                                    </div>

                                    <div className="p-4">
                                      <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                                          <div className="text-xs text-gray-500 mb-1">
                                            Doctor
                                          </div>
                                          <div className="text-sm font-semibold text-gray-900">
                                            {queueItem.doctor || "Not assigned"}
                                          </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                                          <div className="text-xs text-gray-500 mb-1">
                                            Waiting
                                          </div>
                                          <div
                                            className={cn(
                                              "text-sm font-semibold",
                                              queueItem.actualWaitTime > "15 min"
                                                ? "text-red-600"
                                                : "text-gray-900"
                                            )}
                                          >
                                            {queueItem.actualWaitTime || "0 min"}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex justify-end">
                                        <button
                                          className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-[#7C3AED]/90 flex items-center font-medium shadow-sm transition-colors"
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (queueItem && queueItem.id) {
                                              await handleStatusChange(
                                                queueItem.id,
                                                statusIds.in_progress,
                                                true
                                              );
                                            }
                                          }}
                                        >
                                          <Play className="h-4 w-4 mr-2" />
                                          Start Exam
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={queueItem.id}
                                  className={cn(
                                    "rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md border",
                                    queueItem.priority === "high" ||
                                    queueItem.priority === "Urgent"
                                      ? "border-red-200 bg-red-50"
                                      : "border-gray-200 bg-white"
                                  )}
                                >
                                  <div className={cn(
                                    "px-4 py-3 flex justify-between items-center",
                                    queueItem.priority === "high" ||
                                    queueItem.priority === "Urgent"
                                      ? "bg-gradient-to-r from-red-100 to-red-50 border-b border-red-200"
                                      : "bg-gradient-to-r from-gray-50 to-white border-b border-gray-100"
                                  )}>
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 rounded-full bg-[#2C78E4]/10 flex items-center justify-center mr-3">
                                        <PawPrint className="h-5 w-5 text-[#2C78E4]" />
                                      </div>
                                      <div>
                                        <div className="font-semibold text-gray-900">
                                          {queueItem.patientName}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {queueItem.appointmentType}
                                        </div>
                                      </div>
                                    </div>
                                    <span
                                      className={cn(
                                        "text-xs px-2.5 py-1 rounded-full flex items-center font-medium",
                                        getPriorityColorClass(queueItem.priority)
                                      )}
                                    >
                                      <Flag className="h-3 w-3 mr-1" />
                                      {queueItem.priority
                                        ? queueItem.priority
                                            .charAt(0)
                                            .toUpperCase() +
                                          queueItem.priority.slice(1)
                                        : "Normal"}
                                    </span>
                                  </div>

                                  <div className="p-4">
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <div className="text-xs text-gray-500 mb-1">
                                          Doctor
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">
                                          Dr. {appointment.doctor.doctor_name}
                                        </div>
                                      </div>
                                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <div className="text-xs text-gray-500 mb-1">
                                          Waiting
                                        </div>
                                        <div
                                          className={cn(
                                            "text-sm font-semibold",
                                            queueItem.actualWaitTime > "15 min"
                                              ? "text-red-600"
                                              : "text-gray-900"
                                          )}
                                        >
                                          {queueItem.actualWaitTime || "0 min"}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex justify-end">
                                      <button
                                        className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-[#7C3AED]/90 flex items-center font-medium shadow-sm transition-colors"
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (queueItem && queueItem.id) {
                                            await handleStatusChange(
                                              queueItem.id,
                                              statusIds.in_progress,
                                              true
                                            );
                                          }
                                        }}
                                      >
                                        <Play className="h-4 w-4 mr-2" />
                                        Start Exam
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <div className="text-gray-600 font-medium text-lg mb-2">
                            No patients waiting
                          </div>
                          <div className="text-gray-500 text-sm">
                            Waiting queue is empty
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {sidebarContent === "details" && selectedAppointment && (
                    <div className="p-4">
                      {/* Patient Info */}
                      <div className="mb-6 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-start">
                          <div className="relative">
                            <div className="flex items-start">
                              <div className="relative h-16 w-16 rounded-xl mr-4 border-2 border-[#2C78E4]/20 overflow-hidden bg-gradient-to-br from-[#2C78E4]/10 to-[#2C78E4]/5">
                                {patientData?.data_image ? (
                                  <img
                                    src={`data:image/png;base64,${patientData.data_image}`}
                                    alt={selectedAppointment.pet.pet_name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full w-full">
                                    <PawPrint className="h-8 w-8 text-[#2C78E4]/40" />
                                  </div>
                                )}
                                {selectedAppointment.priority === "urgent" && (
                                  <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                                    <AlertCircle size={12} className="text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-xl text-gray-900">
                                  {selectedAppointment.pet.pet_name}
                                </h3>
                                <div className="text-sm text-gray-600 flex items-center mt-1">
                                  <PawPrint className="h-4 w-4 text-gray-400 mr-1" />
                                  {selectedAppointment.pet.pet_breed}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="bg-white p-5 rounded-xl mb-6 shadow-sm border border-gray-100">
                        <h4 className="font-semibold mb-4 flex justify-between items-center">
                          <span className="flex items-center text-gray-900">
                            <Calendar className="h-5 w-5 text-[#2C78E4] mr-2" />
                            Appointment Details
                          </span>
                          {(!selectedAppointment.time_slot ||
                            !selectedAppointment.time_slot.start_time ||
                            selectedAppointment.time_slot.start_time ===
                              "00:00:00") && (
                            <span className="text-xs flex items-center bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg font-medium">
                              <UserPlus className="h-3 w-3 mr-1" />
                              Walk-in
                            </span>
                          )}
                        </h4>

                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-[#2C78E4]/5 to-[#2C78E4]/10 p-4 rounded-xl border border-[#2C78E4]/20">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-[#2C78E4] font-medium mb-1">
                                  Service
                                </div>
                                <div className="font-semibold text-gray-900">
                                  {selectedAppointment.service.service_name}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-[#2C78E4] font-medium mb-1">
                                  Status
                                </div>
                                <div className="text-sm">
                                  <span
                                    className={cn(
                                      "inline-block px-3 py-1 text-xs rounded-full font-medium",
                                      getStatusColorClass(selectedAppointment.state)
                                    )}
                                  >
                                    {selectedAppointment.state}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-xs text-gray-500 font-medium mb-1">Time</div>
                              <div className="font-semibold text-gray-900">
                                {!selectedAppointment.time_slot ||
                                !selectedAppointment.time_slot.start_time ||
                                selectedAppointment.time_slot.start_time ===
                                  "00:00:00" ? (
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-orange-500" />
                                    <span>
                                      {selectedAppointment.created_at
                                        ? format(
                                            new Date(
                                              selectedAppointment.created_at
                                            ),
                                            "h:mm a"
                                          )
                                        : "Today"}
                                    </span>
                                  </div>
                                ) : (
                                  `${formatTime(
                                    selectedAppointment.time_slot.start_time
                                  )} - ${formatTime(
                                    selectedAppointment.time_slot.end_time
                                  )}`
                                )}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-xs text-gray-500 font-medium mb-1">
                                Duration
                              </div>
                              <div className="font-semibold text-gray-900">
                                {selectedAppointment.service.service_duration} min
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-xs text-gray-500 font-medium mb-1">
                                Doctor
                              </div>
                              <div className="font-semibold text-gray-900 flex items-center">
                                <Stethoscope className="h-4 w-4 text-[#2C78E4] mr-1" />
                                Dr. {selectedAppointment.doctor.doctor_name}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-xs text-gray-500 font-medium mb-1">Room</div>
                              <div className="font-semibold text-gray-900">
                                {selectedAppointment.room}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 font-medium mb-2">Reason</div>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-900">
                              {selectedAppointment.reason}
                            </div>
                          </div>

                          {selectedAppointment.priority === "urgent" && (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                              <div className="flex items-start">
                                <AlertCircle
                                  size={18}
                                  className="text-red-600 mt-0.5 mr-3 shrink-0"
                                />
                                <div>
                                  <div className="font-semibold text-red-800">
                                    Medical Alert
                                  </div>
                                  <div className="text-sm text-red-700 mt-1">
                                    Patient needs urgent care
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="font-semibold mb-3 flex items-center text-gray-900">
                          <Play className="h-5 w-5 text-[#2C78E4] mr-2" />
                          Quick Actions
                        </h4>
                        <div className="space-y-3">
                          {/* Primary Actions Row - Complete and Workflow buttons */}
                          {selectedAppointment.state === "In Progress" && (
                            <div className="grid grid-cols-2 gap-3">
                              {/* Complete Button */}
                              <button
                                className="px-4 py-3 bg-[#10B981] text-white text-sm rounded-xl hover:bg-[#10B981]/90 flex items-center justify-center font-medium shadow-sm transition-colors"
                                onClick={() =>
                                  handleStatusChange(selectedAppointment.id, 6)
                                }
                              >
                                <CheckCircle size={16} className="mr-2" />
                                Complete
                              </button>

                              {/* Workflow Step Button */}
                              {!(
                                selectedAppointment.service?.service_name?.toLowerCase() ===
                                  "body grooming" &&
                                getCurrentWorkflowStep(selectedAppointment) ===
                                  "examination"
                              ) && (
                                <button
                                  className="px-4 py-3 bg-[#2C78E4] text-white text-sm rounded-xl hover:bg-[#2C78E4]/90 flex items-center justify-center font-medium shadow-sm transition-colors"
                                  onClick={() => {
                                    const currentStep =
                                      getCurrentWorkflowStep(selectedAppointment);
                                    // Điều hướng đến trang workflow thích hợp
                                    if (currentStep === "patient-details") {
                                      setLocation(
                                        `/appointment/${selectedAppointment.id}/patient/${selectedAppointment.pet?.pet_id}`
                                      );
                                    } else if (currentStep === "examination") {
                                      setLocation(
                                        `/appointment/${selectedAppointment.id}/lab-management`
                                      );
                                    } else if (currentStep === "soap") {
                                      setLocation(
                                        `/appointment/${selectedAppointment.id}/soap`
                                      );
                                    } else if (currentStep === "diagnostic") {
                                      setLocation(
                                        `/appointment/${selectedAppointment.id}/lab-management`
                                      );
                                    } else if (currentStep === "treatment") {
                                      setLocation(
                                        `/appointment/${selectedAppointment.id}/patient/${selectedAppointment.pet?.pet_id}/treatment`
                                      );
                                    } else if (currentStep === "prescription") {
                                      setLocation(
                                        `/appointment/${selectedAppointment.id}/prescription`
                                      );
                                    } else if (currentStep === "follow-up") {
                                      setLocation(
                                        `/appointment/${selectedAppointment.id}/follow-up`
                                      );
                                    } else {
                                      setLocation(
                                        `/appointment/${selectedAppointment.id}`
                                      );
                                    }
                                  }}
                                >
                                  {getWorkflowStepIcon(
                                    getCurrentWorkflowStep(selectedAppointment)
                                  )}
                                  <span className="truncate">
                                    {getWorkflowStepLabel(
                                      getCurrentWorkflowStep(selectedAppointment)
                                    )}
                                  </span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* Secondary Actions */}
                          <div className="grid grid-cols-2 gap-3">
                            {selectedAppointment.state === "Scheduled" && (
                              <button
                                className="px-3 py-2 bg-[#2C78E4] text-white text-sm rounded-lg hover:bg-[#2C78E4]/90 flex items-center justify-center font-medium shadow-sm transition-colors"
                                onClick={() =>
                                  handleCheckIn(selectedAppointment.id)
                                }
                              >
                                <CheckCircle size={16} className="mr-2" />
                                Check-in
                              </button>
                            )}

                            {selectedAppointment.state === "Confirmed" && (
                              <button
                                className="px-3 py-2 bg-[#2C78E4] text-white text-sm rounded-lg hover:bg-[#2C78E4]/90 flex items-center justify-center font-medium shadow-sm transition-colors"
                                onClick={() =>
                                  handleCheckIn(selectedAppointment.id)
                                }
                              >
                                <CheckCircle size={16} className="mr-2" />
                                Check-in
                              </button>
                            )}

                            {selectedAppointment.state === "Checked In" && (
                              <button
                                className="px-3 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-[#7C3AED]/90 flex items-center justify-center font-medium shadow-sm transition-colors"
                                onClick={() =>
                                  handleStatusChange(selectedAppointment.id, 5, true)
                                }
                              >
                                <Play size={16} className="mr-2" />
                                {selectedAppointment.service?.service_name?.toLowerCase() ===
                                "body grooming"
                                  ? "Start Service"
                                  : "Start Exam"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  );

export default EnhancedAppointmentFlowboard;
