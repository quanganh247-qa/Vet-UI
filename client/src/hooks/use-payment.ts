import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQRCode, RevenueAnalytics } from "@/services/payment-services";
import { QRCodeInformation, QuickLinkRequest } from "@/types";
import { toast, useToast } from "@/components/ui/use-toast";

// export const useQR = () => {
//   return useMutation({
//     mutationFn: (qrCodeInformation: QuickLinkRequest) => getQRCode(qrCodeInformation),
//     onSuccess: (data) => {
//       return data;
//     },
//     onError: (error) => {
//       console.error("Error generating QR code:", error);
//     },
//   });
// };

export const useRevenueAnalytics = () => {
  return useQuery({
    queryKey: ["revenue-analytics"],
    queryFn: () => RevenueAnalytics(),
  });
};

export interface QRCodeResponse {
  url: string;
  dataUrl?: string;
  image_url?: string;
}

export const useQR = () => {
  const queryClient = useQueryClient();

  return useMutation<QRCodeResponse, Error, QuickLinkRequest>({
    mutationFn: getQRCode,
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