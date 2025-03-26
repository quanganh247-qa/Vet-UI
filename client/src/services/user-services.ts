import axios from "axios";

export const getPatientById = async (id: number) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
      throw new Error('No access token found');
  }
  const response = await axios.get(`/api/v1/pet/${id}`, {
      headers: {
          Authorization: `Bearer ${token}`,
      },
  });
  console.log('Patient data response:', response);
  return response.data;
};