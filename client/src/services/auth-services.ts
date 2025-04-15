import axios from "axios";
import api from "@/lib/api";

export const loginDoctor = async (credentials: {
  username: string;
  password: string;
}) => {
  try {
    // Using direct axios here to avoid potential issues with interceptors during login
    const response = await axios.post(
      "/api/v1/doctor/login",
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    localStorage.setItem("doctor_id", response.data.data.doctor.doctor_id);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message ||
          `Login failed with status ${error.response.status}`
      );
    }
    throw error;
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;

    // Using direct axios here to avoid interceptor loops
    const response = await axios.post(
      "/api/v1/auth/refresh",
      { refresh_token: refreshToken },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    localStorage.setItem("access_token", response.data.access_token);
    if (response.data.refresh_token) {
      localStorage.setItem("refresh_token", response.data.refresh_token);
    }
    return true;
  } catch (error) {
    console.error("Refresh token failed:", error);
    localStorage.removeItem("doctor");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    return false;
  }
};

export const logout = async () => {
  try {
    // Send logout request to server if needed
    await api.post("/api/v1/doctor/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always clear local storage, even if server request fails
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("doctor_id");
    localStorage.removeItem("doctor");
  }
};

