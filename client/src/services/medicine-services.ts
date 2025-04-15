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
