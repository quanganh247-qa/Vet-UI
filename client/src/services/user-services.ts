import api from "@/lib/api";
import { handleApiError } from "@/utils/helper";

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


export interface UpdatePasswordParams {
  old_password: string;
  password: string;
}

export const updatePassword = async ( data: UpdatePasswordParams) => {
  try {
      const response = await api.put('/api/v1/user/change-password', data);
      return response.data;
  } catch (error: any) {
      handleApiError(error); // Use the helper function
  }
};

export const updateUserAvatar = async (data: FormData) => {
  // Ensure the file field is named 'image' as expected by the backend
  if (!data.has('image')) {
      throw new Error('Image is required');
  }

  try {
      const response = await api.put('/api/v1/user/avatar', data, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });
      return response.data;
  } catch (error: any) {
      handleApiError(error);
  }
};

export interface UpdateUserParams {
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
}


export const updateUser = async (data: UpdateUserParams) => {
  try {
      const response = await api.put('/api/v1/user', data);
      return response.data;
  } catch (error: any) {
      handleApiError(error); // Use the helper function
  }
};