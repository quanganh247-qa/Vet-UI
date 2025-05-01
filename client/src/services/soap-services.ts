import api from "@/lib/api";

const getTokenOrThrow = () => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No access token found");
  return token;
};

export const createSOAP = async (appointmentID: string, subjective: string) => {
  getTokenOrThrow(); // Ensure token exists
  const response = await api.post(
    `/api/v1/appointment/${appointmentID}/soap`,
    {
      subjective,
      objective: "",
      assessment: "",
      plan: "",
    }
  );
  return response.data;
};

export const getSOAP = async (appointmentID: string) => {
  getTokenOrThrow(); // Ensure token exists
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
  
  console.log(`Fetching SOAP notes for pet_id: ${pet_id}`);
  
  try {
    getTokenOrThrow(); // Ensure token exists
    console.log(`Making API request to: /api/v1/pets/${pet_id}/soap-notes`);
    
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

