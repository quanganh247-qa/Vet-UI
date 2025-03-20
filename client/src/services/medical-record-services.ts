import axios from "axios";

export const getMedicalRecordsByPatientId = async (pet_id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/pet/${pet_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
