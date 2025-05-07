import React from 'react';
import { format } from 'date-fns';
import { Clock, MapPin, User, Calendar, Info, Trash, Edit, Stethoscope, AlarmClock } from 'lucide-react';

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
  
  // Calculate shift duration in hours
  const calculateDuration = () => {
    try {
      const start = new Date(shift.start_time);
      const end = new Date(shift.end_time);
      const diffMs = end.getTime() - start.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);
      return `${diffHrs} ${diffHrs === 1 ? 'hour' : 'hours'}`;
    } catch (error) {
      return 'Unknown duration';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border border-indigo-200 bg-white">
        <DialogHeader className="border-b border-indigo-100 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-indigo-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-indigo-600" />
              {shift.title}
            </DialogTitle>
            {getStatusBadge()}
          </div>
          <DialogDescription className="text-indigo-500">
            Shift details and information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Doctor Information */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center">
              <Stethoscope className="h-5 w-5 mr-3 text-indigo-600" />
              <div>
                <h4 className="font-medium text-indigo-900">Doctor</h4>
                <p className="text-sm text-indigo-700">
                  {doctor?.doctor_name || 'Unknown Doctor'}
                  {doctor?.specialization && ` - ${doctor.specialization}`}
                </p>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Date</h4>
                  <p className="text-sm text-blue-700">
                    {format(new Date(shift.start_time), 'PPP')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center">
                <AlarmClock className="h-5 w-5 mr-3 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Time</h4>
                  <p className="text-sm text-green-700">
                    {format(new Date(shift.start_time), 'HH:mm')} - {format(new Date(shift.end_time), 'HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Duration */}
          <div className="border border-indigo-200 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                <span className="font-medium text-indigo-900">Duration</span>
              </div>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {calculateDuration()}
              </span>
            </div>
          </div>

          {/* Description if available */}
          {shift.description ? (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-3 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Description</h4>
                  <p className="text-sm text-amber-700 mt-1">{shift.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">No additional details provided for this shift</p>
            </div>
          )}

          <Separator className="my-2 border-indigo-100" />

          {/* Created/Updated Info */}
          <div className="text-xs text-indigo-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Created: {format(new Date(shift.created_at), 'PPP')}
          </div>
        </div>

        <DialogFooter className="flex justify-between border-t border-indigo-100 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            Close
          </Button>
          <div className="space-x-2">
            {userRole === 'admin' && onDelete && (
              <Button 
                variant="destructive" 
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            {(userRole === 'admin' || userRole === 'doctor') && onEdit && (
              <Button 
                onClick={onEdit} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white">
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