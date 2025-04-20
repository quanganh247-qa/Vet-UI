import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { MedicineSupplierRequest, MedicineSupplierResponse } from "@/types";
import api from "@/lib/api";

export const useSuppliers = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ["suppliers", page, pageSize],
    queryFn: async () => {
      const response = await api.get(`/api/v1/medicine/suppliers?page=${page}&pageSize=${pageSize}`);
      return response.data;
    },
    staleTime: 300000, // Consider data fresh for 5 minutes
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MedicineSupplierRequest) => {
      const response = await api.post('/api/v1/medicine/supplier', data);
      return response.data;
    },
    onMutate: async (newSupplier) => {
      await queryClient.cancelQueries({ queryKey: ["suppliers"] });
      const previousSuppliers = queryClient.getQueryData(["suppliers"]);
      
      // Optimistically add new supplier
      queryClient.setQueryData(["suppliers"], (old: any) => ({
        ...old,
        data: [...(old?.data || []), { ...newSupplier, id: Date.now() }],
      }));
      
      return { previousSuppliers };
    },
    onError: (err, newSupplier, context: any) => {
      queryClient.setQueryData(["suppliers"], context.previousSuppliers);
      toast({
        title: "Error",
        description: "Failed to create supplier. Changes reverted.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Success",
        description: "Supplier created successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MedicineSupplierRequest }) => {
      const response = await api.put(`/api/v1/medicine/supplier/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["suppliers"] });
      const previousSuppliers = queryClient.getQueryData(["suppliers"]);
      
      // Optimistically update supplier
      queryClient.setQueryData(["suppliers"], (old: any) => ({
        ...old,
        data: old.data.map((supplier: MedicineSupplierResponse) =>
          supplier.id === id ? { ...supplier, ...data } : supplier
        ),
      }));
      
      return { previousSuppliers };
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(["suppliers"], context.previousSuppliers);
      toast({
        title: "Error",
        description: "Failed to update supplier. Changes reverted.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Success",
        description: "Supplier updated successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/v1/medicine/supplier/${id}`);
      return response.data;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["suppliers"] });
      const previousSuppliers = queryClient.getQueryData(["suppliers"]);
      
      // Optimistically remove supplier
      queryClient.setQueryData(["suppliers"], (old: any) => ({
        ...old,
        data: old.data.filter((supplier: MedicineSupplierResponse) => supplier.id !== deletedId),
      }));
      
      return { previousSuppliers };
    },
    onError: (err, deletedId, context: any) => {
      queryClient.setQueryData(["suppliers"], context.previousSuppliers);
      toast({
        title: "Error",
        description: "Failed to delete supplier. Changes reverted.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({
        title: "Success",
        description: "Supplier deleted successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }
  });
};