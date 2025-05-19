import axios from "axios";

// Set your server URL
const API_URL = process.env.NODE_API_URL || "http://localhost:3000";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendNotification = async (
  userId: string,
  title: string,
  body: string
) => {
  try {
    const response = await apiClient.post("/sendNotification", {
      user_id: userId,
      title,
      body,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};


