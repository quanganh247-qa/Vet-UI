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