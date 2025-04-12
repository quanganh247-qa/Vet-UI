import { MedicineSupplierRequest, MedicineTransactionRequest } from "@/types";

export const exportMedicine = async (data: MedicineTransactionRequest) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`/api/v1/medicine/transaction`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error("Error exporting medicine:", error);
    throw error;
  }
};

export const getAllMedicineSuppliers = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`/api/v1/medicine/suppliers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  } catch (error) {
    console.error("Error getting medicine supplier:", error);
    throw error;
  }
};

export const createMedicineSupplier = async (supplier: MedicineSupplierRequest) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`/api/v1/medicine/supplier`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(supplier),
    });
    return response.json();
  } catch (error) {
    console.error("Error creating medicine supplier:", error);
    throw error;
  }
};


export const getMedicineSupplierById = async (supplierId: number) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`/api/v1/medicine/supplier/${supplierId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  } catch (error) {
    console.error("Error getting medicine supplier by id:", error);
    throw error;
  }
};

