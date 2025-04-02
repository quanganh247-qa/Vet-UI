import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { 
  Calendar, Plus, Bell, User, FileText, CheckSquare, AlertCircle, Settings, 
  Calendar as CalendarIcon, AlertTriangle, Info, LogOut, ArrowLeft, Printer,
  UserCog, ChevronRight, PieChart, BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppointmentsTable from "@/components/dashboard/appointments-table";
import DoctorSchedule from "@/components/dashboard/doctor-schedule";
import RecentPatients from "@/components/dashboard/recent-patients";
import AnalyticsCharts from "@/components/dashboard/analytics-charts";
import RealTimeStatistics from "@/components/dashboard/RealTimeStatistics";
import { useNotifications } from "@/context/notification-context";
import { useAuth } from "@/context/auth-context";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { unreadCount, addNotification } = useNotifications();
  const { doctor, logout } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Quick action to create a notification for demonstration purposes
  const createDemoNotification = (type: 'info' | 'success' | 'warning' | 'error') => {
    const notificationTypes = {
      info: {
        title: "New Patient Registration",
        message: "A new patient has registered and needs to be reviewed"
      },
      success: {
        title: "Appointment Completed",
        message: "Dr. Smith has completed the appointment with Patient #12458"
      },
      warning: {
        title: "Medication Running Low",
        message: "Inventory alert: Amoxicillin stock is below threshold"
      },
      error: {
        title: "System Maintenance",
        message: "Scheduled maintenance tonight at 11PM. System will be unavailable for 1 hour."
      }
    };
    
    addNotification({
      ...notificationTypes[type],
      type,
      action: {
        label: "View details",
        onClick: () => console.log(`Action for ${type} notification clicked`)
      }
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">Veterinary Dashboard</h1>
            {doctor && (
              <Badge className="ml-4 bg-white/20 text-white hover:bg-white/30">
                Dr. {doctor.username}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white/10 text-white border-white/20 rounded-md px-3 py-1">
              <Calendar className="h-4 w-4 text-white/70 mr-2" />
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="text-sm bg-transparent border-none focus:outline-none text-white"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <UserCog className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href="/appointments/new">
              <Button size="sm" className="bg-white text-indigo-700 hover:bg-white/90">
                <Plus className="h-4 w-4 mr-1" /> New Appointment
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Actions Card with improved styling */}
      <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-md text-indigo-700">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/appointments">
              <Button variant="outline" size="sm" className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <CalendarIcon className="h-4 w-4 mr-2" />
                View All Appointments
              </Button>
            </Link>
            <Link href="/patients/new">
              <Button variant="outline" size="sm" className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <User className="h-4 w-4 mr-2" />
                Register New Patient
              </Button>
            </Link>
            <Link href="/medical-records/new">
              <Button variant="outline" size="sm" className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <FileText className="h-4 w-4 mr-2" />
                Create Medical Record
              </Button>
            </Link>
            <Link href="/notifications">
              <Button variant="outline" size="sm" className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Bell className="h-4 w-4 mr-2" />
                Manage Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" size="sm" className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <BarChart2 className="h-4 w-4 mr-2" />
                Analytics Dashboard
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="sm" className="h-9 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </Link>
          </div>
          
          {/* Demo notification triggers - for testing only */}
          <div className="mt-4 pt-3 border-t border-indigo-100">
            <p className="text-xs text-gray-500 mb-2">Test Notifications</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-blue-600 bg-blue-50 hover:bg-blue-100"
                onClick={() => createDemoNotification('info')}
              >
                <Info className="h-3.5 w-3.5 mr-1" />
                Info
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-green-600 bg-green-50 hover:bg-green-100"
                onClick={() => createDemoNotification('success')}
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1" />
                Success
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-amber-600 bg-amber-50 hover:bg-amber-100"
                onClick={() => createDemoNotification('warning')}
              >
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                Warning
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-red-600 bg-red-50 hover:bg-red-100"
                onClick={() => createDemoNotification('error')}
              >
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Error
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <RealTimeStatistics />
      
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Grid */}
        <div className="lg:col-span-2">
          <Card className="shadow-md border-none overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-indigo-900">Today's Appointments</CardTitle>
                <Link href="/appointments">
                  <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AppointmentsTable />
            </CardContent>
          </Card>
        </div>
        
        {/* Doctor schedule - 1/3 width on large screens */}
        <div className="lg:col-span-1">
          <Card className="shadow-md border-none h-full overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-indigo-900">Doctor Schedule</CardTitle>
                <Link href="/staff/schedule">
                  <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    Full Schedule <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <DoctorSchedule />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bottom Row */}
        <div className="lg:col-span-1">
          <Card className="shadow-md border-none h-full overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-indigo-900">Recent Patients</CardTitle>
                <Link href="/patients">
                  <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    All Patients <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <RecentPatients />
            </CardContent>
          </Card>
        </div>
        
        {/* Analytics - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <Card className="shadow-md border-none h-full overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-indigo-900">Analytics</CardTitle>
                <Link href="/analytics">
                  <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    Detailed Reports <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
