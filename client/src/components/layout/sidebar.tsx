import React, { useState, Dispatch, SetStateAction } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useNotificationsContext } from "@/context/notifications-context";
import { PawPrint } from "lucide-react";

// Import the new layered components
import SidebarHeader from "./sidebar/sidebar-header";
import NavigationSection from "./sidebar/navigation-section";
import UserProfile from "./sidebar/user-profile";
import { mainNavigation, secondaryNavigation } from "./sidebar/navigation-config";

interface SidebarContentProps {
  className?: string;
}

const SidebarContent = ({ className }: SidebarContentProps) => {
  const [location] = useLocation();
  const { logout, doctor } = useAuth();
  const { unreadCount } = useNotificationsContext();
  const [isExpanded, setIsExpanded] = useState(true);

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
      {/* Header Layer */}
      <SidebarHeader isExpanded={isExpanded} onToggle={toggleSidebar} />

      {/* Navigation Layer */}
      <div className="mt-4 flex flex-col flex-1 overflow-y-auto px-3">
        {/* Main Navigation */}
        <NavigationSection
          items={mainNavigation}
          isExpanded={isExpanded}
          isActive={isActive}
          className="flex-1"
        />

        {/* Secondary Navigation */}
        <NavigationSection
          title="Settings"
          items={secondaryNavigation}
          isExpanded={isExpanded}
          isActive={isActive}
          unreadCount={unreadCount}
          className="mt-6 mb-4"
        />
      </div>

      {/* User Profile Layer */}
      <UserProfile
        isExpanded={isExpanded}
        username={doctor?.username}
        onLogout={logout}
      />
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
