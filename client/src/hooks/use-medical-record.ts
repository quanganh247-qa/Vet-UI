import { useMutation, useQuery } from "@tanstack/react-query";
import { createMedicalHistory, getMedicalHistoryByPetId, MedicalHistoryRequest } from "../services/medical-record-services";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/components/ui/use-toast";

export const useMedicalRecord = (pet_id: number) => {
    return useQuery({
        queryKey: ['medical-record', pet_id],
        queryFn: () => getMedicalHistoryByPetId(pet_id),
        enabled: pet_id > 0,
        retry: 1,
    });
}

export const useCreateMedicalRecord = (pet_id: number) => {
    return useMutation({
        mutationFn: (medicalHistoryRequest: MedicalHistoryRequest) => createMedicalHistory(pet_id, medicalHistoryRequest),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medical-record', pet_id] });
            toast({
                title: "Success",
                description: "Medical record created successfully!",
                className: "bg-green-50 border-green-200 text-green-800",
              });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Medical record creation failed!",
                variant: "destructive",
            });
        },
    });
}