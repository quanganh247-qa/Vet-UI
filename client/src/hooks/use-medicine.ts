import { useMutation, useQuery } from "@tanstack/react-query";
import {
  exportMedicine,
  getMedicineById,
  getMedicineSupplierById,
} from "../services/medicine-services";
import { MedicineTransactionRequest } from "@/types";
import { getAllMedicines } from "@/services/treament-services";

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