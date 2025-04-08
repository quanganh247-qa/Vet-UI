import React, { useState } from 'react';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Card, CardContent } from '@/components/ui/card';
import { Doctor, WorkShift } from '@/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for the calendar
const localizer = momentLocalizer(moment);

interface DoctorScheduleCalendarProps {
  shifts: WorkShift[];
  doctors: Doctor[];
  onClickShift: (shift: WorkShift) => void;
  userRole: 'doctor' | 'admin';
  currentDoctorId: string;
}

const DoctorScheduleCalendar: React.FC<DoctorScheduleCalendarProps> = ({
  shifts,
  doctors,
  onClickShift,
  userRole,
  currentDoctorId,
}) => {
  const [view, setView] = useState<string>('week');

  // Format events for the calendar
  const events = shifts.map((shift) => {
    const doctor = doctors.find((d) => d.doctor_id.toString() === shift.doctor_id);
    return {
      id: shift.id,
      title: `${shift.title} - ${doctor?.doctor_name || 'Unknown'}`,
      start: new Date(shift.start_time),
      end: new Date(shift.end_time),
      resource: shift,
    };
  });

  // Custom event styling based on status
  const eventStyleGetter = (event: any) => {
    const shift = event.resource as WorkShift;
    let backgroundColor = '#3182ce'; // Default blue for scheduled
    
    if (shift.status === 'completed') {
      backgroundColor = '#38a169'; // Green for completed
    } else if (shift.status === 'cancelled') {
      backgroundColor = '#e53e3e'; // Red for cancelled
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        cursor: 'pointer',
      },
    };
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            defaultView={Views.WEEK}
            view={view as any}
            onView={(newView) => setView(newView)}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => onClickShift(event.resource)}
            tooltipAccessor={(event) => {
              const shift = event.resource as WorkShift;
              const doctor = doctors.find((d) => d.doctor_id.toString() === shift.doctor_id);
              return `${shift.title}\nDoctor: ${doctor?.doctor_name || 'Unknown'}\nTime: ${moment(shift.start_time).format('HH:mm')} - ${moment(shift.end_time).format('HH:mm')}\nStatus: ${shift.status}`;
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorScheduleCalendar;