import { PaginatedResponse } from "@/types";
import api from "@/lib/api";
import { AxiosError } from "axios";

export const getAppointments = async (doctor_id: string) => {
  try {
    const response = await api.get(`/api/v1/appointment/doctor/${doctor_id}`);

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    return [];
  }
};

export const getAllAppointments = async (
  date: Date,
  option: string,
  page: number,
  pageSize: number
): Promise<PaginatedResponse<any>> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }


  try {
    const response = await api.get(`/api/v1/appointments`, {
      params: {
        date: date.toISOString().split("T")[0],
        option: option,
        page: page,
        pageSize: pageSize,
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
        totalPages,
      };
    }

    // Handle response with count and rows directly
    if (
      response.data &&
      response.data.count !== undefined &&
      Array.isArray(response.data.rows)
    ) {
      const total = response.data.count;
      const data = response.data.rows;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: data,
        total,
        page,
        pageSize,
        totalPages,
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
        totalPages,
      };
    }
    return {
      data: response.data?.data?.rows || response.data?.rows || [],
      total: response.data?.data?.count || response.data?.count || 0,
      page,
      pageSize,
      totalPages: Math.ceil(
        (response.data?.data?.count || response.data?.count || 0) / pageSize
      ),
    };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
};

export const checkInAppointment = async (
  id: number,
  room_id: number,
  priority: string
) => {
  try {
    // Debug the URL that will be constructed
    const url = `/api/v1/appointment/check-in/${id}`;

    const response = await api.post(
      `/api/v1/appointment/check-in/${id}`,
      null,
      {
        params: {
          room_id,
          priority,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAppointmentById = async (id: number) => {
  try {
    const response = await api.get(`/api/v1/appointment/${id}`);

    if (!response.data) {
      return null;
    }

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getAppointmentsQueue = async () => {
  try {
    const response = await api.get(`/api/v1/appointments/queue`);
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
  const response = await api.get(`/api/v1/appointments/pet/${pet_id}/history`);
  return response.data;
};

export const updateAppointmentById = async (
  id: number,
  updateData: {
    payment_status?: string;
    state_id?: number;
    room_id?: number;
    notes?: string;
    appointment_reason?: string;
    reminder_send?: boolean;
    arrival_time?: string;
    priority?: string;
  }
) => {
  try {
    const response = await api.put(`/api/v1/appointment/${id}`, updateData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};

export const addAppointmentToQueue = async (appointment: any) => {

  const response = await api.post(`/api/v1/appointments/queue`, appointment);

  return response.data;
};

export const getAppointmentAnalytics = async (payload: {
  start_date: string;
  end_date: string;
}) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await api.get(
      `/api/v1/appointments/statistic?start_date=${payload.start_date}&end_date=${payload.end_date}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching appointment analytics:", error);
    throw error;
  }
};

export interface AppointmentRequest {
  pet_id: number;
  doctor_id: number;
  service_id: number;
  reason: string;
  owner?: {
    owner_name: string;
    owner_email: string;
    owner_number: string;
    owner_address: string;
  };
  pet?: {
    name: string;
    species: string;
    breed: string;
    gender: string;
    birth_date: string;
  };
}

export const createWalkInAppointment = async (
  appointmentData: AppointmentRequest
): Promise<any> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }

  try {
    const response = await api.post(
      "/api/v1/appointments/walk-in",
      appointmentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("An unexpected error occurred");
  }
};

// {
//   "code": "E",
//   "message": "time slot is fully booked"
// }

export type ConfirmAppointmentResponse = {
  code: string;
  message: string;
}

export const confirmAppointment = async (appointment_id: number) => {
  try {
    const response = await api.post(`/api/v1/appointment/confirm/${appointment_id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as ConfirmAppointmentResponse;
      if (errorData.code === "E" && errorData.message === "time slot is fully booked") {
        throw new Error("This time slot is fully booked. Please select another time.");
      }
    }
    throw error;
  }
};

// authRoute.PUT("/appointment/notifications/delivered/:id", appointmentApi.controller.MarkMessageDelivered)
export const markMessageDelivered = async (id: number) => {
  const response = await api.put(`/api/v1/appointment/notifications/${id}/delivered`);
  return response.data;
};


export const getAppointmentByState = async (state: string) => {
  try {
    const response = await api.get(`/api/v1/appointment/state?state=${state}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching appointments by state:", error);
    throw error;
  }
};




// // Database notification routes
// authRoute.GET("/appointment/notifications/db", appointmentApi.controller.getNotificationsFromDB)
// authRoute.PUT("/appointment/notifications/read/:id", appointmentApi.controller.markNotificationAsRead)
// authRoute.PUT("/appointment/notifications/read-all", appointmentApi.controller.markAllNotificationsAsRead)

export const getNotificationsFromDB = async () => {
  try {
    const response = await api.get("/api/v1/appointment/notifications/db");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications from DB:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (id: number) => {
  const response = await api.put(`/api/v1/appointment/notifications/read/${id}`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.put("/api/v1/appointment/notifications/read-all");
  return response.data;
};

export const registerUserRole = async (role: string) => {
  try {
    const response = await api.post('/api/v1/appointment/register-role', { role });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const waitForNotifications = async (signal?: AbortSignal) => {
  try {
    // Use a slightly shorter timeout to ensure client timeout happens before server timeout
    const response = await api.get('/api/v1/appointment/notifications/wait', {
      signal,
      timeout: 25000, // 25 second timeout (shorter than the server's expected 30s)
    });
    return response.data;
  } catch (error: any) {
    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return []; // Return empty array to continue polling
    }
    
    // Don't treat cancellation as an error that needs to be logged
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      throw error; // Re-throw but it will be handled properly in the hook
    }
    throw error;
  }
};







