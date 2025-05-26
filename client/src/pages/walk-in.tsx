import React from "react";
import { useLocation } from "wouter";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalkInRegistrationForm } from "@/components/appointment/WalkInRegistrationForm";

export const WalkInPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleSuccess = () => {
    // Navigate back to appointments page after successful registration
    setLocation("/appointments");
  };

  const handleCancel = () => {
    // Navigate back to appointments page when cancelled
    setLocation("/appointments");
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background matching product management style */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/appointments")}
              className="text-white hover:bg-white/20 rounded-xl h-10 px-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Button>
            <div className="h-6 w-px bg-white/30" />
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Walk-in Registration</h1>
                <p className="text-sm text-white/90">Fast appointment booking for reception desk</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with consistent styling */}
      <div className="bg-white rounded-2xl border border-[#2C78E4]/20 shadow-sm overflow-hidden">
        <WalkInRegistrationForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default WalkInPage; 