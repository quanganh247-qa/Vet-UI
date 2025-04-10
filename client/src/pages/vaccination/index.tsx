import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Syringe, Play } from "lucide-react";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData } from "@/hooks/use-pet";
import VaccinationAdministration from "@/components/vaccination/VaccinationAdministration";
import { useToast } from "@/components/ui/use-toast";

const VaccinationPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const { data: appointment, isLoading: isAppointmentLoading } = useAppointmentData(id);
  const { data: patient, isLoading: isPatientLoading } = usePatientData(
    appointment?.pet?.pet_id
  );

  const [vaccinationCompleted, setVaccinationCompleted] = useState(false);

  const handleVaccinationComplete = () => {
    setVaccinationCompleted(true);
    toast({
      title: "Vaccination Record Saved",
      description: "The vaccination has been successfully recorded in the patient's chart.",
      className: "bg-green-50 border-green-200 text-green-800",
    });
    // Navigate to the next step in the workflow (e.g., follow-up or billing)
    navigate(`/appointment/${id}/follow-up`);
  };

  const handleCancel = () => {
    navigate(`/appointment/${id}`);
  };

  if (isAppointmentLoading || isPatientLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">
            Loading vaccination details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
            onClick={() => navigate(`/appointment/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Patient</span>
          </Button>
          <h1 className="text-white font-semibold text-lg">Vaccination</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            onClick={() => navigate(`/appointment/${id}/soap`)}
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            <span>Skip to SOAP</span>
          </Button>
        </div>
      </div>

      {/* Workflow Navigation */}
      <div className="px-4 pt-3">
        <WorkflowNavigation
          appointmentId={id}
          petId={patient?.pet_id?.toString()}
          currentStep="vaccination"
        />
      </div>

      {/* Patient header */}
      <div className="bg-gradient-to-b from-indigo-50 to-white pt-4 pb-4 px-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Patient photo and basic info */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative mx-auto sm:mx-0">
              <div className="h-24 w-24 rounded-lg shadow overflow-hidden flex-shrink-0 border-2 border-white">
                <img
                  src={
                    patient?.data_image
                      ? `data:image/png;base64,${patient.data_image}`
                      : "/fallback-image.png"
                  }
                  alt={patient?.name || "Pet"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full">
                <Syringe className="h-4 w-4" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-900">
                {patient?.name || "Unknown Patient"}
              </h2>
              <p className="text-sm text-gray-600">
                {patient?.type || "Unknown"} • {patient?.breed || "Unknown Breed"} • {patient?.age || "Unknown Age"}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  Vaccination Visit
                </span>
                {appointment?.priority === "urgent" && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    Priority
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Appointment and doctor info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:self-start">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-gray-500">Appointment</p>
                <p className="font-medium">
                  {appointment?.date
                    ? new Date(appointment.date).toLocaleDateString()
                    : "Unknown Date"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Time</p>
                <p className="font-medium">
                  {appointment?.time_slot?.start_time || "Unknown Time"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Doctor</p>
                <p className="font-medium">
                  {appointment?.doctor?.doctor_name || "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Room</p>
                <p className="font-medium">{appointment?.room || "Not Assigned"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
            <VaccinationAdministration
              appointmentId={id || ""}
              petId={patient?.pet_id?.toString() || ""}
              onComplete={handleVaccinationComplete}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VaccinationPage; 