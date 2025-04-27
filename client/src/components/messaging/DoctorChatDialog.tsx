import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Search, Loader2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useStaffList, useDoctorPatientChat } from "@/hooks/use-messaging";
import { useAuth } from "@/context/auth-context";
import { DoctorDetail } from "@/types";

interface DoctorChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export function DoctorChatDialog({
  isOpen,
  onClose,
  onConversationCreated,
}: DoctorChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: staffList = [], isLoading } = useStaffList();
  const { findOrCreateConversation, isCreating } = useDoctorPatientChat();
  const { doctor, logout } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetail | null>(null);

  // Reset state when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedDoctor(null);
    }
  }, [isOpen]);

  // Filter staff based on search query
  const filteredStaff = Array.isArray(staffList) 
    ? staffList.filter((staff: DoctorDetail) => {
        return (
          (staff.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (!doctor || staff.doctor_id !== Number(doctor.id)) // Don't show the current user in the list
        );
      })
    : [];

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleStartConversation = async () => {
    if (!selectedDoctor || !doctor) return;
    
    try {
      const conversation = await findOrCreateConversation(selectedDoctor.doctor_id, Number(doctor.id));
      onConversationCreated(conversation.id);
      onClose();
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
          <DialogDescription>
            Select a doctor to start a conversation with.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border rounded-md px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="border-0 p-0 focus-visible:ring-0"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              // Loading skeleton
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border-b"
                  >
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px] mt-2" />
                    </div>
                  </div>
                ))
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No doctors found matching your search.
              </div>
            ) : (
              filteredStaff.map((staff: DoctorDetail) => (
                <div
                  key={staff.doctor_id}
                  className={`flex items-center gap-3 p-3 border-b cursor-pointer ${
                    selectedDoctor?.doctor_id === staff.doctor_id
                      ? "bg-accent"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedDoctor(staff)}
                >
                  <Avatar>
                    <AvatarImage src={staff.data_image} alt={staff.doctor_name} />
                    <AvatarFallback>
                      {getInitials(staff.doctor_name || staff.doctor_name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{staff.doctor_name}</p>
                    {staff.doctor_name && (
                      <p className="text-sm text-muted-foreground">
                        {staff.doctor_name}
                      </p>
                    )}
                  </div>
                  {/* {staff.online_status === "online" && (
                    <div className="ml-auto">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                  )} */}
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleStartConversation}
              disabled={!selectedDoctor || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Conversation"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}