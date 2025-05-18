import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Bell,
  User,
  FileText,
  CheckSquare,
  AlertCircle,
  Settings,
  Calendar as CalendarIcon,
  AlertTriangle,
  Info,
  LogOut,
  ArrowLeft,
  Printer,
  UserCog,
  ChevronRight,
  PieChart,
  BarChart2,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportsDashboard from "@/components/dashboard/ReportsDashboard";
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

interface DashboardData {
  totalPatients: number;
  todayAppointments: number;
  pendingReports: number;
  criticalCases: number;
}

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { doctor, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setSelectedDate(date);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-[#2C78E4] to-[#1E40AF] px-6 py-4 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">
              Dashboard Overview
            </h1>
            {doctor && (
              <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-full">
                Dr. {doctor.username}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white/10 text-white border-white/20 rounded-lg px-3 py-2 transition-all hover:bg-white/15">
              <CalendarIcon className="h-4 w-4 text-white/80 mr-2" />
              <input
                type="date"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={handleDateChange}
                className="text-sm bg-transparent border-none focus:outline-none text-white placeholder-white/70"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-white hover:bg-white/20 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white rounded-lg shadow-md border-none"
              >
                <DropdownMenuLabel className="text-[#111827]">
                  Quick Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100" />
                <Link href="/appointments">
                  <DropdownMenuItem className="text-[#4B5563] hover:bg-[#F9FAFB] cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4 text-[#2C78E4]" />
                    <span>View Appointments</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/notifications">
                  <DropdownMenuItem className="text-[#4B5563] hover:bg-[#F9FAFB] cursor-pointer">
                    <Bell className="mr-2 h-4 w-4 text-[#2C78E4]" />
                    <span>All Notifications</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="text-[#4B5563] hover:bg-[#F9FAFB] cursor-pointer">
                    <Settings className="mr-2 h-4 w-4 text-[#2C78E4]" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-[#4B5563] hover:bg-[#F9FAFB] cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4 text-[#2C78E4]" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Reports Dashboard */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-white pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-[#2C78E4]" />
              <CardTitle className="text-lg font-semibold text-[#111827]">
                Performance Overview
              </CardTitle>
            </div>
           
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ReportsDashboard />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
