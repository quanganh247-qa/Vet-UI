import axios from "axios";

export const getListServices = async () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await axios.get("/api/v1/services", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
