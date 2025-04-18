import api from "@/lib/api";

export const getDoctorById = async (doctor_id: number) => {
    try {
        const response = await api.get(`/api/v1/doctor/${doctor_id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching doctor:", error);
        throw error;
    }
};


export const getDoctors = async () => {
    try {
        const response = await api.get('/api/v1/doctors');
        return response.data;
    } catch (error) {
        console.error("Error fetching doctors:", error);
        throw error;
    }
};

export const getDoctorProfile = async () => {
    try {
        const response = await api.get('/api/v1/doctor/profile');
        return response.data.data;
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        throw error;
    }
};

export const getShifts = async () => {
    try {
        const response = await api.get('/api/v1/doctor/shifts');
        return response.data;
    } catch (error) {
        console.error("Error fetching shifts:", error);
        throw error;
    }
};

export const createShift = async (data: { start_time: Date; end_time: Date; doctor_id: number }) => {
    try {
        const response = await api.post('/api/v1/doctor/shifts', data);
        return response.data;
    } catch (error) {
        console.error("Error creating shift:", error);
        throw error;
    }
};

export const getShiftByDoctorId = async (doctor_id: number) => {
    try {
        const response = await api.get(`/api/v1/doctor/${doctor_id}/shifts`);
        return response.data;
    } catch (error) {
        console.error("Error fetching shifts by doctor ID:", error);
        throw error;
    }
};

export const updateShift = async (shift_id: number, data: { start_time: Date; end_time: Date; doctor_id: number }) => {
    try {
        const response = await api.put(`/api/v1/doctor/shifts/${shift_id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating shift:", error);
        throw error;
    }
};


export const deleteShift = async (shift_id: number) => {
    try {
        const response = await api.delete(`/api/v1/doctor/shifts/${shift_id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting shift:", error);
        throw error;
    }
};

export const addNewShift = async (data: { start_time: Date; end_time: Date; doctor_id: number }) => {
    try {
        const response = await api.post('/api/v1/doctor/shifts', data);
        return response.data;
    } catch (error) {
        console.error("Error adding new shift:", error);
        throw error;
    }
};

export interface CreateStaffRequest {
    username:        string;
    password:        string;
    full_name:        string;
    email:           string;
    phone_number:     string;
    address:         string;
    role:            string;
    is_verified_email: boolean;
}

export const addNewStaff = async (data: CreateStaffRequest) => {
    try {
        const response = await api.post('/api/v1/staff', data);
        return response.data;
    } catch (error) {
        console.error("Error adding new staff:", error);
        throw error;
    }
};