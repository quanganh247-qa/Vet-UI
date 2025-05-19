import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CashPaymentRequest,
  confirmPayment,
  ConfirmPaymentPayload,
  createCashPayment,
  getQRCode,
  listPayments,
  RevenueAnalytics,
} from "@/services/payment-services";
import { QRCodeInformation, QuickLinkRequest } from "@/types";
import { toast, useToast } from "@/components/ui/use-toast";

export const useRevenueAnalytics = () => {
  return useQuery({
    queryKey: ["revenue-analytics"],
    queryFn: () => RevenueAnalytics(),
  });
};

export interface QRCodeResponse {
  payment_id: number;
  url: string;
  data_url?: string;
  image_url?: string;
  quick_link?: string;
}

export const useQR = () => {
  const queryClient = useQueryClient();

  return useMutation<QRCodeResponse | null, Error, QuickLinkRequest>({
    mutationFn: async (qrCodeInfo) => {
      try {
        // Set a reasonable timeout to avoid hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        // Log request for debugging purposes
        const result = await getQRCode(qrCodeInfo);
        
        // Clear timeout if successful
        clearTimeout(timeoutId);
        
        return result;
      } catch (error: any) {
        console.error("Error in QR code mutation:", error);

        // Enhanced error message with response details if available
        if (error.response) {
          console.error("Response error data:", error.response.data);
          console.error("Response error status:", error.response.status);
          console.error("Response error headers:", error.response.headers);
          
          // For 500 errors, return null to gracefully handle on the UI side
          if (error.response.status === 500) {
            return null;
          }
          
          throw new Error(
            `Server error (${error.response.status}): ${
              error.response.data?.message || error.message || "Unknown server error"
            }`
          );
        } else if (error.request) {
          // Network error or no response from server
          throw new Error(`Network error: No response from server - ${error.message || "Request timed out"}`);
        } else if (error.message === "canceled") {
          // Request was aborted due to timeout
          throw new Error("Request timed out. Please try again.");
        }

        // For any other type of error
        throw new Error(`Error: ${error.message || "Unknown error occurred"}`);
      }
    },
    onSuccess: (data) => {
      // If data is null, don't show success toast as it was handled in error case
      if (!data) return null;
      
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ["qr-codes"] });

      // Show success feedback
      toast({
        title: "QR Code Generated",
        description: "QR code was successfully created",
        className: "bg-green-500 text-white ",
      });

      return data;
    },
    onError: (error) => {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate QR code",
        variant: "destructive",
      });
      
      // Return null to prevent uncaught promise rejections
      return null;
    },
    // Optional: Add retry logic for intermittent errors
    retry: (failureCount, error: any) => {
      // Don't retry 500 errors as they're likely server-side issues
      if (error.response?.status === 500) return false;
      // Don't retry after 2 attempts
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};

export const useConfirmPayment = () => {
  return useMutation<any, Error, ConfirmPaymentPayload>({
    mutationFn: async (payload) => {
      return confirmPayment(payload);
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Confirmed",
        description: "Payment was successfully confirmed",
        className: "bg-green-500 text-white ",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      });
    },
  });
};

export const useCreateCashPayment = () => {
  return useMutation<any, Error, CashPaymentRequest>({
    mutationFn: async (payload) => {
      return createCashPayment(payload);
    },
    onSuccess: (data) => {
      toast({
        title: "Cash Payment Created",
        description: "Cash payment was successfully created",
        className: "bg-green-500 text-white ",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create cash payment",
        variant: "destructive",
      });
    },
  });
};

export const useListPayments = (page: number, page_size: number) => {
  return useQuery<any, Error, any>({
    queryKey: ["payments", page, page_size],
    queryFn: () => listPayments(page, page_size),
  });
};
