import { TestByAppointment } from "@/types";
import api from "@/lib/api";
import axios from "axios";

export const listTests = async (type: string) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await api.get(`/api/v1/items?type=${type}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Unauthorized: Invalid or expired token");
      } else if (error.response?.status === 403) {
        throw new Error("Forbidden: You do not have permission");
      }
    }
    console.error("Error listing tests:", error);
    throw error;
  }
};

export const createTestOrder = async (
  appointmentID: number,
  itemIDs: number[],
  notes: string
) => {
  try {
    const response = await api.post(`/api/v1/test-orders`, {
      appointment_id: appointmentID,
      item_ids: itemIDs,
      notes: notes,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating test order:", error);
    throw error;
  }
};

export const listTestOrders = async (appointmentID: number) => {
  try {
    const response = await api.get(`/api/v1/test-orders?appointment_id=${appointmentID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export type CreateTestRequest = {
	test_id: string;
	category_id: string;
	name: string;
	description: string;
	price: number;
	turnaround_time: string;
	type: string;
	medicine_id: number;
}

// Tạo xét nghiệm mới
export const createTest = async (
  test: CreateTestRequest
) => {
  try {
    const response = await api.post(`/api/v1/items`, {
      test_id: test.test_id,
      category_id: test.category_id,
      name: test.name,
      description: test.description,
      price: test.price,
      turnaround_time: test.turnaround_time,
      type: test.type,
      medicine_id: test.medicine_id,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating test:", error);
    throw error;
  }
};


		// permsRoute([]perms.Permission{perms.ManageTest}).POST("/items", controller.CreateTest)

  

// Cập nhật trạng thái xét nghiệm
export const updateTestStatus = async (testID: number, status: string) => {
  try {
    const response = await api.put(`/api/v1/tests/${testID}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating test status:", error);
    throw error;
  }
};

// Lấy danh sách xét nghiệm theo petID
export const getTestsByPetID = async (petID: number) => {
  try {
    const response = await api.get(`/api/v1/tests?pet_id=${petID}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tests:", error);
    throw error;
  }
};

// Lấy chi tiết xét nghiệm theo ID
export const getTestByID = async (testID: number) => {
  try {
    const response = await api.get(`/api/v1/tests/${testID}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching test details:", error);
    throw error;
  }
};

// Lấy danh sách xét nghiệm chờ kết quả
export const getPendingTests = async () => {
  try {
    const response = await api.get(`/api/v1/tests?status=Pending`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending tests:", error);
    throw error;
  }
};

// Lấy danh sách xét nghiệm đã hoàn thành
export const getCompletedTests = async () => {
  try {
    const response = await api.get(`/api/v1/tests?status=Completed`);
    return response.data;
  } catch (error) {
    console.error("Error fetching completed tests:", error);
    throw error;
  }
};

// Get all test orders (for staff)
export const getAllTestOrders = async () => {
  try {
    const response = await api.get(`/api/v1/appointments/test-orders`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all test orders:", error);
    throw error;
  }
};

export const getTestByAppointmentID = async (appointmentID: number): Promise<TestByAppointment[]> => {
  try {
    const response = await api.get(`/api/v1/tests?appointment_id=${appointmentID}`);
    const data = response.data;
    
    // Check if data exists and has the expected structure
    if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error("No data found");
    }
    
    // Transform dates if needed
    const formattedData = data.data.map((test: any) => ({
      ...test,
      // If backend doesn't format dates, format here
      expiration_date: test.expiration_date?.split(' ')[0] || '',
      test_name: test.test_name || 'Unnamed Vaccine',
      test_id: test.test_id || `test-${Math.random().toString(36).substring(2, 9)}`,
      batch_number: test.batch_number || 'N/A',
    }));

    return formattedData;
  } catch (error) {
    throw error;
  }
};