import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { 
  Calendar, Plus, Bell, User, FileText, CheckSquare, AlertCircle, Settings, 
  Calendar as CalendarIcon, AlertTriangle, Info, LogOut, ArrowLeft, Printer,
  UserCog, ChevronRight, PieChart, BarChart2, Activity, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportsDashboard from "@/components/dashboard/ReportsDashboard";
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
          </div>
        </div>
      </div>

      {/* Dashboard with Reports */}
      <Card className="border-none shadow-md overflow-hidden">
        {/* <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-3 border-b">
          <div className="flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
            <CardTitle className="text-lg font-semibold text-indigo-900">Reports Dashboard</CardTitle>
          </div>
        </CardHeader> */}

        <CardContent className="p-6">
          <ReportsDashboard />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
