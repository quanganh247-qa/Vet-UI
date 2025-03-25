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
import { Input } from "@/components/ui/input";

import MedicationReminder from "@/components/medical-records/MedicationReminder";

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
      {/* Back button and page title */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/patients"
            className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Patients</span>
          </Link>
          <h1 className="text-white font-semibold ml-4 text-lg">
            Patient Management
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1"
          >
            <UserCog className="h-4 w-4" />
            <span>Edit Patient</span>
          </Button>
        </div>
      </div>

      {/* Workflow Navigation */}
      {appointment?.pet?.pet_id && (
        <div className="px-4 pt-3">
          <WorkflowNavigation
            appointmentId={id}
            petId={appointment?.pet?.pet_id?.toString()}
            currentStep="patient-details"
          />
        </div>
      )}

      {/* Patient header */}
      <div className="bg-gradient-to-b from-indigo-50 to-white pt-8 pb-6 px-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Patient photo and basic info */}
          <div className="flex gap-6">
            <div className="relative">
              <div className="h-28 w-28 rounded-xl shadow-md overflow-hidden flex-shrink-0 border-4 border-white">
                <img
                  src={
                    patientData?.image_url || "https://via.placeholder.com/96"
                  }
                  alt={patientData?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {patientData?.gender && (
                <div
                  className={`absolute bottom-0 right-0 h-7 w-7 rounded-full flex items-center justify-center text-white shadow-md ${
                    patientData?.gender === "Male"
                      ? "bg-blue-500"
                      : "bg-pink-500"
                  }`}
                >
                  {patientData?.gender === "Male" ? "♂" : "♀"}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {patientData?.name}
                </h1>
                {hasUpcomingVaccinations && (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1 px-2 py-1 font-medium"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    Vaccinations Due Soon
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1">
                  {patientData?.breed}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                  {patientData?.type}
                </Badge>
                <div className="text-gray-600 text-sm flex items-center gap-3 ml-1">
                  <span className="flex items-center">
                    <span className="font-medium text-gray-700">Age:</span>{" "}
                    <span className="ml-1">{patientData?.age}</span>
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="flex items-center">
                    <span className="font-medium text-gray-700">Weight:</span>{" "}
                    <span className="ml-1">{patientData?.weight}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center mt-3 text-gray-700">
                <div className="flex items-center px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                  <span className="font-medium text-gray-700">Owner:</span>
                  <span className="ml-1.5">{appointment?.owner.owner_name}</span>
                </div>
                <div className="flex items-center ml-3 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                  <span>{appointment?.owner.owner_phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white shadow-sm flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Phone className="h-4 w-4 text-green-500" />
              <span>Call</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white shadow-sm flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Mail className="h-4 w-4 text-blue-500" />
              <span>Email</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white shadow-sm flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <CalendarPlus className="h-4 w-4 text-indigo-500" />
              <span>New Appointment</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white shadow-sm flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <FileSignature className="h-4 w-4 text-amber-500" />
              <span>New Record</span>
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
              onClick={navigateToSOAP}
            >
              <Activity className="h-4 w-4" />
              <span>Complete SOAP</span>
            </Button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 uppercase font-medium">
                Last Visit
              </div>
              <Calendar className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-2 font-semibold text-gray-800">
              {historyAppointments && historyAppointments.length > 0
                ? historyAppointments[0].date
                : "No records"}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 uppercase font-medium">
                Vaccines
              </div>
              <Syringe className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-2 font-semibold text-gray-800 flex items-center gap-1">
              {hasUpcomingVaccinations ? (
                <>
                  <span className="text-amber-600">Due Soon</span>
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                </>
              ) : vaccines && vaccines.length > 0 ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Up to date
                </span>
              ) : (
                "No records"
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 uppercase font-medium">
                Medications
              </div>
              <FileBarChart className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-2 font-semibold text-gray-800">
              {medicalRecords.some((r) => r.treatments?.length > 0) ? (
                <span className="text-blue-600 flex items-center">
                  {medicalRecords.flatMap((r) => r.treatments).length} Active
                </span>
              ) : (
                "None active"
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 uppercase font-medium">
                Status
              </div>
              <Activity className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-700 border-green-200 px-2.5 py-1 font-medium">
                Healthy
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <Tabs
        defaultValue="overview"
        className="w-full px-6 py-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="border-b pb-2 mb-4">
          <TabsList className="grid grid-cols-5 bg-gray-100 p-1 rounded-md w-full max-w-3xl">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BarChart className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              <span>Appointments</span>
            </TabsTrigger>
            <TabsTrigger
              value="medical-records"
              className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4" />
              <span>Records</span>
            </TabsTrigger>
            <TabsTrigger
              value="vaccines"
              className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Syringe className="h-4 w-4" />
              <span>Vaccines</span>
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="flex items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Receipt className="h-4 w-4" />
              <span>Billing</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main column - History and Records */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent appointments card */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                    Recent Appointments
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white shadow-sm flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <CalendarPlus className="h-4 w-4 text-indigo-600" />
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
                          className="p-5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                              <div
                                className={`p-2.5 rounded-lg ${
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
                                  <CheckCircle className="h-6 w-6 text-green-600" />
                                ) : appointment.status === "in-progress" ? (
                                  <Activity className="h-6 w-6 text-blue-600" />
                                ) : (
                                  <Calendar className="h-6 w-6 text-indigo-600" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-base">
                                  {appointment.type}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 flex items-center">
                                  <CalendarClock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                  {appointment.date} • {appointment.start_time}{" "}
                                  - {appointment.end_time}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 flex items-center">
                                  <UserCog className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                  Dr.{" "}
                                  {appointment.doctor_id === 1
                                    ? "Roberts"
                                    : appointment.doctor_id === 2
                                    ? "Carter"
                                    : "Chen"}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end">
                              <Badge
                                className={
                                  appointment.status === "completed"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : appointment.status === "in-progress"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : appointment.status === "scheduled"
                                    ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                }
                              >
                                {appointment.status === "completed"
                                  ? "Completed"
                                  : appointment.status === "in-progress"
                                  ? "In Progress"
                                  : "Scheduled"}
                              </Badge>

                              <div className="mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Calendar className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="text-gray-500 font-medium mb-1">
                        No appointments found
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        This patient doesn't have any appointment history
                      </p>
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Schedule First Appointment
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent medical records card */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                    Medical Records
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white shadow-sm hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        // Handle sort
                      }}
                    >
                      <ArrowDownUp className="mr-2 h-4 w-4 text-indigo-600" />
                      Sort
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FilePlus2 className="mr-2 h-4 w-4" />
                      New Record
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar column */}
            <div className="space-y-6">
              {/* Medication reminders */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-indigo-600" />
                    Medication Reminders
                  </h3>
                </div>

                <div className="p-5">
                  <MedicationReminder patientId={appointment?.pet?.pet_id} />
                </div>
              </div>

              {/* Upcoming vaccinations */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Syringe className="h-5 w-5 mr-2 text-indigo-600" />
                    Vaccination Status
                  </h3>
                </div>

                <div className="p-5">
                  {vaccines.length > 0 ? (
                    <div className="space-y-3">
                      {vaccines.slice(0, 3).map((vaccine: Vaccination) => {
                        const isDue =
                          new Date(vaccine.next_due_date) <=
                          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                        return (
                          <div
                            key={vaccine.vaccination_id}
                            className={`p-3 rounded-lg border ${
                              isDue
                                ? "bg-amber-50 border-amber-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {vaccine.vaccine_name}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Last:{" "}
                                  {vaccine.date_administered
                                    ? new Date(
                                        vaccine.date_administered
                                      ).toLocaleDateString()
                                    : "Never"}
                                </div>
                              </div>

                              <div className="flex flex-col items-end">
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
                          className="text-indigo-600 hover:text-indigo-800 w-full mt-2"
                          onClick={() => setActiveTab("vaccines")}
                        >
                          View all vaccinations
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <Syringe className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-gray-500 text-sm mb-2">
                        No vaccination records found
                      </p>
                      <Button variant="outline" size="sm" className="mt-1">
                        Add Vaccination Record
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Weight and vital trends */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-indigo-600" />
                    Weight Tracker
                  </h3>
                </div>

                <div className="p-5">
                  <div className="h-32 flex flex-col items-center justify-center">
                    <div className="text-gray-400 text-sm">
                      Weight trend visualization would appear here
                    </div>
                    <Button
                      variant="link"
                      className="text-indigo-600 hover:text-indigo-800 mt-3"
                    >
                      View full health trends
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                Appointment History
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  New Appointment
                </Button>
              </div>
            </div>

            <div className="p-4">
              {/* Filter and search controls */}
              <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2 flex-1">
                  <div className="relative max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="py-2 pl-10 pr-4 block w-full border border-gray-200 rounded-md text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Search appointments..."
                    />
                  </div>

                  <div className="min-w-[180px]">
                    <select className="py-2 pl-3 pr-10 block w-full border border-gray-200 rounded-md text-sm focus:border-indigo-500 focus:ring-indigo-500">
                      <option value="">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="checked-in">Checked In</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 flex items-center bg-transparent hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1 text-gray-500" />
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 flex items-center bg-transparent hover:bg-gray-50"
                  >
                    <Printer className="h-4 w-4 mr-1 text-gray-500" />
                    Print
                  </Button>
                </div>
              </div>

              {/* Appointments table */}
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-medium">Date & Time</TableHead>
                      <TableHead className="font-medium">Service</TableHead>
                      <TableHead className="font-medium">Doctor</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyAppointments?.length > 0 ? (
                      historyAppointments.map((appointment: Appointment) => (
                        <TableRow
                          key={appointment.id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="py-3">
                            <div className="font-medium text-gray-900">
                              {appointment.date}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.start_time} - {appointment.end_time}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="font-medium text-gray-900">
                              {appointment.type}
                            </div>
                            {appointment.reason && (
                              <div className="text-sm text-gray-500">
                                {appointment.reason}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 text-indigo-700 font-medium">
                                {appointment.doctor_id === 1
                                  ? "DR"
                                  : appointment.doctor_id === 2
                                  ? "JC"
                                  : "LC"}
                              </div>
                              <div>
                                Dr.{" "}
                                {appointment.doctor_id === 1
                                  ? "Roberts"
                                  : appointment.doctor_id === 2
                                  ? "Carter"
                                  : "Chen"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge
                              className={
                                appointment.status === "Completed"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {appointment.status?.replace(/_/g, " ") ||
                                "Unknown Status"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Calendar className="h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500 mb-2">
                              No appointment history available
                            </p>
                            <Button
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              Schedule First Appointment
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {historyAppointments?.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(historyAppointments.length, 10)} of{" "}
                    {historyAppointments.length} appointments
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 flex items-center justify-center"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 flex items-center justify-center bg-indigo-50 text-indigo-600 border-indigo-200"
                    >
                      1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 flex items-center justify-center"
                    >
                      2
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 flex items-center justify-center"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vaccines" className="mt-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-white border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Syringe className="h-4 w-4 mr-2 text-emerald-600" />
                Vaccination History
              </h3>
              <Button className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Vaccine
              </Button>
            </div>

            {/* Vaccination History */}

            {vaccines.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {vaccines.map((vaccine: Vaccination) => (
                  <div
                    key={vaccine.vaccination_id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {vaccine.vaccine_name}
                          </h3>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            {vaccine.vaccination_id}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                          {vaccine.date_administered}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white shadow-sm flex items-center gap-1"
                        >
                          <Printer className="h-4 w-4" />
                          <span>Print</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white shadow-sm flex items-center gap-1"
                        >
                          <Pencil className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500">
                <Syringe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  No Vaccinations Yet
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  This patient doesn't have any vaccinations yet.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-white border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Receipt className="h-4 w-4 mr-2 text-purple-600" />
                Billing &amp; Invoices
              </h3>
              <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="w-full sm:w-2/3">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-900 flex items-center mb-3">
                      <CreditCard className="h-4 w-4 mr-2 text-gray-600" />
                      Billing Summary
                    </h4>

                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">${invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Total Billed</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-purple-600">${invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Paid</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-red-600">${invoices.filter(i => i.status === 'Unpaid').reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Outstanding</div>
                      </div>
                    </div> */}
                  </div>
                </div>

                <div className="w-full sm:w-1/3">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 h-full">
                    <h4 className="font-medium text-purple-900 flex items-center mb-3">
                      <Info className="h-4 w-4 mr-2 text-purple-600" />
                      Payment Information
                    </h4>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Payment Method:
                        </span>
                        <span className="text-sm font-medium flex items-center">
                          <CreditCard className="h-3.5 w-3.5 mr-1.5 text-gray-600" />
                          Visa ending in 5463
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Insurance:
                        </span>
                        <span className="text-sm font-medium">
                          PetGuard Plus
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Policy No:
                        </span>
                        <span className="text-sm font-medium">PG-4567239</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-purple-200">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center mt-2 bg-white border-purple-200"
                      >
                        <PencilLine className="h-3.5 w-3.5 mr-1.5" />
                        Update Payment Info
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {invoices.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">
                      Recent Invoices
                    </h4>
                    <div className="flex gap-2">
                      <div>
                        <Select>
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select>
                          <SelectTrigger className="w-[110px] h-8 text-xs">
                            <SelectValue placeholder="Last 3 Months" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3months">
                              Last 3 Months
                            </SelectItem>
                            <SelectItem value="6months">
                              Last 6 Months
                            </SelectItem>
                            <SelectItem value="1year">Last Year</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="w-[100px]">Invoice #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {invoice.id}
                            </TableCell>
                            <TableCell>{invoice.date}</TableCell>
                            <TableCell>{invoice.amount}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  invoice.status === "Paid"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                                }
                              >
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                >
                                  <Printer className="h-4 w-4 mr-1" />
                                  Print
                                </Button>
                                {invoice.status === "Unpaid" && (
                                  <Button
                                    size="sm"
                                    className="h-8 bg-purple-600 hover:bg-purple-700"
                                  >
                                    <CreditCard className="h-4 w-4 mr-1" />
                                    Pay
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {Math.min(5, invoices.length)} of{" "}
                      {invoices.length} invoices
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled>
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button variant="outline" size="sm">
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    No Invoices Yet
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    This patient doesn't have any invoices or billing history.
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Create First Invoice
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientManagement;
