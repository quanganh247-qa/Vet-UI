import { useQuery } from "@tanstack/react-query";
import { getPatientById, getAllPatients } from "@/services/pet-services";
import { PaginatedResponse } from "@/types";
import { getPetOwnerByPetId } from "@/services/user-services";

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

export const usePetOwnerByPetId = (id: number | undefined) => {
  return useQuery({
    queryKey: ['petOwner', id],
    queryFn: () => {
      if (typeof id === 'undefined') {
        throw new Error('Pet ID is required');
      }
      return getPetOwnerByPetId(id);
    },
    enabled: !!id, // Only run the query when id is available
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 1,
  });
};