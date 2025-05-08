import api from "@/lib/api";
import { CreateInvoiceRequest } from "@/types";
import axios from "axios";

export const createInvoice = async (data: CreateInvoiceRequest) => {
  try {
    const response = await api.post("/api/v1/invoice", data);
    return response.data;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

export const getInvoiceById = async (id: string) => {
  try {
    if (!id || id === "") {
      throw new Error("Invoice ID is required");
    }

    const response = await api.get(`/api/v1/invoice/${id}`);

    // Add some logging to help with debugging
    if (response.data) {
      console.log(`Successfully fetched invoice with ID: ${id}`);
    } else {
      console.warn(`No data found for invoice ID: ${id}`);
    }

    return response.data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error getting invoice by id ${id}: ${errorMessage}`, error);
    throw error;
  }
};

export const getInvoices = async () => {
  try {
    const response = await api.get("/api/v1/invoices");
    return response.data;
  } catch (error) {
    console.error("Error getting invoices:", error);
    throw error;
  }
};

export const updateInvoice = async (id: string, data: CreateInvoiceRequest) => {
  try {
    const response = await api.put(`/api/v1/invoice/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

export const deleteInvoice = async (id: string) => {
  try {
    const response = await api.delete(`/api/v1/invoice/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

export const getInvoiceItems = async (id: string) => {
  try {
    const response = await api.get(`/api/v1/invoice/${id}/items`);
    return response.data;
  } catch (error) {
    console.error("Error getting invoice items:", error);
    throw error;
  }
};

export const getInvoiceItemDetails = async (
  invoice_id: string,
  item_id: string
) => {
  try {
    const response = await api.get(
      `/api/v1/invoice/${invoice_id}/items/${item_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting invoice item details:", error);
    throw error;
  }
};

export interface UpdateInvoiceStatusRequest {
  status: string;
}

export const updateInvoiceStatus = async (
  id: string,
  data: UpdateInvoiceStatusRequest
) => {
  try {
    const response = await api.put(`/api/v1/invoice/${id}/status`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  }
};
