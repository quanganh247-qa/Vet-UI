import { MedicineSupplierRequest, MedicineTransactionRequest } from "@/types";
import api from "@/lib/api";

export const exportMedicine = async (data: MedicineTransactionRequest) => {
  try {
    const response = await api.post(`/api/v1/medicine/transaction`, data);
    return response.data;
  } catch (error) {
    console.error("Error exporting medicine:", error);
    throw error;
  }
};

export const getAllMedicineSuppliers = async () => {
  try {
    const response = await api.get(`/api/v1/medicine/suppliers`);
    return response.data;
  } catch (error) {
    console.error("Error getting medicine supplier:", error);
    throw error;
  }
};

export const createMedicineSupplier = async (
  supplier: MedicineSupplierRequest
) => {
  try {
    const response = await api.post(`/api/v1/medicine/supplier`, supplier);
    return response.data;
  } catch (error) {
    console.error("Error creating medicine supplier:", error);
    throw error;
  }
};

export const getMedicineSupplierById = async (supplierId: number) => {
  try {
    const response = await api.get(`/api/v1/medicine/supplier/${supplierId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting medicine supplier by id:", error);
    throw error;
  }
};

export const getMedicineById = async (medicineId: number) => {
  try {
    const response = await api.get(`/api/v1/medicine/${medicineId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting medicine by id:", error);
    throw error;
  }
};

export type MedicineRequest = {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  side_effects: string;
  quantity: number;
  expiration_date: string;
  description: string;
  usage: string;
  supplier_id: number;
  unit_price: number;
  reorder_level: number;
}

export const createMedicine = async (medicine: MedicineRequest) => {
  try {
    const response = await api.post(`/api/v1/medicine`, medicine);
    return response.data;
  } catch (error) {
    console.error("Error creating medicine:", error);
    throw error;
  }
};

export const updateMedicine = async (medicine: MedicineRequest, medicine_id: number) => {
  try {
    const response = await api.put(`/api/v1/medicine/${medicine_id}`, medicine);
    return response.data;
  } catch (error) {
    console.error("Error updating medicine:", error);
    throw error;
  }
};


