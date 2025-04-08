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

export const getDoctorProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get('/api/v1/doctor/profile', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const getShifts = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get('/api/v1/doctor/shifts', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const createShift = async (data: { start_time: Date; end_time: Date; doctor_id: number }) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.post('/api/v1/doctor/shifts', data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getShiftByDoctorId = async (doctor_id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }

    const response = await axios.get(`/api/v1/doctor/${doctor_id}/shifts`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateShift = async (shift_id: number, data: { start_time: Date; end_time: Date; doctor_id: number }) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.put(`/api/v1/doctor/shifts/${shift_id}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteShift = async (shift_id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.delete(`/api/v1/doctor/shifts/${shift_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};



export  const addNewShift = async (data: { start_time: Date; end_time: Date; doctor_id: number }) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.post('/api/v1/doctor/shifts', data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}