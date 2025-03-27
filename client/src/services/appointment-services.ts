import axios from "axios";

export const getAppointments = async (doctor_id: string) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(
      `/api/v1/appointment/doctor/${doctor_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Appointments:", response.data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    return [];
  }
};

export const getAllAppointments = async (date: Date, option: string) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }

  const response = await axios.get(`/api/v1/appointments`, {
    params: {
      date: date.toISOString().split("T")[0],
      option: option,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const checkInAppointment = async (
  id: number,
  room_id: number,
  priority: string
) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    // Debug the URL that will be constructed
    const url = `/api/v1/appointment/check-in/${id}`;
    console.log("API URL:", url);
    console.log("Parameters:", { room_id, priority });

    const response = await axios.post(
      `/api/v1/appointment/check-in/${id}`,
      null,
      {
        params: {
          room_id,
          priority,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Unauthorized: Invalid or expired token");
      } else if (error.response?.status === 403) {
        throw new Error("Forbidden: You do not have permission");
      } else if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "Bad Request: Invalid input"
        );
      }
    }
    console.error("Error checking in appointment:", error);
    throw error;
  }
};

export const getAppointmentById = async (id: number) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await axios.get(`/api/v1/appointment/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data) {
      return null;
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("API Error Response:", error.response);
      if (error.response?.status === 401) {
        return null;
      } else if (error.response?.status === 404) {
        return null;
      }
    }
    return null;
  }
};

export const getAppointmentsQueue = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await axios.get(`/api/v1/appointments/queue`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("Appointments Queue Response:", response.data);

        // Check if response.data has a data property
        if (response.data && response.data.data) {
            return response.data.data; // Return the data property
        }

        // If there's no data property, return the response.data itself
        return response.data || [];
    } catch (error) {
        console.error("Error fetching appointments queue:", error);
        return []; // Return empty array on error
    }
};

export const getHistoryAppointments= async (pet_id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }

    const response = await axios.get(`/api/v1/appointments/pet/${pet_id}/history`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};
