import { useMutation, useQuery } from "@tanstack/react-query";
import { getPatientById, getAllPatients, updatePet, updatePetRequest, getPetWeightHistory } from "@/services/pet-services";
import { useQueryClient } from "@tanstack/react-query";
import { PaginatedResponse } from "@/types";
import { getPetOwnerByPetId } from "@/services/user-services";
import { toast } from "@/components/ui/use-toast";

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

export const useUpdatePet = (pet_id: number, updatePetRequest: updatePetRequest) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => updatePet(pet_id, updatePetRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet", pet_id] });
      toast({
        title: "Success",
        description: "Pet updated successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pet!",
        variant: "destructive",
      });
    },
  });
};


export const usePetWeightHistory = (pet_id: number, page: number, pageSize: number) => {
  return useQuery({
    queryKey: ["petWeightHistory", pet_id, page, pageSize],
    queryFn: () => getPetWeightHistory(pet_id, page, pageSize),
  });
};
