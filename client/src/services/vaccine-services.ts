import axios from "axios";

export const getVaccinations = async (pet_id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/vaccinations/pet/${pet_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    console.log("response", response.data);
    return response.data;
};