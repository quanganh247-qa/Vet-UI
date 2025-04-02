import { useQuery } from "@tanstack/react-query";
import { getPatientById, getAllPatients } from "@/services/pet-services";
import { PaginatedResponse } from "@/types";

export const usePatientData = (id: string | undefined) => {
  return useQuery({
    queryKey: ["pet", id],
    queryFn: () => getPatientById(parseInt(id!)),
    enabled: !!id,
  });
};

export const usePatientsData = (page: number, pageSize: number) => {
  return useQuery<PaginatedResponse<any>>({
    queryKey: ["pets", page, pageSize],
    queryFn: () => getAllPatients(page, pageSize),
  });
};


export const usePatientList = () => {
return useQuery({
    queryKey: ["pets"],
    queryFn: () => getAllPatients(1, 1000),

  });
}