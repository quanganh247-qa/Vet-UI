import api from "@/lib/api";
import { QRCodeInformation, QuickLinkRequest } from "@/types";
import axios from "axios";
import { map } from "lodash";
import { time } from "console";

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

    // Create an abort controller for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

    try {
      const response = await api.post(
        `/api/v1/payment/quick-link`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal,
          timeout: 10000 // 10 second timeout
        }
      );
      
      clearTimeout(timeoutId);
      
      console.log("QR code response data:", response.data);
      return response.data;
    } catch (innerError: any) {
      clearTimeout(timeoutId);
      
      if (innerError.code === 'ECONNABORTED' || innerError.message?.includes('timeout')) {
        throw new Error('Request timed out. The payment server is taking too long to respond.');
      }
      
      if (innerError.name === 'AbortError' || innerError.message?.includes('aborted')) {
        throw new Error('Request was aborted due to timeout. Please try again.');
      }
      
      throw innerError; // rethrow to be caught by outer catch
    }
  } catch (error: any) {
    console.error("Error in getQRCode service:", error);

    // Get detailed error information
    if (error.response) {
      // The request was made and the server responded with a non-2xx status code
      console.error("Response error status:", error.response.status);
      console.error("Response error data:", error.response.data);
      
      // For 500 errors, provide a more specific message
      if (error.response.status === 500) {
        const errorMsg = error.response.data?.message || 'Internal server error';
        throw new Error(`Server error (500): ${errorMsg}. Try again later.`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      throw new Error('Network error: The server did not respond to the request.');
    }

    // If it's a custom error we threw earlier, preserve the message
    if (error instanceof Error) {
      throw error;
    }

    // Default error
    throw new Error('Failed to generate QR code. Please try again later.');
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



// PaymentItem represents a single payment in the list
export type PaymentItem = {
	id: number;
	amount: number;
	payment_method: string;
	payment_status: string;
	order_id: number;
	test_order_id: number;
	appointment_id: number;
	transaction_id: string;
	payment_details: any;
	created_at: string;
	updated_at: string;
}

// ListPaymentsResponse represents the paginated response for listing payments
export type ListPaymentsResponse = {
	Payments: PaymentItem[]
}

// /api/v1/payment/list
export const listPayments = async (page: number, page_size: number) => {
  try {
    const response = await api.get(`/api/v1/payment/list?page=${page}&pageSize=${page_size}`);
    return response.data;
  } catch (error) {
    console.error("Error listing payments:", error);
    throw error;
  }
};
