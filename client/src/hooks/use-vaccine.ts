import { toast } from "@/components/ui/use-toast";
import { queryClient } from "@/lib/queryClient";
import { getVaccinations, getAllVaccines, saveVaccinationRecord, SaveVaccinationRequest } from "@/services/vaccine-services";
import { Vaccination } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useVaccineData = (pet_id: number) => {
  return useQuery({
    queryKey: ["vaccinations", pet_id],
    queryFn: async () => {
      const data = await getVaccinations(pet_id);
      return data || [];
    },
    enabled: !!pet_id,
  });
};

// Hook to fetch all available vaccines
export const useAllVaccines = () => {
  return useQuery({
    queryKey: ["all-vaccines"],
    queryFn: async () => {
      try {
        const response = await getAllVaccines();
        return response?.data;
      } catch (error) {
        return [];
      }
    },
  });
};

// saveVaccinationRecord
export const useSaveVaccinationRecord = () => {
  return useMutation({
    mutationFn: async (vaccinationData: SaveVaccinationRequest) => {
      return await saveVaccinationRecord(vaccinationData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations"] });
      toast({
        title: "Success",
        description: "Vaccination record saved successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error) => {
      console.error("Error saving vaccination record:", error);
      // Toast lỗi từ server (tùy chọn)
      toast({
        title: "Error",
        description: "Failed to save vaccination record",
        variant: "destructive",
      });
    },
  });
};