import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Syringe,
  Play,
  AlertCircle,
  User,
  Settings,
  LogOut,
  ChevronRight,
  FileText,
  PlusCircle,
} from "lucide-react";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { useAppointmentData } from "@/hooks/use-appointment";
import { usePatientData } from "@/hooks/use-pet";
import VaccinationAdministration from "@/components/vaccination/VaccinationAdministration";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const VaccinationPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: appointment, isLoading: isAppointmentLoading } =
    useAppointmentData(id);
  const { data: patient, isLoading: isPatientLoading } = usePatientData(
    appointment?.pet?.pet_id
  );

  const [vaccinationCompleted, setVaccinationCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("administration");

  const handleVaccinationComplete = () => {
    setVaccinationCompleted(true);
    toast({
      title: "Vaccination Record Saved",
      description:
        "The vaccination has been successfully recorded in the patient's chart.",
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

  // Define workflow steps
  const tabSteps = [
    { id: "administration", label: "Administration", icon: Syringe },
    { id: "history", label: "History", icon: FileText },
  ];

  const activeIndex = tabSteps.findIndex((tab) => tab.id === activeTab);
  const progressPercentage = ((activeIndex + 1) / tabSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Vaccination Management
            </h1>
            <p className="text-indigo-100 text-sm">
              Record and manage patient vaccinations
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => navigate(`/appointment/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patient
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/login")}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="bg-white rounded-lg border border-indigo-100 shadow-sm p-6 mb-6">
          {/* Patient info card */}
          <div className="mb-6">
            <Card className="border border-indigo-100 bg-indigo-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-indigo-700">
                  <AlertCircle className="h-4 w-4 mr-2 text-indigo-500" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-indigo-500 font-medium mb-1">
                      Patient Name
                    </p>
                    <p className="text-indigo-900 font-medium">
                      {patient?.pet_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-500 font-medium mb-1">
                      Species / Breed
                    </p>
                    <p className="text-indigo-900 font-medium">
                      {patient?.pet_species || "N/A"} /{" "}
                      {patient?.pet_breed || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-500 font-medium mb-1">
                      Age / Weight
                    </p>
                    <p className="text-indigo-900 font-medium">
                      {patient?.pet_age || "N/A"} years /{" "}
                      {patient?.pet_weight || "N/A"} kg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="bg-white rounded-lg border border-indigo-100 overflow-hidden">
            <VaccinationAdministration
              appointmentId={id || ""}
              petId={patient?.pet_id?.toString() || ""}
              onComplete={handleVaccinationComplete}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationPage;
