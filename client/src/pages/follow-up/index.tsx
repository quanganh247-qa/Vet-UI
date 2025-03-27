import React, { useState } from 'react';
import { useParams } from 'wouter';
import WorkflowNavigation from '@/components/WorkflowNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CalendarClock } from 'lucide-react';

const FollowUp: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { toast } = useToast();

  // Form state for scheduling a follow-up appointment
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  
  const handleSchedule = () => {
    // Here you would normally submit the appointment data to the server
    toast({
      title: "Follow-up Scheduled",
      description: "Your follow-up appointment has been scheduled successfully.",
      variant: "default"
    });
    // Optionally reset form fields
    setNotes('');
  };

  return (
    <div className="container mx-auto py-4">
      <WorkflowNavigation appointmentId={id} currentStep="follow-up" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Schedule Follow-up Appointment</h2>
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Follow-up Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
              <Input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Appointment Time</label>
              <Input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details or instructions..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
        <div className="flex justify-end p-4">
          <Button onClick={handleSchedule} className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" /> Schedule Follow-up
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FollowUp; 