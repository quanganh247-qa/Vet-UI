import { useAppointmentAnalytics } from '@/hooks/use-appointment';
import { useRevenueAnalytics } from '@/hooks/use-payment';
import { format, subDays, addDays } from 'date-fns';

// Types for dashboard data
export interface DashboardMetrics {
  appointmentsToday: number;
  newPatients: number;
  totalRevenue: number;
  pendingBills: number;
  completedAppointments: number;
}

export interface AppointmentDistribution {
  category: string;
  count: number;
}

export interface RevenueData {
  date: string;
  amount: number;
}

export interface PatientTrend {
  month: string;
  patients: number;
}

export interface ProcedureData {
  name: string;
  value: number;
}

export type TimeRange = 'week' | 'last-week' | 'month' | 'last-month' | 'custom';

// Generate mock data for dashboard
const generateMockDashboardData = () => {
  // Current date for reference
  const today = new Date();
  
  // Generate mock metrics
  const metrics: DashboardMetrics = {
    appointmentsToday: Math.floor(Math.random() * 15) + 5,
    newPatients: Math.floor(Math.random() * 10) + 1,
    totalRevenue: Math.floor(Math.random() * 5000) + 1000,
    pendingBills: Math.floor(Math.random() * 10) + 2,
    completedAppointments: Math.floor(Math.random() * 12) + 3,
  };

  const { data: appointmentDistribution } = useAppointmentAnalytics({
    start_date: format(subDays(today, 7), 'yyyy-MM-dd'),
    end_date: format(today, 'yyyy-MM-dd'),
  });
  
  // Generate mock revenue data for the last 7 days
  const { data: revenueData } = useRevenueAnalytics();
  
  
  // Generate procedure data
  const procedureData: ProcedureData[] = [
    { name: 'Vaccinations', value: Math.floor(Math.random() * 40) + 20 },
    { name: 'Surgeries', value: Math.floor(Math.random() * 25) + 10 },
    { name: 'Dental Care', value: Math.floor(Math.random() * 30) + 15 },
    { name: 'Checkups', value: Math.floor(Math.random() * 50) + 30 },
    { name: 'Emergency', value: Math.floor(Math.random() * 15) + 5 },
  ];
  
  return {
    metrics,
    appointmentDistribution,
    revenueData,
    procedureData,
  };
};

// Get dashboard overview data
export const getDashboardData = async () => {
  // In a real app, this would be an API call
  // For now, we'll return mock data
  return generateMockDashboardData();
};

// Upcoming appointments for today
export const getTodayAppointments = async () => {
  const today = new Date();
  
  // Mock appointments for today
  return Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, i) => {
    const startHour = 9 + Math.floor(i / 2);
    const startMinute = (i % 2) * 30;
    
    const startTime = new Date(today);
    startTime.setHours(startHour, startMinute, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);
    
    const petTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster'];
    const appointmentTypes = ['Checkup', 'Vaccination', 'Surgery', 'Dental', 'Emergency'];
    const petNames = ['Max', 'Bella', 'Charlie', 'Luna', 'Lucy', 'Cooper', 'Bailey', 'Daisy', 'Sadie', 'Molly', 'Buddy', 'Lola'];
    const ownerNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
    
    return {
      id: `appt-${i + 1}`,
      petName: petNames[Math.floor(Math.random() * petNames.length)],
      petType: petTypes[Math.floor(Math.random() * petTypes.length)],
      ownerName: `${ownerNames[Math.floor(Math.random() * ownerNames.length)]}`,
      appointmentType: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
      startTime: format(startTime, 'HH:mm'),
      endTime: format(endTime, 'HH:mm'),
      status: Math.random() > 0.7 ? 'complete' : Math.random() > 0.5 ? 'in-progress' : 'scheduled',
    };
  });
};

// Get appointments for the next 7 days
export const getUpcomingAppointments = async (days = 7) => {
  // In a real app, this would be an API call
  // For now, we'll return mock data
  return Array.from({ length: days }, (_, dayIndex) => {
    const date = addDays(new Date(), dayIndex);
    const appointmentsCount = Math.floor(Math.random() * 10) + 1;
    
    return {
      date: format(date, 'yyyy-MM-dd'),
      displayDate: format(date, 'EEE, MMM d'),
      appointments: Array.from({ length: appointmentsCount }, (_, i) => {
        const startHour = 9 + Math.floor(Math.random() * 8);
        const startMinute = Math.random() > 0.5 ? 30 : 0;
        
        const startTime = new Date(date);
        startTime.setHours(startHour, startMinute, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);
        
        const petTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster'];
        const appointmentTypes = ['Checkup', 'Vaccination', 'Surgery', 'Dental', 'Emergency'];
        const petNames = ['Max', 'Bella', 'Charlie', 'Luna', 'Lucy', 'Cooper', 'Bailey', 'Daisy', 'Sadie', 'Molly', 'Buddy', 'Lola'];
        const ownerNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
        
        return {
          id: `appt-day${dayIndex}-${i + 1}`,
          petName: petNames[Math.floor(Math.random() * petNames.length)],
          petType: petTypes[Math.floor(Math.random() * petTypes.length)],
          ownerName: `${ownerNames[Math.floor(Math.random() * ownerNames.length)]}`,
          appointmentType: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
          startTime: format(startTime, 'HH:mm'),
          endTime: format(endTime, 'HH:mm'),
          status: 'scheduled',
        };
      })
    };
  });
};

export default {
  getDashboardData,
  getTodayAppointments,
  getUpcomingAppointments,
}; 