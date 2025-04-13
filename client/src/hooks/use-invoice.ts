import { useMutation, useQuery } from "@tanstack/react-query";
import { createInvoice, getInvoiceById } from "@/services/invoice-services";
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


export const useInvoiceData = (invoiceId: string) => {
  return useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => {
      if (!invoiceId || invoiceId === '') {
        return Promise.reject(new Error("Invoice ID is required"));
      }
      return getInvoiceById(invoiceId);
    },
    enabled: !!invoiceId && invoiceId !== '',
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
