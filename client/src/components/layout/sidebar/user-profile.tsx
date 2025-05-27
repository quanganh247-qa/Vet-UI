import React from "react";
import { User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  isExpanded: boolean;
  username?: string;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isExpanded, username, onLogout }) => {
  return (
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
            <p className="text-sm font-medium text-[#111827]">{username || "User"}</p>
            <button
              onClick={onLogout}
              className="flex items-center text-xs text-[#4B5563] hover:text-[#2C78E4] transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" /> Logout
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onLogout}
          className="p-2 rounded-full hover:bg-[#2C78E4]/10 text-[#4B5563] hover:text-[#2C78E4] transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default UserProfile; 