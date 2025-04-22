import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQRCode, RevenueAnalytics } from "@/services/payment-services";
import { QRCodeInformation, QuickLinkRequest } from "@/types";
import { toast, useToast } from "@/components/ui/use-toast";

export const useRevenueAnalytics = () => {
  return useQuery({
    queryKey: ["revenue-analytics"],
    queryFn: () => RevenueAnalytics(),
  });
};

export interface QRCodeResponse {
  url: string;
  dataUrl?: string;
  quick_link?: string;
}

export const useQR = () => {
  const queryClient = useQueryClient();

  return useMutation<QRCodeResponse, Error, QuickLinkRequest>({
    mutationFn: async (qrCodeInfo) => {
      try {
        // Log request for debugging purposes
        console.log("QR code request payload:", qrCodeInfo);
        const result = await getQRCode(qrCodeInfo);
        console.log("QR code response:", result);
        return result;
      } catch (error: any) {
        console.error("Error in QR code mutation:", error);
        
        // Enhanced error message with response details if available
        if (error.response) {
          console.error("Response error data:", error.response.data);
          console.error("Response error status:", error.response.status);
          console.error("Response error headers:", error.response.headers);
          throw new Error(
            `Server error (${error.response.status}): ${
              error.response.data?.message || error.message
            }`
          );
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      
      // Show success feedback
      toast({
        title: 'QR Code Generated',
        description: 'QR code was successfully created',
        className: 'bg-green-500 text-white ',
      });

      return data;
    },
    onError: (error) => {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate QR code',
        variant: 'destructive',
      });
    },
    // Optional: Add retry logic
    retry: 2,
    retryDelay: 1000,
  });
};