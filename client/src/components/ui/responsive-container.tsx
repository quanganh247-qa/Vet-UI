import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileBreakpoint?: number;
  mobilePadding?: string;
  desktopPadding?: string;
  mobileBehavior?: "stack" | "scroll" | "hide";
  detectBreakpoint?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  mobileBreakpoint = 768, // default md breakpoint
  mobilePadding = "px-4 py-3",
  desktopPadding = "px-6 py-4",
  mobileBehavior = "stack",
  detectBreakpoint = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!detectBreakpoint) return;

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    // Initial check
    checkIsMobile();

    // Setup listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [mobileBreakpoint, detectBreakpoint]);

  const responsiveClasses = isMobile
    ? cn(
        mobilePadding,
        mobileBehavior === "stack" && "flex flex-col",
        mobileBehavior === "scroll" && "overflow-x-auto",
        mobileBehavior === "hide" && "hidden md:block"
      )
    : desktopPadding;

  return (
    <div
      className={cn(
        "transition-all duration-200",
        responsiveClasses,
        className
      )}
      data-mobile={isMobile}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer; 