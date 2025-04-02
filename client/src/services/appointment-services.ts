import { PaginatedResponse } from "@/types";
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

export const getAllAppointments = async (date: Date, option: string, page: number, pageSize: number): Promise<PaginatedResponse<any>> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }

  try {
    const response = await axios.get(`/api/v1/appointments`, {
      params: {
        date: date.toISOString().split("T")[0],
        option: option,
        page: page,
        pageSize: pageSize
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle the nested structure from your API
    if (response.data && response.data.data && response.data.data.rows) {
      const total = response.data.data.count || 0;
      const data = response.data.data.rows;
      const totalPages = Math.ceil(total / pageSize);
      
      return {
        data: data,
        total,
        page,
        pageSize,
        totalPages
      };
    }
    
    // Handle response with count and rows directly
    if (response.data && response.data.count !== undefined && Array.isArray(response.data.rows)) {
      const total = response.data.count;
      const data = response.data.rows;
      const totalPages = Math.ceil(total / pageSize);
      
      return {
        data: data,
        total,
        page,
        pageSize,
        totalPages
      };
    }
    
    // Handle array response
    if (Array.isArray(response.data)) {
      const data = response.data;
      const total = data.length;
      const totalPages = Math.ceil(total / pageSize);
      
      // Manual pagination if needed
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, total);
      const paginatedData = data.slice(startIndex, endIndex);
      
      return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages
      };
    }
    
    // Default case - return a safe structure
    console.log("Response structure:", response.data);
    return {
      data: response.data?.data?.rows || response.data?.rows || [],
      total: response.data?.data?.count || response.data?.count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((response.data?.data?.count || response.data?.count || 0) / pageSize)
    };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0
    };
  }
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

export const getHistoryAppointments = async (pet_id: number) => {
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


export const updateAppointmentById = async (id: number, updateData: {
  payment_status?: string;
  state_id?: number;
  room_id?: number;
  notes?: string;
  appointment_reason?: string;
  reminder_send?: boolean;
  arrival_time?: string;
  priority?: string;
}) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await axios.put(
      `/api/v1/appointment/${id}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};


export const addAppointmentToQueue = async (appointment: any) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await axios.post(`/api/v1/appointments/queue`, appointment, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;

}


export const getAppointmentAnalytics = async (payload: {
  start_date: string;
  end_date: string;
}) => {
  try {

    const token = localStorage.getItem('access_token');
    if (!token) {
    throw new Error('No access token found');
  }

  const response = await axios.get(`/api/v1/appointments/statistic?start_date=${payload.start_date}&end_date=${payload.end_date}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  
  });

  return response.data;
  
  } catch (error) {
    console.error("Error fetching appointment analytics:", error);
    throw error;
  }
  
}