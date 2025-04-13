import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  FileText,
  Syringe,
  BarChart,
  Printer,
  Mail,
  Pencil,
  FilePlus2,
  XCircle,
  Activity,
  Bell,
  Phone,
  ArrowLeft,
  UserCog,
  CalendarPlus,
  FileSignature,
  Clock,
  CheckCircle,
  PlusCircle,
  CalendarClock,
  FileBarChart,
  Trash2,
  Receipt,
  CreditCard,
  Info,
  PencilLine,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowDownUp,
  Stethoscope,
  Pill,
  FlaskConical,
  NotebookText,
  ClipboardEdit,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  CalendarSearch,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { usePatientData } from "@/hooks/use-pet";
import {
  Appointment,
  getMedicalRecordsByPatientId,
  getAppointmentsByPatientId,
  getVaccinesByPatientId,
  MedicalRecord,
  Vaccine,
  Invoice,
  mockInvoices,
} from "@/data/mock-data";
import {
  useAppointmentData,
  useHistoryAppointments,
} from "@/hooks/use-appointment";
import { useVaccineData } from "@/hooks/use-vaccine";
import { Vaccination } from "@/types";
import WorkflowNavigation from "@/components/WorkflowNavigation";

const PatientManagement = () => {
  // Lấy params từ cả route params (để tương thích ngược) và query params (phương án mới)
  const { id: routeId } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  
  // Lấy tham số từ query params
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
    
    console.log("Patient Management URL Params:", { urlAppointmentId, urlPetId, routeId });
    
    // Thiết lập appointmentId và petId theo thứ tự ưu tiên
    let appointmentIdValue = urlAppointmentId || routeId || null;
    let petIdValue = urlPetId || null;
    
    setWorkflowParams({
      appointmentId: appointmentIdValue,
      petId: petIdValue
    });
    
    console.log("Patient Management Workflow Params Set:", { appointmentIdValue, petIdValue });
  }, [routeId]);
  
  // Sử dụng appointmentId từ workflowParams
  const effectiveAppointmentId = workflowParams.appointmentId || "";
  
  // Utility function to build query parameters
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
  
  const { data: appointment, error: appointmentError } = useAppointmentData(effectiveAppointmentId);

  const { data: historyAppointments, error: historyAppointmentsError } =
    useHistoryAppointments(appointment?.pet?.pet_id);
  const { data: patientData, isLoading: isPatientLoading } = usePatientData(
    appointment?.pet?.pet_id
  );

  const { data: vaccines = [], isLoading: isVaccinesLoading } = useVaccineData(
    appointment?.pet?.pet_id
  );

  useEffect(() => {
    if (effectiveAppointmentId) {
      setMedicalRecords(getMedicalRecordsByPatientId(parseInt(effectiveAppointmentId)));
      setInvoices(mockInvoices);
    }
  }, [effectiveAppointmentId]);

  // Function to navigate to treatment page with query params
  const navigateToTreatment = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id
    };
    navigate(`/treatment${buildUrlParams(params)}`);
  };

  // Navigate to SOAP with query params
  const navigateToSOAP = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id
    };
    navigate(`/soap${buildUrlParams(params)}`);
  };

  // Navigate to examination with query params
  const navigateToExamination = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id
    };
    navigate(`/examination${buildUrlParams(params)}`);
  };

  // Navigate to vaccination with query params
  const navigateToVaccination = () => {
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: appointment?.pet?.pet_id
    };
    navigate(`/vaccination${buildUrlParams(params)}`);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (isPatientLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">
            Loading patient details...
          </p>
        </div>
      </div>
    );
  }

  // Calculate vaccination status
  const hasUpcomingVaccinations = vaccines.some(
    (v: Vaccination) =>
      new Date(v.next_due_date) <=
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  
  // Create alert items for the patient
  const patientAlerts = [
    ...(hasUpcomingVaccinations ? [{
      type: "warning",
      icon: <Syringe className="h-4 w-4 text-amber-600" />,
      title: "Vaccination Due",
      message: "Patient has vaccinations due within 30 days"
    }] : []),
    ...(patientData?.allergies ? [{
      type: "critical",
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      title: "Allergies",
      message: patientData?.allergies
    }] : []),
    ...(patientData?.chronic_conditions ? [{
      type: "info", 
      icon: <Activity className="h-4 w-4 text-blue-600" />,
      title: "Chronic Conditions",
      message: patientData?.chronic_conditions
    }] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with back button and title */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-white font-semibold text-lg">Patient Management</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/30 flex items-center gap-2 text-xs font-medium"
          >
            <UserCog className="h-3.5 w-3.5" />
            <span>Edit Patient</span>
          </Button>
        </div>
      </div>

      {/* Workflow Navigation */}
      {appointment?.pet?.pet_id && (
        <div className="px-4 pt-3">
          <WorkflowNavigation
            appointmentId={effectiveAppointmentId}
            petId={appointment?.pet?.pet_id?.toString()}
            currentStep="patient-details"
          />
        </div>
      )}

      {/* Patient header - improved styling */}
      <div className="bg-gradient-to-b from-indigo-50 to-white pt-6 pb-4 px-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Patient photo and basic info */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative mx-auto sm:mx-0">
              <div className="h-24 w-24 rounded-lg shadow-md overflow-hidden flex-shrink-0 border-2 border-white">
                <img
                  src={
                    patientData?.data_image
                      ? `data:image/png;base64,${patientData.data_image}`
                      : "/fallback-image.png"
                  }
                  alt={patientData?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {patientData?.gender && (
                <div
                  className={`absolute bottom-0 right-0 h-6 w-6 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ${
                    patientData?.gender === "Male"
                      ? "bg-blue-500"
                      : "bg-pink-500"
                  }`}
                >
                  {patientData?.gender === "Male" ? "♂" : "♀"}
                </div>
              )}
            </div>

            <div className="text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl font-bold text-gray-900">
                  {patientData?.name}
                </h1>
                {hasUpcomingVaccinations && (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1 px-2 py-0.5 text-xs font-medium mx-auto sm:mx-0 w-fit"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    Vaccinations Due Soon
                  </Badge>
                )}
              </div>


              <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 text-gray-700 justify-center sm:justify-start">
                <div className="flex items-center px-3 py-1.5 bg-white rounded-md shadow-sm border border-gray-100 w-full sm:w-auto">
                  <span className="font-medium text-gray-700 text-xs">Owner:</span>
                  <span className="ml-1.5 text-xs">
                    {appointment?.owner.owner_name}
                  </span>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-white rounded-md shadow-sm border border-gray-100 w-full sm:w-auto">
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                  <span className="text-xs">{appointment?.owner.owner_phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={navigateToExamination}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 w-full flex items-center justify-center gap-2 py-5 font-medium transition-all shadow-sm hover:shadow border border-blue-200"
              variant="outline"
            >
              <Stethoscope className="h-5 w-5" />
              <span>Start Examination</span>
            </Button>
            
            {appointment?.service?.service_name?.toLowerCase().includes('vaccine') || 
             appointment?.reason?.toLowerCase().includes('vaccine') ? (
              <Button
                onClick={navigateToVaccination}
                className="bg-green-100 hover:bg-green-200 text-green-700 w-full flex items-center justify-center gap-2 py-5 font-medium transition-all shadow-sm hover:shadow border border-green-200"
                variant="outline"
              >
                <Syringe className="h-5 w-5" />
                <span>Administer Vaccine</span>
              </Button>
            ) : (
              <Button
                onClick={navigateToSOAP}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 w-full flex items-center justify-center gap-2 py-5 font-medium transition-all shadow-sm hover:shadow border border-purple-200"
                variant="outline"
              >
                <FileText className="h-5 w-5" />
                <span>SOAP Notes</span>
              </Button>
            )}
            
            <Button
              onClick={navigateToTreatment}
              className="bg-amber-100 hover:bg-amber-200 text-amber-700 w-full flex items-center justify-center gap-2 py-5 font-medium transition-all shadow-sm hover:shadow border border-amber-200"
              variant="outline"
            >
              <Pill className="h-5 w-5" />
              <span>Treatment Plan</span>
            </Button>
          </div>
        </div>
      </div>

      {/* New Patient Clinical Summary Banner */}
      {patientData && (
        <div className="bg-white px-6 py-4 border-y border-gray-200 mt-2">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="w-full md:w-auto">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-indigo-600" />
                Patient Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                  <div className="text-xs text-indigo-700 font-medium">Weight</div>
                  <div className="text-lg font-bold text-indigo-900 mt-1 flex items-end">
                    {patientData?.weight || "N/A"}
                    <span className="text-xs ml-1 text-indigo-700 font-normal">kg</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-xs text-blue-700 font-medium">Breed</div>
                  <div className="text-lg font-bold text-blue-900 mt-1 flex items-end">
                    {patientData?.breed || "N/A"}
                    {/* <span className="text-xs ml-1 text-blue-700 font-normal">Breed</span> */}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <div className="text-xs text-green-700 font-medium">Type</div>
                  <div className="text-lg font-bold text-green-900 mt-1 flex items-end">
                    {patientData?.type || "N/A"}
                    {/* <span className="text-xs ml-1 text-green-700 font-normal">Type</span> */}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <div className="text-xs text-purple-700 font-medium">Age</div>
                  <div className="text-lg font-bold text-purple-900 mt-1">
                    {patientData?.age || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Clinical Alerts */}
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-amber-600" />
                  <span>Clinical Alerts</span>
                  {patientAlerts.length > 0 && (
                    <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                      {patientAlerts.length}
                    </Badge>
                  )}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setAlertsExpanded(!alertsExpanded)}
                >
                  {alertsExpanded ? 
                    <ChevronLeft className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              </div>
              
              {patientAlerts.length > 0 ? (
                <div className="space-y-2 mt-1 overflow-y-auto max-h-48">
                  {patientAlerts.slice(0, alertsExpanded ? patientAlerts.length : 2).map((alert, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded-md flex items-start gap-2 ${
                        alert.type === 'critical' 
                          ? 'bg-red-50 border border-red-200' 
                          : alert.type === 'warning'
                          ? 'bg-amber-50 border border-amber-200'
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="mt-0.5">{alert.icon}</div>
                      <div>
                        <div className="font-medium text-gray-900 text-xs">{alert.title}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{alert.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-3 text-center border border-gray-200">
                  No alerts for this patient
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons with improved visibility */}
      {/* <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={navigateToExamination}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-2 py-6 font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Stethoscope className="h-5 w-5" />
            <span>Start Examination</span>
          </Button>
          
          {appointment?.service?.service_name?.toLowerCase().includes('vaccine') || 
           appointment?.reason?.toLowerCase().includes('vaccine') ? (
            <Button
              onClick={navigateToVaccination}
              className="bg-green-600 hover:bg-green-700 text-white w-full flex items-center justify-center gap-2 py-6 font-medium transition-all shadow-md hover:shadow-lg"
            >
              <Syringe className="h-5 w-5" />
              <span>Administer Vaccine</span>
            </Button>
          ) : (
            <Button
              onClick={navigateToSOAP}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full flex items-center justify-center gap-2 py-6 font-medium transition-all shadow-md hover:shadow-lg"
            >
              <ClipboardEdit className="h-5 w-5" />
              <span>SOAP Notes</span>
            </Button>
          )}
          
          <Button
            onClick={navigateToTreatment}
            className="bg-amber-600 hover:bg-amber-700 text-white w-full flex items-center justify-center gap-2 py-6 font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Pill className="h-5 w-5" />
            <span>Treatment Plan</span>
          </Button>
        </div>
      </div> */}

      {/* Tabs section with improved styling */}
      <Tabs
        defaultValue="overview"
        className="w-full px-6 py-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* REDESIGNED: Recent Appointments */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                    Recent Appointments
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white shadow-sm hover:bg-gray-50 text-xs px-2.5 py-1"
                  >
                    <CalendarPlus className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                    <span>New</span>
                  </Button>
                </div>

                <div className="overflow-hidden">
                  {historyAppointments?.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {historyAppointments.slice(0, 3).map((appointment: Appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                appointment.status === "completed"
                                  ? "bg-green-100"
                                  : appointment.status === "in-progress"
                                  ? "bg-blue-100"
                                  : appointment.status === "scheduled"
                                  ? "bg-indigo-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              {appointment.status === "completed" ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : appointment.status === "in-progress" ? (
                                <Activity className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Calendar className="h-4 w-4 text-indigo-600" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                  {appointment.type}
                                </div>
                                <Badge
                                  className={`text-xs px-2 py-0.5 ml-2 ${
                                    appointment.status === "completed"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : appointment.status === "in-progress"
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : appointment.status === "scheduled"
                                      ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                                      : "bg-gray-100 text-gray-800 border-gray-200"
                                  }`}
                                >
                                  {appointment.status === "completed"
                                    ? "Completed"
                                    : appointment.status === "in-progress"
                                    ? "In Progress"
                                    : "Scheduled"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center text-xs text-gray-600 mt-1 gap-3">
                                <span className="flex items-center">
                                  <CalendarClock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  {appointment.date}
                                </span>
                                <span className="flex items-center">
                                  <UserCog className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  Dr. {appointment.doctor_id === 1
                                    ? "Roberts"
                                    : appointment.doctor_id === 2
                                    ? "Carter"
                                    : "Chen"}
                                </span>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <div className="w-12 h-12 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Calendar className="h-6 w-6 text-gray-300" />
                      </div>
                      <h3 className="text-gray-500 font-medium mb-2 text-sm">
                        No appointments found
                      </h3>
                      <p className="text-gray-400 text-xs mb-3">
                        This patient doesn't have any appointment history
                      </p>
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5"
                      >
                        Schedule First Appointment
                      </Button>
                    </div>
                  )}
                  
                  {historyAppointments?.length > 3 && (
                    <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-indigo-600 text-xs"
                        onClick={() => setActiveTab("appointments")}
                      >
                        View all appointments
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* REDESIGNED: Medical Records */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                    Medical Records
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white shadow-sm hover:bg-gray-50 text-xs px-2.5 py-1"
                  >
                    <FilePlus2 className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                    <span>New</span>
                  </Button>
                </div>
                
                <div className="overflow-hidden">
                  {medicalRecords.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {medicalRecords.slice(0, 3).map((record) => (
                        <div
                          key={record.id}
                          className="p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-indigo-100">
                              <FileBarChart className="h-4 w-4 text-indigo-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                  {record.type || "Medical Visit"}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0 -mr-1"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="flex flex-wrap items-center text-xs text-gray-600 mt-1 gap-3">
                                <span className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  {record.date}
                                </span>
                                <span className="flex items-center">
                                  <UserCog className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  Dr. {record.doctor_id === 1
                                    ? "Roberts"
                                    : record.doctor_id === 2
                                    ? "Carter"
                                    : "Chen"}
                                </span>
                              </div>
                              
                              {record.diagnosis && (
                                <div className="mt-2">
                                  <Badge 
                                    className="bg-blue-100 text-blue-800 border-blue-200 text-xs"
                                  >
                                    {record.diagnosis}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <div className="w-12 h-12 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <FileText className="h-6 w-6 text-gray-300" />
                      </div>
                      <h3 className="text-gray-500 font-medium mb-2 text-sm">
                        No medical records
                      </h3>
                      <p className="text-gray-400 text-xs mb-3">
                        This patient doesn't have any medical records yet
                      </p>
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5"
                      >
                        <FilePlus2 className="h-3.5 w-3.5 mr-1.5" />
                        Create First Record
                      </Button>
                    </div>
                  )}
                  
                  {medicalRecords.length > 3 && (
                    <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-indigo-600 text-xs"
                        onClick={() => setActiveTab("medical-records")}
                      >
                        View all medical records
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* REDESIGNED: Owner Information */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                    <UserCog className="h-4 w-4 mr-2 text-indigo-600" />
                    Owner Information
                  </h3>
                </div>

                <div className="p-3">
                  {appointment?.owner ? (
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 mr-3">
                          {appointment.owner.owner_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {appointment.owner.owner_name}
                          </div>
                          <Badge className="bg-indigo-100 text-indigo-800 mt-1 text-xs">Primary Owner</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-3">
                        <a 
                          href={`tel:${appointment.owner.owner_phone}`}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                          <Phone className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm text-gray-700">{appointment.owner.owner_phone}</span>
                        </a>
                        
                        {appointment.owner.owner_email && (
                          <a 
                            href={`mailto:${appointment.owner.owner_email}`}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors"
                          >
                            <Mail className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm text-gray-700 truncate">{appointment.owner.owner_email}</span>
                          </a>
                        )}
                        
                        {appointment.owner.owner_address && (
                          <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                            <Info className="h-4 w-4 text-indigo-500 mt-0.5" />
                            <div>
                              <span className="text-sm text-gray-700">{appointment.owner.owner_address}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <UserCog className="h-3.5 w-3.5 mr-1.5" />
                          View Owner Profile
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-gray-500 text-sm">Owner information not available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* REDESIGNED: Vaccination Status */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center text-sm">
                    <Syringe className="h-4 w-4 mr-2 text-indigo-600" />
                    Vaccination Status
                  </h3>
                </div>

                <div className="p-3">
                  {vaccines.length > 0 ? (
                    <div>
                      {hasUpcomingVaccinations && (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-md mb-3 flex items-center">
                          <Bell className="h-4 w-4 text-amber-600 mr-2" />
                          <span className="text-xs text-amber-800">Vaccinations due soon</span>
                        </div>
                      )}
                    
                      <div className="space-y-2">
                        {vaccines.slice(0, 3).map((vaccine: Vaccination) => {
                          const isDue =
                            new Date(vaccine.next_due_date) <=
                            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                          const isPastDue = 
                            new Date(vaccine.next_due_date) < new Date();

                          return (
                            <div
                              key={vaccine.vaccination_id}
                              className={`p-2 rounded-md border flex justify-between items-center ${
                                isPastDue
                                  ? "bg-red-50 border-red-200"
                                  : isDue
                                  ? "bg-amber-50 border-amber-200"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                  {vaccine.vaccine_name}
                                </div>
                                <div className="flex items-center text-xs text-gray-600 mt-1">
                                  <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  {vaccine.date_administered
                                    ? `Last: ${new Date(vaccine.date_administered).toLocaleDateString()}`
                                    : "Never administered"}
                                </div>
                              </div>

                              <div className="flex flex-col items-end ml-2">
                                <Badge
                                  className={`text-xs ${
                                    isPastDue
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : isDue
                                      ? "bg-amber-100 text-amber-800 border-amber-200"
                                      : "bg-green-100 text-green-800 border-green-200"
                                  }`}
                                >
                                  {isPastDue ? "Overdue" : isDue ? "Due Soon" : "Up to date"}
                                </Badge>
                                <div className="text-xs text-gray-600 mt-1 whitespace-nowrap">
                                  Next: {new Date(vaccine.next_due_date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {vaccines.length > 3 && (
                        <div className="mt-3 text-center">
                          <Button
                            variant="link"
                            className="text-indigo-600 text-xs"
                            onClick={() => setActiveTab("vaccines")}
                          >
                            View all vaccinations
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <div className="w-10 h-10 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <Syringe className="h-5 w-5 text-gray-300" />
                      </div>
                      <p className="text-gray-500 text-xs mb-2">
                        No vaccination records found
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs px-3 py-1.5">
                        Add Vaccination Record
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Other tab contents would follow with similar sizing improvements */}
        
      </Tabs>
    </div>
  );
};

export default PatientManagement;
