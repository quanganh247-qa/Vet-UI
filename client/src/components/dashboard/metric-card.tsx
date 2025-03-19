import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  DollarSign,
  PawPrint,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  timePeriod: string;
  icon: "appointments" | "patients" | "wait-time" | "revenue";
  loading?: boolean;
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  timePeriod, 
  icon, 
  loading = false 
}: MetricCardProps) => {
  const isPositiveChange = change >= 0;
  
  const getIcon = () => {
    switch (icon) {
      case "appointments":
        return <Calendar className="h-5 w-5" />;
      case "patients":
        return <PawPrint className="h-5 w-5" />;
      case "wait-time":
        return <Clock className="h-5 w-5" />;
      case "revenue":
        return <DollarSign className="h-5 w-5" />;
    }
  };
  
  const getIconBackground = () => {
    switch (icon) {
      case "appointments":
        return "bg-blue-100 text-[#2C7BE5]";
      case "patients":
        return "bg-green-100 text-green-600";
      case "wait-time":
        return "bg-orange-100 text-orange-500";
      case "revenue":
        return "bg-teal-100 text-[#00A9B5]";
    }
  };
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1"></div>
          ) : (
            <h3 className="text-2xl font-display font-semibold text-[#12263F] mt-1">{value}</h3>
          )}
          
          <div className="flex items-center mt-1">
            <span className={cn(
              "text-xs font-medium flex items-center",
              isPositiveChange ? "text-green-500" : "text-red-500"
            )}>
              {isPositiveChange ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(change)}%
            </span>
            <span className="text-gray-400 text-xs ml-2">vs. {timePeriod}</span>
          </div>
        </div>
        <div className={cn("rounded-full p-2", getIconBackground())}>
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
