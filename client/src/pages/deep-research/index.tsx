import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Search,
  History,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  RefreshCw,
  LayoutDashboard,
  FileText,
  Receipt,
  PlusCircle,
  Stethoscope
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Import our custom components
import ResearchInterface from "@/components/deep-research/ResearchInterface";
import ResearchDisplay from "@/components/deep-research/ResearchDisplay";
import ResearchHistory from "@/components/deep-research/ResearchHistory";

// Import our service functions
import {
  configureAPIKeys,
  startResearch,
  getResearchStatus,
  getResearchResults,
  syncResearch,
  downloadResearchReport,
  listResearchProcesses,
  checkDeepResearchHealth,
  waitForResearchCompletion,
  APIKeys,
  ResearchRequest,
  ResearchResponse,
  ResearchStatus
} from "@/services/deep-research-services";

// EmptyState component for when no research exists
const EmptyState = ({ onStartNew }: { onStartNew: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#2C78E4]/20 h-64 transition-all hover:border-[#2C78E4]/40">
    <div className="rounded-full bg-[#F0F7FF] p-4 mb-5 shadow-sm">
      <Brain className="h-7 w-7 text-[#2C78E4]" />
    </div>
    <h3 className="text-lg font-medium mb-2 text-[#111827]">
      No research tasks found
    </h3>
    <p className="text-sm text-[#4B5563] text-center mb-6 max-w-xs">
      Get started by creating your first deep research task
    </p>
    <Button
      size="sm"
      className="bg-[#2C78E4] hover:bg-[#1E40AF] text-white rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg"
      onClick={onStartNew}
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      Start new research
    </Button>
  </div>
);

const DeepResearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("research");
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [selectedResearchId, setSelectedResearchId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check API health on component mount
  const { data: isHealthy } = useQuery({
    queryKey: ['deepResearchHealth'],
    queryFn: checkDeepResearchHealth,
    refetchInterval: 30000, // Check every 30 seconds
    refetchOnWindowFocus: false,
  });

  // Fetch research history
  const { 
    data: researchHistory = [], 
    isLoading: historyLoading,
    refetch: refetchHistory 
  } = useQuery({
    queryKey: ['researchHistory'],
    queryFn: listResearchProcesses,
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: isHealthy,
  });

  // Fetch status for selected research
  const { 
    data: selectedStatus,
    isLoading: statusLoading 
  } = useQuery({
    queryKey: ['researchStatus', selectedResearchId],
    queryFn: () => selectedResearchId ? getResearchStatus(selectedResearchId) : null,
    enabled: !!selectedResearchId,
    refetchInterval: (query) => {
      // Stop polling if research is completed or errored
      const status = query.state.data as ResearchStatus | null;
      if (status?.status === 'completed' || status?.status === 'error') {
        return false;
      }
      return 5000; // Poll every 5 seconds for active research
    },
  });

  // Fetch results for selected research when completed
  const { 
    data: selectedResults,
    isLoading: resultsLoading 
  } = useQuery({
    queryKey: ['researchResults', selectedResearchId],
    queryFn: async () => {
      if (!selectedResearchId) return undefined;
      const result = await getResearchResults(selectedResearchId);
      return result || undefined; // Convert null to undefined
    },
    enabled: !!selectedResearchId && selectedStatus?.status === 'completed',
  });

  // Configure API keys mutation
  const configureKeysMutation = useMutation({
    mutationFn: configureAPIKeys,
    onSuccess: () => {
      setIsConfigured(true);
      toast({
        title: "Success",
        description: "API keys configured successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to configure API keys: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Start research mutation
  const startResearchMutation = useMutation({
    mutationFn: startResearch,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Research started successfully!",
      });
      setSelectedResearchId(data.research_id);
      setActiveTab("status");
      
      // Invalidate history to show new research
      queryClient.invalidateQueries({ queryKey: ['researchHistory'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to start research: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Sync research mutation (for quick research)
  const syncResearchMutation = useMutation({
    mutationFn: syncResearch,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Research completed successfully!",
      });
      // Handle sync research results directly
      console.log("Sync research results:", data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Research failed: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Download report mutation
  const downloadMutation = useMutation({
    mutationFn: downloadResearchReport,
    onSuccess: (content, researchId) => {
      // Create and download file
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research_report_${researchId}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Report downloaded successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to download report: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleConfigureKeys = (keys: APIKeys) => {
    configureKeysMutation.mutate(keys);
  };

  const handleConfigurationChange = (configured: boolean) => {
    setIsConfigured(configured);
  };

  const handleStartResearch = (request: ResearchRequest) => {
    startResearchMutation.mutate(request);
  };

  const handleSelectResearch = (researchId: string) => {
    setSelectedResearchId(researchId);
    setActiveTab("status");
  };

  const handleDeleteResearch = (researchId: string) => {
    // For now, just remove from local state (in a real app, you'd call an API)
    if (selectedResearchId === researchId) {
      setSelectedResearchId(null);
    }
    
    // Remove from polling
    queryClient.invalidateQueries({ queryKey: ['researchHistory'] });
    
    toast({
      title: "Success",
      description: "Research deleted from history",
    });
    refetchHistory();
  };

  const handleDownloadReport = (researchId: string) => {
    downloadMutation.mutate(researchId);
  };

  const handleRefreshStatus = (researchId: string) => {
    queryClient.invalidateQueries({ queryKey: ['researchStatus', researchId] });
    queryClient.invalidateQueries({ queryKey: ['researchResults', researchId] });
  };

  const handleRefreshHistory = () => {
    refetchHistory();
  };

  // Clean up polling when research completes
  useEffect(() => {
    if (selectedStatus?.status === 'completed' || selectedStatus?.status === 'error') {
      queryClient.invalidateQueries({ queryKey: ['researchHistory'] });
    }
  }, [selectedStatus?.status, queryClient]);

  return (
    <div className="space-y-8">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2C78E4] to-[#2C78E4]/80 px-6 py-4 md:px-8 md:py-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">AI Research</h1>
            <p className="text-sm text-white">
              This is a tool that allows you to perform deep research on a given topic.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#2C78E4]/20 shadow-sm p-6">
        {!isHealthy && (
          <Card className="mb-6 bg-red-50/50 border-red-200 shadow-md rounded-2xl">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <AlertCircle className="h-6 w-6 text-red-500"/>
              <CardTitle className="text-red-700">API Connection Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">
                Unable to connect to the Deep Research API server. Please ensure the server is running.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['deepResearchHealth'] })}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        )}

        <ScrollArea className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="inline-flex h-auto p-1.5 bg-[#F0F7FF] rounded-2xl gap-2 w-auto">
              <TabsTrigger 
                value="research" 
                className="py-3 px-5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] data-[state=active]:shadow-md rounded-xl text-[#2C78E4]/80 hover:bg-white/70 hover:text-[#2C78E4] transition-all duration-150 ease-in-out flex items-center gap-2"
              >
                <Search className="h-4 w-4" /> New Research
              </TabsTrigger>
              <TabsTrigger 
                value="status" 
                className="py-3 px-5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] data-[state=active]:shadow-md rounded-xl text-[#2C78E4]/80 hover:bg-white/70 hover:text-[#2C78E4] transition-all duration-150 ease-in-out flex items-center gap-2"
                disabled={!selectedResearchId && researchHistory.length === 0}
              >
                <LayoutDashboard className="h-4 w-4" /> Current Task
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="py-3 px-5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#2C78E4] data-[state=active]:shadow-md rounded-xl text-[#2C78E4]/80 hover:bg-white/70 hover:text-[#2C78E4] transition-all duration-150 ease-in-out flex items-center gap-2"
              >
                <History className="h-4 w-4" /> History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="research" className="p-0 mt-8">
              <ResearchInterface
                onStartResearch={handleStartResearch}
                isLoading={startResearchMutation.isPending}
                isConfigured={isConfigured}
                onConfigurationChange={handleConfigurationChange}
              />
            </TabsContent>

            <TabsContent value="status" className="p-0 mt-8">
              {selectedResearchId && selectedStatus ? (
                <ResearchDisplay
                  researchId={selectedResearchId}
                  status={selectedStatus}
                  result={selectedResults}
                  onDownload={handleDownloadReport}
                  onRefresh={handleRefreshStatus}
                  onDelete={handleDeleteResearch}
                  isDownloading={downloadMutation.isPending}
                />
              ) : (
                <Card className="shadow-lg rounded-2xl border-[#2C78E4]/10">
                  <CardContent className="pt-8 min-h-[400px] flex flex-col items-center justify-center">
                    <div className="rounded-full bg-[#F0F7FF] p-4 mb-5">
                      <FileText className="h-6 w-6 text-[#2C78E4]"/>
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-[#111827]">
                      No Research Task Selected
                    </h3>
                    <p className="text-sm text-[#4B5563] text-center mb-6 max-w-xs">
                      Select a research task from history or start a new one to view its status and results here.
                    </p>
                    {researchHistory.length > 0 ? (
                      <Button 
                        variant="outline" 
                        className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF]" 
                        onClick={() => setActiveTab("history")}
                      >
                        <History className="mr-2 h-4 w-4"/> View History
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="border-[#2C78E4]/20 text-[#2C78E4] hover:bg-[#F0F7FF]" 
                        onClick={() => setActiveTab("research")}
                      >
                        <PlusCircle className="mr-2 h-4 w-4"/> Start New Research
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="p-0 mt-8">
              {researchHistory.length > 0 ? (
                <ResearchHistory
                  researchItems={researchHistory}
                  onSelectResearch={handleSelectResearch}
                  onDeleteResearch={handleDeleteResearch}
                  onDownloadResearch={handleDownloadReport}
                  onRefreshList={handleRefreshHistory}
                  isLoading={historyLoading}
                />
              ) : (
                <EmptyState onStartNew={() => setActiveTab("research")} />
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DeepResearchPage;
