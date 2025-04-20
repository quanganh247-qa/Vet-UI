import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LowStockNotification, ExpiredMedicineNotification } from "@/types";
import api from "@/lib/api";

export const useMedicineAlerts = (daysThreshold: number = 30) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["medicineAlerts", daysThreshold],
    queryFn: async () => {
      const [lowStockResponse, expiringResponse] = await Promise.all([
        api.get("/api/v1/medicine/alerts/lowstock"),
        api.get(`/api/v1/medicine/alerts/expiring?days=${daysThreshold}`)
      ]);

      return {
        lowStock: lowStockResponse.data as LowStockNotification[],
        expiring: expiringResponse.data as ExpiredMedicineNotification[]
      };
    },
    staleTime: 300000, // Consider data fresh for 5 minutes
  
    select: (data) => ({
      lowStock: data.lowStock.sort((a, b) => 
        (a.current_stock / a.reorder_level) - (b.current_stock / b.reorder_level)
      ),
      expiring: data.expiring.sort((a, b) => 
        a.days_until_expiry - b.days_until_expiry
      )
    })
  });
};

// Helper function to prefetch alerts
export const prefetchMedicineAlerts = async (daysThreshold: number = 30) => {
  const queryClient = useQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["medicineAlerts", daysThreshold],
    queryFn: async () => {
      const [lowStockResponse, expiringResponse] = await Promise.all([
        api.get("/api/v1/medicine/alerts/lowstock"),
        api.get(`/api/v1/medicine/alerts/expiring?days=${daysThreshold}`)
      ]);

      return {
        lowStock: lowStockResponse.data,
        expiring: expiringResponse.data
      };
    }
  });
};

// Helper function to update alerts in cache after stock changes
export const updateAlertsCache = (medicineId: number, newStock: number) => {
  const queryClient = useQueryClient();
  queryClient.setQueryData(["medicineAlerts"], (old: any) => {
    if (!old) return old;

    return {
      ...old,
      lowStock: old.lowStock.map((alert: LowStockNotification) =>
        alert.medicine_id === medicineId
          ? { ...alert, current_stock: newStock }
          : alert
      ).filter((alert: LowStockNotification) => alert.current_stock < alert.reorder_level)
    };
  });
};