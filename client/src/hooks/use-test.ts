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
} from "@/services/test-services";

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

// Hook tạo xét nghiệm mới
export const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      petID,
      doctorID,
      testType,
    }: {
      petID: number;
      doctorID: number;
      testType: string;
    }) => {
      return createTest(petID, doctorID, testType);
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({
        queryKey: ["tests", "pet", variables.petID],
      });
      queryClient.invalidateQueries({ queryKey: ["tests", "pending"] });
    },
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

// // Hook thêm kết quả xét nghiệm
// export const useAddTestResult = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ testID, result }: { testID: number; result: TestResult }) => {
//       return addTestResult(testID, result);
//     },
//     onSuccess: (_, variables) => {
//       // Invalidate specific test query
//       queryClient.invalidateQueries({ queryKey: ['test', variables.testID] });
//       queryClient.invalidateQueries({ queryKey: ['tests'] });
//     }
//   });
// };

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

export const useListTests = () => {
  return useQuery({
    queryKey: ["tests"],
    queryFn: listTests,
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
    mutationFn: ({ appointmentID, testIDs, notes }: { appointmentID: number, testIDs: number[], notes: string }) => {
      return createTestOrder(appointmentID, testIDs, notes);
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
