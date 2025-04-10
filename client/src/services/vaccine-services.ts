import axios from "axios";
import { Vaccination } from "@/types";

export const getVaccinations = async (pet_id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`/api/v1/vaccinations/pet/${pet_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    console.log("response", response.data);
    return response.data;
};

export interface SaveVaccinationRequest {
    pet_id: number;
    vaccine_name: string;
    date_administered: string;
    next_due_date: string;
    vaccine_provider: string;
    batch_number: string;
    notes: string;
    administration_site: string;
    appointment_id?: string;
}

export const saveVaccinationRecord = async (vaccinationData: SaveVaccinationRequest) => {
    try {
        const response = await axios.post(
            `/api/v1/vaccinations`, 
            vaccinationData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error saving vaccination record:", error);
        throw error;
    }
};