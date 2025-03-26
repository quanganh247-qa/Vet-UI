import axios from "axios";

export const getPatientById = async (pet_id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/pet/${pet_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    console.log('Patient data response:', response);
    return response.data;
};

export const getAllPatients = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/pets`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const ListPatients = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found');
        }
        const response = await axios.get('/api/v1/pet/list', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('List patients response 1:', response);
        return response.data || [];
    } catch (error) {
        console.error('Error listing patients:', error);
        return [];
    }
};
