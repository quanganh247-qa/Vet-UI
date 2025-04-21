import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getListServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService,
  CreateServiceRequest,
  UpdateServiceRequest
} from "@/services/catalog-services";

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: getListServices,
  });
};

export const useServiceById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["services", id],
    queryFn: () => getServiceById(id as string),
    enabled: !!id, // Only run the query if id is provided
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateServiceRequest) => createService(data),
    onSuccess: () => {
      // Invalidate and refetch the services list
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequest }) => updateService(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch both the services list and the specific service
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", variables.id] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      // Invalidate and refetch the services list
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

