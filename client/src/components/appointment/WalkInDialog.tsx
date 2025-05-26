import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, PlusCircle, X, UserPlus } from "lucide-react";
import { WalkInRegistrationForm } from "./WalkInRegistrationForm";
import { cn } from "@/lib/utils";

export const WalkInDialog: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3 flex items-center gap-3 border-0"
          onClick={() => setOpen(true)}
        >
          <div className="bg-white/20 rounded-full p-1">
            <UserPlus className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold">Quick Registration</span>
            <span className="text-xs opacity-90 hidden sm:block">New Walk-in Patient</span>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="p-0 border-none overflow-hidden rounded-2xl shadow-2xl max-w-5xl w-[95vw] h-[90vh] flex flex-col"
      >
        <div className="relative bg-white rounded-2xl h-full flex flex-col overflow-hidden">
          {/* Enhanced Header - Fixed */}
          <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <DialogHeader className="space-y-0">
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  Quick Patient Registration
                </DialogTitle>
                <div className="text-green-100 mt-2">
                  Fast and easy walk-in appointment booking for busy reception desk
                </div>
              </DialogHeader>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-lg h-10 w-10"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <WalkInRegistrationForm
              onSuccess={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
