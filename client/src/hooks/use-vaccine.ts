import { getVaccinations } from "@/services/vaccine-services";
import { useQuery } from "@tanstack/react-query";

export const useVaccineData = (pet_id: number) => {
  return useQuery({
    queryKey: ["vaccinations", pet_id],
    queryFn: async () => {
      const data = await getVaccinations(pet_id);
      return data || []; // Trả về mảng rỗng nếu không có dữ liệu
    },
    enabled: !!pet_id,
  });
};

