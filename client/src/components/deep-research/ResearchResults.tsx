import React, { useState } from "react";
import {
  FileText,
  Download,
  Globe,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ResearchResponse {
  success: boolean;
  research_id: string;
  topic: string;
  initial_report?: string;
  enhanced_report?: string;
  sources_count?: number;
  sources?: Array<{ title?: string; url: string; [key: string]: any }>;
  error?: string;
}

interface ResearchResultsProps {
  results: ResearchResponse;
  onDownload?: (researchId: string) => void;
  className?: string;
  isStandalone?: boolean;
}

const ResearchResults: React.FC<ResearchResultsProps> = ({ 
  results, 
  onDownload, 
  className,
  isStandalone = true
}) => {
  const [isSourcesOpen, setIsSourcesOpen] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopyText = async (text: string, type: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const renderMarkdownContent = (content: string | undefined, placeholder: string) => {
    return (
      <ScrollArea className="h-[500px] w-full rounded-md border bg-muted/20 p-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>
            {content || placeholder}
          </ReactMarkdown>
        </div>
      </ScrollArea>
    );
  };

  if (!results.success) {
    return (
      <Card className={cn("w-full", className, isStandalone && "shadow-xl")}>
        <CardHeader className="border-b">
          <CardTitle className="text-destructive flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5" />
            Research Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-destructive-foreground">
            {results.error || "An unknown error occurred during the research process."}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Research ID: {results.research_id}
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasBothReports = results.enhanced_report && results.initial_report;
  const defaultTab = results.enhanced_report ? "enhanced" : "initial";

  return (
    <Card className={cn("w-full", className, isStandalone && "shadow-xl rounded-lg overflow-hidden")}>
      <CardHeader className="bg-muted/30 p-4 md:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-grow min-w-0">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">Research Report</p>
            <CardTitle className="text-2xl font-bold mt-1 truncate" title={results.topic}>
              {results.topic}
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-1.5 space-x-2">
              <span>ID: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{results.research_id}</code></span>
              {results.sources_count !== undefined && (
                <Badge variant="outline" className="py-0.5 px-1.5">
                  <Globe className="h-3 w-3 mr-1" /> {results.sources_count} source{results.sources_count !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          {onDownload && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onDownload(results.research_id)}
              className="mt-2 sm:mt-0 flex-shrink-0 shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-6">
        {(results.initial_report || results.enhanced_report) ? (
          <Tabs defaultValue={defaultTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-muted/50 rounded-md p-1">
                    {results.enhanced_report && <TabsTrigger value="enhanced" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium py-1.5 px-3">Enhanced Report</TabsTrigger>}
                    {results.initial_report && <TabsTrigger value="initial" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium py-1.5 px-3">Initial Report</TabsTrigger>}
                </TabsList>
            </div>
            
            {results.enhanced_report && (
              <TabsContent value="enhanced" className="mt-0 space-y-3">
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleCopyText(results.enhanced_report!, "enhanced")}>
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> {copiedText === "enhanced" ? "Copied!" : "Copy Enhanced"}
                    </Button>
                </div>
                {renderMarkdownContent(results.enhanced_report, "Enhanced report content is not available.")}
              </TabsContent>
            )}
            
            {results.initial_report && (
              <TabsContent value="initial" className="mt-0 space-y-3">
                 <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleCopyText(results.initial_report!, "initial")}>
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> {copiedText === "initial" ? "Copied!" : "Copy Initial"}
                    </Button>
                </div>
                {renderMarkdownContent(results.initial_report, "Initial report content is not available.")}
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="text-center py-10">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No report content available.</h3>
            <p className="mt-1 text-xs text-muted-foreground">The research may still be in progress or did not produce a report.</p>
          </div>
        )}

        {results.sources && results.sources.length > 0 && (
          <Collapsible open={isSourcesOpen} onOpenChange={setIsSourcesOpen} className="pt-4 border-t">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between p-3 hover:bg-muted/50">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <Globe className="h-5 w-5 text-primary" />
                  Sources ({results.sources.length})
                </div>
                {isSourcesOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 bg-background rounded-md border">
                <ScrollArea className="h-auto max-h-[300px]">
                    <ul className="divide-y">
                    {results.sources.map((source, index) => (
                        <li key={index} className="p-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-grow">
                            <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm font-medium text-primary hover:underline truncate block"
                                title={source.url}
                            >
                                {source.title || source.url}
                            </a>
                            {source.title && source.url && 
                                <span className="text-xs text-muted-foreground truncate block" title={source.url}>{source.url}</span>
                            }
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => handleCopyText(source.url, `source-url-${index}`)}>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span className="sr-only">Copy URL</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Copy URL</p>
                                </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button asChild variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="sr-only">Open Source</span>
                                        </a>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Open in new tab</p>
                                </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        </li>
                    ))}
                    </ul>
                </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        )}

        {copiedText && (
          <div className="fixed bottom-4 right-4 bg-foreground text-background text-sm py-2 px-4 rounded-md shadow-lg z-50 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" /> Copied {copiedText.replace('-', ' ')} to clipboard!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResearchResults;
