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
        <Button className="bg-[#23b3c7] text-white border-[#b6e6f2] hover:bg-[#b6e6f2]">
          <Plus className="mr-2 h-5 w-5 stroke-[2.5]" />
          New Appointment
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "p-0 border-none overflow-hidden rounded-2xl shadow-2xl",
          "backdrop:bg-[#1e293b]/30 backdrop:backdrop-blur-sm",
          isExpanded ? "w-screen h-screen max-w-none" : "max-w-3xl"
        )}
      >
        <div className="relative bg-white">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-[#f6fcfe] flex items-center justify-between px-8 py-6 border-b border-[#b6e6f2]">
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-2xl font-bold text-[#1e293b]">
                New Walk-in Registration
                <div className="text-sm font-normal text-[#888] mt-1">
                  Register a new walk-in appointment
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#888] hover:bg-[#eaf7fa] rounded-xl"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Expand className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#888] hover:bg-[#eaf7fa] rounded-xl"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div
            className={cn(
              "overflow-y-auto bg-[#f6fcfe]",
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
