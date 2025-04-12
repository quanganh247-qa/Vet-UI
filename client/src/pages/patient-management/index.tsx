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
            <p className="text-indigo-100 text-xs hidden sm:block">View and manage patient information</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/30 flex items-center gap-2 text-xs font-medium"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </Button>
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

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 mt-1.5">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-2 py-0.5 text-xs">
                  {patientData?.breed}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-2 py-0.5 text-xs">
                  {patientData?.type}
                </Badge>
                <div className="text-gray-600 text-xs flex items-center gap-3 ml-0 sm:ml-2 mt-1.5 flex-wrap justify-center sm:justify-start">
                  <span className="flex items-center">
                    <span className="font-medium text-gray-700">Age:</span>{" "}
                    <span className="ml-1">{patientData?.age}</span>
                  </span>
                  <span className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="flex items-center">
                    <span className="font-medium text-gray-700">Weight:</span>{" "}
                    <span className="ml-1">{patientData?.weight}</span>
                  </span>
                </div>
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

      {/* Tabs section - standardized styling */}
      <Tabs
        defaultValue="overview"
        className="w-full px-4 py-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="border-b pb-2 mb-4 overflow-x-auto">
          <TabsList className="inline-flex bg-gray-100 p-1 rounded-md shadow-sm">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow py-1.5 px-3 text-xs font-medium transition-all"
            >
              <BarChart className="h-3.5 w-3.5" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow py-1.5 px-3 text-xs font-medium transition-all"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Appointments</span>
            </TabsTrigger>
            <TabsTrigger
              value="medical-records"
              className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow py-1.5 px-3 text-xs font-medium transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Records</span>
            </TabsTrigger>
            <TabsTrigger
              value="vaccines"
              className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow py-1.5 px-3 text-xs font-medium transition-all"
            >
              <Syringe className="h-3.5 w-3.5" />
              <span>Vaccines</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main column - History and Records */}
            <div className="lg:col-span-2 space-y-4">
              {/* Recent appointments card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b gap-2 sm:gap-0">
                  <h3 className="font-medium text-gray-800 flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                    Recent Appointments
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white shadow-sm flex items-center gap-1.5 hover:bg-gray-50 transition-all text-xs px-2.5 py-1 hover:shadow"
                  >
                    <CalendarPlus className="h-3.5 w-3.5 text-indigo-600" />
                    <span>New Appointment</span>
                  </Button>
                </div>

                <div className="divide-y divide-gray-100">
                  {historyAppointments?.length > 0 ? (
                    historyAppointments
                      .slice(0, 3)
                      .map((appointment: Appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                            <div className="flex items-start gap-2 w-full sm:w-auto">
                              <div
                                className={`p-1.5 rounded-md ${
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
                              <div>
                                <div className="font-medium text-gray-900 text-xs">
                                  {appointment.type}
                                </div>
                                <div className="text-xs text-gray-600 mt-1 flex items-center">
                                  <CalendarClock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  {appointment.date}
                                </div>
                                <div className="text-xs text-gray-600 mt-1 flex items-center">
                                  <UserCog className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  Dr.{" "}
                                  {appointment.doctor_id === 1
                                    ? "Roberts"
                                    : appointment.doctor_id === 2
                                    ? "Carter"
                                    : "Chen"}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-start sm:items-end mt-2 sm:mt-0 w-full sm:w-auto">
                              <Badge
                                className={`text-xs px-2 py-0.5 ${
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

                              <div className="mt-2 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white border-gray-200 hover:bg-gray-50 transition-all text-xs px-2 py-1 hover:shadow w-full sm:w-auto"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
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
                        className="bg-indigo-600 hover:bg-indigo-700 text-xs px-3 py-1.5 transition-all hover:shadow"
                      >
                        Schedule First Appointment
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent medical records card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b gap-2 sm:gap-0">
                  <h3 className="font-medium text-gray-800 flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                    Medical Records
                  </h3>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white shadow-sm hover:bg-gray-50 transition-all text-xs px-2.5 py-1 hover:shadow"
                      onClick={() => {
                        // Handle sort
                      }}
                    >
                      <ArrowDownUp className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
                      Sort
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-xs px-2.5 py-1 transition-all hover:shadow text-white"
                    >
                      <FilePlus2 className="mr-1.5 h-3.5 w-3.5" />
                      New Record
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar column */}
            <div className="space-y-4">
              {/* Upcoming vaccinations */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-white border-b">
                  <h3 className="font-medium text-gray-800 flex items-center text-sm">
                    <Syringe className="h-4 w-4 mr-2 text-indigo-600" />
                    Vaccination Status
                  </h3>
                </div>

                <div className="p-4">
                  {vaccines.length > 0 ? (
                    <div className="space-y-2">
                      {vaccines.slice(0, 3).map((vaccine: Vaccination) => {
                        const isDue =
                          new Date(vaccine.next_due_date) <=
                          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                        return (
                          <div
                            key={vaccine.vaccination_id}
                            className={`p-2 rounded-md border transition-all hover:shadow ${
                              isDue
                                ? "bg-amber-50 border-amber-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
                              <div>
                                <div className="font-medium text-gray-900 text-xs">
                                  {vaccine.vaccine_name}
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  Last:{" "}
                                  {vaccine.date_administered
                                    ? new Date(
                                        vaccine.date_administered
                                      ).toLocaleDateString()
                                    : "Never"}
                                </div>
                              </div>

                              <div className="flex flex-col items-start sm:items-end mt-1 sm:mt-0">
                                <div
                                  className={`text-xs font-medium ${
                                    isDue ? "text-amber-600" : "text-green-600"
                                  }`}
                                >
                                  {isDue ? "Due" : "Up to date"}
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  Next:{" "}
                                  {new Date(
                                    vaccine.next_due_date
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {vaccines.length > 3 && (
                        <Button
                          variant="link"
                          className="text-indigo-600 hover:text-indigo-800 w-full mt-1 text-xs transition-all hover:underline"
                          onClick={() => setActiveTab("vaccines")}
                        >
                          View all vaccinations
                        </Button>
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
                        className="mt-1 text-xs px-2 py-1 transition-all hover:shadow">
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
