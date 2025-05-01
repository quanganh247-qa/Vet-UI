import React, { useState, useEffect } from "react";
import { useGetAllSOAPs } from "@/hooks/use-soap";
import { formatDistance } from "date-fns";
import { ReadonlyMarkdownView } from "@/components/ui/readonly-markdown-view";
import {
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
  Activity,
  ClipboardEdit,
  ClipboardList,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SOAPHistoryProps {
  petId: string;
  className?: string;
}

interface ExpandedItems {
  [key: string]: boolean;
}

export const SOAPHistory: React.FC<SOAPHistoryProps> = ({ petId, className }) => {
  const { data: soapHistory, isLoading, error } = useGetAllSOAPs(petId);
  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({});

  // Debug logging
  useEffect(() => {
    if (soapHistory) {
      console.log("SOAP History data:", soapHistory);
    }
    if (error) {
      console.error("SOAP History error:", error);
    }
  }, [soapHistory, error]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-indigo-600 font-medium">Loading SOAP history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-red-200 rounded-lg bg-red-50">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="text-red-700 font-medium mb-1">Error Loading SOAP History</h3>
        <p className="text-red-600 text-sm text-center">
          There was a problem loading the SOAP notes.
        </p>
      </div>
    );
  }

  if (!soapHistory || !Array.isArray(soapHistory) || soapHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <FileText className="h-10 w-10 text-gray-400 mb-2" />
        <h3 className="text-gray-700 font-medium mb-1">No SOAP History</h3>
        <p className="text-gray-500 text-sm text-center">
          There are no previous SOAP notes for this patient.
        </p>
      </div>
    );
  }

  // Sort SOAP notes by date, newest first
  // Ensure soapHistory is an array and has the necessary properties
  const sortedSoapHistory = [...soapHistory]
    .filter(soap => soap && soap.id && soap.created_at)
    .sort((a, b) => {
      try {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } catch (e) {
        console.error("Error sorting SOAP notes:", e);
        return 0;
      }
    });

  if (sortedSoapHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <FileText className="h-10 w-10 text-gray-400 mb-2" />
        <h3 className="text-gray-700 font-medium mb-1">No Valid SOAP History</h3>
        <p className="text-gray-500 text-sm text-center">
          The SOAP history data is not in the expected format.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <ClipboardList className="mr-2 h-5 w-5 text-indigo-600" />
        SOAP History Timeline
      </h3>
      
      <div className="space-y-4">
        {sortedSoapHistory.map((soap) => {
          if (!soap || !soap.id) return null;
          
          const isExpanded = expandedItems[soap.id];
          const createdDate = new Date(soap.created_at);
          const timeAgo = formatDistance(createdDate, new Date(), { addSuffix: true });
          
          return (
            <div 
              key={soap.id} 
              className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <div 
                className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(soap.id)}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mr-3"></div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {new Date(soap.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {timeAgo}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 mr-2">
                    SOAP Note
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 space-y-4">
                  {soap.subjective && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-sm font-medium text-gray-700">Subjective</h4>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <ReadonlyMarkdownView 
                          content={soap.subjective} 
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
                  
                  {soap.objective && typeof soap.objective === 'object' && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-sm font-medium text-gray-700">Objective</h4>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="text-sm text-gray-700">
                          {soap.objective.vital_signs && (
                            <div className="mb-2">
                              <div className="font-medium mb-1">Vital Signs</div>
                              <ul className="space-y-1 text-sm">
                                {soap.objective.vital_signs.weight && (
                                  <li>Weight: {soap.objective.vital_signs.weight} kg</li>
                                )}
                                {soap.objective.vital_signs.temperature && (
                                  <li>Temperature: {soap.objective.vital_signs.temperature} °C</li>
                                )}
                                {soap.objective.vital_signs.heart_rate && (
                                  <li>Heart Rate: {soap.objective.vital_signs.heart_rate} bpm</li>
                                )}
                                {soap.objective.vital_signs.respiratory_rate && (
                                  <li>Respiratory Rate: {soap.objective.vital_signs.respiratory_rate} rpm</li>
                                )}
                              </ul>
                            </div>
                          )}
                          
                          {soap.objective.systems && (
                            <div>
                              <div className="font-medium mb-1">Systems Examination</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Object.entries(soap.objective.systems as Record<string, string>).map(([system, value]) => 
                                  value ? (
                                    <div key={system} className="text-sm">
                                      <span className="font-medium">{system}: </span>
                                      {value}
                                    </div>
                                  ) : null
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {soap.assessment && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ClipboardEdit className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-sm font-medium text-gray-700">Assessment</h4>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <ReadonlyMarkdownView 
                          content={soap.assessment} 
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                      View Full Details
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};