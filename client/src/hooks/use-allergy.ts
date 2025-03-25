import { getPatientAllergies } from "@/services/allergy-services";
import { useQuery } from "@tanstack/react-query";

export const useAllergiesData = (patient_id: string, enabled = true) => {
  return useQuery({
    queryKey: ["allergies"],
    queryFn: () => getPatientAllergies(patient_id),
    enabled,
    select: (data) => data.data || [],
  });
};
