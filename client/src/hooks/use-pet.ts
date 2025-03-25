import { useQuery } from "@tanstack/react-query";
import { getPatientById, getAllPatients } from "@/services/pet-services";

export const usePatientData = (id: string | undefined) => {
  return useQuery({
    queryKey: ["pet", id],
    queryFn: () => getPatientById(parseInt(id!)),
    enabled: !!id,
  });
};

export const usePatientsData = () => {
  return useQuery({
    queryKey: ["pets"],
    queryFn: () => getAllPatients(),
  });
};

