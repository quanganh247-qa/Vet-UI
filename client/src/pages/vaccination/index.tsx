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