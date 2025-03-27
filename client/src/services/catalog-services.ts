import axios from 'axios';

export const getCatalogItems = async (type: 'diseases' | 'medicines' | 'services') => {
  const response = await axios.get(`/api/v1/catalog/${type}`);
  return response.data;
};

export const createCatalogItem = async (type: 'diseases' | 'medicines' | 'services', data: any) => {
  const response = await axios.post(`/api/v1/catalog/${type}`, data);
  return response.data;
};

export const updateCatalogItem = async (type: 'diseases' | 'medicines' | 'services', id: string, data: any) => {
  const response = await axios.put(`/api/v1/catalog/${type}/${id}`, data);
  return response.data;
};

export const deleteCatalogItem = async (type: 'diseases' | 'medicines' | 'services', id: string) => {
  const response = await axios.delete(`/api/v1/catalog/${type}/${id}`);
  return response.data;
}; 