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
    href: "/shift-assignment",
    icon: <CalendarRange className="h-5 w-5" />,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: <Package className="h-5 w-5" />,
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

  // Check if current URL matches href
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
        "bg-white text-[#111827] border-r border-gray-100 shadow-sm transition-all duration-300 flex flex-col h-full",
        isExpanded ? "w-64" : "w-20",
        className
      )}
    >
      {/* Logo */}
      <div className={cn("p-5 flex items-center", isExpanded ? "justify-between" : "justify-center")}>
        {isExpanded && (
          <div className="flex items-center">
            <PawPrint className="h-8 w-8 text-[#2C78E4]" />
            <span className="ml-2 text-xl font-semibold text-[#111827]">VetCare</span>
          </div>
        )}
        {!isExpanded && <PawPrint className="h-8 w-8 text-[#2C78E4]" />}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-[#F9FAFB] text-[#4B5563] transition-colors"
        >
          {isExpanded ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main navigation */}
      <div className="mt-4 flex flex-col flex-1 overflow-y-auto px-3">
        <nav className="flex-1 space-y-1.5">
          {navigation.map((item) => {
            const isActiveItem = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                  isActiveItem
                    ? "bg-[#2C78E4]/10 text-[#2C78E4]"
                    : "text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#2C78E4]"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className={cn(
                      isActiveItem ? "text-[#2C78E4]" : "text-[#4B5563] group-hover:text-[#2C78E4]",
                      "transition-colors"
                    )}>
                      {item.icon}
                    </div>
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
                  {item.name === "Notifications" && notificationCount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1.5 mt-6 mb-4">
          <div className={cn(
            "py-2 px-3",
            isExpanded ? "block" : "hidden"
          )}>
            <p className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Settings
            </p>
          </div>
          {secondaryNavigation.map((item) => {
            const isActiveItem = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                  isActiveItem
                    ? "bg-[#2C78E4]/10 text-[#2C78E4]"
                    : "text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#2C78E4]"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className={cn(
                      isActiveItem ? "text-[#2C78E4]" : "text-[#4B5563] group-hover:text-[#2C78E4]",
                      "transition-colors"
                    )}>
                      {item.icon}
                    </div>
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
                  {item.name === "Notifications" && notificationCount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User profile */}
      <div
        className={cn(
          "border-t border-gray-100 p-4 mt-auto bg-[#F9FAFB]",
          isExpanded ? "" : "flex justify-center"
        )}
      >
        {isExpanded ? (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#2C78E4]/10 flex items-center justify-center text-[#2C78E4]">
              <User className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#111827]">{doctor?.username || "User"}</p>
              <button
                onClick={logout}
                className="flex items-center text-xs text-[#4B5563] hover:text-[#2C78E4] transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" /> Logout
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={logout}
            className="p-2 rounded-full hover:bg-[#2C78E4]/10 text-[#4B5563] hover:text-[#2C78E4] transition-colors"
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
      <div className="bg-white text-[#111827] border-r border-gray-100 w-20 flex flex-col h-full">
        <div className="p-4 flex items-center justify-center">
          <PawPrint className="h-8 w-8 text-[#2C78E4]" />
        </div>
        {/* Empty space where navigation would be */}
        <div className="flex-1"></div>
      </div>
    );
  }
};

export default Sidebar;
