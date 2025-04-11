import { toast } from "@/components/ui/use-toast";
import { queryClient } from "@/lib/queryClient";
import { getVaccinations, getAllVaccines, saveVaccinationRecord, SaveVaccinationRequest } from "@/services/vaccine-services";
import { Vaccination } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

// Default vaccines data in case API fails
const DEFAULT_VACCINES = [
  {
    id: 1,
    name: "Rabies",
    type: "Core",
    manufacturer: "VetGuard",
    description: "Protects against rabies virus",
    recommended_age: "12 weeks",
    booster_frequency: "12",
    side_effects: ["Mild fever", "Lethargy"],
    contraindications: ["Previous allergic reaction"],
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: 2,
    name: "DHPP",
    type: "Core",
    manufacturer: "PetShield",
    description: "Protects against Distemper, Hepatitis, Parainfluenza, and Parvovirus",
    recommended_age: "8 weeks",
    booster_frequency: "12",
    side_effects: ["Mild fever", "Reduced appetite"],
    contraindications: ["Immunocompromised patients"],
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: 3,
    name: "Bordetella",
    type: "Non-core",
    manufacturer: "VetGuard",
    description: "Protects against kennel cough",
    recommended_age: "8 weeks",
    booster_frequency: "6",
    side_effects: ["Sneezing", "Nasal discharge"],
    contraindications: ["Respiratory infection"],
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: 4,
    name: "Leptospirosis",
    type: "Non-core",
    manufacturer: "PetShield",
    description: "Protects against Leptospira bacteria",
    recommended_age: "12 weeks",
    booster_frequency: "12",
    side_effects: ["Mild fever", "Lethargy"],
    contraindications: ["Previous allergic reaction"],
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  },
  {
    id: 5,
    name: "Feline Leukemia (FeLV)",
    type: "Core",
    manufacturer: "CatCare",
    description: "Protects cats against feline leukemia virus",
    recommended_age: "8 weeks",
    booster_frequency: "12",
    side_effects: ["Mild fever", "Lethargy"],
    contraindications: ["Previous allergic reaction"],
    created_at: "2023-01-01",
    updated_at: "2023-01-01"
  }
];

export const useVaccineData = (pet_id: number) => {
  return useQuery({
    queryKey: ["vaccinations", pet_id],
    queryFn: async () => {
      const data = await getVaccinations(pet_id);
      return data || []; // Trả về mảng rỗng nếu không có dữ liệu
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
        return response?.data || DEFAULT_VACCINES;
      } catch (error) {
        console.error("Error fetching vaccines, using defaults:", error);
        return DEFAULT_VACCINES;
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