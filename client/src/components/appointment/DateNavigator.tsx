import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateNavigatorProps {
  selectedDate: Date;
  formatDate: (date: Date) => string;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  formatDate,
  goToPreviousDay,
  goToNextDay,
  goToToday
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button 
        className="p-1 rounded-full hover:bg-gray-100"
        onClick={goToPreviousDay}
      >
        <ChevronLeft size={20} />
      </button>
      
      <button 
        className="flex items-center px-3 py-1 rounded-md hover:bg-gray-100"
        onClick={goToToday}
      >
        <Calendar size={16} className="mr-2" />
        <span>{formatDate(selectedDate)}</span>
      </button>
      
      <button 
        className="p-1 rounded-full hover:bg-gray-100"
        onClick={goToNextDay}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default DateNavigator;