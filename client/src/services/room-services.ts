import api from "@/lib/api";
import { Room, RoomResponse } from "@/types";

export const getRooms = async (): Promise<RoomResponse> => {
    try {
        const response = await api.get(`/api/v1/reports/rooms`);
        // Ensure we return data in the correct format
        if (response.data && response.data.data) {
            return response.data;
        }
        // If response.data is an array, wrap it in the expected format
        if (Array.isArray(response.data)) {
            return {
                data: response.data,
                message: "Success",
                status: 200
            };
        }
        // Return empty array if no data
        return {
            data: [],
            message: "No rooms found",
            status: 200
        };
    } catch (error) {
        console.error("Error fetching rooms:", error);
        throw error;
    }
};