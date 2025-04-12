import axios from "axios";

export const getPatientAllergies = async (petId: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/pet/${petId}/allergies`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};