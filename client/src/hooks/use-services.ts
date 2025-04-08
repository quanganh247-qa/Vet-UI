import { useQuery } from "@tanstack/react-query";
import { getListServices } from "@/services/catalog-services";

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: getListServices,
  });
}; 