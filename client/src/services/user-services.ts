import api from "@/lib/api";

export const getPatientById = async (id: number) => {
  try {
    const response = await api.get(`/api/v1/pet/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient:", error);
    throw error;
  }
};

export const getPetOwnerByPetId = async (id: number) => {
  try {
    const response = await api.get(`/api/v1/pet/${id}/owner`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pet owner:", error);
    throw error;
  }
};

