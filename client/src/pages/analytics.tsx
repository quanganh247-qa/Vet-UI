import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAppointmentAnalytics, useListAppointments } from "@/hooks/use-appointment";
import { useDateRange, TimeRange } from "@/hooks/use-date-range";

interface Appointment {
  id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  // Add other appointment fields as needed
}

const Analytics = () => {
  const { timeRange, setTimeRange, dateRange } = useDateRange();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Update selectedDate when timeRange changes
  useEffect(() => {
    if (dateRange.startDate) {
      setSelectedDate(parseISO(dateRange.startDate));
    }
  }, [dateRange.startDate]);
  
  const { data: analyticsData, isLoading } = useAppointmentAnalytics({
    start_date: dateRange.startDate,
    end_date: dateRange.endDate,
  });
  
  const { data: appointmentsData, isLoading: appointmentsLoading } = useListAppointments(selectedDate, "true");
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
      // Update timeRange to 'custom' when manually selecting a date
      setTimeRange('custom');
    }
  };
  
  // Chart configurations
  const appointmentTypeData = analyticsData?.appointment_counts ? 
    Object.entries(analyticsData.appointment_counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value
    })) : [];
  
  const checkinData = analyticsData?.checkins ? 
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
      name: day,
      current: analyticsData.checkins.current[index] || 0,
      previous: analyticsData.checkins.previous[index] || 0
    })) : [];
  
  const COLORS = ['#2C7BE5', '#00A9B5', '#A6C5F7', '#12263F', '#E6EDF5'];
  
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-[#12263F]">Analytics</h1>
          <p className="text-sm text-gray-500">Monitor clinic performance and patient trends</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="date"
              className="pl-10 border border-gray-200 rounded-md text-sm px-3 py-2 focus:outline-none focus:border-[#2C7BE5]"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
            />
          </div>
          <Button 
            variant="outline" 
            className="border-[#2C7BE5] text-[#2C7BE5]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">Total Appointments</h3>
              {isLoading ? (
                <Skeleton className="h-10 w-20 mx-auto mt-2" />
              ) : (
                <p className="text-3xl font-display font-semibold text-[#12263F] mt-2">
                  {appointmentsData?.length || 0}
                </p>
              )}
              <p className="text-xs text-green-500 mt-2">
                <span className="font-medium">↑ 8%</span> vs last week
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
              {isLoading || appointmentsLoading ? (
                <Skeleton className="h-10 w-20 mx-auto mt-2" />
              ) : (
                <p className="text-3xl font-display font-semibold text-[#12263F] mt-2">
                  {appointmentsData?.data?.length > 0 ? 
                    Math.round((appointmentsData.data.filter((a: Appointment) => a.status === 'completed').length / 
                      appointmentsData.data.length) * 100) : 0}%
                </p>
              )}
              <p className="text-xs text-green-500 mt-2">
                <span className="font-medium">↑ 5%</span> vs last month
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">Avg. Wait Time</h3>
              {isLoading ? (
                <Skeleton className="h-10 w-20 mx-auto mt-2" />
              ) : (
                <p className="text-3xl font-display font-semibold text-[#12263F] mt-2">
                  {analyticsData?.wait_time || 0} min
                </p>
              )}
              <p className="text-xs text-red-500 mt-2">
                <span className="font-medium">↑ 3%</span> vs last week
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">Weekly Revenue</h3>
              {isLoading ? (
                <Skeleton className="h-10 w-20 mx-auto mt-2" />
              ) : (
                <p className="text-3xl font-display font-semibold text-[#12263F] mt-2">
                  ${analyticsData?.revenue.toLocaleString() || 0}
                </p>
              )}
              <p className="text-xs text-green-500 mt-2">
                <span className="font-medium">↑ 12%</span> vs last week
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Analytics Tabs */}
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="bg-white rounded-t-lg p-0 border-b border-gray-200 w-full h-auto">
          <TabsTrigger value="appointments" className="py-3 px-5 data-[state=active]:border-b-2 data-[state=active]:border-[#2C7BE5] data-[state=active]:text-[#2C7BE5] rounded-none">
            Appointments
          </TabsTrigger>
          <TabsTrigger value="patients" className="py-3 px-5 data-[state=active]:border-b-2 data-[state=active]:border-[#2C7BE5] data-[state=active]:text-[#2C7BE5] rounded-none">
            Patients
          </TabsTrigger>
          <TabsTrigger value="revenue" className="py-3 px-5 data-[state=active]:border-b-2 data-[state=active]:border-[#2C7BE5] data-[state=active]:text-[#2C7BE5] rounded-none">
            Revenue
          </TabsTrigger>
          <div className="ml-auto flex items-center pr-4">
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger className="text-sm border-0 text-gray-500 focus:outline-none bg-transparent h-8 w-32">
                <SelectValue placeholder="This Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="custom">Custom Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsList>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments" className="bg-white rounded-b-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Appointments by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={appointmentTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {appointmentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Daily Appointment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={checkinData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Appointments']}
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #f0f0f0',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="current" 
                        name="This Week" 
                        stroke="#2C7BE5" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="previous" 
                        name="Last Week" 
                        stroke="#00A9B5" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Appointment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || appointmentsLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={[
                        { name: 'Scheduled', value: appointmentsData.filter((a: Appointment)   => a.status === 'scheduled').length },
                        { name: 'In Progress', value: appointmentsData.filter((a: Appointment) => a.status === 'in_progress').length },
                        { name: 'Completed', value: appointmentsData.filter((a: Appointment) => a.status === 'completed').length },
                        { name: 'Canceled', value: appointmentsData.filter((a: Appointment) => a.status === 'canceled').length }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Appointments']}
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #f0f0f0',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="value" fill="#2C7BE5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Patients Tab (Placeholder) */}
        <TabsContent value="patients" className="bg-white rounded-b-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Patient Demographics</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-72">
                <p className="text-gray-500">Patient data visualization coming soon</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">New Patients Trend</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-72">
                <p className="text-gray-500">Patient growth chart coming soon</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Revenue Tab (Placeholder) */}
        <TabsContent value="revenue" className="bg-white rounded-b-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Revenue by Service</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-72">
                <p className="text-gray-500">Revenue breakdown coming soon</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-72">
                <p className="text-gray-500">Revenue trend chart coming soon</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Bottom Row - Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <Card className="bg-gray-50 p-3">
          <CardContent className="p-0">
            <p className="text-xs text-gray-500 mb-1">Most Common</p>
            <p className="text-sm font-medium">Vaccinations</p>
            <p className="text-lg font-display font-semibold mt-1">32%</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50 p-3">
          <CardContent className="p-0">
            <p className="text-xs text-gray-500 mb-1">Peak Hours</p>
            <p className="text-sm font-medium">10am - 2pm</p>
            <p className="text-lg font-display font-semibold mt-1">42%</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50 p-3">
          <CardContent className="p-0">
            <p className="text-xs text-gray-500 mb-1">Avg. Time</p>
            <p className="text-sm font-medium">Per Patient</p>
            <p className="text-lg font-display font-semibold mt-1">24 min</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50 p-3">
          <CardContent className="p-0">
            <p className="text-xs text-gray-500 mb-1">New Patients</p>
            <p className="text-sm font-medium">This Week</p>
            <p className="text-lg font-display font-semibold mt-1">+18</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Analytics;
