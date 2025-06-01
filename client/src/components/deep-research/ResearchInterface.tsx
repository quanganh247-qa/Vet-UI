import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Search,
  Settings,
  Download,
  Clock,
  Globe,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

export interface ResearchInterfaceProps {
  onStartResearch: (request: ResearchRequest) => void;
  isLoading: boolean;
  isConfigured: boolean;
  onConfigurationChange: (configured: boolean) => void;
}

export interface ResearchRequest {
  topic: string;
  max_depth: number;
  time_limit: number;
  max_urls: number;
  enhance_report: boolean;
}

const ResearchInterface: React.FC<ResearchInterfaceProps> = ({
  onStartResearch,
  isLoading,
  isConfigured,
  onConfigurationChange
}) => {
  const [topic, setTopic] = useState<string>("");
  const [maxDepth, setMaxDepth] = useState<number>(3);
  const [timeLimit, setTimeLimit] = useState<number>(180);
  const [maxUrls, setMaxUrls] = useState<number>(10);
  const [enhanceReport, setEnhanceReport] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [isAutoConfiguring, setIsAutoConfiguring] = useState<boolean>(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus the input field and check configuration when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {  // Removed the configuration check
      onStartResearch({
        topic: topic.trim(),
        max_depth: maxDepth,
        time_limit: timeLimit,
        max_urls: maxUrls,
        enhance_report: false,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const exampleTopics = [
    "Breast cancer treatment and prevention",
  
  ];

  // Only check if there's content and we're not currently loading
  const canStartResearch = topic.trim().length > 0 && !isLoading;

  return (
    <div>
      {/* Research Form */}
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Search className="h-6 w-6 text-primary" />
            New Research Task
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="research-topic" className="text-base font-semibold">Research Topic</Label>
              <Textarea
                ref={inputRef}
                id="research-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[120px] resize-none text-base p-3 focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Enter your research topic, e.g., 'The future of renewable energy in Southeast Asia'"
                required
              />
            </div>

            {/* Quick Examples */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-muted-foreground">
                Or, get started with an example:
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {exampleTopics.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-left justify-start h-auto py-2 px-3 border-dashed hover:border-primary hover:bg-primary/10 transition-all duration-200 ease-in-out group"
                    )}
                    onClick={() => setTopic(example)}
                  >
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      {example.length > 60 ? `${example.substring(0, 60)}...` : example}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold text-base py-6 shadow-md hover:shadow-lg transition-shadow"
              disabled={!canStartResearch}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Initiating Research...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Start Research
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchInterface;
