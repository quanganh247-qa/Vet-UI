import api from "@/lib/api";
import axios from "axios";
import { is } from "date-fns/locale";

// Base URL for the deep research API - read from environment variables
const DEEP_RESEARCH_BASE_URL = import.meta.env.VITE_DEEP_RESEARCH_BASE_URL || "http://localhost:8000";

// API keys from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const FIRECRAWL_API_KEY = import.meta.env.VITE_FIRECRAWL_API_KEY;

// Store configuration state
let isConfigured = false;
let configurationAttempted = false;

// Type definitions based on the FastAPI backend
export interface APIKeys {
  gemini_api_key: string;
  firecrawl_api_key: string;
}

export interface ResearchRequest {
  topic: string;
  max_depth: number;
  time_limit: number;
  max_urls: number;
  enhance_report: boolean;
}

export interface ResearchResponse {
  success: boolean;
  research_id: string;
  topic: string;
  initial_report?: string;
  enhanced_report?: string;
  sources_count?: number;
  sources?: Array<Record<string, any>>;
  error?: string;
}

export interface ResearchStatus {
  research_id: string;
  status: "pending" | "researching" | "enhancing" | "completed" | "error";
  progress: string;
  current_step: string;
  activities: string[];
}

export interface StartResearchResponse {
  research_id: string;
  message: string;
  status: string;
}


/**
 * Helper function to handle API errors consistently
 */
const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error) && error.response) {
    throw new Error(error.response.data?.detail || defaultMessage);
  }
  throw new Error(`Network error occurred while ${defaultMessage.toLowerCase()}`);
};

/**
 * Check if the deep research API is healthy and available
 */
export const checkDeepResearchHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${DEEP_RESEARCH_BASE_URL}/health`);
    return response.status === 200;
  } catch (error) {
    console.error("Deep research health check failed:", error);
    return false;
  }
};

/**
 * Configure API keys for the deep research service
 */
export const configureAPIKeys = async (apiKeys: APIKeys): Promise<{ success: boolean; message: string }> => {
  try {
    configurationAttempted = true;
    const response = await axios.post(`${DEEP_RESEARCH_BASE_URL}/configure`, apiKeys);
    isConfigured = response.data.success;
    return response.data;
  } catch (error) {
    isConfigured = false;
    return handleApiError(error, "Failed to configure API keys");
  }
};



/**
 * Start a new research process (asynchronous)
 * Automatically configures API keys from environment variables if not already configured
 */
export const startResearch = async (request: ResearchRequest): Promise<StartResearchResponse> => {
  try {
    await configureAPIKeys({
      gemini_api_key: GEMINI_API_KEY || "",
      firecrawl_api_key: FIRECRAWL_API_KEY || ""
    });
    // Ensure the request is vali
    if (!isConfigured) {
      throw new Error("Deep research service is not configured. Please configure API keys first.");
    }
    
    const response = await axios.post(`${DEEP_RESEARCH_BASE_URL}/research`, request);
    return response.data;
  } catch (error) {
    // Enhanced error handling for API key issues
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      const message = error.response.data?.detail || error.response.data?.error?.message;
      if (message && message.includes("API key not valid")) {
        throw new Error("The Gemini API key is invalid. Please verify that you're using a valid API key from the Google AI Studio.");
      }
    }
    return handleApiError(error, "Failed to start research");
  }
};

/**
 * Get the status of a research process
 */
export const getResearchStatus = async (researchId: string): Promise<ResearchStatus> => {
  try {
    const response = await axios.get(`${DEEP_RESEARCH_BASE_URL}/research/${researchId}/status`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to get research status");
  }
};

/**
 * Get the results of a completed research process
 */
export const getResearchResults = async (researchId: string): Promise<ResearchResponse> => {
  try {
    const response = await axios.get(`${DEEP_RESEARCH_BASE_URL}/research/${researchId}/results`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to get research results");
  }
};

/**
 * Perform synchronous research (waits for completion)
 * Automatically configures API keys from environment variables if not already configured
 */
export const syncResearch = async (request: ResearchRequest): Promise<ResearchResponse> => {
  try {
     await configureAPIKeys({
      gemini_api_key: GEMINI_API_KEY || "",
      firecrawl_api_key: FIRECRAWL_API_KEY || ""
    });
    // Ensure the request is vali
    if (!isConfigured) {
      throw new Error("Deep research service is not configured. Please configure API keys first.");
    }

    const response = await axios.post(`${DEEP_RESEARCH_BASE_URL}/research/sync`, request);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to perform synchronous research");
  }
};

/**
 * Download research report as markdown
 */
export const downloadResearchReport = async (researchId: string): Promise<string> => {
  try {
    const response = await axios.get(`${DEEP_RESEARCH_BASE_URL}/research/${researchId}/download`, {
      params: { format: "markdown" }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to download research report");
  }
};



/**
 * List all research processes
 */
export const listResearchProcesses = async (): Promise<ResearchStatus[]> => {
  try {
    const response = await axios.get(`${DEEP_RESEARCH_BASE_URL}/research`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to list research processes");
  }
};

/**
 * Utility function to poll research status until completion
 */
export const waitForResearchCompletion = async (
  researchId: string,
  onStatusUpdate?: (status: ResearchStatus) => void,
  pollInterval: number = 5000,
  timeout: number = 600000 // 10 minutes default
): Promise<ResearchResponse> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const status = await getResearchStatus(researchId);
    
    if (onStatusUpdate) {
      onStatusUpdate(status);
    }
    
    if (status.status === "completed") {
      return await getResearchResults(researchId);
    } else if (status.status === "error") {
      throw new Error(`Research failed: ${status.current_step}`);
    }
    
    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error(`Research did not complete within ${timeout / 1000} seconds`);
};
