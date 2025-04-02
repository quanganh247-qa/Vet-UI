import { CreateInvoiceRequest } from "@/types";
import axios from "axios";

export const createInvoice = async (data: CreateInvoiceRequest) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    const response = await axios.post("/api/v1/invoice", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

export const getInvoiceById = async (id: string) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    const response = await axios.get(`/api/v1/invoice/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting invoice by id:", error);
    throw error;
  }
};

export const getInvoices = async () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    const response = await axios.get("/api/v1/invoices", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting invoices:", error);
    throw error;
  }
};

export const updateInvoice = async (id: string, data: CreateInvoiceRequest) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    const response = await axios.put(`/api/v1/invoice/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};


export const deleteInvoice = async (id: string) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    const response = await axios.delete(`/api/v1/invoice/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};


export const getInvoiceItems = async (id: string) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    const response = await axios.get(`/api/v1/invoice/${id}/items`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting invoice items:", error);
    throw error;
  }
};


export const getInvoiceItemDetails = async (invoice_id: string, item_id: string) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    const response = await axios.get(`/api/v1/invoice/${invoice_id}/items/${item_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting invoice item details:", error);
    throw error;
  }
};



