import React from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Search,
  Zap,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ResearchStatus {
  research_id: string;
  topic?: string;
  status: "pending" | "researching" | "enhancing" | "completed" | "error";
  progress: string;
  current_step: string;
}

interface ResearchStatusCardProps {
  status: ResearchStatus;
  className?: string;
  onClick?: (researchId: string) => void;
}

const ResearchStatusCard: React.FC<ResearchStatusCardProps> = ({ status, className, onClick }) => {
  const getStatusVisuals = () => {
    switch (status.status) {
      case "pending":
        return { 
            icon: <Clock className="h-5 w-5 text-yellow-500" />, 
            color: "border-yellow-500/50 bg-yellow-500/5",
            textColor: "text-yellow-600 dark:text-yellow-400",
            badgeVariant: "secondary" as const
        };
      case "researching":
        return { 
            icon: <Search className="h-5 w-5 text-blue-500" />, 
            color: "border-blue-500/50 bg-blue-500/5",
            textColor: "text-blue-600 dark:text-blue-400",
            badgeVariant: "default" as const
        };
      case "enhancing":
        return { 
            icon: <Zap className="h-5 w-5 text-purple-500" />, 
            color: "border-purple-500/50 bg-purple-500/5",
            textColor: "text-purple-600 dark:text-purple-400",
            badgeVariant: "secondary" as const
        };
      case "completed":
        return { 
            icon: <CheckCircle className="h-5 w-5 text-green-500" />, 
            color: "border-green-500/50 bg-green-500/5",
            textColor: "text-green-600 dark:text-green-400",
            badgeVariant: "default" as const
        };
      case "error":
        return { 
            icon: <XCircle className="h-5 w-5 text-red-500" />, 
            color: "border-red-500/50 bg-red-500/5",
            textColor: "text-red-600 dark:text-red-400",
            badgeVariant: "destructive" as const 
        };
      default:
        return { 
            icon: <AlertCircle className="h-5 w-5 text-gray-500" />, 
            color: "border-gray-500/50 bg-gray-500/5",
            textColor: "text-gray-600 dark:text-gray-400",
            badgeVariant: "outline" as const 
        };
    }
  };

  const visuals = getStatusVisuals();

  const getProgressValue = () => {
    const progressNum = parseFloat(status.progress);
    if (!isNaN(progressNum)) return progressNum;

    switch (status.status) {
      case "pending": return 10;
      case "researching": return 40;
      case "enhancing": return 75;
      case "completed": return 100;
      case "error": return 0;
      default: return 0;
    }
  };

  const progressValue = getProgressValue();
  const isActive = status.status === "researching" || status.status === "enhancing" || status.status === "pending";

  return (
    <Card 
        className={cn(
            "w-full shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden border", 
            visuals.color,
            onClick && "cursor-pointer",
            className
        )}
        onClick={onClick ? () => onClick(status.research_id) : undefined}
    >
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={cn("flex-shrink-0 p-1.5 rounded-full", visuals.color)}>{visuals.icon}</span>
            <div>
                {status.topic && <p className="text-xs text-muted-foreground truncate" title={status.topic}>{status.topic}</p>}
                <CardTitle className={cn("text-base font-semibold leading-tight", status.topic ? "mt-0.5" : "")}>
                     {status.current_step || "Research Status"}
                </CardTitle>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant={visuals.badgeVariant} className="capitalize text-xs py-1 px-2.5 rounded-full font-medium flex-shrink-0">
                        {status.status}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Status: {status.status}</p>
                </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <div className="space-y-1.5">
          <div className={cn("flex justify-between text-xs font-medium", visuals.textColor)}>
            <span>Progress</span>
            <span>{progressValue}%</span>
          </div>
          <Progress 
            value={progressValue} 
            className={cn(
              "h-1.5",
              (status.status === "researching" || status.status === "enhancing") && "animate-pulse"
            )}
          />
        </div>
        
        {status.progress && status.progress !== `${progressValue}%` && progressValue !== 100 && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1.5">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <p className="leading-snug">{status.progress}</p>
          </div>
        )}
        
        <div className="pt-2 text-xs text-muted-foreground/80">
          ID: <code className="bg-muted/50 px-1 py-0.5 rounded font-mono text-xs">{status.research_id}</code>
        </div>
        
        {isActive && status.status !== "pending" && (
          <div className={cn("flex items-center gap-1.5 text-xs pt-1", visuals.textColor, "font-medium")}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Processing...
          </div>
        )}
        {status.status === "error" && (
            <div className={cn("flex items-center gap-1.5 text-xs pt-1", visuals.textColor, "font-medium")}>
                <AlertCircle className="h-3.5 w-3.5" />
                Error occurred. Check details.
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResearchStatusCard;
