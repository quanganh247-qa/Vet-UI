import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Expand, Plus, X } from "lucide-react";
import { WalkInRegistrationForm } from "./WalkInRegistrationForm";
import { cn } from "@/lib/utils";

export const WalkInDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-[#2C78E4] hover:bg-white/90 rounded-lg shadow-sm">
          <Plus className="h-4 w-4 mr-1" /> New Appointment
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "p-0 border-none overflow-hidden rounded-2xl shadow-2xl",
          "backdrop:bg-[#111827]/20 backdrop:backdrop-blur-sm",
          isExpanded ? "w-screen h-screen max-w-none" : "max-w-3xl"
        )}
      >
        <div className="relative bg-white rounded-2xl">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-[#F9FAFB] flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-2xl font-bold text-[#111827]">
                New Walk-in Registration
                <div className="text-sm font-normal text-[#4B5563] mt-1">
                  Register a new walk-in appointment
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#4B5563] hover:bg-[#2C78E4]/10 hover:text-[#2C78E4] rounded-lg"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Expand className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#4B5563] hover:bg-[#2C78E4]/10 hover:text-[#2C78E4] rounded-lg"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div
            className={cn(
              "overflow-y-auto bg-white",
              isExpanded ? "h-[calc(100vh-88px)]" : "max-h-[75vh]"
            )}
          >
            <div className="p-8">
              <WalkInRegistrationForm
                onSuccess={() => setOpen(false)}
                onCancel={() => setOpen(false)}
                className="space-y-6"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
