import axios from "axios";

export const getDoctorById = async (doctor_id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/doctor/${doctor_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};


export const getDoctors = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get('/api/v1/doctors', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
