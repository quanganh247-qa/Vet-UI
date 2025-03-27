import { QRCodeInformation } from "@/types";
import axios from "axios";

export const getQRCode = async (qrCodeInformation: QRCodeInformation) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.post(`/api/v1/payment/generate-qr`, qrCodeInformation, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    console.log("response", response);
    return response.data;
};
