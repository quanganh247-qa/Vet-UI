import api from "@/lib/api";

export const getRooms = async () => {
    try {
        const response = await api.get('/rooms');
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch rooms');
    }
};