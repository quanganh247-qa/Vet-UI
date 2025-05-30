import axios from "axios";

// Create a separate axios instance for notification service with direct URL
// This avoids using the proxy configuration in the main API client
const notificationApi = axios.create({
  baseURL: import.meta.env.PUSH_NOTI,
  headers: {
    "Content-Type": "application/json",
  },
});


export const sendNotification = async (
  user_id: number,
  title: string,
  body: string
) => {
  try {
    console.log("Sending notification to:", user_id);
    const response = await notificationApi.post("/sendNotification", {
      user_id,
      title,
      body,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};


// app.post("/scheduleNotification", async(req, res) => {
  // const { user_id, title, body, cronExpression, schedule_id, end_date } = req.body;



export const scheduleNotification = async (
  user_id: number,
  title: string,
  body: string,
  cronExpression: string,
  schedule_id: string,
  end_date: string
) => {
  try {
    const response = await notificationApi.post("/scheduleNotification", {
      user_id,
      title,
      body,
      cronExpression,
      schedule_id,
      end_date
    });
    return response.data;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw error;
  }
};

// scheduleAppointment
export const scheduleAppointment = async (
  user_id: number,
  appointment_id: string,
  pet_name: string,
  date: string,
  start_time: string,
  reason: string,
  doctor_name: string,
  service_name: string,
) => {
  try {
    const response = await notificationApi.post("/scheduleAppointment", {
      user_id,
      appointment_id,
      pet_name,
      date,
      start_time,
      reason,
      doctor_name,
      service_name,
    });
    return response.data;
  } catch (error) {
    console.error("Error scheduling appointment:", error);
    throw error;
  }
};