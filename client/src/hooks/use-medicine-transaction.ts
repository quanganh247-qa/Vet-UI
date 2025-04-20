import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { MedicineTransactionRequest, MedicineTransactionResponse } from "@/types";
import api from "@/lib/api";

export const useMedicineTransactions = (medicineId?: number) => {
  return useQuery({
    queryKey: ["medicineTransactions", medicineId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/medicine/${medicineId}/transactions`);
      return response.data;
    },
    enabled: !!medicineId,
    staleTime: 300000, // 5 minutes
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  const validateTransaction = (data: MedicineTransactionRequest) => {
    const errors: string[] = [];
    if (data.quantity <= 0) errors.push("Quantity must be positive");
    if (data.unit_price < 0) errors.push("Unit price cannot be negative");
    if (!data.transaction_type) errors.push("Transaction type is required");
    if (!data.medicine_id) errors.push("Medicine ID is required");
    return errors;
  };

  return useMutation({
    mutationFn: async (data: MedicineTransactionRequest) => {
      // Validate transaction before sending
      const errors = validateTransaction(data);
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      const response = await api.post("/api/v1/medicine/transaction", data);
      return response.data;
    },
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ 
        queryKey: ["medicineTransactions", newTransaction.medicine_id] 
      });
      
      const previousTransactions = queryClient.getQueryData(
        ["medicineTransactions", newTransaction.medicine_id]
      );

      // Update medicine stock optimistically
      queryClient.setQueryData(["medicines"], (old: any) => {
        if (!old) return old;
        return old.map((medicine: any) => {
          if (medicine.id === newTransaction.medicine_id) {
            const stockChange = newTransaction.transaction_type === "export" 
              ? -newTransaction.quantity 
              : newTransaction.quantity;
            return {
              ...medicine,
              current_stock: medicine.current_stock + stockChange
            };
          }
          return medicine;
        });
      });

      return { previousTransactions };
    },
    onError: (err, newTransaction, context: any) => {
      // Revert optimistic update
      queryClient.setQueryData(
        ["medicineTransactions", newTransaction.medicine_id],
        context.previousTransactions
      );

      // Revert medicine stock
      queryClient.invalidateQueries({ queryKey: ["medicines"] });

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to process transaction",
        variant: "destructive",
      });
    },
    onSuccess: (result, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["medicineTransactions", variables.medicine_id] 
      });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });

      toast({
        title: "Success",
        description: "Transaction completed successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
  });
};

export const useExportMedicine = () => {
  const createTransaction = useCreateTransaction();

  return useMutation({
    mutationFn: async (data: MedicineTransactionRequest) => {
      return createTransaction.mutateAsync({
        ...data,
        transaction_type: "export"
      });
    },
    onError: (err) => {
      toast({
        title: "Export Failed",
        description: err instanceof Error ? err.message : "Failed to export medicine",
        variant: "destructive",
      });
    }
  });
};

export const useImportMedicine = () => {
  const createTransaction = useCreateTransaction();

  return useMutation({
    mutationFn: async (data: MedicineTransactionRequest) => {
      return createTransaction.mutateAsync({
        ...data,
        transaction_type: "import"
      });
    },
    onError: (err) => {
      toast({
        title: "Import Failed",
        description: err instanceof Error ? err.message : "Failed to import medicine",
        variant: "destructive",
      });
    }
  });
};