import { PaginatedResponse } from "@/types";
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

export const getAllPatients = async (page: number, pageSize: number): Promise<PaginatedResponse<any>> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    
    try {
        const response = await axios.get(`/api/v1/pets?page=${page}&pageSize=${pageSize}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Xử lý phản hồi có định dạng {count: number, rows: Array}
        if (response.data && response.data.count !== undefined && Array.isArray(response.data.rows)) {
            const total = response.data.count;
            const data = response.data.rows;
            const totalPages = Math.ceil(total / pageSize);
            
            return {
                data: data,
                total,
                page,
                pageSize,
                totalPages
            };
        }
        
        // Nếu API không trả về định dạng mong đợi, xử lý như trước
        if (Array.isArray(response.data)) {
            const data = response.data;
            const total = data.length; // Giả định tổng số là độ dài mảng
            const totalPages = Math.ceil(total / pageSize);
            
            // Manually paginate the data
            const startIndex = (page - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, total);
            const paginatedData = data.slice(startIndex, endIndex);
            
            return {
                data: paginatedData,
                total,
                page,
                pageSize,
                totalPages
            };
        }
        
        return response.data;
    } catch (error) {
        console.error('Error fetching patients:', error);
        return {
            data: [],
            total: 0,
            page,
            pageSize,
            totalPages: 0
        };
    }
};



export const ListPatients = async (page: number = 1, pageSize: number = 5): Promise<PaginatedResponse<any>> => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found');
        }
        const response = await axios.get(`/api/v1/pets?page=${page}&pageSize=${pageSize}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data || { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    } catch (error) {
        console.error('Error listing patients:', error);
        return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    }
};
