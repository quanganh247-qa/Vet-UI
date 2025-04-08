import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Doctor, WorkShift } from '@/types';

interface CustomCalendarProps {
  shifts: WorkShift[];
  doctors: Doctor[];
  onClickShift: (shift: WorkShift) => void;
  userRole: 'doctor' | 'admin';
  currentDoctorId?: string;
}

type ViewType = 'month' | 'week' | 'day';

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  shifts,
  doctors,
  onClickShift,
  userRole,
  currentDoctorId,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');
  
  // Log shifts data when component mounts or shifts change
  useEffect(() => {
    console.log('CustomCalendar received shifts:', shifts);
  }, [shifts]);

  // Get status color
  const getStatusColor = (status: string = 'scheduled') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  // Navigation functions
  const nextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
    } else if (view === 'week') {
      setCurrentDate(prevDate => addDays(prevDate, 7));
    } else {
      setCurrentDate(prevDate => addDays(prevDate, 1));
    }
  };

  const prevPeriod = () => {
    if (view === 'month') {
      setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
    } else if (view === 'week') {
      setCurrentDate(prevDate => addDays(prevDate, -7));
    } else {
      setCurrentDate(prevDate => addDays(prevDate, -1));
    }
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  // Calendar header based on current view
  const renderHeader = () => {
    let dateFormat = 'MMMM yyyy';
    if (view === 'day') {
      dateFormat = 'EEEE, MMMM d, yyyy';
    } else if (view === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return (
        <div className="text-xl font-semibold">
          {format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}
        </div>
      );
    }
    
    return (
      <div className="text-xl font-semibold">
        {format(currentDate, dateFormat)}
      </div>
    );
  };

  // Render days of the week
  const renderDays = () => {
    const dateFormat = 'EEE';
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium py-2">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 border-b">{days}</div>;
  };

  // Filter shifts for the current day
  const getDayShifts = (day: Date): WorkShift[] => {
    if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
      return [];
    }
    
    return shifts.filter(shift => {
      // Ensure shift data is valid
      if (!shift || !shift.start_time) {
        return false;
      }
      
      const shiftStart = shift.start_time instanceof Date 
        ? shift.start_time 
        : new Date(shift.start_time);
      
      // Simple check if the day, month, and year match
      return isSameDay(shiftStart, day);
    });
  };

  // Render a single cell in the month view
  const renderCell = (day: Date, monthStart: Date) => {
    const formattedDate = format(day, 'd');
    const dayShifts = getDayShifts(day);
    
    return (
      <div
        className={cn(
          "min-h-[100px] border p-1",
          !isSameMonth(day, monthStart) && "bg-gray-50 text-gray-400",
          isSameDay(day, new Date()) && "bg-blue-50"
        )}
      >
        <div className="text-right p-1">{formattedDate}</div>
        <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
          {dayShifts.length > 0 ? (
            dayShifts.map((shift) => {
              const doctor = doctors.find(d => d.doctor_id?.toString() === shift.doctor_id);
              return (
                <div
                  key={shift.id}
                  onClick={() => onClickShift(shift)}
                  className={cn(
                    "px-2 py-1 text-xs rounded cursor-pointer truncate border",
                    getStatusColor(shift.status),
                  )}
                >
                  {format(shift.start_time instanceof Date ? shift.start_time : new Date(shift.start_time), 'HH:mm')} - {doctor?.doctor_name || 'Doctor'}
                </div>
              );
            })
          ) : (
            <div className="text-xs text-gray-400 text-center mt-2">No shifts</div>
          )}
        </div>
      </div>
    );
  };

  // Render the month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(renderCell(day, monthStart));
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="mt-2">{rows}</div>;
  };

  // Helper to get hours range for the day/week view
  const getTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 18; i++) { // 8 AM to 6 PM
      slots.push(`${i}:00`);
    }
    return slots;
  };

  // Render shifts for a specific day and time slot
  const renderShiftsForTimeSlot = (day: Date, timeSlot: string) => {
    if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
      return null;
    }
    
    const [hour] = timeSlot.split(':').map(Number);
    
    return shifts.filter(shift => {
      // Ensure shift data is valid
      if (!shift || !shift.start_time) {
        return false;
      }
      
      const shiftStart = shift.start_time instanceof Date 
        ? shift.start_time 
        : new Date(shift.start_time);
        
      // Check if the day matches and hour matches
      return isSameDay(day, shiftStart) && shiftStart.getHours() === hour;
    }).map(shift => {
      const doctor = doctors.find(d => d.doctor_id?.toString() === shift.doctor_id);
      const shiftStart = shift.start_time instanceof Date ? shift.start_time : new Date(shift.start_time);
      const shiftEnd = shift.end_time instanceof Date ? shift.end_time : new Date(shift.end_time);
      
      const startTime = format(shiftStart, 'HH:mm');
      const endTime = format(shiftEnd, 'HH:mm');
      
      return (
        <div
          key={shift.id}
          onClick={() => onClickShift(shift)}
          className={cn(
            "p-2 rounded cursor-pointer my-1 border text-sm",
            getStatusColor(shift.status),
          )}
        >
          <div className="font-medium truncate">{shift.title || `Shift #${shift.id}`}</div>
          <div className="text-xs">
            {startTime} - {endTime} | {doctor?.doctor_name || 'Doctor'}
          </div>
        </div>
      );
    });
  };

  // Render the day view
  const renderDayView = () => {
    const timeSlots = getTimeSlots();
    
    return (
      <div className="mt-4">
        <div className="space-y-2">
          {timeSlots.map(timeSlot => (
            <div key={timeSlot} className="grid grid-cols-[80px_1fr] border-b pb-1">
              <div className="text-right pr-4 text-sm text-gray-600 pt-2">{timeSlot}</div>
              <div className="pl-2 border-l">
                {renderShiftsForTimeSlot(currentDate, timeSlot)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the week view
  const renderWeekView = () => {
    const timeSlots = getTimeSlots();
    const days: Date[] = [];
    const startDate = startOfWeek(currentDate);
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startDate, i));
    }
    
    return (
      <div className="mt-4">
        <div className="grid grid-cols-[80px_1fr]">
          <div></div>
          <div className="grid grid-cols-7">
            {days.map((day, idx) => (
              <div key={idx} className="text-center border-b pb-1 font-medium">
                {format(day, 'EEE d')}
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-1">
          {timeSlots.map(timeSlot => (
            <div key={timeSlot} className="grid grid-cols-[80px_1fr]">
              <div className="text-right pr-4 text-sm text-gray-600 pt-2">
                {timeSlot}
              </div>
              <div className="grid grid-cols-7 border-l">
                {days.map((day, idx) => (
                  <div key={idx} className="border-r min-h-[60px] pl-1 pr-1">
                    {renderShiftsForTimeSlot(day, timeSlot)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the correct view based on state
  const renderView = () => {
    switch (view) {
      case 'month':
        return renderMonthView();
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={prevPeriod}
              aria-label="Previous period"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={today}
            >
              Today
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={nextPeriod}
              aria-label="Next period"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {renderHeader()}
          </div>
          
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setView('month')}
              className="rounded-none"
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setView('week')}
              className="rounded-none"
            >
              Week
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setView('day')}
              className="rounded-none"
            >
              Day
            </Button>
          </div>
        </div>
        
        <div className="overflow-auto h-[600px]">
          {shifts && shifts.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No shifts to display</p>
            </div>
          ) : (
            <>
              {view === 'month' && renderDays()}
              {renderView()}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomCalendar; 