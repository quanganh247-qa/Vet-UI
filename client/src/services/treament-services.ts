import axios from "axios";

export const getPatientTreatments = async (patient_id: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/pet/${patient_id}/treatments`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getTreatmentPhasesByTreatmentId = async (treatment_id: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/treatment/${treatment_id}/phases`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getMedicationByPhaseId = async (treatment_id: string, phase_id: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/treatment/${treatment_id}/phases/${phase_id}/medicines`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
