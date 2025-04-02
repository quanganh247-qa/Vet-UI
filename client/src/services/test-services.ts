export const listTests = async () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token available");
  }

  try {
    const response = await fetch(`/api/v1/tests`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Handle specific HTTP errors
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    return data.data;
  } catch (error) {
    console.error("Network Error:", error);
    throw error; // Re-throw for React Query to handle
  }
};

export const createTestOrder = async (
  appointmentID: number,
  testIDs: number[],
  notes: string
) => {
  try {
    const response = await fetch(`/api/v1/test-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        appointment_id: appointmentID,
        test_ids: testIDs,
        notes: notes,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating test order:", error);
    throw error;
  }
};

export const listTestOrders = async (appointmentID: number) => {
  const token = localStorage.getItem("access_token");

  try {
    const response = await fetch(`/api/v1/test-orders?appointment_id=${appointmentID}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching test orders:", error);
    throw error;
  }
};

// Tạo xét nghiệm mới
export const createTest = async (
  petID: number,
  doctorID: number,
  testType: string
) => {
  try {
    const response = await fetch(`/api/v1/tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        pet_id: petID,
        doctor_id: doctorID,
        test_type: testType,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating test:", error);
    throw error;
  }
};

// Cập nhật trạng thái xét nghiệm
export const updateTestStatus = async (testID: number, status: string) => {
  try {
    const response = await fetch(`/api/v1/tests/${testID}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating test status:", error);
    throw error;
  }
};

// Lấy danh sách xét nghiệm theo petID
export const getTestsByPetID = async (petID: number) => {
  try {
    const response = await fetch(`/api/v1/tests?pet_id=${petID}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching tests:", error);
    throw error;
  }
};

// Lấy chi tiết xét nghiệm theo ID
export const getTestByID = async (testID: number) => {
  try {
    const response = await fetch(`/api/v1/tests/${testID}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching test details:", error);
    throw error;
  }
};

// Lấy danh sách xét nghiệm chờ kết quả
export const getPendingTests = async () => {
  try {
    const response = await fetch(`/api/v1/tests?status=Pending`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching pending tests:", error);
    throw error;
  }
};

// Lấy danh sách xét nghiệm đã hoàn thành
export const getCompletedTests = async () => {
  try {
    const response = await fetch(`/api/v1/tests?status=Completed`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching completed tests:", error);
    throw error;
  }
};

// Get all test orders (for staff)
export const getAllTestOrders = async () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token available");
  }

  try {
    const response = await fetch(`/api/v1/appointments/test-orders`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching all test orders:", error);
    throw error;
  }
};

