import api from "@/lib/api";

export const getShifts = async () => {
    try {
        const response = await api.get('/api/v1/doctor/shifts');
        return response.data;
    } catch (error) {
        console.error("Error fetching shifts:", error);
        throw error;
    }
};

export const createShift = async (data: { 
    start_time: Date | string; 
    end_time: Date | string; 
    doctor_id: number;
    title?: string;
    description?: string;
    status?: string;
}) => {
    try {
        // Format dates to YYYY-MM-DD HH:MM:SS if they are Date objects
        const formatDateIfNeeded = (date: Date | string): string => {
            if (date instanceof Date) {
                const pad = (num: number) => String(num).padStart(2, '0');
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            }
            // If it's already a string, assume it's in the correct format
            return date;
        };

        const formattedData = {
            ...data,
            start_time: formatDateIfNeeded(data.start_time),
            end_time: formatDateIfNeeded(data.end_time)
        };

        console.log("Sending to API:", formattedData);
        const response = await api.post('/api/v1/doctor/shifts', formattedData);
        return response.data;
    } catch (error) {
        console.error("Error creating shift:", error);
        throw error;
    }
};

export const getShiftByDoctorId = async (doctor_id: number) => {
    try {
        const response = await api.get(`/api/v1/doctor/${doctor_id}/shifts`);
        console.log("response", response);
        return response.data;
    } catch (error) {
        console.error("Error fetching shifts by doctor ID:", error);
        throw error;
    }
};


export const updateShift = async (shift_id: number, data: { 
    start_time: Date | string; 
    end_time: Date | string; 
    doctor_id: number;
    title?: string;
    description?: string;
    status?: string;
}) => {
    try {
        // Format dates to YYYY-MM-DD HH:MM:SS if they are Date objects
        const formatDateIfNeeded = (date: Date | string): string => {
            if (date instanceof Date) {
                const pad = (num: number) => String(num).padStart(2, '0');
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            }
            // If it's already a string, assume it's in the correct format
            return date;
        };

        const formattedData = {
            ...data,
            start_time: formatDateIfNeeded(data.start_time),
            end_time: formatDateIfNeeded(data.end_time)
        };

        console.log("Updating shift with data:", formattedData);
        const response = await api.put(`/api/v1/doctor/shifts/${shift_id}`, formattedData);
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


export const getTimeSlots = async (doctor_id: number) => {
    try {
        const response = await api.get(`/api/v1/doctor/${doctor_id}/time-slot`);
        return response.data;
    } catch (error) {
        console.error("Error fetching time slots:", error);
        throw error;
    }
};