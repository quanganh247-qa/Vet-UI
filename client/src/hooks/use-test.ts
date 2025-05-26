import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTest,
  updateTestStatus,
  getTestsByPetID,
  getTestByID,
  getPendingTests,
  getCompletedTests,
  listTests,
  createTestOrder,
  listTestOrders,
  getAllTestOrders,
  getTestByAppointmentID,
  CreateTestRequest,
} from "@/services/test-services";
import { TestByAppointment } from "@/types";
// Hook lấy danh sách xét nghiệm theo petID
export const useTestsByPetID = (petID?: number | string) => {
  const numericPetID = typeof petID === "string" ? parseInt(petID) : petID;

  return useQuery({
    queryKey: ["tests", "pet", numericPetID],
    queryFn: () =>
      numericPetID ? getTestsByPetID(numericPetID) : Promise.resolve([]),
    enabled: !!numericPetID,
  });
};

// Hook lấy chi tiết xét nghiệm theo ID
export const useTestByID = (testID?: number | string) => {
  const numericTestID = typeof testID === "string" ? parseInt(testID) : testID;

  return useQuery({
    queryKey: ["test", numericTestID],
    queryFn: () =>
      numericTestID ? getTestByID(numericTestID) : Promise.resolve(null),
    enabled: !!numericTestID,
  });
};


// Hook cập nhật trạng thái xét nghiệm
export const useUpdateTestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testID, status }: { testID: number; status: string }) => {
      return updateTestStatus(testID, status);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
};


// Hook lấy danh sách xét nghiệm đang chờ
export const usePendingTests = () => {
  return useQuery({
    queryKey: ["tests", "pending"],
    queryFn: getPendingTests,
  });
};

// Hook lấy danh sách xét nghiệm đã hoàn thành
export const useCompletedTests = () => {
  return useQuery({
    queryKey: ["tests", "completed"],
    queryFn: getCompletedTests,
  });
};

export const useListTests = (type: string) => {
  return useQuery({
    queryKey: ["tests", type],
    queryFn: () => listTests(type),
    select: (response) => {
      // Kiểm tra response và trả về mảng rỗng nếu không có data
      if (!response) return [];
      return Array.isArray(response) ? response : response.data || [];
    },
    retry: 1,
  });
};

export const useCreateTestOrder = (

) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentID, itemIDs, notes }: { appointmentID: number, itemIDs: number[], notes: string }) => {
      return createTestOrder(appointmentID, itemIDs, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error) => {
      console.error("Error creating test order:", error);
    },
  });
};

export const useListTestOrders = (appointmentID: number) => {
  return useQuery({
    queryKey: ["test-orders", appointmentID],
    queryFn: () => listTestOrders(appointmentID),
    select: (response) => {
      // Kiểm tra response và trả về mảng rỗng nếu không có data
      if (!response) return [];
      return Array.isArray(response) ? response : response.data || [];
    },
    retry: 1,
    enabled: !!appointmentID,
  });
};

export const useAllTestOrders = () => {
  return useQuery({
    queryKey: ["test-orders", "all"],
    queryFn: getAllTestOrders,
    refetchInterval: 30000, // Refetch every 30 seconds to keep data fresh
    select: (response) => {
      if (!response) return [];
      return Array.isArray(response) ? response : response.data || [];
    },
  });
};


export const useGetTestByAppointmentID = (appointmentID: number | undefined) => {
  return useQuery<TestByAppointment[], Error>({
    queryKey: ['tests', appointmentID],
    queryFn: async () => {
      if (!appointmentID) {
        console.warn('No appointment ID provided, returning empty array');
        return [];
      }
      return await getTestByAppointmentID(appointmentID);
    },
    enabled: true, // Always enable the hook, handle empty appointmentID inside
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2, // Retry failed requests twicxe
    select: (data) => {
      // Handle empty data
      if (!data || data.length === 0) {
        return [];
      }

      // Transform data for consistent property names
      return data.map(test => {
        // Safe access to properties with type casting to avoid linter errors
        const item = test as TestByAppointment;

        return {
          test_id: item.test_id || `test-${Math.random().toString(36).substring(2, 9)}`,
          test_name: item.test_name || 'Unnamed Vaccine',
          batch_number: item.batch_number || 'N/A',
          expiration_date: item.expiration_date || 'N/A',
        } as TestByAppointment;
      });
    }
  });
};

export const useCreateTest = () => {
  return useMutation({
    mutationFn: (test: CreateTestRequest) => {
      return createTest(test);
    },
  });
};