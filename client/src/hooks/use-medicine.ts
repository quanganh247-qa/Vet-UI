import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createMedicine,
  exportMedicine,
  getMedicineById,
  getMedicineSupplierById,
  MedicineRequest,
  updateMedicine,
} from "../services/medicine-services";
import { MedicineTransactionRequest } from "@/types";
import { getAllMedicines, getMedicinesByPhaseId } from "@/services/treament-services";
import { queryClient } from "@/lib/queryClient";
import { toast } from "./use-toast";

export const useExportMedicine = () => {
  const { mutateAsync, isPending, error, data } = useMutation({
    mutationFn: (data: MedicineTransactionRequest) => exportMedicine(data),
  });
  return { mutateAsync, isPending, error, data };
};

export const useGetMedicineSupplierById = (id: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["medicineSupplierById", id],
    queryFn: () => getMedicineSupplierById(id),
  });
  return { data, isLoading, error };
};

export const useGetAllMedicines = (page: number, pageSize: number, search: string = "") => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["medicines", page, pageSize, search],
    queryFn: () => getAllMedicines(page, pageSize, search),
    staleTime: 300000, // Consider data fresh for 5 minutes
  });
  return { data, isLoading, error };
};

export const useGetMedicineById = (id: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["medicineById", id],
    queryFn: () => getMedicineById(id),
  });
  return { data, isLoading, error };
};

export const useCreateMedicine = () => {
  const { mutateAsync, isPending, error, data } = useMutation({
    mutationFn: (data: MedicineRequest) => createMedicine(data),
    onMutate: async (newMedicine) => {
      await queryClient.cancelQueries({ queryKey: ["medicines"] });
      const previousMedicines = queryClient.getQueryData(["medicines"]);
      
      // Add temporary ID for optimistic update
      const tempMedicine = { ...newMedicine, id: Date.now() };
      queryClient.setQueryData(["medicines"], (old: any[] = []) => [...old, tempMedicine]);
      
      return { previousMedicines };
    },
    onError: (err, newMedicine, context: any) => {
      queryClient.setQueryData(["medicines"], context.previousMedicines);
      toast({
        title: "Error",
        description: "Failed to create medicine. Changes reverted.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast({
        title: "Success",
        description: "Medicine created successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }
  });
  return { mutateAsync, isPending, error, data };
};

export const useUpdateMedicine = () => {
  const { mutateAsync, isPending, error, data } = useMutation({
    mutationFn: ({ data, medicine_id }: { data: MedicineRequest, medicine_id: number }) => updateMedicine(data, medicine_id),
    onMutate: async (newMedicine) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["medicines"] });
      
      // Snapshot the previous value
      const previousMedicines = queryClient.getQueryData(["medicines"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["medicines"], (old: any) => {
        return old?.map((medicine: any) => 
          medicine.id === newMedicine.medicine_id ? { ...medicine, ...newMedicine.data } : medicine
        );
      });
      
      return { previousMedicines };
    },
    onError: (err, newMedicine, context: any) => {
      // If the mutation fails, revert back to the previous value
      queryClient.setQueryData(["medicines"], context.previousMedicines);
      toast({
        title: "Error",
        description: "Failed to update medicine. Changes reverted.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast({
        title: "Success",
        description: "Medicine updated successfully!",
      });
    }
  });
  return { mutateAsync, isPending, error, data };
};


export const useGetMedicineByPhaseId = (treatment_id: number, phase_id: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["medicineByPhaseId", treatment_id, phase_id],
    queryFn: () => getMedicinesByPhaseId(treatment_id.toString(), phase_id.toString()),
  });
  return { data, isLoading, error };
};