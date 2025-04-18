import axios from "axios";
import api from "@/lib/api";
export const getMedicalRecordsByPatientId = async (pet_id: number) => {
  try {
    const response = await api.get(`/api/v1/pets/${pet_id}/medical-histories`);
    return response.data;
  } catch (error) {
    console.error("Error getting medical records by patient id:", error);
    throw error;
  }
};

export type MedicalHistoryRequest = {
  condition: string;
  diagnosis_date: string;
  notes: string;
};

export const createMedicalHistory = async (
  pet_id: number,
  medicalHistoryRequest: MedicalHistoryRequest
) => {
  try {
    const response = await api.post(
      `/api/v1/pets/${pet_id}/medical-histories`,
      medicalHistoryRequest
    );
    return response.data;
  } catch (error) {
    console.error("Error creating medical history:", error);
    throw error;
  }
};

export const getMedicalHistoryByPetId = async (pet_id: number) => {
  try {
    const response = await api.get(`/api/v1/pets/${pet_id}/medical-histories`);
    console.log("Medical history response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting medical history by pet id:", error);
    throw error;
  }
};
