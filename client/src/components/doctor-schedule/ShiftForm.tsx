import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Save, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Doctor, WorkShift } from '@/types';
import { ShiftTemplate } from './ShiftTemplateManager';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DialogFooter } from '@/components/ui/dialog';

interface ShiftFormProps {
  doctors: Doctor[];
  shift?: WorkShift;
  templates?: ShiftTemplate[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

// Default shift templates
const DEFAULT_TEMPLATES: ShiftTemplate[] = [
  {
    id: 'morning-shift',
    name: 'Morning Shift',
    startTime: '08:00',
    endTime: '12:00',
    status: 'scheduled',
    description: 'Standard morning shift'
  },
  {
    id: 'afternoon-shift',
    name: 'Afternoon Shift',
    startTime: '13:00',
    endTime: '17:00',
    status: 'scheduled',
    description: 'Standard afternoon shift'
  }
];

// Form validation schema
const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  doctorId: z.string({ required_error: 'Please select a doctor' }),
  date: z.date({ required_error: 'Please select a date' }),
  startTime: z.string({ required_error: 'Please select a start time' }),
  endTime: z.string({ required_error: 'Please select an end time' }),
  status: z.enum(['scheduled', 'completed', 'cancelled'], {
    required_error: 'Please select a status',
  }),
  location: z.string().optional(),
  description: z.string().optional(),
});

const ShiftForm: React.FC<ShiftFormProps> = ({
  doctors,
  shift,
  templates,
  onSubmit,
  onCancel,
}) => {
  // State to track if a template is being applied
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("custom");
  const [allTemplates, setAllTemplates] = useState<ShiftTemplate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(shift ? new Date(shift.start_time) : new Date());

  // Combine provided templates with default templates
  useEffect(() => {
    const combinedTemplates = [...DEFAULT_TEMPLATES];
    if (templates && templates.length > 0) {
      combinedTemplates.push(...templates);
    }
    setAllTemplates(combinedTemplates);
  }, [templates]);

  // Initialize form with default values or existing shift data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: shift
      ? {
          title: shift.title,
          doctorId: shift.doctor_id,
          date: new Date(shift.start_time),
          startTime: format(new Date(shift.start_time), 'HH:mm'),
          endTime: format(new Date(shift.end_time), 'HH:mm'),
          status: shift.status,
          location: shift.location || '',
          description: shift.description || '',
        }
      : {
          title: '',
          doctorId: '',
          date: new Date(),
          startTime: '09:00',
          endTime: '17:00',
          status: 'scheduled',
          location: '',
          description: '',
        },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    onSubmit(values);
    setTimeout(() => setIsSubmitting(false), 1000); // Safety timeout in case onSubmit doesn't handle state
  };

  // Apply the selected template to the form
  const applyTemplate = (templateId: string) => {
    if (templateId === "custom") {
      setSelectedTemplate("custom");
      return;
    }
    
    const template = allTemplates?.find((t) => t.id === templateId);
    if (template) {
      form.setValue('title', template.name);
      form.setValue('startTime', template.startTime);
      form.setValue('endTime', template.endTime);
      form.setValue('description', template.description);
      form.setValue('status', template.status);
      setSelectedTemplate(templateId);
    }
  };

  // Handle direct date input change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
      form.setValue('date', date);
    }
  };

  return (
    <>
      <ScrollArea className="max-h-[60vh] px-1">
        <div className="space-y-4 p-1">
          {/* Template selector */}
          <div className="mb-4">
            <Label htmlFor="template" className="mb-1.5 block">Shift Template</Label>
            <Select
              value={selectedTemplate || 'custom'}
              onValueChange={applyTemplate}
            >
              <SelectTrigger id="template" className="border-indigo-200 focus:border-indigo-500">
                <SelectValue placeholder="Select a template or create custom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Shift</SelectItem>
                {allTemplates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.startTime} - {template.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Choose a template to quickly fill shift details or create a custom shift
            </p>
          </div>

          <div>
            <Label htmlFor="title" className="mb-1.5 block">Shift Title*</Label>
            <Input
              id="title"
              placeholder="Morning Shift"
              value={form.watch('title')}
              onChange={(e) => form.setValue('title', e.target.value)}
              className="border-indigo-200 focus:border-indigo-500"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="doctorId" className="mb-1.5 block">Doctor*</Label>
            <Select
              value={form.watch('doctorId')}
              onValueChange={(value) => form.setValue('doctorId', value)}
            >
              <SelectTrigger id="doctorId" className="border-indigo-200 focus:border-indigo-500">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors?.map((doctor) => (
                  <SelectItem
                    key={doctor.doctor_id}
                    value={doctor.doctor_id.toString()}
                  >
                    {doctor.doctor_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.doctorId && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.doctorId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="mb-1.5 block">Date*</Label>
              <Input
                id="date"
                type="date"
                value={format(form.watch('date') || new Date(), 'yyyy-MM-dd')}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    form.setValue('date', date);
                  }
                }}
                className="border-indigo-200 focus:border-indigo-500"
              />
              {form.formState.errors.date && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status" className="mb-1.5 block">Status*</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as any)}
              >
                <SelectTrigger id="status" className="border-indigo-200 focus:border-indigo-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime" className="mb-1.5 block">Start Time*</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-400" />
                <Input
                  id="startTime"
                  type="time"
                  value={form.watch('startTime')}
                  onChange={(e) => form.setValue('startTime', e.target.value)}
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>
              {form.formState.errors.startTime && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.startTime.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endTime" className="mb-1.5 block">End Time*</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-400" />
                <Input
                  id="endTime"
                  type="time"
                  value={form.watch('endTime')}
                  onChange={(e) => form.setValue('endTime', e.target.value)}
                  className="border-indigo-200 focus:border-indigo-500"
                />
              </div>
              {form.formState.errors.endTime && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="mb-1.5 block">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this shift"
              value={form.watch('description') || ''}
              onChange={(e) => form.setValue('description', e.target.value)}
              rows={3}
              className="border-indigo-200 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Add any additional information about this shift
            </p>
            {form.formState.errors.description && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>
        </div>
      </ScrollArea>

      <DialogFooter className="border-t border-indigo-100 pt-4 mt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          Cancel
        </Button>
        <Button
          disabled={isSubmitting || (!form.watch('title') || !form.watch('doctorId'))}
          onClick={() => {
            // Manually trigger form submission with current values
            const values = form.getValues();
            handleSubmit(values);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {shift ? 'Update' : 'Create'} Shift
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
};

export default ShiftForm;