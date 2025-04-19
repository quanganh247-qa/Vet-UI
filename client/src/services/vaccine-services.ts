import api from "@/lib/api";
import axios from "axios";

export const getVaccinations = async (pet_id: number) => {
  const response = await api.get(`/api/v1/vaccinations/pet/${pet_id}`);
  return response.data;
};

// Get all available vaccines from the system
export const getAllVaccines = async () => {
  try {
    const response = await api.get("/api/v1/vaccines");
    return response.data;
  } catch (error) {
    console.error("Error fetching vaccines:", error);
    throw error;
  }
};

export interface SaveVaccinationRequest {
  pet_id: number;
  vaccine_name: string;
  date_administered: string;
  next_due_date: string;
  vaccine_provider: string;
  batch_number: string;
  notes: string;
  appointment_id?: string;
}

export const saveVaccinationRecord = async (
  vaccinationData: SaveVaccinationRequest
) => {
  try {
    const response = await api.post(
      `/api/v1/vaccination/create`,
      vaccinationData
    );
    return response.data;
  } catch (error) {
    console.error("Error saving vaccination record:", error);
    throw error;
  }
};
