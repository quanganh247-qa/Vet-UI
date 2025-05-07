import { X } from "lucide-react";
import { forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationDialogProps {
  notification: {
    id: string | number;
    title?: string;
    message?: string;
    created_at?: string;
    read?: boolean;
    appointment_id?: number;
  } | null;
  open: boolean;
  onClose: () => void;
}

export const NotificationDialog = forwardRef<HTMLDivElement, NotificationDialogProps>(
  ({ notification, open, onClose }, ref) => {
    if (!notification) return null;

    const formattedDate = notification.created_at 
      ? new Date(notification.created_at).toLocaleString() 
      : 'Unknown date';

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-lg shadow-lg p-0">
          <DialogHeader className="bg-indigo-50 p-6 rounded-t-lg">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-semibold text-indigo-900">
                {notification.title || 'Notification'}
              </DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-indigo-100"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              {formattedDate}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <p className={cn(
              "text-gray-800 whitespace-pre-wrap",
              notification.read ? "font-normal" : "font-medium"
            )}>
              {notification.message}
            </p>
            
            {notification.appointment_id && (
              <div className="mt-6">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    window.location.href = `/appointment/${notification.appointment_id}/check-in`;
                    onClose();
                  }}
                >
                  Go to Appointment
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

NotificationDialog.displayName = "NotificationDialog";