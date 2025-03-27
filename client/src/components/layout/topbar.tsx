import { Bell, Search, Menu, MessageSquare, LogOut, Settings, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import MobileMenu from "./mobile-menu";
import { useAuth } from "@/context/auth-context";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopbarProps {
  openSidebar: () => void;
}

const Topbar = ({ openSidebar }: TopbarProps) => {
  const { doctor, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'DR';
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-md z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <MobileMenu className="text-white hover:text-white/80" />
          <h1 className="text-lg font-display font-medium ml-3 text-white">Dashboard</h1>
        </div>
        
        <div className="hidden md:block">
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-white/60" />
            </div>
            <Input 
              type="search" 
              placeholder="Search patients, appointments..." 
              className="pl-10 pr-3 py-2 border-white/20 bg-white/10 text-white placeholder-white/60 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <NotificationCenter className="mr-2 text-white" />
          <button className="p-2 mr-3 text-white hover:text-white/80">
            <MessageSquare className="h-5 w-5" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 border-2 border-white/20">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" 
                    alt="Profile" 
                  />
                  <AvatarFallback className="bg-indigo-800 text-white">
                    {doctor ? getInitials(doctor.username) : 'DR'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-white ml-2 mr-1">
                  {doctor ? `Dr. ${doctor.username}` : 'Doctor'}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="md:hidden p-4 pt-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-white/60" />
          </div>
          <Input 
            type="search" 
            placeholder="Search patients, appointments..." 
            className="pl-10 pr-3 py-2 border-white/20 bg-white/10 text-white placeholder-white/60 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent w-full"
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
