import React, { useState } from "react";
import { 
  AlertCircle,
  Check, 
  User, 
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetOverlay,
} from "@/components/ui/sheet";

interface WalkInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => Promise<void>;
  onDecline?: () => Promise<void>;
}

const WalkInDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onDecline
}: WalkInDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) return;
    
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!onDecline) return;
    
    setIsProcessing(true);
    try {
      await onDecline();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetOverlay className="bg-gray-400/30" />
      <SheetContent className="sm:max-w-md bg-white p-0 flex flex-col">
        <div className="px-6 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Walk-In Appointment
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Register a new walk-in appointment
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-base">
                New Walk-In Appointment
              </h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Patient
                    </div>
                    <div className="text-sm text-gray-600">
                      {/* Replace with patient input field or selection */}
                      Patient name
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <User className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Doctor
                    </div>
                    <div className="text-sm text-gray-600">
                      {/* Replace with doctor selection */}
                      Doctor name
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Reason
                    </div>
                    <div className="text-sm text-gray-600">
                      {/* Replace with reason input field */}
                      Consultation reason
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-4">
                <Button
                  onClick={handleConfirm}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Confirm"}
                  {!isProcessing && <Check className="ml-2 h-4 w-4" />}
                </Button>

                <Button
                  onClick={handleDecline}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Cancel"}
                  {!isProcessing && <X className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full justify-center"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WalkInDialog; 