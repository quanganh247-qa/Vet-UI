import api from "@/lib/api";
import { handleApiError } from "@/utils/helper";

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


export interface CreateStaffRequest {
    username: string;
    password: string;
    full_name: string;
    email: string;
    phone_number: string;
    address: string;
    role: string;
    is_verified_email: boolean;
}

export const addNewStaff = async (data: CreateStaffRequest) => {
    try {
        const response = await api.post('/api/v1/staff', data);
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};


export interface EditDoctorProfileRequest {
    specialization: string;
    years_of_experience: number;
    education: string;
    certificate_number: string;
    bio: string;
}

export const editDoctorProfile = async (data: EditDoctorProfileRequest) => {
    try {
        const response = await api.put('/api/v1/doctor/profile', data);
        return response.data;
    } catch (error: any) {
        handleApiError(error); // Use the helper function
    }
};

