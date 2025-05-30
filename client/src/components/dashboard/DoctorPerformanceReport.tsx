import React from "react";
import { useDoctorStats } from "@/hooks/use-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { 
  Users, 
  Activity, 
  AlertCircle, 
  Calendar, 
  CheckCircle, 
  Clock,
  UserCheck,
  Award,
  TrendingUp,
  XCircle,
  CalendarClock
} from "lucide-react";
import { DoctorStatsResponse } from "@/services/report-services";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, description, className = "" }: StatCardProps) => (
  <div className={`bg-[#FFFFFF] rounded-2xl border border-[#F9FAFB] p-4 shadow-md hover:shadow-lg transition-shadow ${className}`}>
    <div className="flex items-center gap-3">
      <div className="bg-[#2C78E4]/10 p-2 rounded-lg">
        <Icon className="h-5 w-5 text-[#2C78E4]" />
      </div>
      <div>
        <p className="text-sm text-[#4B5563]">{title}</p>
        <h3 className="text-2xl font-bold text-[#111827]">{value}</h3>
        {description && (
          <p className="text-sm text-[#4B5563]/80 mt-1">{description}</p>
        )}
      </div>
    </div>
  </div>
);

const DoctorCard = ({ doctor, isTopPerformer = false }: { doctor: DoctorStatsResponse; isTopPerformer?: boolean }) => (
  <div className="bg-[#FFFFFF] rounded-2xl border border-[#F9FAFB] p-6 shadow-md hover:shadow-lg transition-shadow relative">
    {isTopPerformer && (
      <div className="absolute -top-2 -right-2 bg-[#FFA726] text-white p-1.5 rounded-full z-10 shadow-lg">
        <Award className="h-4 w-4" />
      </div>
    )}
    
    {/* Doctor Info Header */}
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-[#2C78E4]/10 p-3 rounded-xl">
        <UserCheck className="h-6 w-6 text-[#2C78E4]" />
      </div>
      <div>
        <h3 className="font-semibold text-[#111827] text-lg">{doctor.doctor_name}</h3>
        <p className="text-sm text-[#4B5563]">ID: {doctor.doctor_id}</p>
      </div>
    </div>

    {/* Completion Rate */}
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-[#4B5563]">Completion Rate</span>
        <span className="text-sm font-medium text-[#2C78E4]">{doctor.completion_rate}%</span>
      </div>
      <Progress value={doctor.completion_rate} className="h-2 bg-[#2C78E4]/10 [&>div]:bg-[#2C78E4]" />
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[#F9FAFB] rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="h-4 w-4 text-[#2C78E4]" />
          <span className="text-sm text-[#4B5563]">Completed</span>
        </div>
        <p className="text-xl font-semibold text-[#111827]">{doctor.completed_appointments}</p>
      </div>

      <div className="bg-[#F9FAFB] rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <CalendarClock className="h-4 w-4 text-[#FFA726]" />
          <span className="text-sm text-[#4B5563]">Scheduled</span>
        </div>
        <p className="text-xl font-semibold text-[#111827]">{doctor.scheduled_appointments}</p>
      </div>

      <div className="bg-[#F9FAFB] rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-4 w-4 text-[#2C78E4]" />
          <span className="text-sm text-[#4B5563]">Patients</span>
        </div>
        <p className="text-xl font-semibold text-[#111827]">{doctor.unique_patients_served}</p>
      </div>

      <div className="bg-[#F9FAFB] rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-4 w-4 text-[#2C78E4]" />
          <span className="text-sm text-[#4B5563]">Avg. Daily</span>
        </div>
        <p className="text-xl font-semibold text-[#111827]">{doctor.avg_appointments_per_day.toFixed(1)}</p>
      </div>
    </div>
  </div>
);

interface DoctorPerformanceReportProps {
  startDate: string;
  endDate: string;
}

const DoctorPerformanceReport = ({ startDate, endDate }: DoctorPerformanceReportProps) => {
  const { data: doctorStats, isLoading, error } = useDoctorStats(
    startDate,
    endDate
  );

  return (
    <div className="space-y-8 font-['Open_Sans',_'Lato',_'Montserrat',_sans-serif] py-4">
      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <Activity className="h-8 w-8 text-[#2C78E4] animate-spin" />
          <p className="ml-2 text-[#4B5563]">Loading performance data...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-40 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-700 font-medium">Error loading data</p>
          <p className="text-red-600 text-sm">Could not fetch doctor performance statistics.</p>
        </div>
      )}

      {doctorStats && !isLoading && !error && (
        <div className="space-y-8">
          {/* Overall Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-[#111827] mb-6 flex items-center gap-2 font-['Lato',_sans-serif]">
              <TrendingUp className="h-5 w-5 text-[#2C78E4]" />
              Overall Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Doctors"
                value={doctorStats.total_doctors}
                icon={Users}
              />
              <StatCard
                title="Total Appointments"
                value={doctorStats.period_stats.total_appointments}
                icon={Calendar}
              />
              <StatCard
                title="Completion Rate"
                value={`${doctorStats.period_stats.completion_rate.toFixed(1)}%`}
                icon={CheckCircle}
              />
              <StatCard
                title="Unique Patients"
                value={doctorStats.period_stats.unique_patients_served}
                icon={UserCheck}
              />
            </div>
          </div>

          {/* Doctor Performance List */}
          <div>
            <h3 className="text-lg font-semibold text-[#111827] mb-6 flex items-center gap-2 font-['Lato',_sans-serif]">
              <Users className="h-5 w-5 text-[#2C78E4]" />
              Doctor Performance
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {doctorStats.doctors_list?.map((doctor, index) => (
                <DoctorCard 
                  key={doctor.doctor_id} 
                  doctor={doctor}
                  isTopPerformer={doctorStats.top_performers?.findIndex(
                    (top) => top.doctor_id === doctor.doctor_id
                  ) === 0}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPerformanceReport; 