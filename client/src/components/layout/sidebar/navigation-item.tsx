import React from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavigationItemProps {
  name: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
  isExpanded: boolean;
  showBadge?: boolean;
  badgeCount?: number;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  name,
  href,
  icon,
  isActive,
  isExpanded,
  showBadge = false,
  badgeCount = 0,
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
        isActive
          ? "bg-[#2C78E4]/10 text-[#2C78E4]"
          : "text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#2C78E4]"
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div className={cn(
            isActive ? "text-[#2C78E4]" : "text-[#4B5563] group-hover:text-[#2C78E4]",
            "transition-colors"
          )}>
            {icon}
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-3 whitespace-nowrap"
              >
                {name}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {showBadge && badgeCount > 0 && (
          <Badge className="bg-red-500 text-white">
            {badgeCount > 99 ? "99+" : badgeCount}
          </Badge>
        )}
      </div>
    </Link>
  );
};

export default NavigationItem; 