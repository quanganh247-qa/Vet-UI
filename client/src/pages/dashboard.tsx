import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MetricCard from "@/components/dashboard/metric-card";
import AppointmentsTable from "@/components/dashboard/appointments-table";
import DoctorSchedule from "@/components/dashboard/doctor-schedule";
import RecentPatients from "@/components/dashboard/recent-patients";
import AnalyticsCharts from "@/components/dashboard/analytics-charts";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
    }
  };
  
  return (
    <>
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-[#12263F]">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, Dr. Wilson. Here's what's happening today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <div className="relative">
            <Input
              type="date"
              className="block border border-gray-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:border-[#2C7BE5]"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
            />
          </div>
          <Button className="bg-[#2C7BE5] text-white rounded-md px-4 py-2 text-sm font-medium flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Appointments Today"
          value={isLoading ? "..." : dashboardData?.appointmentsToday || 0}
          change={12}
          timePeriod="last week"
          icon="appointments"
          loading={isLoading}
        />
        
        <MetricCard
          title="Total Patients"
          value={isLoading ? "..." : dashboardData?.totalPatients || 0}
          change={5}
          timePeriod="last month"
          icon="patients"
          loading={isLoading}
        />
        
        <MetricCard
          title="Avg. Wait Time"
          value={`${isLoading ? "..." : dashboardData?.avgWaitTime || 0} min`}
          change={-3}
          timePeriod="last week"
          icon="wait-time"
          loading={isLoading}
        />
        
        <MetricCard
          title="Revenue (Weekly)"
          value={`$${isLoading ? "..." : dashboardData?.weeklyRevenue || 0}`}
          change={8}
          timePeriod="last week"
          icon="revenue"
          loading={isLoading}
        />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Appointments Today - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <AppointmentsTable />
        </div>
        
        {/* Doctor schedule - 1/3 width on large screens */}
        <div>
          <DoctorSchedule />
        </div>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Patients - 1/3 width on large screens */}
        <div>
          <RecentPatients />
        </div>
        
        {/* Analytics - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <AnalyticsCharts />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
