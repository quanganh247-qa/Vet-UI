export interface TestResult {
  testID: number;
  parameters: Record<string, string | number>;
  notes?: string;
  files?: string[];
}

export interface Test {
  id: number;
  petID: number;
  doctorID: number;
  testType: string;
  status: 'Pending' | 'In-Progress' | 'Completed' | 'Reviewed';
  createdAt: string;
  result?: TestResult;
}

// Tạo xét nghiệm mới
export const createTest = async (
  petID: number, 
  doctorID: number, 
  testType: string,

) => {
  try {
    const response = await fetch(`/api/v1/tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        pet_id: petID,
        doctor_id: doctorID,
        test_type: testType
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating test:', error);
    throw error;
  }
};

// Cập nhật trạng thái xét nghiệm
export const updateTestStatus = async (testID: number, status: string) => {
  try {
    const response = await fetch(`/api/v1/tests/${testID}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating test status:', error);
    throw error;
  }
};

// Thêm kết quả xét nghiệm
export const addTestResult = async (testID: number, result: TestResult) => {
  try {
    const response = await fetch(`/api/v1/tests/${testID}/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(result)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding test result:', error);
    throw error;
  }
};

// Lấy danh sách xét nghiệm theo petID
export const getTestsByPetID = async (petID: number) => {
  try {
    const response = await fetch(`/api/v1/tests?pet_id=${petID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tests:', error);
    throw error;
  }
};

// Lấy chi tiết xét nghiệm theo ID
export const getTestByID = async (testID: number) => {
  try {
    const response = await fetch(`/api/v1/tests/${testID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching test details:', error);
    throw error;
  }
};

// Lấy danh sách xét nghiệm chờ kết quả
export const getPendingTests = async () => {
  try {
    const response = await fetch(`/api/v1/tests?status=Pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending tests:', error);
    throw error;
  }
};

// Lấy danh sách xét nghiệm đã hoàn thành
export const getCompletedTests = async () => {
  try {
    const response = await fetch(`/api/v1/tests?status=Completed`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching completed tests:', error);
    throw error;
  }
}; 