import axios from "axios";

export const getRooms = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/rooms`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};