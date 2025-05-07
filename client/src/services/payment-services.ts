import api from "@/lib/api";
import { QRCodeInformation, QuickLinkRequest } from "@/types";
import axios from "axios";

export const getQRCode = async (qrCodeInformation: QuickLinkRequest) => {
  try {

    // Make sure all required fields are present
    const requiredFields = ["bank_id", "account_no", "account_name", "amount"];
    for (const field of requiredFields) {
      if (!qrCodeInformation[field as keyof QuickLinkRequest]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Set defaults for optional fields if not provided
    const payload = {
      ...qrCodeInformation
    };

    console.log("Sending QR code request:", payload);

    const response = await api.post(
      `/api/v1/payment/quick-link`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log("QR code response data:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error in getQRCode service:", error);

    // Get detailed error information
    if (error.response) {
      // The request was made and the server responded with a non-2xx status code
      console.error("Response error status:", error.response.status);
      console.error("Response error data:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    }

    throw error;
  }
};

export const RevenueAnalytics = async () => {
  try {

    const response = await api.get(`/api/v1/payment/revenue/last-seven-days`);
    return response.data;
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    throw error;
  }
};



export type ConfirmPaymentPayload = {
  payment_id: number;
  payment_status: string;
  notes: string;
  appointment_id: number;
}

export const confirmPayment = async (payload: ConfirmPaymentPayload) => {
  try {
    const response = await api.post(`/api/v1/payment/confirm`, payload);
    console.log("Payment confirmed:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw error;
  }
};

// authRoute.POST("/payment/cash", paymentApi.controller.CreateCashPayment)
export type CashPaymentRequest = {
  amount: number;
  description: string;
  order_id: number;
  test_order_id: number;
  appointment_id: number;
  received_by: string;
  cash_received: number;
  cash_change: number;
}

export const createCashPayment = async (payload: CashPaymentRequest) => {
  try {
    const response = await api.post(`/api/v1/payment/cash`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating cash payment:", error);
    throw error;
  }
};


