import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart, PieChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Activity, RefreshCw, TrendingUp, ArrowUpRight, ArrowDownRight, Clipboard, BarChart2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Dummy data - in a real app, this would come from an API
  const [stats, setStats] = useState({
    today: {
      totalAppointments: 24,
      completedAppointments: 16,
      cancelledAppointments: 2,
      averageWaitTime: 12, // minutes
      revenue: 3250,
      newPatients: 5,
      appointmentsByType: [
        { name: "Check-up", value: 10 },
        { name: "Vaccination", value: 6 },
        { name: "Surgery", value: 3 },
        { name: "Emergency", value: 2 },
        { name: "Other", value: 3 }
      ],
      appointmentsByHour: [
        { hour: "8 AM", appointments: 3 },
        { hour: "9 AM", appointments: 4 },
        { hour: "10 AM", appointments: 2 },
        { hour: "11 AM", appointments: 3 },
        { hour: "12 PM", appointments: 1 },
        { hour: "1 PM", appointments: 2 },
        { hour: "2 PM", appointments: 3 },
        { hour: "3 PM", appointments: 3 },
        { hour: "4 PM", appointments: 3 },
        { hour: "5 PM", appointments: 0 }
      ],
      revenueByService: [
        { service: "Exams", amount: 1200 },
        { service: "Procedures", amount: 850 },
        { service: "Medications", amount: 650 },
        { service: "Lab Tests", amount: 350 },
        { service: "Other", amount: 200 }
      ],
      performanceMetrics: {
        appointmentsPerHour: 3.2,
        averageAppointmentDuration: 24, // minutes
        patientSatisfaction: 4.7
      },
      comparisonToLastWeek: {
        appointments: +15, // percentage
        revenue: +8,
        newPatients: +20
      }
    },
    week: {
      // similar structure but with weekly data
      totalAppointments: 122,
      completedAppointments: 98,
      cancelledAppointments: 8,
      averageWaitTime: 14,
      revenue: 15800,
      newPatients: 18,
      appointmentsByType: [
        { name: "Check-up", value: 45 },
        { name: "Vaccination", value: 32 },
        { name: "Surgery", value: 15 },
        { name: "Emergency", value: 12 },
        { name: "Other", value: 18 }
      ],
      appointmentsByDay: [
        { day: "Mon", appointments: 25 },
        { day: "Tue", appointments: 22 },
        { day: "Wed", appointments: 18 },
        { day: "Thu", appointments: 20 },
        { day: "Fri", appointments: 27 },
        { day: "Sat", appointments: 10 },
        { day: "Sun", appointments: 0 }
      ],
      revenueByService: [
        { service: "Exams", amount: 5200 },
        { service: "Procedures", amount: 4100 },
        { service: "Medications", amount: 3200 },
        { service: "Lab Tests", amount: 2100 },
        { service: "Other", amount: 1200 }
      ],
      performanceMetrics: {
        appointmentsPerHour: 3.0,
        averageAppointmentDuration: 26,
        patientSatisfaction: 4.5
      },
      comparisonToLastWeek: {
        appointments: +5,
        revenue: +10,
        newPatients: -3
      }
    },
    month: {
      // similar structure but with monthly data
      totalAppointments: 512,
      completedAppointments: 428,
      cancelledAppointments: 42,
      averageWaitTime: 15,
      revenue: 68500,
      newPatients: 78,
      appointmentsByType: [
        { name: "Check-up", value: 210 },
        { name: "Vaccination", value: 124 },
        { name: "Surgery", value: 64 },
        { name: "Emergency", value: 48 },
        { name: "Other", value: 66 }
      ],
      appointmentsByWeek: [
        { week: "Week 1", appointments: 120 },
        { week: "Week 2", appointments: 135 },
        { week: "Week 3", appointments: 122 },
        { week: "Week 4", appointments: 135 }
      ],
      revenueByService: [
        { service: "Exams", amount: 22500 },
        { service: "Procedures", amount: 18200 },
        { service: "Medications", amount: 14500 },
        { service: "Lab Tests", amount: 8500 },
        { service: "Other", amount: 4800 }
      ],
      performanceMetrics: {
        appointmentsPerHour: 3.1,
        averageAppointmentDuration: 25,
        patientSatisfaction: 4.6
      },
      comparisonToLastMonth: {
        appointments: +8,
        revenue: +12,
        newPatients: +15
      }
    }
  });
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFC'];
  
  // In a real app, this would fetch data from an API
  const fetchStats = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would update with fresh data from the backend
    // For now, we're just updating the timestamp
    setLastUpdated(new Date());
    setLoading(false);
  };
  
  useEffect(() => {
    // Initial fetch
    fetchStats();
    
    // Set up interval for auto-refresh
    let interval: NodeJS.Timeout | null = null;
    
    if (isAutoRefresh) {
      interval = setInterval(fetchStats, refreshInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, refreshInterval]);
  
  // Get the current data based on the selected time range
  const currentData = stats[timeRange];
  
  // Get the appropriate time series data based on time range
  const getTimeSeriesData = () => {
    if (timeRange === "today") {
      return (currentData as any).appointmentsByHour || [];
    } else if (timeRange === "week") {
      return (currentData as any).appointmentsByDay || [];
    } else {
      return (currentData as any).appointmentsByWeek || [];
    }
  };
  
  // Get the appropriate x-axis key based on time range
  const getXAxisKey = () => {
    if (timeRange === "today") {
      return "hour";
    } else if (timeRange === "week") {
      return "day";
    } else {
      return "week";
    }
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
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Clinic Performance</CardTitle>
            <CardDescription>Real-time statistics and key metrics</CardDescription>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock size={14} />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            
            <Button 
              variant="outline"
              size="sm"
              className={isAutoRefresh ? "bg-blue-50 text-blue-600" : ""}
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            >
              <RefreshCw size={14} className="mr-1" />
              {isAutoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={loading}
              onClick={fetchStats}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Tabs value={chartView} onValueChange={(value: any) => setChartView(value)}>
            <TabsList>
              <TabsTrigger value="appointments">
                <Calendar size={14} className="mr-1" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="revenue">
                <TrendingUp size={14} className="mr-1" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="patients">
                <Users size={14} className="mr-1" />
                Patients
              </TabsTrigger>
              <TabsTrigger value="procedures">
                <Activity size={14} className="mr-1" />
                Procedures
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-gray-500">Total Appointments</div>
                <div className="text-2xl font-bold mt-1">{currentData.totalAppointments}</div>
              </div>
              <div className="rounded-full bg-blue-100 p-2">
                <Calendar size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs">
              {renderComparison(
                timeRange === "month" 
                  ? (currentData as any).comparisonToLastMonth?.appointments || 0
                  : (currentData as any).comparisonToLastWeek?.appointments || 0
              )}
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-gray-500">Revenue</div>
                <div className="text-2xl font-bold mt-1">${currentData.revenue}</div>
              </div>
              <div className="rounded-full bg-green-100 p-2">
                <TrendingUp size={20} className="text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-xs">
              {renderComparison(
                timeRange === "month" 
                  ? (currentData as any).comparisonToLastMonth?.revenue || 0
                  : (currentData as any).comparisonToLastWeek?.revenue || 0
              )}
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-gray-500">New Patients</div>
                <div className="text-2xl font-bold mt-1">{currentData.newPatients}</div>
              </div>
              <div className="rounded-full bg-purple-100 p-2">
                <Users size={20} className="text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-xs">
              {renderComparison(
                timeRange === "month" 
                  ? (currentData as any).comparisonToLastMonth?.newPatients || 0
                  : (currentData as any).comparisonToLastWeek?.newPatients || 0
              )}
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-gray-500">Avg. Wait Time</div>
                <div className="text-2xl font-bold mt-1">{currentData.averageWaitTime} min</div>
              </div>
              <div className="rounded-full bg-amber-100 p-2">
                <Clock size={20} className="text-amber-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="col-span-2 bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-4">
              {chartView === "appointments" && "Appointment Distribution"}
              {chartView === "revenue" && "Revenue Breakdown"}
              {chartView === "patients" && "Patient Statistics"}
              {chartView === "procedures" && "Procedures Performed"}
            </h3>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === "appointments" ? (
                  <BarChart
                    data={getTimeSeriesData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={getXAxisKey()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="appointments" fill="#0088FE" name="Appointments" />
                  </BarChart>
                ) : chartView === "revenue" ? (
                  <BarChart
                    data={currentData.revenueByService}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Legend />
                    <Bar dataKey="amount" fill="#00C49F" name="Revenue" />
                  </BarChart>
                ) : chartView === "patients" ? (
                  <LineChart
                    data={getTimeSeriesData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={getXAxisKey()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="appointments" stroke="#A28BFC" name="Patient Visits" activeDot={{ r: 8 }} />
                  </LineChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={currentData.appointmentsByType}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, value}) => `${name}: ${value}`}
                    >
                      {currentData.appointmentsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Procedures']} />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Stats & Metrics */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-4">Performance Metrics</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Appointments Per Hour</div>
                <div className="flex items-center">
                  <div className="text-xl font-bold">
                    {currentData.performanceMetrics.appointmentsPerHour}
                  </div>
                  <div className="ml-2 text-xs text-gray-500">
                    Target: 3.5
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (currentData.performanceMetrics.appointmentsPerHour / 3.5) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Average Appointment Duration</div>
                <div className="flex items-center">
                  <div className="text-xl font-bold">
                    {currentData.performanceMetrics.averageAppointmentDuration} min
                  </div>
                  <div className="ml-2 text-xs text-gray-500">
                    Target: 25 min
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${
                      currentData.performanceMetrics.averageAppointmentDuration <= 25 
                        ? "bg-green-600" 
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, (currentData.performanceMetrics.averageAppointmentDuration / 25) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Patient Satisfaction</div>
                <div className="flex items-center">
                  <div className="text-xl font-bold">
                    {currentData.performanceMetrics.patientSatisfaction} / 5
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(currentData.performanceMetrics.patientSatisfaction / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Appointment Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span className="font-medium">{currentData.completedAppointments} ({Math.round((currentData.completedAppointments / currentData.totalAppointments) * 100)}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancelled</span>
                    <span className="font-medium">{currentData.cancelledAppointments} ({Math.round((currentData.cancelledAppointments / currentData.totalAppointments) * 100)}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress</span>
                    <span className="font-medium">
                      {currentData.totalAppointments - currentData.completedAppointments - currentData.cancelledAppointments} 
                      ({Math.round(((currentData.totalAppointments - currentData.completedAppointments - currentData.cancelledAppointments) / currentData.totalAppointments) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeStatistics;