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
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});



// Memoized color utility functions
const getStatusColorClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-[#E3F2FD] text-[#1976D2]";
    case "checked in":
      return "bg-[#2C78E4] text-white";
    case "in progress":
      return "bg-[#7C3AED] text-white";
    case "waiting":
      return "bg-[#FDD835] text-[#594D26]";
    case "completed":
      return "bg-[#4CAF50] text-white";
    case "scheduled":
      return "bg-[#E3F2FD] text-[#1976D2]";
    case "cancelled":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-200 text-gray-800";
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
      return "bg-[#FFEBEE] text-[#C62828]";
    case "high":
      return "bg-[#FFF3E0] text-[#E65100]";
    case "medium":
      return "bg-[#FFF8E1] text-[#F57F17]";
    case "low":
      return "bg-[#E8F5E9] text-[#2E7D32]";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Memoized appointment card component to prevent unnecessary re-renders
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

    // Handle start exam button click
    const handleStartExam = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onStatusChange(appointment.id, 5, true); // Update status and navigate to patient info
      },
      [appointment.id, onStatusChange]
    );

    // Format date for display
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });
    };

    // Generate random tasks count for demo
    const tasksTotal = Math.floor(Math.random() * 5) + 1;
    const tasksCompleted = Math.floor(Math.random() * tasksTotal);

    // Get service type color class
    const getServiceBgColor = () => {
      const serviceName = appointment.service?.service_name?.toLowerCase();

      if (serviceName?.includes("radiology")) return "bg-[#E3F2FD]";
      if (serviceName?.includes("check-up")) return "bg-[#E8F5E9]";
      if (serviceName?.includes("surgery")) return "bg-[#FFEBEE]";
      if (serviceName?.includes("lab")) return "bg-[#F3E5F5]";
      if (serviceName?.includes("dental")) return "bg-[#FFF8E1]";
      if (serviceName?.includes("grooming")) return "bg-[#FFF3E0]";

      return "bg-[#F0F7FF]"; // Default
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
        className={`${getServiceBgColor()} rounded-xl shadow-sm border border-gray-100 p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer`}
        onClick={handleClick}
      >
        {/* Service type and time */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <span className={`text-sm font-medium ${getServiceTextColor()}`}>
              {appointment.service?.service_name || "Service"}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(appointment.date || "")}
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-between items-center mb-4">
          <button
            className={`text-sm px-3 py-1.5 border rounded-lg ${
              appointment.state === "Checked In" ||
              appointment.state === "Waiting"
                ? "bg-[#2C78E4] text-white border-[#2C78E4] hover:bg-[#2C78E4]/90"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (
                appointment.state === "Checked In" ||
                appointment.state === "Waiting"
              ) {
                handleStartExam(e);
              }
            }}
          >
            {appointment.state === "Checked In" ||
            appointment.state === "Waiting"
              ? appointment.service?.service_name?.toString() ===
                "Body Grooming"
                ? "Start Service"
                : "Start Exam"
              : appointment.state === "In Progress"
              ? "In Progress"
              : "Check out"}
          </button>
          <div className="text-sm font-medium text-gray-700">
            {formatTime(appointment.time_slot?.start_time || "")}
          </div>
        </div>

        {/* People section with avatars */}
        <div className="flex items-center gap-1.5 mt-5 border-t pt-3 border-gray-200">
          <div className="w-6 h-6 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] text-xs font-medium border border-white z-10">
            {appointment.pet?.pet_name?.substring(0, 1) || "P"}
          </div>
          <div className="w-6 h-6 rounded-full bg-[#E3F2FD] flex items-center justify-center text-[#1565C0] text-xs font-medium border border-white z-0 -ml-2">
            {appointment.doctor?.doctor_name?.substring(0, 1) || "D"}
          </div>
          <div className="ml-2 text-xs text-gray-600">
            <div className="font-medium">{appointment.pet?.pet_name}</div>
            <div className="text-gray-500">{appointment.pet?.pet_breed}</div>
          </div>
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

      const queryClient = useQueryClient();

      // Queue data (patients waiting, estimated times)
      const { data: queueData } = useListAppointmentsQueue();

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
        const date = typeof time === "string" ? new Date(time) : time;
        return isNaN(date.getTime()) ? "" : timeFormatter.format(date);
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

          return statusMatch && doctorMatch && typeMatch;
        });
      }, [appointments, filterStatus, filterDoctor, filterType]);

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
        (
          appointmentId: number,
          newStatus: number,
          navigateToDetail: boolean = false
        ) => {
          const appointment = appointments.find((a) => a.id === appointmentId);

          if (appointment) {
            // Use the mutation we defined at the component level
            updateStatusMutation.mutate(
              { id: appointmentId, state_id: newStatus },
              {
                onSuccess: () => {
                  // Update local state
                  const updatedAppointment = {
                    ...appointment,
                    state_id: newStatus,
                  };
                  onAppointmentUpdate(updatedAppointment);
                  if (navigateToDetail) {
                    console.log("Navigating to health card with params:", {
                      appointmentId: appointment.id,
                      petId: appointment.pet?.pet_id,
                    });
                    setLocation(
                      `/patient/health-card?appointmentId=${appointment.id}`
                    );
                    // setLocation(`/examination?appointmentId=${appointment.id}&petId=${appointment.pet?.pet_id}`);
                  }
                },
              }
            );
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
      console.log("Doctors", doctors);

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
        <div className="flex flex-col h-screen max-w-full w-full overflow-x-hidden bg-white">
          {/* Toolbar */}
          <div className="p-3 sm:p-4 bg-white border-b flex flex-wrap justify-between items-center gap-3">
            {/* Date & Calendar Controls */}
            <div className="flex items-center gap-2">
              <div className="whitespace-nowrap text-sm font-medium text-gray-700 mr-1">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </div>
              <div className="flex items-center">
                <button
                  onClick={onPreviousDay}
                  className="p-1.5 rounded-l-lg border border-gray-200 text-gray-600 hover:bg-[#F9FAFB] hover:text-[#2C78E4] hover:border-[#2C78E4]/30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={onToday}
                  className="p-1.5 border-t border-b border-gray-200 text-gray-600 hover:bg-[#F9FAFB] hover:text-[#2C78E4] hover:border-[#2C78E4]/30 flex items-center px-2 transition-colors"
                >
                  <Calendar size={14} className="mr-1" />
                  <span className="text-xs">Today</span>
                </button>
                <button
                  onClick={onNextDay}
                  className="p-1.5 rounded-r-lg border border-gray-200 text-gray-600 hover:bg-[#F9FAFB] hover:text-[#2C78E4] hover:border-[#2C78E4]/30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* View Controls & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex mb-0 mr-0 sm:mr-4">
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className={`px-2 sm:px-3 py-1.5 text-sm font-medium flex items-center ${
                      viewMode === "columns"
                        ? "bg-[#2C78E4] text-white"
                        : "bg-white text-gray-700 hover:bg-[#F9FAFB] hover:text-[#2C78E4]"
                    }`}
                    onClick={() => setViewMode("columns")}
                  >
                    <Columns size={14} className="mr-1" />
                    <span className="hidden sm:inline">Column</span>
                  </button>

                  <button
                    className={`px-2 sm:px-3 py-1.5 text-sm font-medium flex items-center ${
                      viewMode === "list"
                        ? "bg-[#2C78E4] text-white"
                        : "bg-white text-gray-700 hover:bg-[#F9FAFB] hover:text-[#2C78E4]"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <List size={14} className="mr-1" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center">
                <select
                  className="mr-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 focus:border-[#2C78E4] focus:outline-none focus:ring-1 focus:ring-[#2C78E4]"
                  value={filterDoctor}
                  onChange={(e) => setFilterDoctor(e.target.value)}
                >
                  <option value="all">All Doctors</option>
                  {doctors?.map((doctor: any) => (
                    <option key={doctor.doctor_id} value={doctor.doctor_name}>
                      {doctor.doctor_name}
                    </option>
                  ))}
                </select>

                <select
                  className="mr-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 focus:border-[#2C78E4] focus:outline-none focus:ring-1 focus:ring-[#2C78E4]"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="check-up">General Check-up</option>
                  <option value="surgery">Surgery</option>
                  <option value="sick visit">Sick Visit</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="grooming">Grooming</option>
                  <option value="new patient">New Patient</option>
                </select>

                {/* Show/Hide Sidebar Button */}
                <div className="hidden sm:block">
                  <button
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-[#F9FAFB] hover:text-[#2C78E4] hover:border-[#2C78E4]/30 transition-colors"
                    onClick={() => setShowSidebar(!showSidebar)}
                  >
                    {showSidebar ? (
                      <PanelRightClose size={16} />
                    ) : (
                      <PanelRight size={16} />
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
              className={`flex-1 overflow-y-auto overflow-x-hidden bg-[#F9FAFB] transition-all duration-300 ${
                showSidebar ? "w-3/5 lg:w-2/3" : "w-full"
              }`}
            >
              {/* Appointments View - Column View (Kanban style) */}
              {viewMode === "columns" && (
                <div className="px-2 sm:px-4 flex gap-3 sm:gap-4 h-[calc(100vh-150px)] pb-24 overflow-x-auto">
                  {" "}
                  {/* Scheduled Column */}
                  <div className="flex-1 min-w-[230px] sm:min-w-[250px] max-w-[450px] shrink-0">
                    <div className="bg-[#F9FAFB] rounded-t-lg px-3 py-2 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-800 flex items-center">
                          <Calendar className="h-4 w-4 text-[#2C78E4] mr-1.5" />
                          Scheduled
                        </h3>
                        <span className="bg-white text-xs font-medium px-2 py-1 rounded-lg border border-gray-200 text-[#2C78E4]">
                          {groupedAppointments.scheduled.length}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-b-lg p-2 border-l border-r border-b border-gray-200 h-[calc(100vh-280px)] overflow-y-auto">
                      {groupedAppointments.scheduled.length > 0 ? (
                        groupedAppointments.scheduled.map((appointment) =>
                          renderAppointmentCard(appointment)
                        )
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-[#F9FAFB] rounded-lg mt-2 border border-dashed border-gray-200">
                          <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          No appointments scheduled
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Confirmed Column */}
                  <div className="flex-1 min-w-[230px] sm:min-w-[250px] max-w-[450px] shrink-0">
                    <div className="bg-[#E3F2FD] rounded-t-lg px-3 py-2 border border-[#BFDBFE]">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-[#1976D2] flex items-center">
                          <CheckCircle className="h-4 w-4 text-[#1976D2] mr-1.5" />
                          Confirmed
                        </h3>
                        <span className="bg-white text-xs font-medium px-2 py-1 rounded-lg border border-[#BFDBFE] text-[#1976D2]">
                          {groupedAppointments.confirmed.length}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-b-lg p-2 border-l border-r border-b border-[#BFDBFE] h-[calc(100vh-280px)] overflow-y-auto">
                      {groupedAppointments.confirmed.length > 0 ? (
                        groupedAppointments.confirmed.map((appointment) =>
                          renderAppointmentCard(appointment)
                        )
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-[#F9FAFB] rounded-lg mt-2 border border-dashed border-gray-200">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          No confirmed appointments
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Arrived/Waiting Column */}
                  <div className="flex-1 min-w-[230px] sm:min-w-[250px] max-w-[450px] shrink-0">
                    <div className="bg-[#EBF5FF] rounded-t-lg px-3 py-2 border border-[#BFDBFE]">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-[#1E40AF] flex items-center">
                          <Clock className="h-4 w-4 text-[#2C78E4] mr-1.5" />
                          Waiting
                        </h3>
                        <span className="bg-white text-xs font-medium px-2 py-1 rounded-lg border border-[#BFDBFE] text-[#2C78E4]">
                          {groupedAppointments.arrived.length}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-b-lg p-2 border-l border-r border-b border-[#BFDBFE] h-[calc(100vh-280px)] overflow-y-auto">
                      {groupedAppointments.arrived.length > 0 ? (
                        groupedAppointments.arrived.map((appointment) =>
                          renderAppointmentCard(appointment)
                        )
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-[#F9FAFB] rounded-lg mt-2 border border-dashed border-gray-200">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          No patients waiting
                        </div>
                      )}
                    </div>
                  </div>
                  {/* In Progress Column */}
                  <div className="flex-1 min-w-[230px] sm:min-w-[250px] max-w-[450px] shrink-0">
                    <div className="bg-[#F3E8FF] rounded-t-lg px-3 py-2 border border-[#E9D5FF]">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-[#6B21A8] flex items-center">
                          <Stethoscope className="h-4 w-4 text-[#7C3AED] mr-1.5" />
                          In Progress
                        </h3>
                        <span className="bg-white text-xs font-medium px-2 py-1 rounded-lg border border-[#E9D5FF] text-[#7C3AED]">
                          {groupedAppointments.inProgress.length}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-b-lg p-2 border-l border-r border-b border-[#E9D5FF] h-[calc(100vh-280px)] overflow-y-auto">
                      {groupedAppointments.inProgress.length > 0 ? (
                        groupedAppointments.inProgress.map((appointment) =>
                          renderAppointmentCard(appointment)
                        )
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-[#F9FAFB] rounded-lg mt-2 border border-dashed border-gray-200">
                          <Stethoscope className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          No appointments in progress
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Completed Column */}
                  <div className="flex-1 min-w-[230px] sm:min-w-[250px] max-w-[450px] shrink-0">
                    <div className="bg-[#ECFDF5] rounded-t-lg px-3 py-2 border border-[#A7F3D0]">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-[#065F46] flex items-center">
                          <CheckCircle className="h-4 w-4 text-[#10B981] mr-1.5" />
                          Completed
                        </h3>
                        <span className="bg-white text-xs font-medium px-2 py-1 rounded-lg border border-[#A7F3D0] text-[#10B981]">
                          {groupedAppointments.completed.length}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-b-lg p-2 border-l border-r border-b border-[#A7F3D0] h-[calc(100vh-280px)] overflow-y-auto">
                      {groupedAppointments.completed.length > 0 ? (
                        groupedAppointments.completed.map((appointment) =>
                          renderAppointmentCard(appointment)
                        )
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-[#F9FAFB] rounded-lg mt-2 border border-dashed border-gray-200">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          No completed appointments
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline View */}
              {viewMode === "timeline" && (
                <div className="p-2 sm:p-4">
                  <div className="bg-white rounded-lg shadow">
                    <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-240px)]">
                      <table className="min-w-full table-fixed">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 border-r w-36 sm:w-52">
                              Resource
                            </th>
                            {Array.from({ length: 9 }).map((_, index) => {
                              const hour = index + 8; // 8 AM to 5 PM
                              return (
                                <th
                                  key={index}
                                  className="px-4 py-2 border-r text-center w-32 md:w-40"
                                >
                                  {hour <= 12
                                    ? `${hour} AM`
                                    : `${hour - 12} PM`}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {doctors.map((doctor) => (
                            <tr
                              key={doctor.doctor_id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-2 whitespace-nowrap border-r bg-gray-50 font-medium">
                                {doctor.doctor_name}
                              </td>
                              <td colSpan={9} className="relative">
                                <div className="h-16 md:h-20 relative">
                                  {filteredAppointments
                                    .filter(
                                      (app) =>
                                        app.doctor.doctor_id ===
                                        doctor.doctor_id
                                    )
                                    .map((app) => {
                                      // Parse time to position it properly - simplified here
                                      const startHour = parseInt(
                                        app.time_slot.start_time.split(":")[0]
                                      );
                                      const startPosition =
                                        (startHour - 8) * 100 + "%";
                                      const width =
                                        (app.service.service_duration / 60) *
                                          100 +
                                        "%";

                                      return (
                                        <div
                                          key={app.id}
                                          className={`absolute top-1 h-14 md:h-18 rounded ${getStatusColorClass(
                                            app.state
                                          )} px-2 py-1 cursor-pointer text-xs shadow-sm border border-gray-200 overflow-hidden hover:z-10 hover:shadow-md transition-shadow`}
                                          style={{
                                            left: startPosition,
                                            width: width,
                                          }}
                                          onClick={() =>
                                            handleAppointmentClick(app.id)
                                          }
                                        >
                                          <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                            {app.pet.pet_name}
                                          </div>
                                          <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                                            {app.service.service_name}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </td>
                            </tr>
                          ))}

                          {rooms.map((room) => (
                            <tr key={room.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap border-r bg-gray-50 font-medium">
                                {room.name}
                              </td>
                              <td colSpan={9} className="relative">
                                <div className="h-16 md:h-20 relative">
                                  {filteredAppointments
                                    .filter((app) => app.room === room.name)
                                    .map((app) => {
                                      // Parse time to position it properly - simplified here
                                      const startHour = parseInt(
                                        app.time_slot.start_time.split(":")[0]
                                      );
                                      const startPosition =
                                        (startHour - 8) * 100 + "%";
                                      const width =
                                        (app.service.service_duration / 60) *
                                          100 +
                                        "%";

                                      return (
                                        <div
                                          key={app.id}
                                          className={`absolute top-1 h-14 md:h-18 rounded ${getStatusColorClass(
                                            app.state
                                          )} px-2 py-1 cursor-pointer text-xs shadow-sm border border-gray-200 overflow-hidden hover:z-10 hover:shadow-md transition-shadow`}
                                          style={{
                                            left: startPosition,
                                            width: width,
                                          }}
                                          onClick={() =>
                                            handleAppointmentClick(app.id)
                                          }
                                        >
                                          <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                            {app.pet.pet_name}
                                          </div>
                                          <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                                            {app.service.service_name}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="p-4">
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Time
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Patient
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Service
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Doctor
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Room
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
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
                                className={`hover:bg-gray-50 cursor-pointer ${
                                  selectedAppointmentId === appointment.id
                                    ? "bg-indigo-50"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleAppointmentClick(appointment.id)
                                }
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {!appointment.time_slot ||
                                    !appointment.time_slot.start_time ||
                                    appointment.time_slot.start_time ===
                                      "00:00" ? (
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1 text-orange-500" />
                                        <span>
                                          {appointment.created_at
                                            ? format(
                                                new Date(
                                                  appointment.created_at
                                                ),
                                                "h:mm a"
                                              )
                                            : "Today"}
                                        </span>
                                      </div>
                                    ) : (
                                      `${formatTime(
                                        appointment.time_slot.start_time
                                      )} - ${formatTime(
                                        appointment.time_slot.end_time
                                      )}`
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {!appointment.time_slot ||
                                    !appointment.time_slot.start_time ||
                                    appointment.time_slot.start_time ===
                                      "00:00" ? (
                                      <span className="text-orange-600 font-medium">
                                        Walk-in
                                      </span>
                                    ) : (
                                      `${appointment.service.service_duration} minutes`
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <img
                                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        appointment.pet.pet_name
                                      )}`}
                                      alt={appointment.pet.pet_name}
                                      className="h-8 w-8 rounded-full mr-2"
                                    />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {appointment.pet.pet_name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {appointment.pet.pet_breed}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getTypeColorClass(
                                      appointment.service.service_name
                                    )}`}
                                  >
                                    {appointment.service.service_name}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {appointment.doctor.doctor_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {appointment.room}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColorClass(
                                      appointment.state
                                    )}`}
                                  >
                                    {appointment.state}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      className="text-indigo-600 hover:text-indigo-900"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAppointmentClick(appointment.id);
                                      }}
                                    >
                                      Details
                                    </button>
                                    <button
                                      className="text-gray-500 hover:text-gray-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsQuickActionsOpen(true);
                                        setSelectedAppointmentId(
                                          appointment.id
                                        );
                                      }}
                                    >
                                      <MoreHorizontal size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredAppointments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No appointments found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions Panel (floating) */}
              {isQuickActionsOpen && selectedAppointmentId && (
                <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 border">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Quick Actions</h3>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setIsQuickActionsOpen(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center"
                      onClick={() => {
                        handleCheckIn(selectedAppointmentId);
                        setIsQuickActionsOpen(false);
                      }}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Check-in
                    </button>

                    <button
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center justify-center"
                      onClick={() => {
                        handleStatusChange(selectedAppointmentId, 6);
                        setIsQuickActionsOpen(false);
                      }}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Completed
                    </button>

                    <button className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50 flex items-center justify-center">
                      <MessageSquare size={14} className="mr-1" />
                      Message
                    </button>

                    <button className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50 flex items-center justify-center">
                      <Edit size={14} className="mr-1" />
                      Edit
                    </button>

                    {/* <button className="px-3 py-1.5 border text-red-600 text-sm rounded hover:bg-red-50 flex items-center justify-center">
                      <XCircle size={14} className="mr-1" />
                      Cancel
                    </button> */}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            {showSidebar && (
              <div className="border-l border-gray-200 bg-white w-2/5 lg:w-1/3 min-w-[350px] max-w-[500px] flex flex-col overflow-hidden">
                {/* Sidebar Header */}
                <div className="p-3 border-b flex justify-between items-center">
                  <button
                    className={`p-2 rounded ${
                      sidebarContent === "queue"
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      setSidebarContent(
                        sidebarContent === "details" ? "queue" : "queue"
                      )
                    }
                  >
                    {sidebarContent === "queue" ? (
                      <FileText size={16} />
                    ) : (
                      <Users size={16} />
                    )}
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setShowSidebar(false)}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto">
                  {sidebarContent === "queue" && (
                    <div className="p-4">
                      <div className="mb-4 flex justify-between items-center">
                        <h4 className="font-medium text-lg flex items-center">
                          <Users className="h-5 w-5 text-indigo-500 mr-2" />
                          Patients waiting
                          <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                            {queueData?.length || 0}
                          </span>
                        </h4>
                        {/* <button className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md flex items-center">
                      <ExternalLink size={12} className="mr-1" />
                      Show waiting screen
                    </button> */}
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
                              return a.position - b.position;
                            })
                            .map((queueItem: QueueItem) => {
                              const appointment = appointments.find(
                                (a) => a.id === queueItem.id
                              );

                              return appointment ? (
                                <div
                                  key={queueItem.id}
                                  className={`border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${
                                    queueItem.priority === "high"
                                      ? "border-red-200 bg-red-50"
                                      : "border-gray-200 bg-white"
                                  }`}
                                >
                                  <div
                                    className={`px-4 py-3 flex justify-between items-center ${
                                      queueItem.priority === "high"
                                        ? "bg-red-100 border-b border-red-200"
                                        : getStatusColorClass(queueItem.status)
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <div>
                                        <div className="font-medium text-sm">
                                          {appointment.pet.pet_name}
                                        </div>
                                        <div className="text-xs opacity-70">
                                          {appointment.pet.pet_breed}
                                        </div>
                                      </div>
                                    </div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full flex items-center ${getPriorityColorClass(
                                        queueItem.priority
                                      )}`}
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

                                  <div className="p-3">
                                    <div className="grid grid-cols-2 gap-2 bg-white rounded-lg p-2 mb-3 shadow-sm">
                                      <div>
                                        <div className="text-gray-500 text-xs">
                                          Doctor
                                        </div>
                                        <div className="text-sm font-medium">
                                          {appointment.doctor.doctor_name}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-gray-500 text-xs">
                                          Service
                                        </div>
                                        <div className="text-sm font-medium">
                                          {appointment.service.service_name}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 bg-white rounded-lg p-2 shadow-sm">
                                      <div>
                                        <div className="text-gray-500 text-xs">
                                          Appointment
                                        </div>
                                        <div className="text-sm font-medium">
                                          {formatTime(
                                            appointment.time_slot.start_time
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-gray-500 text-xs">
                                          Waiting
                                        </div>
                                        <div
                                          className={
                                            queueItem.actualWaitTime > "15 min"
                                              ? "text-red-600 text-sm font-medium"
                                              : "text-sm font-medium"
                                          }
                                        >
                                          {queueItem.waitingSince
                                            ? formatTime(queueItem.waitingSince)
                                            : "0 min"}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-3 flex justify-end space-x-2">
                                      <button
                                        className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 flex items-center shadow-sm"
                                        onClick={() =>
                                          handleStatusChange(
                                            queueItem.id,
                                            5,
                                            true // Navigate to patient details
                                          )
                                        }
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Start Exam
                                        <ArrowRight className="h-3 w-3 ml-1" />
                                      </button>
                                      <button className="px-3 py-1.5 border border-gray-200 text-xs rounded-md hover:bg-gray-50 flex items-center shadow-sm">
                                        <Bell className="h-3 w-3 mr-1" />
                                        Notify
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })}
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                          <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <div className="text-gray-500 font-medium">
                            No patients waiting
                          </div>
                          <div className="text-gray-400 text-sm mt-1">
                            Waiting queue is empty
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {sidebarContent === "details" && selectedAppointment && (
                    <div className="p-4">
                      {/* Patient Info */}
                      <div className="mb-5 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                        <div className="flex items-start">
                          <div className="relative">
                            <img
                              src={`data:image/png;base64,${patientData?.data_image}`}
                              alt={selectedAppointment.pet.pet_name}
                              className="h-16 w-16 rounded-full mr-4 border-2 border-blue-100"
                            />
                            {selectedAppointment.priority === "urgent" && (
                              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                                <AlertCircle size={10} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {selectedAppointment.pet.pet_name}
                            </h3>
                            <div className="text-sm text-gray-600 flex items-center">
                              <PawPrint className="h-3.5 w-3.5 text-gray-400 mr-1" />
                              {selectedAppointment.pet.pet_breed}
                            </div>
                            {/* <div className="mt-1 flex items-center">
                          <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                            <ExternalLink size={14} className="mr-1" />
                            View patient profile
                          </button>
                        </div> */}
                          </div>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="bg-white p-4 rounded-lg mb-4 shadow-sm border border-gray-100">
                        <h4 className="font-medium mb-3 flex justify-between items-center">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 text-indigo-500 mr-1.5" />
                            Appointment Details
                          </span>
                          {(!selectedAppointment.time_slot ||
                            !selectedAppointment.time_slot.start_time ||
                            selectedAppointment.time_slot.start_time ===
                              "00:00:00") && (
                            <span className="text-xs flex items-center bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              <UserPlus className="h-3 w-3 mr-1" />
                              Walk-in
                            </span>
                          )}
                        </h4>

                        <div className="space-y-4">
                          <div className="bg-indigo-50 p-3 rounded-md">
                            <div className="grid grid-cols-2 gap-4 mb-1">
                              <div>
                                <div className="text-xs text-indigo-700">
                                  Service
                                </div>
                                <div className="font-medium text-indigo-900">
                                  {selectedAppointment.service.service_name}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-indigo-700">
                                  Status
                                </div>
                                <div className="text-sm font-medium">
                                  <span
                                    className={`inline-block px-2 py-1 text-xs rounded-full mt-0.5 ${getStatusColorClass(
                                      selectedAppointment.state
                                    )}`}
                                  >
                                    {selectedAppointment.state}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-sm text-gray-500">Time</div>
                              <div className="font-medium">
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
                            <div>
                              <div className="text-sm text-gray-500">
                                Duration
                              </div>
                              <div className="font-medium">
                                {selectedAppointment.service.service_duration}{" "}
                                minutes
                                {/* {(!selectedAppointment.time_slot ||
                              !selectedAppointment.time_slot.start_time ||
                              selectedAppointment.time_slot.start_time ===
                              "00:00:00") && (
                                <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                                  Unscheduled
                                </span>
                              )} */}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-sm text-gray-500">
                                Doctor
                              </div>
                              <div className="font-medium flex items-center">
                                <Stethoscope className="h-4 w-4 text-indigo-500 mr-1" />
                                {selectedAppointment.doctor.doctor_name}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Room</div>
                              <div className="font-medium">
                                {selectedAppointment.room}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-gray-500">Reason</div>
                            <div className="mt-1 bg-gray-50 p-2 rounded text-sm">
                              {selectedAppointment.reason}
                            </div>
                          </div>

                          {selectedAppointment.priority === "urgent" && (
                            <div className="bg-red-50 p-3 rounded">
                              <div className="flex items-start">
                                <AlertCircle
                                  size={16}
                                  className="text-red-600 mt-0.5 mr-2 shrink-0"
                                />
                                <div>
                                  <div className="font-medium text-red-800">
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
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <h4 className="font-medium mb-3 flex items-center">
                          <Play className="h-4 w-4 text-indigo-500 mr-1.5" />
                          Quick Actions
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedAppointment.state === "In Progress" &&
                            !(
                              selectedAppointment.service?.service_name?.toLowerCase() ===
                                "body grooming" &&
                              getCurrentWorkflowStep(selectedAppointment) ===
                                "examination"
                            ) && (
                              <button
                                className="w-full px-3 py-2.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 flex items-center justify-center shadow-sm"
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
                                <span className="mx-1">
                                  {getWorkflowStepLabel(
                                    getCurrentWorkflowStep(selectedAppointment)
                                  )}
                                </span>
                                <ArrowRightCircle className="ml-1 h-4 w-4" />
                              </button>
                            )}

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {selectedAppointment.state === "Scheduled" && (
                              <button
                                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center justify-center shadow-sm"
                                onClick={() =>
                                  handleCheckIn(selectedAppointment.id)
                                }
                              >
                                <CheckCircle size={14} className="mr-1.5" />
                                Check-in
                              </button>
                            )}

                            {selectedAppointment.state === "Checked In" && (
                              <button
                                className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 flex items-center justify-center shadow-sm"
                                onClick={() =>
                                  handleStatusChange(selectedAppointment.id, 5)
                                }
                              >
                                <Play size={14} className="mr-1.5" />
                                {selectedAppointment.service?.service_name?.toLowerCase() ===
                                "body grooming"
                                  ? "Start Service"
                                  : "Start Exam"}
                              </button>
                            )}

                            {selectedAppointment.state === "In Progress" && (
                              <button
                                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center justify-center shadow-sm"
                                onClick={() =>
                                  handleStatusChange(selectedAppointment.id, 6)
                                }
                              >
                                <CheckCircle size={14} className="mr-1.5" />
                                Complete
                              </button>
                            )}

                            {/* <button className="px-3 py-2 border border-gray-200 text-sm rounded-md hover:bg-gray-50 flex items-center justify-center shadow-sm">
                          <Edit size={14} className="mr-1.5" />
                          Edit
                        </button> */}

                            {/* <button className="px-3 py-2 border border-gray-200 text-red-600 text-sm rounded-md hover:bg-red-50 hover:border-red-200 flex items-center justify-center shadow-sm">
                              <XCircle size={14} className="mr-1.5" />
                              Cancel
                            </button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {sidebarContent === "new" && (
                    <div className="p-4">
                      <h3 className="font-medium mb-4">
                        Create New Appointment
                      </h3>

                      <div className="space-y-4">
                        {/* Patient Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Patient
                          </label>
                          <div className="relative mt-1">
                            <input
                              type="text"
                              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Search patient..."
                            />
                            <button className="absolute right-0 top-0 px-3 py-2 text-indigo-600 hover:text-indigo-800">
                              <UserPlus size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Appointment Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Appointment Type
                          </label>
                          <select className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">Select appointment type</option>
                            <option value="check-up">General Checkup</option>
                            <option value="sick-visit">Sick Visit</option>
                            <option value="vaccination">Vaccination</option>
                            <option value="surgery">Surgery</option>
                            <option value="dental">Dental</option>
                            <option value="grooming">Grooming</option>
                            <option value="new-patient">New Patient</option>
                          </select>
                        </div>

                        {/* Appointment Reason */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Appointment Reason
                          </label>
                          <textarea
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            rows={2}
                            placeholder="Describe the reason for the appointment..."
                          ></textarea>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Time
                            </label>
                            <select className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                              <option value="">Select time</option>
                              <option>08:00 AM</option>
                              <option>08:30 AM</option>
                              <option>09:00 AM</option>
                              <option>09:30 AM</option>
                              <option>10:00 AM</option>
                              {/* More time options... */}
                            </select>
                          </div>
                        </div>

                        {/* Duration & Doctor */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Duration
                            </label>
                            <select className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                              <option value="15">15 minutes</option>
                              <option value="30" selected>
                                30 minutes
                              </option>
                              <option value="45">45 minutes</option>
                              <option value="60">1 hour</option>
                              <option value="90">1 hour 30 minutes</option>
                              <option value="120">2 hours</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Doctor
                            </label>
                            <select className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                              <option value="">Select doctor</option>
                              {doctors.map((doctor) => (
                                <option
                                  key={doctor.doctor_id}
                                  value={doctor.doctor_id}
                                >
                                  {doctor.doctor_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <textarea
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            rows={3}
                            placeholder="Additional notes..."
                          ></textarea>
                        </div>

                        {/* Communication Options */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Communication Options
                          </label>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="confirm-email"
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <label
                                htmlFor="confirm-email"
                                className="ml-2 text-sm text-gray-700"
                              >
                                Send confirmation email to customer
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="confirm-sms"
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <label
                                htmlFor="confirm-sms"
                                className="ml-2 text-sm text-gray-700"
                              >
                                Send SMS confirmation to customer
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="reminder"
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <label
                                htmlFor="reminder"
                                className="ml-2 text-sm text-gray-700"
                              >
                                Schedule reminder 24 hours before appointment
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-3">
                          {/* <button
                            className="px-4 py-2 border rounded shadow-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setSidebarContent("queue")}
                          >
                            Cancel
                          </button> */}
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700">
                            Create Appointment
                          </button>
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
