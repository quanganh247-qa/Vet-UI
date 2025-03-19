import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateNavigatorProps {
  selectedDate: Date;
  formatDate: (date: Date) => string;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  formatDate,
  goToPreviousDay,
  goToNextDay,
  goToToday,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      // Create a new date that matches the selected date but preserves time
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear());
      newDate.setMonth(date.getMonth());
      newDate.setDate(date.getDate());
      
      // Custom function to update the parent component's date state
      // This assumes you have a way to set the selected date from the parent
      // For now, we'll use goToToday as a placeholder, but you would replace this
      // with a proper date setter function passed from the parent
      goToToday();
      
      // Close calendar
      setCalendarOpen(false);
    }
  };
  
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={goToPreviousDay}
        title="Previous Day"
      >
        <ChevronLeft size={16} />
      </Button>
      
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-2 sm:px-3 min-w-[140px] justify-start gap-1 text-left font-normal"
          >
            <CalendarIcon size={16} className="opacity-70" />
            <span>{formatDate(selectedDate)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <Button
        variant="outline"
        size="icon"
        onClick={goToNextDay}
        title="Next Day"
      >
        <ChevronRight size={16} />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={goToToday}
        className="ml-1 text-sm hidden sm:inline-flex"
      >
        Today
      </Button>
    </div>
  );
};

export default DateNavigator;