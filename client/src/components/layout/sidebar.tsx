import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Calendar, 
  Users, 
  Stethoscope, 
  BarChart, 
  TestTube, 
  DollarSign, 
  Settings, 
  HelpCircle, 
  Pill,
  ChevronLeft,
  ChevronRight,
  Bell,
  MessageCircle,
  FileText,
  Activity,
  PawPrint,
  BookOpen,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const [location, navigate] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(3); // Example notification count
  const { doctor, logout } = useAuth();

  // Save collapsed state to localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed) {
      setCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  // Update localStorage when collapsed state changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainLinks = [
    { name: "Dashboard", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Appointments", path: "/appointments", icon: <Calendar className="h-5 w-5" /> },
    { name: "Flowboard", path: "/appointment-flow", icon: <Activity className="h-5 w-5" /> },
    { name: "Patients", path: "/patients", icon: <PawPrint className="h-5 w-5" /> },
  ];

  // const clinicalLinks = [
  //   { name: "Patient Management", path: "/patient-management", icon: <FileText className="h-5 w-5" /> },
  //   { name: "Medical Records", path: "/medical-records", icon: <BookOpen className="h-5 w-5" /> },
  //   { name: "Prescriptions", path: "/prescriptions", icon: <Pill className="h-5 w-5" /> },
  //   { name: "Lab Results", path: "/lab-results", icon: <TestTube className="h-5 w-5" /> },
  // ];

  const practiceLinks = [
    { name: "Catalog Management", path: "/catalog", icon: <BookOpen className="h-5 w-5" /> },
    { name: "Veterinary Staff", path: "/staff", icon: <Stethoscope className="h-5 w-5" /> },
    { name: "Chatbot", path: "/chatbot", icon: <MessageCircle className="h-5 w-5" /> },
    { name: "Billing", path: "/billing", icon: <DollarSign className="h-5 w-5" /> }
  ];

  const accountLinks = [
    { 
      name: "Notifications", 
      path: "/notifications", 
      icon: <Bell className="h-5 w-5" />,
      badge: notifications > 0 ? notifications : undefined
    },
    { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" /> },
    { name: "Help", path: "/help", icon: <HelpCircle className="h-5 w-5" /> }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" 
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white shadow-lg fixed inset-y-0 left-0 z-50 transition-all duration-300 md:relative flex flex-col",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-16 md:w-16" : "w-64 md:w-64"
        )}
      >
        {/* Toggle button for desktop */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-white rounded-full p-1 shadow-md border border-gray-200 hidden md:flex items-center justify-center z-50 hover:bg-gray-50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? 
            <ChevronRight className="h-4 w-4 text-indigo-600" /> : 
            <ChevronLeft className="h-4 w-4 text-indigo-600" />
          }
        </button>

        {/* Logo area */}
        <div className={cn(
          "border-b border-gray-200",
          collapsed ? "p-3" : "p-4"
        )}>
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "justify-between"
          )}>
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg flex items-center justify-center overflow-hidden">
                <div className={cn(
                  "flex items-center justify-center",
                  collapsed ? "w-10 h-10" : "w-10 h-10"
                )}>
                  <PawPrint className="h-6 w-6" />
                </div>
              </div>
              {!collapsed && (
                <h1 className="text-xl font-semibold text-gray-800 ml-3">VetDashboard</h1>
              )}
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {/* Main Links */}
          <div className="mb-4">
            {!collapsed && (
              <div className="px-3 mb-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h2>
              </div>
            )}
            
            <div className="space-y-1">
              {mainLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  onClick={() => setOpen(false)}
                >
                  <div
                    className={cn(
                      "flex items-center text-gray-700 rounded-lg",
                      collapsed ? "justify-center px-2 py-3" : "px-3 py-2",
                      isActive(link.path) 
                        ? "bg-gradient-to-r from-indigo-50 to-white text-indigo-600 border-l-4 border-indigo-600 font-medium" 
                        : "hover:bg-gray-100"
                    )}
                    title={collapsed ? link.name : undefined}
                  >
                    <span className={cn(
                      "flex-shrink-0",
                      isActive(link.path) ? "text-indigo-600" : "text-gray-500",
                      collapsed ? "" : "mr-3"
                    )}>
                      {link.icon}
                    </span>
                    {!collapsed && <span>{link.name}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Clinical Links */}
          {/* <div className="mb-4">
            {!collapsed && (
              <div className="px-3 mb-2 mt-6">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Clinical</h2>
              </div>
            )}
            
            {collapsed && <div className="my-4 border-t border-gray-200"></div>}
            
            <div className="space-y-1">
              {clinicalLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  onClick={() => setOpen(false)}
                >
                  <div
                    className={cn(
                      "flex items-center text-gray-700 rounded-lg",
                      collapsed ? "justify-center px-2 py-3" : "px-3 py-2",
                      isActive(link.path) 
                        ? "bg-gradient-to-r from-indigo-50 to-white text-indigo-600 border-l-4 border-indigo-600 font-medium" 
                        : "hover:bg-gray-100"
                    )}
                    title={collapsed ? link.name : undefined}
                  >
                    <span className={cn(
                      "flex-shrink-0",
                      isActive(link.path) ? "text-indigo-600" : "text-gray-500",
                      collapsed ? "" : "mr-3"
                    )}>
                      {link.icon}
                    </span>
                    {!collapsed && <span>{link.name}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div> */}
          
          {/* Practice Links */}
          <div className="mb-4">
            {!collapsed && (
              <div className="px-3 mb-2 mt-6">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Practice</h2>
              </div>
            )}
            
            {collapsed && <div className="my-4 border-t border-gray-200"></div>}
            
            <div className="space-y-1">
              {practiceLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  onClick={() => setOpen(false)}
                >
                  <div
                    className={cn(
                      "flex items-center text-gray-700 rounded-lg",
                      collapsed ? "justify-center px-2 py-3" : "px-3 py-2",
                      isActive(link.path) 
                        ? "bg-gradient-to-r from-indigo-50 to-white text-indigo-600 border-l-4 border-indigo-600 font-medium" 
                        : "hover:bg-gray-100"
                    )}
                    title={collapsed ? link.name : undefined}
                  >
                    <span className={cn(
                      "flex-shrink-0",
                      isActive(link.path) ? "text-indigo-600" : "text-gray-500",
                      collapsed ? "" : "mr-3"
                    )}>
                      {link.icon}
                    </span>
                    {!collapsed && <span>{link.name}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Account Links */}
          <div>
            {!collapsed && (
              <div className="px-3 mb-2 mt-6">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</h2>
              </div>
            )}
            
            {collapsed && <div className="my-4 border-t border-gray-200"></div>}
            
            <div className="space-y-1">
              {accountLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  onClick={() => setOpen(false)}
                >
                  <div
                    className={cn(
                      "flex items-center text-gray-700 rounded-lg relative",
                      collapsed ? "justify-center px-2 py-3" : "px-3 py-2",
                      isActive(link.path) 
                        ? "bg-gradient-to-r from-indigo-50 to-white text-indigo-600 border-l-4 border-indigo-600 font-medium" 
                        : "hover:bg-gray-100"
                    )}
                    title={collapsed ? link.name : undefined}
                  >
                    <span className={cn(
                      "flex-shrink-0",
                      isActive(link.path) ? "text-indigo-600" : "text-gray-500",
                      collapsed ? "" : "mr-3"
                    )}>
                      {link.icon}
                    </span>
                    {!collapsed && <span>{link.name}</span>}
                    
                    {/* Badge for notifications */}
                    {link.badge && (
                      <Badge 
                        className={cn(
                          "bg-red-500 text-white ml-auto",
                          collapsed && "absolute top-1 right-1 w-4 h-4 p-0 flex items-center justify-center"
                        )}
                      >
                        {collapsed ? "" : link.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
              
              {/* Logout button */}
              <div
                className={cn(
                  "flex items-center text-gray-700 rounded-lg cursor-pointer",
                  collapsed ? "justify-center px-2 py-3" : "px-3 py-2",
                  "hover:bg-gray-100 mt-2"
                )}
                title={collapsed ? "Logout" : undefined}
                onClick={handleLogout}
              >
                <span className={cn(
                  "flex-shrink-0 text-red-500",
                  collapsed ? "" : "mr-3"
                )}>
                  <LogOut className="h-5 w-5" />
                </span>
                {!collapsed && <span className="text-red-500">Logout</span>}
              </div>
            </div>
          </div>
        </nav>
        
        {/* User profile */}
        <div className={cn(
          "border-t border-gray-200 p-4",
          collapsed && "p-2"
        )}>
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "justify-between"
          )}>
            <div className="flex items-center">
              <Avatar className="h-9 w-9 border-2 border-indigo-200">
                <AvatarImage src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" alt="Dr. Sarah Wilson" />
                <AvatarFallback className="bg-indigo-100 text-indigo-800">
                  {doctor ? doctor.username.charAt(0).toUpperCase() : 'SW'}
                </AvatarFallback>
              </Avatar>
              
              {!collapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {doctor ? `Dr. ${doctor.username}` : 'Dr. Sarah Wilson'}
                  </p>
                  <p className="text-xs text-gray-500">Lead Veterinarian</p>
                </div>
              )}
            </div>
            
            {!collapsed && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
