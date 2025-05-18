import api from "@/lib/api";
import { SOAPData, SubjectiveData } from "@/types";

const getTokenOrThrow = () => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No access token found");
  return token;
};

// Helper function to process subjective data
const processSubjectiveData = (subjective: string | SubjectiveData[]): SubjectiveData[] => {
  if (Array.isArray(subjective)) {
    return subjective.map(item => ({
      id: item.id || crypto.randomUUID(),
      key: item.key || "Note",
      value: item.value || ""
    }));
  }
  
  // If it's a string, try to parse it as JSON
  try {
    const parsed = JSON.parse(subjective);
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        id: item.id || crypto.randomUUID(),
        key: item.key || "Note",
        value: item.value || ""
      }));
    }
  } catch (e) {
    // If not valid JSON, create structured data from text format
    const lines = subjective.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        return {
          id: crypto.randomUUID(),
          key: line.substring(0, colonIndex).trim(),
          value: line.substring(colonIndex + 1).trim()
        };
      } else {
        return {
          id: crypto.randomUUID(),
          key: "Note",
          value: line.trim()
        };
      }
    });
  }
  
  // If all else fails, return empty array
  return [];
};

export const createSOAP = async (appointmentID: string, subjective: string | SubjectiveData[]) => {
  try {
    // Process subjective data to ensure it's in the correct format
    const processedSubjective = processSubjectiveData(subjective);
    
    const response = await api.post(
      `/api/v1/appointment/${appointmentID}/soap`,
      {
      subjective: processedSubjective,
      objective: "",
      assessment: "",
      plan: "",
    }
  );
  
  return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Unknown error occurred while creating SOAP note');
  }
};





export const getSOAP = async (appointmentID: string): Promise<SOAPData> =>  {
  try {
    const response = await api.get(`/api/v1/appointment/${appointmentID}/soap`);

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Unknown error occurred while fetching SOAP note');
  }
};

export const updateSOAP = async (appointmentID: string, requestBody: any) => {
  getTokenOrThrow(); // Ensure token exists
  try {
    // Ensure subjective data is properly formatted
    if (requestBody.subjective) {
      requestBody.subjective = processSubjectiveData(requestBody.subjective);
    }
    
    const response = await api.put(
      `/api/v1/appointment/${appointmentID}/soap`,
      requestBody
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Unknown error occurred while updating SOAP note');
  }
};

export const getAllSOAPs = async (pet_id: string) => {
  if (!pet_id) {
    console.error("getAllSOAPs called with empty pet_id");
    return [];
  }
    
  try {
    const response = await api.get(`/api/v1/pets/${pet_id}/soap-notes`);
    console.log("SOAP API response:", response);
    
    // Validate the response format
    if (!Array.isArray(response.data)) {
      console.error("Expected array response from SOAP API but got:", typeof response.data);
      // If the server returns an object with a data property, try to use that
      if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching SOAP notes:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Unknown error occurred while fetching all SOAP notes');
  }
};

