import { getPatientAllergies } from "@/services/allergy-services";
import { useQuery } from "@tanstack/react-query";

export const useAllergiesData = (petId: string, enabled = true) => {
  return useQuery({
    queryKey: ["allergies"],
    queryFn: () => getPatientAllergies(petId),
    enabled,
    select: (data) => data.data || [],
  });
};
