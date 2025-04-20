import { queryClient } from "@/lib/queryClient";
import api from "@/lib/api";
import { prefetchMedicineAlerts } from "@/hooks/use-medicine-alerts";

export async function prefetchMedicineData() {
  // Prefetch medicines list
  await queryClient.prefetchQuery({
    queryKey: ["medicines"],
    queryFn: async () => {
      const response = await api.get("/api/v1/medicines");
      return response.data;
    }
  });

  // Prefetch alerts
  await prefetchMedicineAlerts();

  // Prefetch suppliers
  await queryClient.prefetchQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await api.get("/api/v1/medicine/suppliers");
      return response.data;
    }
  });
}

export function setupMedicinePrefetch() {
  // Set up prefetch on hover for medicine details
  const prefetchMedicineDetails = async (medicineId: number) => {
    await queryClient.prefetchQuery({
      queryKey: ["medicineById", medicineId],
      queryFn: async () => {
        const response = await api.get(`/api/v1/medicine/${medicineId}`);
        return response.data;
      }
    });
  };

  // Set up prefetch on hover for medicine transactions
  const prefetchMedicineTransactions = async (medicineId: number) => {
    await queryClient.prefetchQuery({
      queryKey: ["medicineTransactions", medicineId],
      queryFn: async () => {
        const response = await api.get(`/api/v1/medicine/${medicineId}/transactions`);
        return response.data;
      }
    });
  };

  return {
    prefetchMedicineDetails,
    prefetchMedicineTransactions
  };
}