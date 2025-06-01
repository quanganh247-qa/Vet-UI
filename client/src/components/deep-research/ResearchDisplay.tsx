import React, { useState } from "react";
import {
  Download,
  ExternalLink,
  Clock,
  Globe,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Copy,
  RefreshCw,
  Trash2,
  ListChecks, // Added for Activity Log
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area"; // Added for scrollable activity log
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import {
  ResearchStatus,
  ResearchResponse,
} from "@/services/deep-research-services";
import { Separator } from "@/components/ui/separator"; // Added Separator
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Added Tooltip
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

export interface ResearchDisplayProps {
  researchId: string;
  status: ResearchStatus;
  result?: ResearchResponse;
  onDownload: (researchId: string) => void;
  onRefresh: (researchId: string) => void;
  onDelete: (researchId: string) => void;
  isDownloading?: boolean;
}

const ResearchDisplay: React.FC<ResearchDisplayProps> = ({
  researchId,
  status,
  result,
  onDownload,
  onRefresh,
  onDelete,
  isDownloading = false,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const getStatusIcon = () => {
    switch (status.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
      case "researching":
      case "enhancing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "pending":
      case "researching":
      case "enhancing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getProgressPercentage = () => {
    switch (status.status) {
      case "pending":
        return 10;
      case "researching":
        return 50;
      case "enhancing":
        return 80;
      case "completed":
        return 100;
      case "error":
        return 0;
      default:
        return 0;
    }
  };

  const handleMarkdownDownload = () => {
    if (!result?.initial_report) return;
    
    const blob = new Blob([result.initial_report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Research_${researchId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePdfDownload = async () => {
    if (!result?.initial_report) return;
    
    setIsPdfGenerating(true);
    try {
      // Get the content element
      const contentElement = document.getElementById('research-content');
      if (!contentElement) {
        throw new Error('Content element not found');
      }

      // Hide the buttons during capture
      const actionButtons = contentElement.querySelector(".action-buttons");
      if (actionButtons) {
        actionButtons.classList.add("hidden");
      }

      // Generate canvas
      const canvas = await html2canvas(contentElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Generate filename
      const fileName = `Research_${researchId}_${format(new Date(), "yyyy-MM-dd")}`;
      
      // Download the PDF
      pdf.save(`${fileName}.pdf`);

      // Show buttons again
      if (actionButtons) {
        actionButtons.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const renderMarkdown = (content: string) => {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  };

  return (
    <Card className="w-full shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/30 p-4 md:p-6 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {getStatusIcon()}
            <div className="min-w-0">
              <CardTitle
                className="text-xl font-semibold truncate"
                title={result?.topic || "Unknown Topic"}
              >
                {result?.topic || "Research Task"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                ID:{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                  {researchId}
                </code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant={
                status.status === "completed"
                  ? "default"
                  : status.status === "error"
                  ? "destructive"
                  : "secondary"
              }
              className={cn(
                "text-xs font-medium py-1 px-2.5 rounded-full",
                getStatusColor(),
                status.status === "completed" && "bg-green-500 text-white",
                status.status === "error" && "bg-red-500 text-white"
              )}
            >
              {status.status.toUpperCase()}
            </Badge>
            {status.status !== "completed" && status.status !== "error" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRefresh(researchId)}
                      className="h-8 w-8"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="sr-only">Refresh Status</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh Status</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(researchId)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete Research</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Research</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Progress Bar & Current Step */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-sm font-medium">
            <span>Progress ({getProgressPercentage()}%)</span>
          </div>
          <Progress value={getProgressPercentage()} className="w-full h-2" />
          {status.current_step && (
            <h3 className=" text-muted-foreground pt-1 font-bold">
              Current step: {status.current_step}
            </h3>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-6">
        {/* Error Message Display */}
        <div id="research-content" className="space-y-6">
          {status.status === "error" && result?.error && (
            <Card className="bg-destructive/10 border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive text-lg">
                  <AlertCircle className="h-5 w-5" />
                  Research Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-destructive-foreground">
                  {result.error}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results Content */}
          {result && status.status === "completed" && result.success && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Research Report</h2>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(), "PPP")}
                  <span className="mx-2">•</span>
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    ID: {researchId}
                  </code>
                </div>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                {renderMarkdown(result.initial_report || "No report available.")}
              </div>
            </div>
          )}

          {/* Activity Log */}
          {status.activities && status.activities.length > 0 && (
            <Card className="shadow-sm mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] w-full rounded-md border p-3 bg-muted/20">
                  <ul className="space-y-2.5">
                    {status.activities.map((activity, index) => (
                      <li
                        key={index}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <Clock className="h-4 w-4 mt-0.5 text-primary/70 flex-shrink-0" />
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 action-buttons print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleCopyText(result?.initial_report || "", "report")
            }
            disabled={!result?.initial_report}
          >
            <Copy className="mr-2 h-3.5 w-3.5" /> Copy Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkdownDownload}
            disabled={!result?.initial_report}
          >
            <FileText className="mr-2 h-3.5 w-3.5" />
            Save as Markdown
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handlePdfDownload}
            disabled={isPdfGenerating || !result?.initial_report}
            className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white"
          >
            {isPdfGenerating ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-3.5 w-3.5" />
                Save as PDF
              </>
            )}
          </Button>
        </div>

        {copiedText && (
          <div className="fixed bottom-4 right-4 bg-foreground text-background text-sm py-2 px-4 rounded-md shadow-lg z-50 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" /> Copied{" "}
            {copiedText} to clipboard!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResearchDisplay;
