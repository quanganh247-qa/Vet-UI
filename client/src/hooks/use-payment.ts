import { useMutation, useQuery } from "@tanstack/react-query";
import { getQRCode, RevenueAnalytics } from "@/services/payment-services";
import { QRCodeInformation, QuickLinkRequest } from "@/types";

export const useQR = () => {
  return useMutation({
    mutationFn: (qrCodeInformation: QuickLinkRequest) => getQRCode(qrCodeInformation),
    onSuccess: (data) => {
      console.log("QR code generated successfully");
      return data;
    },
    onError: (error) => {
      console.error("Error generating QR code:", error);
    },
  });
};

export const useRevenueAnalytics = () => {
  return useQuery({
    queryKey: ["revenue-analytics"],
    queryFn: () => RevenueAnalytics(),
  });
};
