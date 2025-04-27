import api from "@/lib/api";
export const getAllStaff = async () => {
    try {
        const response = await api.get(`api/v1/doctors`);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching staff:", error);
        throw error;
    }
}