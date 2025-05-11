import { PaginatedResponse } from "@/types";
import api from "@/lib/api";
import { time } from "console";

export const getPatientById = async (pet_id: number) => {
    const response = await api.get(`/api/v1/pet/${pet_id}`, {

    });

    return response.data;
};

export const getAllPatients = async (page: number, pageSize: number): Promise<PaginatedResponse<any>> => {

    try {
        const response = await api.get(`/api/v1/pets?page=${page}&pageSize=${pageSize}`);

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
        const response = await api.get(`/api/v1/pets?page=${page}&pageSize=${pageSize}`);
        return response.data || { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    } catch (error) {
        console.error('Error listing patients:', error);
        return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    }
};


export type updatePetRequest = {
    name: string;
    type: string;
    breed: string;
    age: number;
    weight: number;
    gender: string;
    healthnotes: string;
    bod: string;
    microchip_number: string;
}

export const updatePet = async (pet_id: number, updatePetRequest: updatePetRequest) => {

    const response = await api.put(`/api/v1/pet/${pet_id}`, updatePetRequest);
    return response.data;
}

export type WeightRecordResponse = {
	id: number;
	pet_id: number;
	weight_kg: number;
	weight_lb: number;
	recorded_at: Date;
	notes: string;
	created_at: Date;
}

export type PetWeightHistoryResponse = {
	pet_id: number;
	pet_name: string;
	current_weight: WeightRecordResponse;
	weight_history: WeightRecordResponse[];
	total_records: number;
	default_unit_type: string; // "kg" or "lb"
}

export const getPetWeightHistory = async (pet_id: number, page: number, pageSize: number ) => {
    try {
        const response = await api.get<PetWeightHistoryResponse>(`/api/v1/pet/${pet_id}/weights?page=${page}&pageSize=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pet weight history:', error);
        return null;
    }
}
