import { useQuery } from "@tanstack/react-query";
import { getDoctors } from "@/services/doctor-services";

export const useDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });
}; 