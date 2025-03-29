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
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { data: appointment, error: appointmentError } = useAppointmentData(id);
  const { data: historyAppointments, error: historyAppointmentsError } =
    useHistoryAppointments(appointment?.pet?.pet_id);
  const { data: patientData, isLoading: isPatientLoading } = usePatientData(
    appointment?.pet?.pet_id
  );

  console.log("Pet", patientData);
  const { data: vaccines = [], isLoading: isVaccinesLoading } = useVaccineData(
    appointment?.pet?.pet_id
  );

  useEffect(() => {
    if (id) {
      setMedicalRecords(getMedicalRecordsByPatientId(parseInt(id)));
      setInvoices(mockInvoices);
    }
  }, [id]);

  // Function to navigate to treatment page
  const navigateToTreatment = () => {
    navigate(`/treatment/${appointment?.pet?.pet_id}`);
  };

  const navigateToSOAP = () => {
    navigate(`/soap-notes/${id}`);
  };

  // Add a function to navigate to the examination page
  const navigateToExamination = () => {
    navigate(`/appointment/${id}/examination`);
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
    <div className="w-full max-w-[95%] lg:max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Back button and page title */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-4 sm:px-6 md:px-10 py-4 sm:py-5 md:py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center w-full sm:w-auto">
          <Link
            href="/patients"
            className="text-white flex items-center hover:bg-white/20 rounded-lg px-3 sm:px-5 py-2 sm:py-3 transition-all text-base sm:text-lg font-medium"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
            <span className="font-medium">Back to Patients</span>
          </Link>
          <h1 className="text-white font-semibold ml-0 sm:ml-8 text-xl sm:text-2xl mt-2 sm:mt-0">
            Patient Management
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="default"
            className="bg-white/10 text-white border-white/20 hover:bg-white/30 flex items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-medium transition-all duration-200"
          >
            <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Print Report</span>
          </Button>
          <Button
            variant="outline"
            size="default"
            className="bg-white/10 text-white border-white/20 hover:bg-white/30 flex items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-medium transition-all duration-200"
          >
            <UserCog className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Edit Patient</span>
          </Button>
        </div>
      </div>

      {/* Workflow Navigation */}
      {appointment?.pet?.pet_id && (
        <div className="px-4 sm:px-6 pt-4">
          <WorkflowNavigation
            appointmentId={id}
            petId={appointment?.pet?.pet_id?.toString()}
            currentStep="patient-details"
          />
        </div>
      )}

      {/* Patient header - increased padding and sizing */}
      <div className="bg-gradient-to-b from-indigo-50 to-white pt-6 sm:pt-8 md:pt-12 pb-6 sm:pb-8 md:pb-10 px-4 sm:px-8 md:px-12 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
          {/* Patient photo and basic info */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div className="relative mx-auto sm:mx-0">
              <div className="h-32 w-32 sm:h-36 sm:w-36 md:h-44 md:w-44 rounded-xl shadow-md overflow-hidden flex-shrink-0 border-4 border-white transition-all duration-300 hover:shadow-lg hover:scale-105">
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
                  className={`absolute bottom-0 right-0 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-md ${
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  {patientData?.name}
                </h1>
                {hasUpcomingVaccinations && (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base md:text-lg font-medium transition-all duration-200 hover:bg-amber-200 mx-auto sm:mx-0 w-fit"
                  >
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    Vaccinations Due Soon
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 sm:gap-x-4 gap-y-2 sm:gap-y-3 mt-2 sm:mt-3">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 sm:px-5 py-1 sm:py-2 text-sm sm:text-base md:text-lg transition-all duration-200 hover:bg-indigo-200">
                  {patientData?.breed}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 sm:px-5 py-1 sm:py-2 text-sm sm:text-base md:text-lg transition-all duration-200 hover:bg-blue-200">
                  {patientData?.type}
                </Badge>
                <div className="text-gray-600 text-sm sm:text-base md:text-lg flex items-center gap-3 sm:gap-5 ml-0 sm:ml-2 mt-2 flex-wrap justify-center sm:justify-start">
                  <span className="flex items-center">
                    <span className="font-medium text-gray-700">Age:</span>{" "}
                    <span className="ml-1.5">{patientData?.age}</span>
                  </span>
                  <span className="hidden sm:block w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                  <span className="flex items-center">
                    <span className="font-medium text-gray-700">Weight:</span>{" "}
                    <span className="ml-1.5">{patientData?.weight}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 text-gray-700 justify-center sm:justify-start">
                <div className="flex items-center px-3 sm:px-5 py-2 sm:py-3 bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-gray-200 w-full sm:w-auto">
                  <span className="font-medium text-gray-700 text-sm sm:text-base md:text-lg">Owner:</span>
                  <span className="ml-2 sm:ml-3 text-sm sm:text-base md:text-lg">
                    {appointment?.owner.owner_name}
                  </span>
                </div>
                <div className="flex items-center px-3 sm:px-5 py-2 sm:py-3 bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-gray-200 w-full sm:w-auto">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-indigo-500" />
                  <span className="text-sm sm:text-base md:text-lg">{appointment?.owner.owner_phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-end mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-white shadow-sm flex items-center gap-2 sm:gap-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-xs sm:text-sm md:text-base font-medium px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3"
            >
              <CalendarPlus className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
              <span>New Appointment</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white shadow-sm flex items-center gap-2 sm:gap-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-xs sm:text-sm md:text-base font-medium px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3"
            >
              <FileSignature className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              <span>New Record</span>
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md flex items-center gap-2 text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3"
              onClick={navigateToExamination}
            >
              <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Start Examination</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs section - increased text size and spacing */}
      <Tabs
        defaultValue="overview"
        className="w-full px-4 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="border-b pb-2 sm:pb-3 mb-4 sm:mb-6 overflow-x-auto">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 bg-gray-100 p-1 sm:p-2 rounded-lg w-full max-w-4xl shadow-sm">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 sm:gap-3 data-[state=active]:bg-white data-[state=active]:shadow-md py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base md:text-lg font-medium transition-all duration-200 hover:bg-white/70"
            >
              <BarChart className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-2 sm:gap-3 data-[state=active]:bg-white data-[state=active]:shadow-md py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base md:text-lg font-medium transition-all duration-200 hover:bg-white/70"
            >
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              <span>Appointments</span>
            </TabsTrigger>
            <TabsTrigger
              value="medical-records"
              className="flex items-center gap-2 sm:gap-3 data-[state=active]:bg-white data-[state=active]:shadow-md py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base md:text-lg font-medium transition-all duration-200 hover:bg-white/70"
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              <span>Records</span>
            </TabsTrigger>
            <TabsTrigger
              value="vaccines"
              className="flex items-center gap-2 sm:gap-3 data-[state=active]:bg-white data-[state=active]:shadow-md py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base md:text-lg font-medium transition-all duration-200 hover:bg-white/70"
            >
              <Syringe className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              <span>Vaccines</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Main column - History and Records */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
              {/* Recent appointments card */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-3 sm:py-5 bg-gradient-to-r from-indigo-50 to-white border-b gap-3 sm:gap-0">
                  <h3 className="font-semibold text-gray-800 flex items-center text-lg sm:text-xl">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 mr-2 sm:mr-3 text-indigo-600" />
                    Recent Appointments
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white shadow-sm flex items-center gap-2 sm:gap-3 hover:bg-gray-50 transition-all duration-200 text-xs sm:text-sm md:text-lg px-3 sm:px-5 py-1.5 sm:py-2.5 hover:shadow-md"
                  >
                    <CalendarPlus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-indigo-600" />
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
                          className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex items-start gap-3 sm:gap-5 w-full sm:w-auto">
                              <div
                                className={`p-2 sm:p-3 rounded-lg ${
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
                                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-green-600" />
                                ) : appointment.status === "in-progress" ? (
                                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-blue-600" />
                                ) : (
                                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-indigo-600" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm sm:text-base md:text-lg">
                                  {appointment.type}
                                </div>
                                <div className="text-sm sm:text-base md:text-lg text-gray-600 mt-2 flex items-center">
                                  <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-gray-400" />
                                  {appointment.date}
                                </div>
                                <div className="text-sm sm:text-base md:text-lg text-gray-600 mt-2 flex items-center">
                                  <UserCog className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-gray-400" />
                                  Dr.{" "}
                                  {appointment.doctor_id === 1
                                    ? "Roberts"
                                    : appointment.doctor_id === 2
                                    ? "Carter"
                                    : "Chen"}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-start sm:items-end mt-3 sm:mt-0 w-full sm:w-auto">
                              <Badge
                                className={`text-xs sm:text-sm md:text-lg px-2 sm:px-4 py-1 sm:py-1.5 ${
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

                              <div className="mt-3 sm:mt-4 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white border-gray-200 hover:bg-gray-50 transition-all duration-200 text-xs sm:text-sm md:text-lg px-3 sm:px-5 py-1.5 sm:py-2.5 hover:shadow-md w-full sm:w-auto"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-6 sm:p-8 text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                      </div>
                      <h3 className="text-gray-500 font-medium mb-2 sm:mb-3 text-lg sm:text-xl">
                        No appointments found
                      </h3>
                      <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-4 sm:mb-5">
                        This patient doesn't have any appointment history
                      </p>
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base md:text-lg px-4 sm:px-6 py-2 sm:py-3 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
                      >
                        Schedule First Appointment
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent medical records card */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-3 sm:py-5 bg-gradient-to-r from-indigo-50 to-white border-b gap-3 sm:gap-0">
                  <h3 className="font-semibold text-gray-800 flex items-center text-lg sm:text-xl">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 mr-2 sm:mr-3 text-indigo-600" />
                    Medical Records
                  </h3>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white shadow-sm hover:bg-gray-50 transition-all duration-200 text-xs sm:text-sm md:text-lg px-3 sm:px-5 py-1.5 sm:py-2.5 hover:shadow-md"
                      onClick={() => {
                        // Handle sort
                      }}
                    >
                      <ArrowDownUp className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-indigo-600" />
                      Sort
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm md:text-lg px-3 sm:px-5 py-1.5 sm:py-2.5 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
                    >
                      <FilePlus2 className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                      New Record
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar column */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Upcoming vaccinations */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                <div className="px-4 sm:px-6 py-3 sm:py-5 bg-gradient-to-r from-indigo-50 to-white border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center text-lg sm:text-xl">
                    <Syringe className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 mr-2 sm:mr-3 text-indigo-600" />
                    Vaccination Status
                  </h3>
                </div>

                <div className="p-4 sm:p-6">
                  {vaccines.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {vaccines.slice(0, 3).map((vaccine: Vaccination) => {
                        const isDue =
                          new Date(vaccine.next_due_date) <=
                          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                        return (
                          <div
                            key={vaccine.vaccination_id}
                            className={`p-3 sm:p-5 rounded-lg border transition-all duration-200 hover:shadow-md ${
                              isDue
                                ? "bg-amber-50 border-amber-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                              <div>
                                <div className="font-medium text-gray-900 text-sm sm:text-base md:text-lg">
                                  {vaccine.vaccine_name}
                                </div>
                                <div className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
                                  Last:{" "}
                                  {vaccine.date_administered
                                    ? new Date(
                                        vaccine.date_administered
                                      ).toLocaleDateString()
                                    : "Never"}
                                </div>
                              </div>

                              <div className="flex flex-col items-start sm:items-end mt-2 sm:mt-0">
                                <div
                                  className={`text-sm sm:text-base md:text-lg font-medium ${
                                    isDue ? "text-amber-600" : "text-green-600"
                                  }`}
                                >
                                  {isDue ? "Due" : "Up to date"}
                                </div>
                                <div className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
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
                          className="text-indigo-600 hover:text-indigo-800 w-full mt-2 sm:mt-4 text-sm sm:text-base md:text-lg transition-all duration-200 hover:underline"
                          onClick={() => setActiveTab("vaccines")}
                        >
                          View all vaccinations
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 sm:py-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                        <Syringe className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg mb-3 sm:mb-4">
                        No vaccination records found
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-lg px-3 sm:px-5 py-1.5 sm:py-2.5 transition-all duration-200 hover:shadow-md">
                        Add Vaccination Record
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Other tab contents would follow with similar scaling improvements */}
        
      </Tabs>
    </div>
  );
};

export default PatientManagement;
