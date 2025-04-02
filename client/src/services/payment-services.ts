import { QRCodeInformation, QuickLinkRequest } from "@/types";
import axios from "axios";

export const getQRCode = async (qrCodeInformation: QuickLinkRequest) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No access token found");
  }
  const response = await axios.post(
    `/api/v1/payment/quick-link`,
    qrCodeInformation,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("response", response);
  return response.data;
};

export const RevenueAnalytics = async () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    const response = await axios.get(`/api/v1/payment/revenue/last-seven-days`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    throw error;
  }
};
