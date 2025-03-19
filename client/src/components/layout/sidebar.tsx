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
  Pill
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const sidebarLinks = [
    { name: "Dashboard", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Appointments", path: "/appointments", icon: <Calendar className="h-5 w-5" /> },
    { name: "Patients", path: "/patients", icon: <Users className="h-5 w-5" /> },
    { name: "Staff", path: "/staff", icon: <Stethoscope className="h-5 w-5" /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart className="h-5 w-5" /> }
  ];

  const practiceLinks = [
    { name: "Prescriptions", path: "/prescriptions", icon: <Pill className="h-5 w-5" /> },
    { name: "Lab Results", path: "/lab-results", icon: <TestTube className="h-5 w-5" /> },
    { name: "Billing", path: "/billing", icon: <DollarSign className="h-5 w-5" /> }
  ];

  const accountLinks = [
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
      <aside className={`bg-white shadow-lg fixed inset-y-0 left-0 z-50 transition-transform duration-300 w-64 md:relative md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full" 
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-[#2C7BE5] flex items-center justify-center text-white mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.827 16.379c.472-1.315 1.71-2.508 3.343-3.173 1.334-.544 2.293-1.090 2.847-1.625.83-.802 1.431-1.893 1.431-3.38 0-2.897-2.19-5.201-5.112-5.201-1.822 0-3.078.985-3.753 1.686-.676.702-1.228 1.533-1.228 2.344 0 .203.196.336.369.243.605-.329 1.448-.544 2.286-.544 1.949 0 2.73 1.177 2.73 2.344 0 1.573-1.213 2.186-2.157 2.186-.583 0-.897-.202-.897-.202" />
                <path d="M10.636 18c0-1 .773-1.5 1.636-1.5.864 0 1.636.5 1.636 1.5s-.772 1.5-1.636 1.5c-.863 0-1.636-.5-1.636-1.5Z" />
              </svg>
            </div>
            <h1 className="text-xl font-display font-semibold text-[#12263F]">VetPractice Pro</h1>
          </div>
        </div>
        
        <nav className="mt-5">
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</p>
          </div>
          
          {sidebarLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center px-4 py-2 text-[#12263F] hover:bg-gray-100",
                isActive(link.path) && "bg-[#2C7BE5] bg-opacity-10 text-[#2C7BE5] border-l-4 border-[#2C7BE5]"
              )}
            >
              <span className={cn("mr-2 w-5", isActive(link.path) ? "text-[#2C7BE5]" : "text-gray-500")}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}
          
          <div className="px-4 pt-5 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Practice</p>
          </div>
          
          {practiceLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center px-4 py-2 text-[#12263F] hover:bg-gray-100",
                isActive(link.path) && "bg-[#2C7BE5] bg-opacity-10 text-[#2C7BE5] border-l-4 border-[#2C7BE5]"
              )}
            >
              <span className={cn("mr-2 w-5", isActive(link.path) ? "text-[#2C7BE5]" : "text-gray-500")}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}
          
          <div className="px-4 pt-5 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</p>
          </div>
          
          {accountLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center px-4 py-2 text-[#12263F] hover:bg-gray-100",
                isActive(link.path) && "bg-[#2C7BE5] bg-opacity-10 text-[#2C7BE5] border-l-4 border-[#2C7BE5]"
              )}
            >
              <span className={cn("mr-2 w-5", isActive(link.path) ? "text-[#2C7BE5]" : "text-gray-500")}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center">
            <img 
              className="h-8 w-8 rounded-full object-cover" 
              src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" 
              alt="Profile" 
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-[#12263F]">Dr. Sarah Wilson</p>
              <p className="text-xs text-gray-500">Lead Veterinarian</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
