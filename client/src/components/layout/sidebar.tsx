import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Calendar,
  Users,
  User,
  LineChart,
  Settings,
  Bell,
  LogOut,
  MessageSquare,
  PawPrint,
  CreditCard,
  LifeBuoy,
  Clock,
  Bot,
  CalendarRange,
  Package,
  Syringe,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    name: "Workflow",
    href: "/appointment-flow",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    name: "Patients",
    href: "/patients",
    icon: <PawPrint className="h-5 w-5" />,
  },
  {
    name: "Staff",
    href: "/staff",
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: "Schedule",
    href: "/schedule-management",
    icon: <CalendarRange className="h-5 w-5" />,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: <Package className="h-5 w-5" />,
  },
  {
    name: "Vaccinations",
    href: "/vaccination",
    icon: <Syringe className="h-5 w-5" />,
  },
  {
    name: "Billing",
    href: "/billing",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    name: "Services",
    href: "/services-management",
    icon: <LifeBuoy className="h-5 w-5" />,
  },
  {
    name: "Catalog",
    href: "/catalog-management",
    icon: <LifeBuoy className="h-5 w-5" />,
  },
  // {
  //   name: "Virtual Assistant",
  //   href: "/chatbot",
  //   icon: <Bot className="h-5 w-5" />,
  // },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  {
    name: "Notifications",
    href: "/notifications",
    icon: <Bell className="h-5 w-5" />,
  },
];

interface SidebarContentProps {
  className?: string;
}

const SidebarContent = ({ className }: SidebarContentProps) => {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  // Safe context access within the component
  const auth = useAuth();
  const { doctor, logout, notificationCount } = auth;

  // Hàm kiểm tra URL hiện tại có khớp với href không
  const isActive = (href: string) => {
    if (href === '/') {
      return location === href;
    }
    return location.startsWith(href);
  };

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={cn(
        "bg-indigo-600 text-white transition-all duration-300 flex flex-col h-full",
        isExpanded ? "w-64" : "w-20",
        className
      )}
    >
      {/* Logo */}
      <div className={cn("p-4 flex items-center", isExpanded ? "justify-between" : "justify-center")}>
        {isExpanded && (
          <div className="flex items-center">
            <PawPrint className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-semibold">VetCare</span>
          </div>
        )}
        {!isExpanded && <PawPrint className="h-8 w-8 text-white" />}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
        >
          {isExpanded ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main navigation */}
      <div className="mt-6 flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActiveItem = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all",
                  isActiveItem
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {item.icon}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="ml-3 whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  {item.name === "Thông báo" && notificationCount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-2 space-y-1 mt-6">
          {secondaryNavigation.map((item) => {
            const isActiveItem = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all",
                  isActiveItem
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {item.icon}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="ml-3 whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                 
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User profile */}
      <div
        className={cn(
          "border-t border-indigo-700 p-4 mt-auto",
          isExpanded ? "" : "flex justify-center"
        )}
      >
        {isExpanded ? (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{doctor?.username || "User"}</p>
              <button
                onClick={logout}
                className="flex items-center text-xs text-indigo-200 hover:text-white"
              >
                <LogOut className="h-3 w-3 mr-1" /> Logout
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={logout}
            className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

interface SidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

// The main Sidebar component that will be exported and used in the app
const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  // We'll wrap the SidebarContent with a try-catch to gracefully handle potential auth issues
  try {
    return <SidebarContent />;
  } catch (error) {
    console.error("Error rendering sidebar:", error);
    // Return a minimal sidebar that doesn't depend on auth
    return (
      <div className="bg-indigo-600 text-white w-20 flex flex-col h-full">
        <div className="p-4 flex items-center justify-center">
          <PawPrint className="h-8 w-8 text-white" />
        </div>
        {/* Empty space where navigation would be */}
        <div className="flex-1"></div>
      </div>
    );
  }
};

export default Sidebar;
