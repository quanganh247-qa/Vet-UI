import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { SOAPHistory } from "@/components/soap/SOAPHistory";
import { usePatientData } from "@/hooks/use-pet";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList, FileBarChart, ArrowUpRight } from "lucide-react";

const SOAPHistoryPage: React.FC = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  
  // Manage workflow parameters
  const [workflowParams, setWorkflowParams] = useState<{
    appointmentId: string | null;
    petId: string | null;
  }>({
    appointmentId: null,
    petId: null,
  });

  // Handle URL parameters consistently
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlAppointmentId = searchParams.get("appointmentId");
    const urlPetId = searchParams.get("petId");

    // Set appointmentId and petId with priority
    const appointmentIdValue = urlAppointmentId || routeId || null;
    const petIdValue = urlPetId || null;

    // Check if values are different to avoid infinite loop
    if (
      appointmentIdValue !== workflowParams.appointmentId ||
      petIdValue !== workflowParams.petId
    ) {
      setWorkflowParams({
        appointmentId: appointmentIdValue,
        petId: petIdValue,
      });
    }
  }, [routeId]);

  // Use appointmentId from workflowParams
  const effectiveAppointmentId = workflowParams.appointmentId || "";
  const effectivePetId = workflowParams.petId || "";
  
  // Log parameters for debugging
  useEffect(() => {
    console.log("SOAP History Page Parameters:", {
      appointmentId: effectiveAppointmentId,
      petId: effectivePetId,
      workflowParams
    });
  }, [effectiveAppointmentId, effectivePetId, workflowParams]);

  // Fetch patient data
  const { data: patient, isLoading: isPatientLoading } = usePatientData(effectivePetId);

  const [testApiResult, setTestApiResult] = useState<any>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Test function to directly call the API
  const testSoapApi = async () => {
    if (!effectivePetId) {
      console.error("No pet ID available for testing");
      return;
    }

    setIsTestingApi(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }
      
      console.log(`Testing API endpoint: /api/v1/pets/${effectivePetId}/soap-notes`);
      
      // Directly use fetch for testing to bypass any caching
      const response = await fetch(`/api/v1/pets/${effectivePetId}/soap-notes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log("Direct API test result:", data);
      setTestApiResult(data);
    } catch (error) {
      console.error("API test error:", error);
      setTestApiResult({ error: String(error) });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Utility function to build query parameters
  const buildUrlParams = (params: Record<string, string | number | null | undefined>) => {
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        urlParams.append(key, String(value));
      }
    });

    const queryString = urlParams.toString();
    return queryString ? `?${queryString}` : "";
  };

  const handleBackToPatient = () => {
    // Navigate to patient page with query params
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: effectivePetId,
    };
    navigate(`/patient${buildUrlParams(params)}`);
  };
  
  const handleViewSOAPNotes = () => {
    // Navigate to SOAP notes page with query params
    const params = {
      appointmentId: effectiveAppointmentId,
      petId: effectivePetId,
    };
    navigate(`/soap-notes${buildUrlParams(params)}`);
  };

  if (isPatientLoading || !patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-b-indigo-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">
            Loading patient details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all mr-4"
            onClick={handleBackToPatient}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Patient</span>
          </Button>
          <div>
            <h1 className="text-white font-semibold text-lg">SOAP History</h1>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewSOAPNotes}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ArrowUpRight className="h-4 w-4 mr-2" />
          <span>View Current SOAP Notes</span>
        </Button>
      </div>

      {/* Workflow Navigation */}
      <div className="px-4 pt-3">
        <WorkflowNavigation
          appointmentId={effectiveAppointmentId}
          petId={patient?.petid?.toString()}
          currentStep="soap"
        />
      </div>

      {/* Main content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <ClipboardList className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">
                Patient SOAP History
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <FileBarChart className="h-4 w-4 mr-2" />
                <span>Generate Report</span>
              </Button>
            </div>
          </div>

          <div className="p-6">
            {/* Patient summary */}
            <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">{patient.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>Species: {patient.species}</span>
                    <span className="mx-2">•</span>
                    <span>Breed: {patient.breed}</span>
                    <span className="mx-2">•</span>
                    <span>Age: {patient.age || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBackToPatient}
                    className="border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    View Patient Profile
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Debug Panel for Developers */}
            <div className="mb-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Developer Debug Panel</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={testSoapApi}
                  disabled={isTestingApi}
                  className="text-xs"
                >
                  {isTestingApi ? "Testing..." : "Test Direct API Call"}
                </Button>
              </div>
              <div className="text-xs">
                <p><strong>Pet ID:</strong> {effectivePetId || "Not available"}</p>
                <p><strong>Patient ID Property:</strong> {patient?.petid || "Not available"}</p>
                <p><strong>API Endpoint:</strong> /api/v1/pets/{effectivePetId}/soap-notes</p>
              </div>
              
              {testApiResult && (
                <div className="mt-2 border-t border-gray-300 pt-2">
                  <p className="text-xs font-semibold">API Test Result:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                    {JSON.stringify(testApiResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            {/* Use SOAPHistory directly without wrapping it in Tabs */}
            {patient && (
              <SOAPHistory 
                petId={patient?.petid?.toString() || patient?.id?.toString() || effectivePetId} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOAPHistoryPage; 