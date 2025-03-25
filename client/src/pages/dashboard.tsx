import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Plus, Bell, User, FileText, CheckSquare, AlertCircle, Settings, Calendar as CalendarIcon, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MetricCard from "@/components/dashboard/metric-card";
import AppointmentsTable from "@/components/dashboard/appointments-table";
import DoctorSchedule from "@/components/dashboard/doctor-schedule";
import RecentPatients from "@/components/dashboard/recent-patients";
import AnalyticsCharts from "@/components/dashboard/analytics-charts";
import RealTimeStatistics from "@/components/dashboard/RealTimeStatistics";
import { useNotifications } from "@/context/notification-context";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { unreadCount, addNotification } = useNotifications();
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
    }
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center border rounded-md px-3 py-1">
            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              className="text-sm border-none focus:outline-none"
            />
          </div>
          
          <Link href="/appointments/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Appointment
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Quick Actions Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/appointments">
              <Button variant="outline" size="sm" className="h-9">
                <CalendarIcon className="h-4 w-4 mr-2" />
                View All Appointments
              </Button>
            </Link>
            <Link href="/patients/new">
              <Button variant="outline" size="sm" className="h-9">
                <User className="h-4 w-4 mr-2" />
                Register New Patient
              </Button>
            </Link>
            <Link href="/medical-records/new">
              <Button variant="outline" size="sm" className="h-9">
                <FileText className="h-4 w-4 mr-2" />
                Create Medical Record
              </Button>
            </Link>
            <Link href="/notifications">
              <Button variant="outline" size="sm" className="h-9">
                <Bell className="h-4 w-4 mr-2" />
                Manage Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
          
          {/* Demo notification triggers - for testing only */}
          <div className="mt-4 pt-3 border-t">
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Appointments Today - 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Today's Appointments</h2>
              <Link href="/appointments">
                <Button variant="ghost" size="sm" className="h-8">
                  View All
                </Button>
              </Link>
            </div>
            <AppointmentsTable />
          </div>
          
          {/* Doctor schedule - 1/3 width on large screens */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Doctor Schedule</h2>
              <Link href="/staff/schedule">
                <Button variant="ghost" size="sm" className="h-8">
                  Full Schedule
                </Button>
              </Link>
            </div>
            <DoctorSchedule />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Patients - 1/3 width on large screens */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Recent Patients</h2>
              <Link href="/patients">
                <Button variant="ghost" size="sm" className="h-8">
                  All Patients
                </Button>
              </Link>
            </div>
            <RecentPatients />
          </div>
          
          {/* Analytics - 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Analytics</h2>
              <Link href="/analytics">
                <Button variant="ghost" size="sm" className="h-8">
                  Detailed Reports
                </Button>
              </Link>
            </div>
            <AnalyticsCharts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
