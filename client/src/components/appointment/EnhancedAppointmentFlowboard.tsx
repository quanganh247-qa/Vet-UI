import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Appointment, Doctor, Room, QueueItem } from "@/types";
import {
  useListAppointmentsQueue,
  useUpdateAppointmentStatus,
} from "@/hooks/use-appointment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAppointmentById } from "@/services/appointment-services";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface EnhancedAppointmentFlowboardProps {
  appointments: Appointment[];
  doctors: Doctor[];
  rooms: Room[];
  // staff: Staff[];
  onAppointmentUpdate: (appointment: Appointment) => void;
  onAppointmentCreate: (appointment: Omit<Appointment, "id">) => void;
  onAppointmentDelete: (id: number) => void;
}

interface AppointmentWithWorkflowData extends Appointment {
  workflow_progress?: string;
  lab_results?: any[];
  soap_note?: any[];
}

const EnhancedAppointmentFlowboard: React.FC<
  EnhancedAppointmentFlowboardProps
> = ({
  appointments,
  doctors,
  rooms,
  // staff,
  onAppointmentUpdate,
  onAppointmentCreate,
  onAppointmentDelete,
}) => {
  // State for managing views, filters, and selected appointments
  const [viewMode, setViewMode] = useState<"columns" | "timeline" | "list">(
    "columns"
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
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
  const [showResourceManagement, setShowResourceManagement] = useState(false);

  const queryClient = useQueryClient();

  // Queue data (patients waiting, estimated times)
  const { data: queueData } = useListAppointmentsQueue();

  const queueItem = queueData?.find(
    (item: QueueItem) => item.id === selectedAppointmentId
  );

  // Add location for navigation
  const [, setLocation] = useLocation();

  // Refresh queue data periodically and when appointments change
  useEffect(() => {
    // Refresh queue data when component mounts
    queryClient.invalidateQueries({ queryKey: ["appointmentsQueue"] });

    // Set up an interval to refresh queue data every 30 seconds
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["appointmentsQueue"] });
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [queryClient]);

  // Format time (e.g., 9:00 AM)
  const formatTime = (timeString: string) => {
    if (!timeString) return "";

    try {
      // Parse the time from HH:MM format
      const [hours, minutes] = timeString
        .split(":")
        .map((num) => parseInt(num, 10));

      if (isNaN(hours) || isNaN(minutes)) return timeString;

      // Create a date object for today with the given time
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);

      // Format to 3:04 PM style
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Navigate to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Get status color class
  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-200 text-green-800";
      case "checked in":
        return "bg-blue-500 text-white";
      case "in progress":
        return "bg-purple-500 text-white";
      case "waiting":
        return "bg-yellow-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      case "scheduled":
        return "bg-green-200 text-green-800";
      case "cancelled":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Get type color class
  const getTypeColorClass = (type: string) => {
    switch (type.toLowerCase()) {
      case "check-up":
        return "bg-green-100 text-green-800";
      case "surgery":
        return "bg-red-100 text-red-800";
      case "sick visit":
        return "bg-yellow-100 text-yellow-800";
      case "vaccination":
        return "bg-blue-100 text-blue-800";
      case "grooming":
        return "bg-orange-100 text-orange-800";
      case "new patient":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority color class
  const getPriorityColorClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter appointments based on selected filters
  const filteredAppointments = appointments.filter((appointment) => {
    const statusMatch =
      filterStatus === "all" ||
      appointment.state.toLowerCase() === filterStatus.toLowerCase();
    const doctorMatch =
      filterDoctor === "all" || appointment.doctor.doctor_name === filterDoctor;
    const typeMatch =
      filterType === "all" ||
      appointment.service.service_name.toLowerCase() ===
        filterType.toLowerCase();

    return statusMatch && doctorMatch && typeMatch;
  });

  // Group appointments by status for column view
  const groupedAppointments = {
    scheduled: filteredAppointments.filter((a) => a.state === "Scheduled"),
    confirmed: filteredAppointments.filter((a) => a.state === "Confirmed"),
    arrived: filteredAppointments.filter(
      (a) => a.state === "Checked In" || a.state === "Waiting"
    ),
    inProgress: filteredAppointments.filter((a) => a.state === "In Progress"),
    completed: filteredAppointments.filter((a) => a.state === "Completed"),
  };

  // Get the selected appointment details
  const selectedAppointment = appointments.find(
    (a) => a.id === selectedAppointmentId
  );

  // Handle appointment click
  const handleAppointmentClick = (id: number) => {
    setSelectedAppointmentId(id);
    setSidebarContent("details");
    setShowSidebar(true);
  };

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
  const handleStatusChange = (
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

            // Navigate to patient management page if requested
            if (navigateToDetail) {
              setLocation(`/appointment/${appointment.id}`);
            }
          },
        }
      );
    }
  };

  // Handle showing new appointment form
  const handleNewAppointment = () => {
    setSelectedAppointmentId(null);
    setSidebarContent("new");
    setShowSidebar(true);
  };

  // Render appointment card
  const renderAppointmentCard = (appointment: Appointment) => {
    // Check if this is a walk-in appointment by checking for a special flag or missing time slots
    console.log(appointment.room);
    const isWalkIn = !appointment.time_slot || !appointment.time_slot.start_time || appointment.time_slot.start_time === "00:00:00";
    
    return (
      <div
        key={appointment.id}
        className={`border rounded-md mb-3 overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
          selectedAppointmentId === appointment.id
            ? "ring-2 ring-indigo-500"
            : ""
        }`}
        onClick={() => handleAppointmentClick(appointment.id)}
      >
        <div className={`px-3 py-2 ${getStatusColorClass(appointment.state)}`}>
          <div className="flex justify-between items-center">
            <div className="font-medium">
              {isWalkIn ? (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Arrived: {appointment.created_at ? format(new Date(appointment.created_at), "h:mm a") : "Today"}</span>
                </div>
              ) : (
                `${formatTime(appointment.time_slot.start_time)} - ${formatTime(appointment.time_slot.end_time)}`
              )}
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-20">
              {appointment.state}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-3">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                appointment.pet.pet_name
              )}&background=f0f9ff&color=3b82f6`}
              alt={appointment.pet.pet_name}
              className="h-12 w-12 rounded-full mr-3 border-2 border-blue-100"
            />
            <div>
              <div className="font-medium text-base">{appointment.pet.pet_name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {appointment.pet.pet_breed}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-50 rounded p-2">
              <span
                className={`text-xs px-2 py-1 rounded-full flex items-center w-fit ${getTypeColorClass(
                  appointment.service.service_name
                )}`}
              >
                <Tag className="h-3 w-3 mr-1" />
                {appointment.service.service_name}
              </span>
              <div className="text-xs text-gray-500 mt-1.5">
                {isWalkIn ? (
                  <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">
                    Walk-in
                  </span>
                ) : (
                  `${appointment.service.service_duration} min`
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-500 mb-1">Doctor</div>
              <div className="text-sm font-medium flex items-center">
                <Stethoscope className="h-3 w-3 mr-1 text-indigo-500" />
                {appointment.doctor.doctor_name}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-2 mt-1">
            <div className="text-sm">
              <span className="text-gray-500 text-xs">Room:</span>{" "}
              <span className="font-medium">{appointment.room}</span>
            </div>

            {appointment.priority === "urgent" && (
              <div className="bg-red-50 px-2 py-1 rounded-full">
                <div className="flex items-center text-red-600 text-xs">
                  <AlertCircle size={12} className="mr-1" />
                  Urgent
                </div>
              </div>
            )}

            <div className="flex space-x-1">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                <MessageSquare size={14} />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                <Phone size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Thêm hàm để xác định bước workflow hiện tại của cuộc hẹn
  const getCurrentWorkflowStep = (appointment: Appointment) => {
    // Mặc định bắt đầu với patient-details
    let currentStep = "patient-details";
    
    // Type casting appointment
    const appointmentWithWorkflow = appointment as AppointmentWithWorkflowData;
    
    // Logic đơn giản để xác định bước hiện tại dựa trên trạng thái
    if (appointment.state === "In Progress") {
      // Kiểm tra workflow progress (field mới, giả định tạm)
      if (appointmentWithWorkflow.workflow_progress) {
        currentStep = appointmentWithWorkflow.workflow_progress;
      } else if (appointmentWithWorkflow.lab_results && appointmentWithWorkflow.lab_results.length > 0) {
        currentStep = "diagnostic";
      } else if (appointmentWithWorkflow.soap_note && appointmentWithWorkflow.soap_note.length > 0) {
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

  // Thêm các hàm xử lý sự kiện cho các nút
  const handleStartAppointment = (appointmentId: number) => {
    // Cập nhật trạng thái thành "In Progress"
    handleStatusChange(appointmentId, 5, false);
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
          <div className="whitespace-nowrap text-sm font-medium text-gray-500 mr-1">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </div>
          <div className="flex items-center">
            <button
              onClick={goToPreviousDay}
              className="p-1.5 rounded-l border text-gray-500 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToToday}
              className="p-1.5 border-t border-b text-gray-500 hover:bg-gray-50 flex items-center px-2"
            >
              <Calendar size={14} className="mr-1" />
              <span className="text-xs">Today</span>
            </button>
            <button
              onClick={goToNextDay}
              className="p-1.5 rounded-r border text-gray-500 hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* View Controls & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex mb-0 mr-0 sm:mr-4">
            <div className="flex border rounded-md overflow-hidden">
              <button
                className={`px-2 sm:px-3 py-1.5 text-sm font-medium flex items-center ${
                  viewMode === "columns"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700"
                }`}
                onClick={() => setViewMode("columns")}
              >
                <Columns size={14} className="mr-1" />
                <span className="hidden sm:inline">Column</span>
              </button>

              <button
                className={`px-2 sm:px-3 py-1.5 text-sm font-medium flex items-center ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700"
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
              className="mr-2 px-3 py-1.5 border rounded text-sm bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="waiting">Waiting</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="mr-2 px-3 py-1.5 border rounded text-sm bg-white"
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
            >
              <option value="all">All Doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctor_id} value={doctor.doctor_name}>
                  {doctor.doctor_name}
                </option>
              ))}
            </select>

            <select
              className="mr-2 px-3 py-1.5 border rounded text-sm bg-white"
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

            <button className="mr-2 px-3 py-1.5 border rounded text-sm flex items-center hover:bg-gray-50">
              <RefreshCw size={14} className="mr-1" />
              Refresh
            </button>

            {/* Show/Hide Sidebar Button */}
            <div className="hidden sm:block">
              <button
                className="p-2 border rounded-md text-gray-600 hover:bg-gray-50"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {showSidebar ? (
                  <PanelRightClose size={16} />
                ) : (
                  <PanelRight size={16} />
                )}
              </button>
            </div>

            {/* New Appointment Button */}
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleNewAppointment}
            >
              <Plus size={16} className="mr-1" />
              <span className="hidden xs:inline">New Appointment</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Appointments Area */}
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 ${
            showSidebar ? "w-3/5 lg:w-2/3" : "w-full"
          }`}
        >
          {/* Status Overview */}
          <div className="grid grid-cols-4 gap-4 p-4">
            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-800">Confirmed</h3>
                <span className="text-lg font-bold text-indigo-600">
                  {groupedAppointments.confirmed.length}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-1 bg-green-500 rounded-full"
                  style={{ width: "40%" }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-800">Waiting</h3>
                <span className="text-lg font-bold text-indigo-600">
                  {groupedAppointments.arrived.length}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-1 bg-blue-500 rounded-full"
                  style={{ width: "20%" }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-800">In Progress</h3>
                <span className="text-lg font-bold text-indigo-600">
                  {groupedAppointments.inProgress.length}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-1 bg-purple-500 rounded-full"
                  style={{ width: "20%" }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-800">Completed</h3>
                <span className="text-lg font-bold text-indigo-600">
                  {groupedAppointments.completed.length}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-1 bg-green-500 rounded-full"
                  style={{ width: "20%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Resource Status Bar */}
          {/* <div className="flex justify-between items-center px-6 py-2 bg-white shadow-sm mb-4">
            <div>
              <span className="text-sm font-medium mr-2">
                Active Resources:
              </span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                {staff.filter((s) => s.status === "available").length}/
                {staff.length} Doctors
              </span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full ml-2">
                {rooms.filter((r) => r.status === "available").length}/
                {rooms.length} Exam Rooms
              </span>
            </div>

            <button
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              onClick={() => setShowResourceManagement(!showResourceManagement)}
            >
              <Settings size={14} className="mr-1" />
              Resource Management
            </button>
          </div> */}

          {/* Resource Management Panel */}
          {/* {showResourceManagement && (
            <div className="mx-4 mb-4 bg-white rounded-lg shadow overflow-hidden">
              <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-medium">Resource Management</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowResourceManagement(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Users size={16} className="mr-2 text-indigo-500" />
                      Staff working
                    </h4>
                    <div className="space-y-2">
                      {staff.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center">
                            <img
                              src={person.avatar}
                              alt={person.name}
                              className="h-8 w-8 rounded-full mr-2"
                            />
                            <div>
                              <div className="font-medium text-sm">
                                {person.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {person.role}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              person.status === "available"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {person.status === "available" ? "Sẵn sàng" : "Bận"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Layers size={16} className="mr-2 text-indigo-500" />
                      Rooms
                    </h4>
                    <div className="space-y-2">
                      {rooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {room.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {room.type === "exam"
                                ? "Exam Room"
                                : room.type === "surgery"
                                ? "Surgery Room"
                                : "Grooming Room"}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                room.status === "available"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {room.status === "available"
                                ? "Available"
                                : "Occupied"}
                            </span>
                            {room.status === "occupied" && (
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">
                                  {room.currentPatient}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                    Update status
                  </button>
                </div>
              </div>
            </div>
          )} */}

          {/* Appointments View - Column View (Kanban style) */}
          {viewMode === "columns" && (
            <div className="px-2 sm:px-4 flex gap-3 sm:gap-4 h-full pb-24 overflow-x-auto">
              {/* Scheduled Column */}
              <div className="flex-1 min-w-[230px] sm:min-w-[250px] max-w-[450px] shrink-0">
                <div className="bg-gray-100 rounded-t-lg px-3 py-2 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">Scheduled</h3>
                    <span className="bg-white text-xs font-medium px-2 py-1 rounded">
                      {groupedAppointments.scheduled.length}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-b-lg p-2 border-l border-r border-b border-gray-200 h-[calc(100vh-280px)] overflow-y-auto">
                  {groupedAppointments.scheduled.length > 0 ? (
                    groupedAppointments.scheduled.map((appointment) =>
                      renderAppointmentCard(appointment)
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No appointments scheduled
                    </div>
                  )}
                </div>
              </div>

              {/* Arrived/Waiting Column */}
              <div className="flex-1 min-w-[230px] sm:min-w-[250px] max-w-[450px] shrink-0">
                <div className="bg-blue-100 rounded-t-lg px-3 py-2 border border-blue-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-blue-800">Waiting</h3>
                    <span className="bg-white text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {groupedAppointments.arrived.length}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-b-lg p-2 border-l border-r border-b border-blue-200 h-[calc(100vh-280px)] overflow-y-auto">
                  {groupedAppointments.arrived.length > 0 ? (
                    groupedAppointments.arrived.map((appointment) =>
                      renderAppointmentCard(appointment)
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No patients waiting
                    </div>
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="flex-1 min-w-[230px] sm:min-w-[250px] max-w-[450px] shrink-0">
                <div className="bg-purple-100 rounded-t-lg px-3 py-2 border border-purple-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-purple-800">In Progress</h3>
                    <span className="bg-white text-purple-800 text-xs font-medium px-2 py-1 rounded">
                      {groupedAppointments.inProgress.length}
                    </span>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-b-lg p-2 border-l border-r border-b border-purple-200 h-[calc(100vh-280px)] overflow-y-auto">
                  {groupedAppointments.inProgress.length > 0 ? (
                    groupedAppointments.inProgress.map((appointment) =>
                      renderAppointmentCard(appointment)
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No appointments in progress
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div className="flex-1 min-w-[230px] sm:min-w-[250px] max-w-[450px] shrink-0">
                <div className="bg-green-100 rounded-t-lg px-3 py-2 border border-green-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-green-800">Completed</h3>
                    <span className="bg-white text-green-800 text-xs font-medium px-2 py-1 rounded">
                      {groupedAppointments.completed.length}
                    </span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-b-lg p-2 border-l border-r border-b border-green-200 h-[calc(100vh-280px)] overflow-y-auto">
                  {groupedAppointments.completed.length > 0 ? (
                    groupedAppointments.completed.map((appointment) =>
                      renderAppointmentCard(appointment)
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
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
                              {hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {doctors.map((doctor) => (
                        <tr key={doctor.doctor_id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap border-r bg-gray-50 font-medium">
                            {doctor.doctor_name}
                          </td>
                          <td colSpan={9} className="relative">
                            <div className="h-16 md:h-20 relative">
                              {filteredAppointments
                                .filter(
                                  (app) =>
                                    app.doctor.doctor_id === doctor.doctor_id
                                )
                                .map((app) => {
                                  // Parse time to position it properly - simplified here
                                  const startHour = parseInt(
                                    app.time_slot.start_time.split(":")[0]
                                  );
                                  const startPosition =
                                    (startHour - 8) * 100 + "%";
                                  const width =
                                    (app.service.service_duration / 60) * 100 +
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
                                    (app.service.service_duration / 60) * 100 +
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
                                {!appointment.time_slot || !appointment.time_slot.start_time || appointment.time_slot.start_time === "00:00" ? (
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-orange-500" />
                                    <span>Arrived: {appointment.created_at ? format(new Date(appointment.created_at), "h:mm a") : "Today"}</span>
                                  </div>
                                ) : (
                                  `${formatTime(appointment.time_slot.start_time)} - ${formatTime(appointment.time_slot.end_time)}`
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {!appointment.time_slot || !appointment.time_slot.start_time || appointment.time_slot.start_time === "00:00" ? (
                                  <span className="text-orange-600 font-medium">Walk-in</span>
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
                                    setSelectedAppointmentId(appointment.id);
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
                    handleStatusChange(selectedAppointmentId, 3);
                    setIsQuickActionsOpen(false);
                  }}
                >
                  <CheckCircle size={14} className="mr-1" />
                  Check-in
                </button>

                <button
                  className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center justify-center"
                  onClick={() => {
                    handleStatusChange(selectedAppointmentId, 5);
                    setIsQuickActionsOpen(false);
                  }}
                >
                  <Play size={14} className="mr-1" />
                  Start Exam
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

                <button className="px-3 py-1.5 border text-red-600 text-sm rounded hover:bg-red-50 flex items-center justify-center">
                  <XCircle size={14} className="mr-1" />
                  Cancel
                </button>
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
                          if (a.priority === "high" && b.priority !== "high")
                            return -1;
                          if (a.priority !== "high" && b.priority === "high")
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
                                  <div className="bg-white p-1.5 rounded-full mr-3 shadow-sm">
                                    <img
                                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.pet.pet_name)}&background=f0f9ff&color=3b82f6`}
                                      alt={appointment.pet.pet_name}
                                      className="h-8 w-8 rounded-full"
                                    />
                                  </div>
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
                                    <div className="text-gray-500 text-xs">Doctor</div>
                                    <div className="text-sm font-medium">{appointment.doctor.doctor_name}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500 text-xs">Service</div>
                                    <div className="text-sm font-medium">{appointment.service.service_name}</div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 bg-white rounded-lg p-2 shadow-sm">
                                  <div>
                                    <div className="text-gray-500 text-xs">Appointment</div>
                                    <div className="text-sm font-medium">
                                      {formatTime(appointment.time_slot.start_time)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500 text-xs">Waiting</div>
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
                      <div className="text-gray-500 font-medium">No patients waiting</div>
                      <div className="text-gray-400 text-sm mt-1">Waiting queue is empty</div>
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
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            selectedAppointment.pet.pet_name
                          )}&background=f0f9ff&color=3b82f6`}
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
                        <h3 className="font-bold text-lg">{selectedAppointment.pet.pet_name}</h3>
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
                      {(!selectedAppointment.time_slot || !selectedAppointment.time_slot.start_time || selectedAppointment.time_slot.start_time === "00:00:00") && (
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
                            <div className="text-xs text-indigo-700">Service</div>
                            <div className="font-medium text-indigo-900">
                              {selectedAppointment.service.service_name}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-indigo-700">Status</div>
                            <div>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full mt-0.5 ${getStatusColorClass(selectedAppointment.state)}`}>
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
                            {!selectedAppointment.time_slot || !selectedAppointment.time_slot.start_time || selectedAppointment.time_slot.start_time === "00:00:00" ? (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-orange-500" />
                                <span>Arrived: {selectedAppointment.created_at ? format(new Date(selectedAppointment.created_at), "h:mm a") : "Today"}</span>
                              </div>
                            ) : (
                              `${formatTime(selectedAppointment.time_slot.start_time)} - ${formatTime(selectedAppointment.time_slot.end_time)}`
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-medium">
                            {selectedAppointment.service.service_duration} minutes
                            {(!selectedAppointment.time_slot || !selectedAppointment.time_slot.start_time || selectedAppointment.time_slot.start_time === "00:00:00") && (
                              <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Unscheduled</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-500">Doctor</div>
                          <div className="font-medium flex items-center">
                            <Stethoscope className="h-4 w-4 text-indigo-500 mr-1" />
                            {selectedAppointment.doctor.doctor_name}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Room</div>
                          <div className="font-medium">{selectedAppointment.room}</div>
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

                  {/* Owner Information */}
                  <div className="bg-white p-4 rounded-lg mb-4 shadow-sm border border-gray-100">
                    <h4 className="font-medium mb-3 flex items-center">
                      <User className="h-4 w-4 text-indigo-500 mr-1.5" />
                      Owner Information
                    </h4>

                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <div className="text-sm text-gray-500">Name</div>
                        <div className="font-medium">{selectedAppointment.owner.owner_name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <div className="font-medium">{selectedAppointment.owner.owner_phone}</div>
                      </div>
                    </div>

                    {/* <div className="flex space-x-2 mt-3">
                      <button className="flex-1 px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 shadow-sm flex items-center justify-center">
                        <Phone size={14} className="mr-1.5" />
                        Call Owner
                      </button>
                      <button className="flex-1 px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 shadow-sm flex items-center justify-center">
                        <MessageSquare size={14} className="mr-1.5" />
                        Message
                      </button>
                    </div> */}
                  </div>

                  {/* Status Management */}
                  <div className="bg-white p-4 rounded-lg mb-4 shadow-sm border border-gray-100">
                    <h4 className="font-medium mb-3 flex items-center">
                      <RefreshCw className="h-4 w-4 text-indigo-500 mr-1.5" />
                      Current Status
                    </h4>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-sm font-medium">Progress</div>
                        <div className="text-xs text-gray-500">
                          {selectedAppointment.state === "Scheduled"
                            ? "10%"
                            : selectedAppointment.state === "Confirmed"
                            ? "25%"
                            : selectedAppointment.state === "Checked In" ||
                              selectedAppointment.state === "Arrived" ||
                              selectedAppointment.state === "Waiting"
                            ? "50%"
                            : selectedAppointment.state === "In Progress"
                            ? "75%"
                            : selectedAppointment.state === "Completed"
                            ? "100%"
                            : "0%"}
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-2.5 bg-green-500 rounded-full transition-all duration-500"
                          style={{
                            width:
                              selectedAppointment.state === "Scheduled"
                                ? "10%"
                                : selectedAppointment.state === "Confirmed"
                                ? "25%"
                                : selectedAppointment.state === "Checked In" ||
                                  selectedAppointment.state === "Arrived" ||
                                  selectedAppointment.state === "Waiting"
                                ? "50%"
                                : selectedAppointment.state === "In Progress"
                                ? "75%"
                                : selectedAppointment.state === "Completed"
                                ? "100%"
                                : "0%",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">Current status:</div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColorClass(
                          selectedAppointment.state
                        )}`}
                      >
                        {selectedAppointment.state}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Play className="h-4 w-4 text-indigo-500 mr-1.5" />
                      Quick Actions
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedAppointment.state === "In Progress" && (
                        <button
                          className="w-full px-3 py-2.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 flex items-center justify-center shadow-sm"
                          onClick={() => {
                            const currentStep = getCurrentWorkflowStep(selectedAppointment);
                            // Điều hướng đến trang workflow thích hợp
                            if (currentStep === "patient-details") {
                              setLocation(`/appointment/${selectedAppointment.id}`);
                            } else if (currentStep === "examination") {
                              setLocation(`/appointment/${selectedAppointment.id}/examination`);
                            } else if (currentStep === "soap") {
                              setLocation(`/appointment/${selectedAppointment.id}/soap`);
                            } else if (currentStep === "diagnostic") {
                              setLocation(`/appointment/${selectedAppointment.id}/lab-management`);
                            } else if (currentStep === "treatment") {
                              setLocation(`/appointment/${selectedAppointment.id}/patient/${selectedAppointment.pet?.pet_id}/treatment`);
                            } else if (currentStep === "prescription") {
                              setLocation(`/appointment/${selectedAppointment.id}/prescription`);
                            } else if (currentStep === "follow-up") {
                              setLocation(`/appointment/${selectedAppointment.id}/follow-up`);
                            } else {
                              setLocation(`/appointment/${selectedAppointment.id}`);
                            }
                          }}
                        >
                          {getWorkflowStepIcon(getCurrentWorkflowStep(selectedAppointment))}
                          <span className="mx-1">{getWorkflowStepLabel(getCurrentWorkflowStep(selectedAppointment))}</span>
                          <ArrowRightCircle className="ml-1 h-4 w-4" />
                        </button>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {selectedAppointment.state === "Scheduled" && (
                          <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center justify-center shadow-sm"
                            onClick={() => handleStatusChange(selectedAppointment.id, 3)}>
                            <CheckCircle size={14} className="mr-1.5" />
                            Check-in
                          </button>
                        )}
                        
                        {selectedAppointment.state === "Checked In" && (
                          <button className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 flex items-center justify-center shadow-sm"
                            onClick={() => handleStatusChange(selectedAppointment.id, 5)}>
                            <Play size={14} className="mr-1.5" />
                            Start Exam
                          </button>
                        )}
                        
                        {selectedAppointment.state === "In Progress" && (
                          <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center justify-center shadow-sm"
                            onClick={() => handleStatusChange(selectedAppointment.id, 6)}>
                            <CheckCircle size={14} className="mr-1.5" />
                            Complete
                          </button>
                        )}
                        
                        {/* <button className="px-3 py-2 border border-gray-200 text-sm rounded-md hover:bg-gray-50 flex items-center justify-center shadow-sm">
                          <Edit size={14} className="mr-1.5" />
                          Edit
                        </button> */}
                        
                        <button className="px-3 py-2 border border-gray-200 text-red-600 text-sm rounded-md hover:bg-red-50 hover:border-red-200 flex items-center justify-center shadow-sm">
                          <XCircle size={14} className="mr-1.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sidebarContent === "new" && (
                <div className="p-4">
                  <h3 className="font-medium mb-4">Create New Appointment</h3>

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
                      <button
                        className="px-4 py-2 border rounded shadow-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setSidebarContent("queue")}
                      >
                        Cancel
                      </button>
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
};

export default EnhancedAppointmentFlowboard;
