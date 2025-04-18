import {
  AssignMedicineRequest,
  CreateTreatmentPhaseRequest,
  CreateTreatmentRequest,
} from "@/types";
import api from "@/lib/api";
export const getPatientTreatments = async (patient_id: string) => {
  const response = await api.get(`/api/v1/pet/${patient_id}/treatments`);
  return response.data;
};

export const getTreatmentPhasesByTreatmentId = async (treatment_id: string) => {
  const response = await api.get(`/api/v1/treatment/${treatment_id}/phases`);
  return response.data;
};

export const getMedicationByPhaseId = async (
  treatment_id: string,
  phase_id: string
) => {
  const response = await api.get(
    `/api/v1/treatment/${treatment_id}/phases/${phase_id}/medicines`
  );
  return response.data;
};

export const addNewPhaseToTreatment = async (
  payload: CreateTreatmentPhaseRequest[],
  treatment_id: string
) => {
  try {
    const response = await api.post(
      `/api/v1/treatment/${treatment_id}/phases`,
      payload,
      {
        headers: {
          "Content-Type": "application/json", // Explicit content type
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const assignMedicineToPhase = async (
  payload: AssignMedicineRequest[],
  treatment_id: string,
  phase_id: string
) => {
  try {
    const response = await api.post(
      `/api/v1/treatment/${treatment_id}/phase/${phase_id}/medicines`,
      payload,
      {
        headers: {
          "Content-Type": "application/json", // Explicit content type
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMedicinesByPhaseId = async (
  treatment_id: string,
  phase_id: string
) => {
  try {
    const response = await api.get(
      `/api/v1/treatment/${treatment_id}/phases/${phase_id}/medicines`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllMedicines = async () => {
  try {
    const response = await api.get(`/api/v1/medicines`);
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addNewTreatment = async (payload: CreateTreatmentRequest) => {
  try {
    const response = await api.post(`/api/v1/treatment`, payload);
    return response.data;
  } catch (error: any) {
    console.log("Full error:", error);
    console.log("Response data:", error.response?.data);
    throw error;
  }
};
