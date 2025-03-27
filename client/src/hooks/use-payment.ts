import { useMutation } from "@tanstack/react-query";
import { getQRCode } from "@/services/payment-services";
import { QRCodeInformation } from "@/types";

export const useQR = (qrCodeInformation: QRCodeInformation) => {
    return useMutation({
        mutationFn: () => getQRCode(qrCodeInformation),
        onSuccess: (data) => {
            console.log("QR code generated successfully");
            return data;
        },
        onError: (error) => {
            console.error("Error generating QR code:", error);
        },
    });
};