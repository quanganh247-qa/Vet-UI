import axios from "axios";

export const createSOAP = async (appointmentID: string, subjective: string) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }
  const soap = {
    subjective,
  };
  const response = await axios.post(
    `/api/v1/appointment/${appointmentID}/soap`,
    { soap },
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

export const updateSOAP = async (appointmentID: string, subjective: string, objective: string, assessment: string) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }
  const soap = {
    subjective,
    objective,
    assessment,
    // plan,
  };
  const response = await axios.put(
    `/api/v1/appointment/${appointmentID}/soap`,
    { soap },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};