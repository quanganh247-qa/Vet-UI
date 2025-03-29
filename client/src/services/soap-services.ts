import axios from "axios";

export const createSOAP = async (appointmentID: string, subjective: string) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }
  const response = await axios.post(
    `/api/v1/appointment/${appointmentID}/soap`,
    {
      subjective,
      objective: "", // Add defaults or pass these as parameters
      assessment: "",
      plan: "",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getSOAP = async (appointmentID: string) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }
  const response = await axios.get(
    `/api/v1/appointment/${appointmentID}/soap`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const updateSOAP = async (appointmentID: string, requestBody: any) => {
  try {
    // Double-check requestBody
    if (!requestBody) {
      console.error("Request body is null");
      throw new Error("Request body không thể trống");
    }

    const response = await fetch(`/api/v1/appointment/${appointmentID}/soap`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating SOAP note:', error);
    throw error;
  }
};