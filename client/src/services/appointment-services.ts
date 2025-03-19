import { Appointment, AppointmentsResponse } from "../types";
import axios from 'axios';

export const getAppointments = async (doctor_id: string) => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await axios.get(`/api/v1/appointment/doctor/${doctor_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Appointments:", response.data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    return [];
  }
};

export const getAppointmentsByDate = async (date: Date) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }
  
    const response = await axios.get(`/api/v1/appointments`, {
      params: {
        date: date.toISOString().split('T')[0]
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    return response.data;
  };
  
export const checkInAppointment = async (id: number, room_id: number, priority: string) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await axios.put(
      `/api/v1/appointment/check-in/${id}`,
      null,
      {
        params: {
          room_id,
          priority
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
        throw new Error(error.response.data.message || "Bad Request: Invalid input");
      }
    }
    console.error("Error checking in appointment:", error);
    throw error;
  }
};