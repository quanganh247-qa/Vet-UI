import api from "@/lib/api";
import axios from "axios";

export const getListServices = async () => {
  try {
    const response = await api.get("/api/v1/services");
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

export interface CreateServiceRequest {
  name: string;
  description: string;
  duration: number;
  cost: number;
  category: string;
  notes?: string; // Optional field since it doesn't have "required" binding
}


export const createService = async (data: CreateServiceRequest) => {
  try {
    const response = await api.post("/api/v1/services", data);
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
    console.error("Error creating service:", error);
    throw error;
  }
}

export interface UpdateServiceRequest {
  name: string;
  description: string;
  duration: number;
  cost: number;
  category: string;
  notes: string;
}

export const updateService = async (id: string, data: UpdateServiceRequest) => {
  try {
    const response = await api.put(`/api/v1/services/${id}`, data);
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
    console.error("Error updating service:", error);
    throw error;
  }
};

export const deleteService = async (id: string) => {
  try {
    const response = await api.delete(`/api/v1/services/${id}`);
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
    console.error("Error deleting service:", error);
    throw error;
  }
}

export const getServiceById = async (id: string) => {
  try {
    const response = await api.get(`/api/v1/services/${id}`);
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
    console.error("Error fetching service by ID:", error);
    throw error;
  }
};
