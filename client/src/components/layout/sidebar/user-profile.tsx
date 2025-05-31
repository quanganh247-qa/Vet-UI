import React from "react";
import { User, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfileProps {
  isExpanded: boolean;
  username?: string;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isExpanded, username, onLogout }) => {
  const [, navigate] = useLocation();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <div
      className={cn(
        "border-t border-gray-100 p-4 mt-auto bg-[#F9FAFB]",
        isExpanded ? "" : "flex justify-center"
      )}
    >
      {isExpanded ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center cursor-pointer hover:bg-gray-100 rounded-lg p-2 -mx-2 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#2C78E4]/10 flex items-center justify-center text-[#2C78E4]">
                <User className="h-5 w-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-[#111827]">{username || "User"}</p>
                <p className="text-xs text-[#4B5563]">Click to view options</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mb-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleProfileClick}
              className="cursor-pointer text-[#4B5563] hover:bg-[#F9FAFB]"
            >
              <User className="mr-2 h-4 w-4 text-[#2C78E4]" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
          
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-[#2C78E4]/10 text-[#4B5563] hover:text-[#2C78E4] transition-colors">
              <User className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mb-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleProfileClick}
              className="cursor-pointer text-[#4B5563] hover:bg-[#F9FAFB]"
            >
              <User className="mr-2 h-4 w-4 text-[#2C78E4]" />
              <span>Edit Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default UserProfile; 