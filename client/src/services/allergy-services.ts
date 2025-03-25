import axios from "axios";

export const getPatientAllergies = async (patient_id: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/pet/${patient_id}/allergies`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};