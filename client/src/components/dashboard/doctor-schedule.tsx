import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Staff, Schedule } from "@shared/schema";
import { formatTimeRange } from "@/lib/utils";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ScheduleItemProps {
  schedule: Schedule;
  isActive: boolean;
}

const ScheduleItem = ({ schedule, isActive }: ScheduleItemProps) => {
  return (
    <div className={cn(
      "relative pl-6 pb-8",
      isActive ? "border-l-2 border-[#2C7BE5]" : "border-l-2 border-gray-200"
    )}>
      <div className={cn(
        "absolute -left-1.5 top-1.5 h-3 w-3 rounded-full",
        isActive ? "bg-[#2C7BE5]" : "bg-gray-200"
      )}></div>
      <div className="mb-1">
        <p className="text-xs text-gray-500">
          {formatTimeRange(schedule.start_time, schedule.end_time)}
        </p>
        <p className="text-sm font-medium">{schedule.description}</p>
      </div>
    </div>
  );
};

const DoctorSchedule = () => {
  const [timeFilter, setTimeFilter] = useState("today");
  
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['/api/staff'],
  });
  
  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: [`/api/schedules/date/${timeFilter}`],
  });
  
  const isLoading = staffLoading || schedulesLoading;
  
  // Filter active staff
  const activeStaff = staffData?.filter((staff: Staff) => staff.is_active) || [];
  
  // Get the first doctor's schedule items
  const firstDoctorId = activeStaff[0]?.id;
  const doctorSchedules = schedulesData?.filter(
    (schedule: Schedule) => schedule.staff_id === firstDoctorId
  ) || [];
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-display font-semibold text-[#12263F]">Doctor Schedule</h2>
        <div>
          <Select defaultValue="today" onValueChange={setTimeFilter}>
            <SelectTrigger className="text-sm border-0 text-gray-500 focus:outline-none bg-transparent h-8 w-28">
              <SelectValue placeholder="Today" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          // Loading skeletons for staff list
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="flex items-center mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="ml-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
              <div className="ml-auto">
                <Skeleton className="h-3 w-3 rounded-full" />
              </div>
            </div>
          ))
        ) : (
          // Active staff members
          activeStaff.map((staff: Staff) => (
            <div key={staff.id} className="flex items-center mb-4">
              <img 
                className="h-10 w-10 rounded-full object-cover" 
                src={staff.image_url || "https://via.placeholder.com/40"} 
                alt={staff.name} 
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-[#12263F]">{staff.name}</p>
                <p className="text-xs text-gray-500">{staff.role}</p>
              </div>
              <div className="ml-auto">
                <span className="h-3 w-3 bg-green-500 rounded-full inline-block"></span>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="border-t border-gray-100 p-4">
        <h3 className="text-sm font-medium text-[#12263F] mb-3">Today's Schedule</h3>
        
        {isLoading ? (
          // Loading skeletons for schedule items
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="relative pl-6 pb-8 border-l-2 border-gray-200">
              <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-gray-200"></div>
              <div className="mb-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
            </div>
          ))
        ) : doctorSchedules.length > 0 ? (
          // Schedule items
          doctorSchedules.map((schedule: Schedule, index: number) => (
            <ScheduleItem 
              key={schedule.id} 
              schedule={schedule}
              isActive={index % 2 === 0} // Just for demonstration
            />
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">No schedule items found for today</p>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule;
