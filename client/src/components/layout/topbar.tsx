import { Bell, Search, Menu, MessageSquare, LogOut, Settings, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import MobileMenu from "./mobile-menu";
import { useAuth } from "@/context/auth-context";
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
import { useNotificationsContext } from "@/context/notifications-context";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  openSidebar: () => void;
}

// Inner component that safely uses auth context
const TopbarContent = ({ openSidebar }: TopbarProps) => {
  const { doctor, logout } = useAuth();
  const { unreadCount } = useNotificationsContext();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'BS';
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-md z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <MobileMenu className="text-white hover:text-white/80" />
          <h1 className="text-lg font-display font-medium ml-3 text-white">Bảng điều khiển</h1>
        </div>
        
        <div className="hidden md:block">
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-white/60" />
            </div>
            <Input 
              type="search" 
              placeholder="Tìm kiếm bệnh nhân, cuộc hẹn..." 
              className="pl-10 pr-3 py-2 border-white/20 bg-white/10 text-white placeholder-white/60 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Thông báo */}
          <div className="relative">
            <button 
              className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </button>
          </div>
          
          <button className="p-2 text-white hover:bg-white/10 rounded-md transition-colors">
            <MessageSquare className="h-5 w-5" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 border-2 border-white/20">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" 
                    alt="Hồ sơ" 
                  />
                  <AvatarFallback className="bg-indigo-800 text-white">
                    {doctor ? getInitials(doctor.username) : 'BS'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-white ml-2 mr-1">
                  {doctor ? `Bác sĩ ${doctor.username}` : 'Bác sĩ'}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile/edit')}>
                <User className="h-4 w-4 mr-2" />
                Hồ sơ cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Tùy chọn
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/notifications')}>
                <Bell className="h-4 w-4 mr-2" />
                Thông báo
                {unreadCount > 0 && (
                  <Badge className="ml-2 h-5 px-1 bg-red-500 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
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
            placeholder="Tìm kiếm bệnh nhân, cuộc hẹn..." 
            className="pl-10 pr-3 py-2 border-white/20 bg-white/10 text-white placeholder-white/60 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent w-full"
          />
        </div>
      </div>
    </header>
  );
};

// Main wrapper component that handles error catching
const Topbar: React.FC<TopbarProps> = (props) => {
  try {
    return <TopbarContent {...props} />;
  } catch (error) {
    console.error('Error rendering top bar:', error);
    // Return a simplified version if there's an error
    return (
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-md z-10 p-4">
        <h1 className="text-lg font-medium text-white">Phòng khám thú y</h1>
      </header>
    );
  }
};

export default Topbar;
