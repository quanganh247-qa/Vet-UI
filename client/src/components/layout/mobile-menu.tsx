import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Menu,
  X,
  Home,
  Calendar,
  Users,
  Activity,
  BarChart2,
  Settings,
  LogOut,
  User,
  Clock,
  FileText,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  className?: string;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
}> = ({ icon, label, href, isActive, onClick }) => {
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate(href);
    if (onClick) onClick();
  };

  return (
    <button
      className={cn(
        "flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left",
        isActive
          ? "bg-blue-50 text-blue-600"
          : "text-gray-700 hover:bg-gray-100"
      )}
      onClick={handleClick}
    >
      <div>{icon}</div>
      <span className="font-medium">{label}</span>
    </button>
  );
};

// Inner component that safely uses the auth context
const MobileMenuContent: React.FC<MobileMenuProps & { isOpen: boolean; closeMenu: () => void }> = ({ 
  className, 
  isOpen, 
  closeMenu 
}) => {
  const [location] = useLocation();
  // Get auth context safely within this component
  const { doctor, logout } = useAuth();

  // Close menu when location changes
  useEffect(() => {
    closeMenu();
  }, [location, closeMenu]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMenu} />
      )}

      {/* Menu */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed top-0 right-0 w-3/4 max-w-xs h-full bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">VetDashboard</h2>
          <button onClick={closeMenu} className="p-1">
            <X className="h-6 w-6" />
          </button>
        </div>

        {doctor && (
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">{doctor.username}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <NavItem
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            href="/"
            isActive={location === "/"}
          />
          <NavItem
            icon={<Calendar className="h-5 w-5" />}
            label="Appointments"
            href="/appointments"
            isActive={location === "/appointments"}
          />
          <NavItem
            icon={<Clock className="h-5 w-5" />}
            label="Appointment Flow"
            href="/appointment-flow"
            isActive={location === "/appointment-flow"}
          />
          <NavItem
            icon={<Users className="h-5 w-5" />}
            label="Patients"
            href="/patients"
            isActive={location === "/patients"}
          />
          <NavItem
            icon={<FileText className="h-5 w-5" />}
            label="Medical Records"
            href="/medical-records"
            isActive={location.startsWith("/medical-records")}
          />
          <NavItem
            icon={<Activity className="h-5 w-5" />}
            label="Treatment"
            href="/treatment"
            isActive={location.startsWith("/treatment")}
          />
          <NavItem
            icon={<BarChart2 className="h-5 w-5" />}
            label="Analytics"
            href="/analytics"
            isActive={location === "/analytics"}
          />
        </div>

        <div className="p-4 border-t">
          <NavItem
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            href="/settings"
            isActive={location === "/settings"}
          />
          <Button
            variant="ghost"
            className="flex items-center space-x-3 w-full px-4 py-3 justify-start text-gray-700 hover:bg-gray-100 rounded-lg mt-1"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </div>
    </>
  );
};

// Main component that handles the state and error handling
const MobileMenu: React.FC<MobileMenuProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById("mobile-menu");
      const toggle = document.getElementById("mobile-menu-toggle");
      
      if (
        menu &&
        !menu.contains(event.target as Node) &&
        toggle &&
        !toggle.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        id="mobile-menu-toggle"
        className={cn("md:hidden", className)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Only render the content component when menu is open to avoid unnecessary auth context errors */}
      {isOpen && (
        <React.Suspense fallback={null}>
          {/* Wrap in try-catch to handle any auth context errors */}
          {(() => {
            try {
              return <MobileMenuContent isOpen={isOpen} closeMenu={closeMenu} className={className} />;
            } catch (error) {
              console.error("Error rendering mobile menu:", error);
              return null;
            }
          })()}
        </React.Suspense>
      )}
    </>
  );
};

export default MobileMenu;