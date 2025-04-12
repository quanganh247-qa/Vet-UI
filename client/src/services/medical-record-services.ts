import axios from "axios";

export const getMedicalRecordsByPatientId = async (pet_id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/pets/${pet_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};


export type MedicalHistoryRequest = {
    condition: string;
    diagnosis_date: string;
    notes: string;
}

export const createMedicalHistory = async (pet_id: number, medicalHistoryRequest: MedicalHistoryRequest) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.post(`/api/v1/pets/${pet_id}/medical-histories`, medicalHistoryRequest, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getMedicalHistoryByPetId = async (pet_id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/pets/${pet_id}/medical-histories`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}