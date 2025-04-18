import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';

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

interface ShiftFormProps {
  doctors: Doctor[];
  shift?: WorkShift;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

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
  onSubmit,
  onCancel,
}) => {
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
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift Title</FormLabel>
              <FormControl>
                <Input placeholder="Morning Shift" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem
                      key={doctor.doctor_id}
                      value={doctor.doctor_id.toString()}
                    >
                      {doctor.doctor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 opacity-50" />
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 opacity-50" />
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Main Building, Room 101" {...field} />
              </FormControl>
              <FormDescription>
                Optional: Specify where this shift will take place
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional details about this shift"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional: Add any additional information about this shift
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{shift ? 'Update' : 'Create'} Shift</Button>
        </div>
      </form>
    </Form>
  );
};

export default ShiftForm;