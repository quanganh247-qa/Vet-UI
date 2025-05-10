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
  AlertCircle,
  Stethoscope,
  Heart,
  Wind,
  Scale,
  Thermometer,
  Info,
  CheckCircle,
  ListChecks,
  FileQuestion
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

interface SubjectiveEntry {
  id: string;
  key: string;
  value: string;
}

interface ObjectiveData {
  vital_signs?: {
    weight?: string;
    temperature?: string;
    heart_rate?: string;
    respiratory_rate?: string;
    general_notes?: string;
  };
  systems?: {
    cardiovascular?: string;
    respiratory?: string;
    gastrointestinal?: string;
    musculoskeletal?: string;
    neurological?: string;
    skin?: string;
    eyes?: string;
    ears?: string;
    [key: string]: string | undefined;
  };
}

interface AssessmentData {
  primary: string;
  differentials: string[];
  notes: string;
}

interface SOAPNote {
  id: string;
  created_at: string;
  subjective: string;
  objective: ObjectiveData;
  assessment: string | AssessmentData;
  plan?: string | number;
}

// Component to display subjective data in key-value format
const SubjectiveKeyValueDisplay: React.FC<{ data: string }> = ({ data }) => {
  const parseSubjectiveData = (value: string): SubjectiveEntry[] => {
    if (!value) return [];

    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // If not JSON, try to parse as text with key: value format
      const lines = value.split('\n').filter(line => line.trim());
      const entries: SubjectiveEntry[] = [];
      
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          entries.push({
            id: crypto.randomUUID(),
            key: line.substring(0, colonIndex).trim(),
            value: line.substring(colonIndex + 1).trim()
          });
        } else {
          // If no colon found, add as a note
          entries.push({
            id: crypto.randomUUID(),
            key: "Note",
            value: line.trim()
          });
        }
      }
      
      return entries;
    }
    
    // Default to empty array if parsing fails
    return [];
  };

  const entries = parseSubjectiveData(data);

  if (!data || entries.length === 0) {
    return (
      <div className="text-gray-500 italic text-sm">
        No subjective data available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div key={entry.id} className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-4 text-gray-700 font-medium text-sm">
            {entry.key}:
          </div>
          <div className="col-span-8 text-gray-800 text-sm">
            {entry.value || <span className="text-gray-400 italic">No data</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

// Enhanced Component to display objective data
const ObjectiveDataDisplay: React.FC<{ data: ObjectiveData }> = ({ data }) => {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return (
      <div className="text-gray-500 italic text-sm">
        No objective data available.
      </div>
    );
  }

  const vitalSigns = data.vital_signs || {};
  const systems = data.systems || {};

  const hasVitalSigns = Object.values(vitalSigns).some(v => Boolean(v));
  const hasSystems = Object.values(systems).some(v => Boolean(v));

  if (!hasVitalSigns && !hasSystems) {
    return (
      <div className="text-gray-500 italic text-sm">
        No examination data recorded.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasVitalSigns && (
        <div>
          <div className="font-medium text-indigo-700 text-sm mb-1 flex items-center gap-1">
            <Stethoscope className="h-3.5 w-3.5" />
            Vital Signs
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {vitalSigns.weight && (
              <div className="flex items-center gap-1">
                <Scale className="h-3 w-3 text-gray-500" />
                <span className="text-gray-700">Weight:</span>
                <span className="font-medium">{vitalSigns.weight} kg</span>
              </div>
            )}
            {vitalSigns.temperature && (
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-gray-500" />
                <span className="text-gray-700">Temp:</span>
                <span className="font-medium">{vitalSigns.temperature} °C</span>
              </div>
            )}
            {vitalSigns.heart_rate && (
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-gray-500" />
                <span className="text-gray-700">Heart Rate:</span>
                <span className="font-medium">{vitalSigns.heart_rate} bpm</span>
              </div>
            )}
            {vitalSigns.respiratory_rate && (
              <div className="flex items-center gap-1">
                <Wind className="h-3 w-3 text-gray-500" />
                <span className="text-gray-700">Resp Rate:</span>
                <span className="font-medium">{vitalSigns.respiratory_rate} rpm</span>
              </div>
            )}
          </div>
          {vitalSigns.general_notes && (
            <div className="mt-1 text-sm">
              <span className="text-gray-700 font-medium">Notes: </span>
              <span className="text-gray-600">{vitalSigns.general_notes}</span>
            </div>
          )}
        </div>
      )}

      {hasSystems && (
        <div>
          <div className="font-medium text-indigo-700 text-sm mb-1 flex items-center gap-1 mt-2">
            <Activity className="h-3.5 w-3.5" />
            Systems Examination
          </div>
          <div className="grid grid-cols-1 text-sm gap-y-1">
            {Object.entries(systems).map(
              ([key, value]) =>
                value && (
                  <div key={key} className="flex">
                    <span className="font-medium text-gray-700 min-w-[120px]">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Add a component to display assessment data in a structured way
const AssessmentDataDisplay: React.FC<{ data: string | AssessmentData }> = ({ data }) => {
  // If data is not available
  if (!data) {
    return (
      <div className="text-gray-500 italic text-sm">
        No assessment data available.
      </div>
    );
  }

  // Parse the data if it's a string (try to handle JSON string)
  let assessmentData: AssessmentData | null = null;
  
  if (typeof data === 'string') {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && 'primary' in parsed) {
        assessmentData = parsed as AssessmentData;
      } else {
        // Just display as plain text if not in the expected format
        return (
          <div className="text-gray-700 text-sm whitespace-pre-line">
            {data}
          </div>
        );
      }
    } catch (e) {
      // Not valid JSON, display as plain text
      return (
        <div className="text-gray-700 text-sm whitespace-pre-line">
          {data}
        </div>
      );
    }
  } else if (typeof data === 'object' && 'primary' in data) {
    assessmentData = data as AssessmentData;
  }

  // If we have structured assessment data, display it nicely
  if (assessmentData) {
    return (
      <div className="space-y-3">
        {/* Primary Diagnosis */}
        <div className="bg-indigo-50 p-2 rounded-md border border-indigo-100">
          <h5 className="text-sm font-medium text-indigo-700 mb-1 flex items-center">
            <CheckCircle className="h-3.5 w-3.5 mr-1 text-indigo-600" />
            Primary Diagnosis
          </h5>
          <p className="text-gray-800 text-sm pl-5 font-medium">{assessmentData.primary}</p>
        </div>
        
        {/* Differential Diagnoses */}
        {assessmentData.differentials && assessmentData.differentials.length > 0 && (
          <div className="bg-blue-50 p-2 rounded-md border border-blue-100">
            <h5 className="text-sm font-medium text-blue-700 mb-1 flex items-center">
              <ListChecks className="h-3.5 w-3.5 mr-1 text-blue-600" />
              Differential Diagnoses
            </h5>
            <ul className="space-y-1 pl-5">
              {assessmentData.differentials.map((diff, index) => (
                <li key={index} className="text-sm text-gray-800 flex items-start">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 mr-2 mt-1.5"></span>
                  <span>{diff}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Notes */}
        {assessmentData.notes && (
          <div className="bg-amber-50 p-2 rounded-md border border-amber-100">
            <h5 className="text-sm font-medium text-amber-700 mb-1 flex items-center">
              <FileQuestion className="h-3.5 w-3.5 mr-1 text-amber-600" />
              Clinical Notes
            </h5>
            <p className="text-gray-800 text-sm pl-5">{assessmentData.notes}</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback for unexpected format
  return (
    <div className="text-gray-500 italic text-sm">
      Assessment data in unexpected format.
    </div>
  );
};

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
    .filter((soap): soap is SOAPNote => 
      Boolean(soap && soap.id && soap.created_at)
    )
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
                  {/* Subjective Section - Use the new Key-Value display */}
                  {soap.subjective && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-sm font-medium text-gray-700">Subjective</h4>
                      
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <SubjectiveKeyValueDisplay data={soap.subjective} />
                      </div>
                    </div>
                  )}
                  
                  {/* Objective Section - Use the enhanced ObjectiveDataDisplay component */}
                  {soap.objective && typeof soap.objective === 'object' && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-sm font-medium text-gray-700">Objective</h4>
                        <Badge className="bg-green-50 text-green-700 border-green-100 text-xs">
                          Clinical Data
                        </Badge>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <ObjectiveDataDisplay data={soap.objective} />
                      </div>
                    </div>
                  )}
                  
                  {/* Assessment Section - Use the new AssessmentDataDisplay component */}
                  {soap.assessment && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ClipboardEdit className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-sm font-medium text-gray-700">Assessment</h4>
                        {typeof soap.assessment === 'object' || (
                          typeof soap.assessment === 'string' && 
                          soap.assessment.startsWith('{') && 
                          soap.assessment.endsWith('}')
                        ) ? (
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">
                            Structured Diagnosis
                          </Badge>
                        ) : (
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">
                            Diagnosis
                          </Badge>
                        )}
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <AssessmentDataDisplay data={soap.assessment} />
                      </div>
                    </div>
                  )}
                  
                  {/* Plan Section - Display if there's a plan set */}
                  {soap.plan && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-indigo-600" />
                        <h4 className="text-sm font-medium text-gray-700">Plan</h4>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="text-sm">{String(soap.plan)}</div>
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