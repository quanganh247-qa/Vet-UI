import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin, User, Calendar, Info, Trash, Edit } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Doctor, WorkShift } from '@/types';

interface ShiftDetailsDialogProps {
  shift: WorkShift;
  doctor?: Doctor;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  userRole: 'doctor' | 'admin';
}

const ShiftDetailsDialog: React.FC<ShiftDetailsDialogProps> = ({
  shift,
  doctor,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  userRole,
}) => {
  // Format status badge
  const getStatusBadge = () => {
    switch (shift.status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{shift.title}</span>
            {getStatusBadge()}
          </DialogTitle>
          <DialogDescription>
            Shift details and information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Doctor Information */}
          <div className="flex items-start">
            <User className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
            <div>
              <h4 className="font-medium">Doctor</h4>
              <p className="text-sm text-gray-500">
                {doctor?.doctor_name || 'Unknown'}
                {doctor?.specialization && ` - ${doctor.specialization}`}
              </p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="flex items-start">
            <Calendar className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
            <div>
              <h4 className="font-medium">Date & Time</h4>
              <p className="text-sm text-gray-500">
                {format(new Date(shift.start_time), 'PPP')}, {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}
              </p>
            </div>
          </div>

          {/* Location if available */}
          {shift.location && (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
              <div>
                <h4 className="font-medium">Location</h4>
                <p className="text-sm text-gray-500">{shift.location}</p>
              </div>
            </div>
          )}

          {/* Description if available */}
          {shift.description && (
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-gray-500">{shift.description}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Created/Updated Info */}
          <div className="text-xs text-gray-500">
            <p>Created: {format(new Date(shift.created_at), 'PPP')}</p>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="space-x-2">
            {userRole === 'admin' && onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            {(userRole === 'admin' || userRole === 'doctor') && onEdit && (
              <Button onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftDetailsDialog;