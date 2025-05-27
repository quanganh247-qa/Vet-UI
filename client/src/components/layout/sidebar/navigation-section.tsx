import React from "react";
import { cn } from "@/lib/utils";
import NavigationItem from "./navigation-item";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface NavigationSectionProps {
  title?: string;
  items: NavigationItem[];
  isExpanded: boolean;
  isActive: (href: string) => boolean;
  className?: string;
  unreadCount?: number;
}

const NavigationSection: React.FC<NavigationSectionProps> = ({
  title,
  items,
  isExpanded,
  isActive,
  className,
  unreadCount = 0,
}) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      {title && (
        <div className={cn(
          "py-2 px-3",
          isExpanded ? "block" : "hidden"
        )}>
          <p className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
            {title}
          </p>
        </div>
      )}
      <nav className="space-y-1.5">
        {items.map((item) => (
          <NavigationItem
            key={item.name}
            name={item.name}
            href={item.href}
            icon={item.icon}
            isActive={isActive(item.href)}
            isExpanded={isExpanded}
            showBadge={item.name === "Notifications"}
            badgeCount={unreadCount}
          />
        ))}
      </nav>
    </div>
  );
};

export default NavigationSection; 