import React from "react";
import { PawPrint, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isExpanded, onToggle }) => {
  return (
    <div className={cn("p-5 flex items-center", isExpanded ? "justify-between" : "justify-center")}>
      {isExpanded ? (
        <div className="flex items-center">
          <PawPrint className="h-8 w-8 text-[#2C78E4]" />
          <span className="ml-2 text-xl font-semibold text-[#111827]">VetCare</span>
        </div>
      ) : (
        <PawPrint className="h-8 w-8 text-[#2C78E4]" />
      )}
      <button
        onClick={onToggle}
        className="p-2 rounded-full hover:bg-[#F9FAFB] text-[#4B5563] transition-colors"
      >
        {isExpanded ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default SidebarHeader; 