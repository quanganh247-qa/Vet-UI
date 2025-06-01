import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Bell,
  Clock,
  PawPrint,
  CreditCard,
  CalendarRange,
  Package,
  Pill,
  Wrench,
  ShoppingBag,
  TestTube,
  User,
  Brain,
} from "lucide-react";

export const mainNavigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    name: "Workflow",
    href: "/appointment-flow",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    name: "Patients",
    href: "/patients",
    icon: <PawPrint className="h-5 w-5" />,
  },
  {
    name: "Staff",
    href: "/staff",
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: "Schedule",
    href: "/shift-assignment",
    icon: <CalendarRange className="h-5 w-5" />,
  },
  {
    name: "Billing",
    href: "/billing",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: <Package className="h-5 w-5" />,
  },
  {
    name: "Medicine",
    href: "/medicine-management",
    icon: <Pill className="h-5 w-5" />,
  },
  {
    name: "Services",
    href: "/services-management",
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    name: "Catalog",
    href: "/catalog-management",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    name: "Test",
    href: "/test-management",
    icon: <TestTube className="h-5 w-5" />,
  },
  {
    name: "Deep Research",
    href: "/deep-research",
    icon: <Brain className="h-5 w-5" />,
  },
];

export const secondaryNavigation = [
  { 
    name: "Profile", 
    href: "/profile", 
    icon: <User className="h-5 w-5" /> 
  },
  { 
    name: "Settings", 
    href: "/settings", 
    icon: <Settings className="h-5 w-5" /> 
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: <Bell className="h-5 w-5" />,
  },
]; 