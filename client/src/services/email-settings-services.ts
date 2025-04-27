import axios from "axios";
import { API_BASE_URL } from "@/config";

// Types for SMTP configuration
export interface SMTPConfig {
  id: number;
  name: string;
  email: string;
  smtp_host: string;
  smtp_port: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSMTPConfigRequest {
  name: string;
  email: string;
  password: string;
  smtp_host?: string;
  smtp_port?: string;
  is_default?: boolean;
}

export interface UpdateSMTPConfigRequest {
  name: string;
  email: string;
  password?: string;
  smtp_host?: string;
  smtp_port?: string;
  is_default?: boolean;
}

export interface TestSMTPConfigRequest {
  name: string;
  email: string;
  password: string;
  smtp_host?: string;
  smtp_port?: string;
  test_email: string;
}

export interface TestSMTPConfigResponse {
  success: boolean;
  message: string;
}

export interface SetDefaultSMTPConfigRequest {
  id: number;
}

// Email Settings API Service
export const emailSettingsService = {
  // Create a new SMTP configuration
  createSMTPConfig: async (data: CreateSMTPConfigRequest): Promise<SMTPConfig> => {
    const response = await axios.post(`${API_BASE_URL}/api/smtp/config`, data);
    return response.data;
  },

  // Get a specific SMTP configuration by ID
  getSMTPConfig: async (id: number): Promise<SMTPConfig> => {
    const response = await axios.get(`${API_BASE_URL}/api/smtp/config/${id}`);
    return response.data;
  },

  // Get the default SMTP configuration
  getDefaultSMTPConfig: async (): Promise<SMTPConfig> => {
    const response = await axios.get(`${API_BASE_URL}/api/smtp/config/default`);
    return response.data;
  },

  // List all SMTP configurations
  listSMTPConfigs: async (): Promise<SMTPConfig[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/smtp/config`);
    return response.data;
  },

  // Update an existing SMTP configuration
  updateSMTPConfig: async (id: number, data: UpdateSMTPConfigRequest): Promise<SMTPConfig> => {
    const response = await axios.put(`${API_BASE_URL}/api/smtp/config/${id}`, data);
    return response.data;
  },

  // Delete a SMTP configuration
  deleteSMTPConfig: async (id: number): Promise<{ message: string }> => {
    const response = await axios.delete(`${API_BASE_URL}/api/smtp/config/${id}`);
    return response.data;
  },

  // Set a SMTP configuration as default
  setDefaultSMTPConfig: async (id: number): Promise<SMTPConfig> => {
    const response = await axios.post(`${API_BASE_URL}/api/smtp/config/default`, { id });
    return response.data;
  },

  // Test a SMTP configuration
  testSMTPConfig: async (data: TestSMTPConfigRequest): Promise<TestSMTPConfigResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/smtp/config/test`, data);
    return response.data;
  },
};