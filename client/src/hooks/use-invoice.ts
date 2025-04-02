import { useMutation, useQuery } from "@tanstack/react-query";
import { createInvoice } from "@/services/invoice-services";
import { CreateInvoiceRequest } from "@/types";
import { queryClient } from "@/lib/queryClient";

export const useCreateInvoice = () => {
  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) => createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      console.error("Error creating invoice:", error);
    },
  });
};
