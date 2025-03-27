import axios from "axios";

export const loginDoctor = async (credentials: {
  username: string;
  password: string;
}) => {
  try {
    const response = await axios.post(
      "/api/v1/doctor/login", // Using proxy path instead of full URL
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

const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;

    const response = await axios.post(
      "/api/refresh", // Using proxy path instead of full URL
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
    return false;
  }
};


export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("doctor_id");
};

