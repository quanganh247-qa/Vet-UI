import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  Calendar,
  Clock,
  FileText,
  Trash2,
  Download,
  Eye,
  MoreVertical,
  RefreshCw    // For Refresh button
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Corrected import for Card components - CardDescription was added before, ensure it's from the same source
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ResearchHistoryItem {
  research_id: string;
  status: "pending" | "researching" | "enhancing" | "completed" | "error";
  progress: string;
  current_step: string;
  topic?: string;
  created_at?: string;
  completed_at?: string;
}

export interface ResearchHistoryProps {
  researchItems: ResearchHistoryItem[];
  onSelectResearch: (researchId: string) => void;
  onDeleteResearch: (researchId: string) => void;
  onDownloadResearch: (researchId: string) => void;
  onRefreshList: () => void;
  isLoading?: boolean;
}

const ResearchHistory: React.FC<ResearchHistoryProps> = ({
  researchItems,
  onSelectResearch,
  onDeleteResearch,
  onDownloadResearch,
  onRefreshList,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "pending":
      case "researching":
      case "enhancing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "error":
        return "✗";
      case "pending":
        return "⏳";
      case "researching":
        return "🔍";
      case "enhancing":
        return "✨";
      default:
        return "❓";
    }
  };

  const filteredItems = researchItems
    .filter(item => {
      const matchesSearch = !searchTerm || 
        (item.topic && item.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.research_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.created_at || b.research_id).localeCompare(a.created_at || a.research_id);
        case "oldest":
          return (a.created_at || a.research_id).localeCompare(b.created_at || b.research_id);
        case "topic":
          return (a.topic || "").localeCompare(b.topic || "");
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Invalid date";
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <History className="h-6 w-6 text-primary" />
            Research History
          </CardTitle>
          <Button 
            variant="outline" 
            onClick={onRefreshList} 
            disabled={isLoading}
            className="border-primary/20 hover:border-primary/40"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh List
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 bg-muted/10 p-4 rounded-lg border border-muted">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by topic or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="researching">Researching</SelectItem>
              <SelectItem value="enhancing">Enhancing</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="topic">Topic A-Z</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Research Items List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading research history...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed border-muted">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "No research items match your filters." 
                  : "No research history found. Start your first research!"
                }
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <Card 
                key={item.research_id} 
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all border-l-4",
                  item.status === "completed" && "border-l-green-500",
                  item.status === "error" && "border-l-red-500",
                  item.status === "pending" && "border-l-blue-500",
                  item.status === "researching" && "border-l-purple-500",
                  item.status === "enhancing" && "border-l-amber-500"
                )}
                onClick={() => onSelectResearch(item.research_id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs font-medium px-2 py-1", getStatusColor(item.status))}>
                          {getStatusIcon(item.status)} {item.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">
                          {item.topic ? truncateText(item.topic, 60) : "Untitled Research"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: <code className="bg-muted px-1.5 py-0.5 rounded">{item.research_id}</code>
                        </p>
                      </div>
                      
                      {item.status !== "completed" && item.current_step && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {item.current_step}
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onSelectResearch(item.research_id);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {item.status === "completed" && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onDownloadResearch(item.research_id);
                          }}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteResearch(item.research_id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResearchHistory;
