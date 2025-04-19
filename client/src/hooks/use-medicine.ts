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
import { getAllMedicines } from "@/services/treament-services";
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

export const useGetAllMedicines = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["medicines"],
    queryFn: () => getAllMedicines(),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast({
        title: "Success",
        description: "Medicine created successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create medicine!",
        variant: "destructive",
      });
    },
  });
  return { mutateAsync, isPending, error, data };
};

export const useUpdateMedicine = () => {
  const { mutateAsync, isPending, error, data } = useMutation({
    mutationFn: ({ data, medicine_id }: { data: MedicineRequest, medicine_id: number }) => updateMedicine(data, medicine_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast({
        title: "Success",
        description: "Medicine updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update medicine!",
        variant: "destructive",
      });
    },
  });
  return { mutateAsync, isPending, error, data };
};
