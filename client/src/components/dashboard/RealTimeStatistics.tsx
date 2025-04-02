import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Users, 
  Activity, 
  RefreshCw, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clipboard, 
  BarChart2, 
  DollarSign, 
  CalendarCheck
} from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/services/dashboard-service";
import { Badge } from "@/components/ui/badge";

interface StatisticsProps {
  clinicId?: string;
  doctorId?: string;
  refreshInterval?: number;
}

const RealTimeStatistics: React.FC<StatisticsProps> = ({
  clinicId,
  doctorId,
  refreshInterval = 60000 // 1 minute by default
}) => {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");
  const [chartView, setChartView] = useState<"appointments" | "revenue" | "patients" | "procedures">("appointments");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Use React Query to fetch dashboard data
  const { 
    data: dashboardData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: getDashboardData
  });
  
  // Set up interval for auto-refresh
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isAutoRefresh) {
      interval = setInterval(() => {
        refetch();
        setLastUpdated(new Date());
      }, refreshInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, refreshInterval, refetch]);
  
  // Colors for charts
  const COLORS = ['#4f46e5', '#16a34a', '#ea580c', '#2563eb', '#7c3aed'];
  
  // Handle manual refresh
  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
  };
  
  // Render comparison indicator with arrow
  const renderComparison = (value: number) => {
    if (value > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpRight size={14} className="mr-1" />
          <span>+{value}%</span>
        </div>
      );
    } else if (value < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownRight size={14} className="mr-1" />
          <span>{value}%</span>
        </div>
      );
    } else {
      return <span className="text-gray-500">0%</span>;
    }
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md text-sm">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  if (isLoading || !dashboardData) {
    return (
      <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-md">
        <CardHeader className="pb-3">
          <CardTitle>Clinic Performance</CardTitle>
          <CardDescription>Loading statistics and metrics...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-indigo-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-indigo-600" />
              Clinic Performance
            </CardTitle>
            <CardDescription>Real-time statistics and key metrics</CardDescription>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              <Clock size={12} />
              <span>{format(lastUpdated, 'h:mm a')}</span>
            </div>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            >
              <RefreshCw size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card className="bg-white shadow-sm border-none">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                  <CalendarCheck size={12} className="mr-1 text-indigo-500" />
                  Appointments Today
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {dashboardData.metrics.appointmentsToday}
                  </span>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                    {dashboardData.metrics.completedAppointments} completed
                  </Badge>
                </div>
                <div className="mt-1">
                  {renderComparison(15)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-none">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                  <Users size={12} className="mr-1 text-green-500" />
                  New Patients
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {dashboardData.metrics.newPatients}
                  </span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                    This week
                  </Badge>
                </div>
                <div className="mt-1">
                  {renderComparison(20)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-none">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                  <DollarSign size={12} className="mr-1 text-blue-500" />
                  Revenue
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    ${dashboardData.metrics.totalRevenue.toLocaleString()}
                  </span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                    MTD
                  </Badge>
                </div>
                <div className="mt-1">
                  {renderComparison(8)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-none">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                  <Clipboard size={12} className="mr-1 text-amber-500" />
                  Pending Bills
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {dashboardData.metrics.pendingBills}
                  </span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100">
                    To process
                  </Badge>
                </div>
                <div className="mt-1">
                  {renderComparison(-5)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-none">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                  <TrendingUp size={12} className="mr-1 text-purple-500" />
                  Completion Rate
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round((dashboardData.metrics.completedAppointments / dashboardData.metrics.appointmentsToday) * 100)}%
                  </span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100">
                    Today
                  </Badge>
                </div>
                <div className="mt-1">
                  {renderComparison(3)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <Tabs defaultValue="appointments" className="mt-2">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="appointments" onClick={() => setChartView("appointments")}>
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="revenue" onClick={() => setChartView("revenue")}>
                <DollarSign className="h-4 w-4 mr-2" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="patients" onClick={() => setChartView("patients")}>
                <Users className="h-4 w-4 mr-2" />
                Patients
              </TabsTrigger>
              <TabsTrigger value="procedures" onClick={() => setChartView("procedures")}>
                <Activity className="h-4 w-4 mr-2" />
                Procedures
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="appointments" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Appointment Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.appointmentDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="category"
                        >
                          {dashboardData.appointmentDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center"
                          formatter={(value) => <span className="text-xs text-gray-600">{value}</span>} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Daily Appointments Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.appointmentDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Appointments" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="revenue" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm border-none lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Revenue Trend (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          name="Revenue"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="procedures" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Procedures Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.procedureData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {dashboardData.procedureData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center"
                          formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Procedures by Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.procedureData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Procedures" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RealTimeStatistics;