import { useMutation, useQuery } from "@tanstack/react-query";
import { createSOAP, getSOAP, updateSOAP } from "@/services/soap-services";

// React Query mutation hook
export const useCreateSOAP = () => {
    return useMutation({
        mutationFn: ({ appointmentID, subjective }: { appointmentID: string; subjective: string }) => 
            createSOAP(appointmentID, subjective),
        onSuccess: (subjective) => {
            console.log('SOAP note created successfully:', subjective);
        },
        onError: (error) => {
            console.error('Error creating SOAP note:', error);
        }
    });
};

export const useGetSOAP = (appointmentID: string) => {
    return useQuery({
        queryKey: ['soap', appointmentID],
        queryFn: () => getSOAP(appointmentID),
        enabled: !!appointmentID,
    });
};

export const useUpdateSOAP = () => {
    return useMutation({
        mutationFn: ({ appointmentID, subjective, objective, assessment }: { appointmentID: string; subjective: string; objective: string; assessment: string }) =>
            updateSOAP(appointmentID, subjective, objective, assessment),
        onSuccess: () => {
            console.log('SOAP note updated successfully');
        },
        onError: (error) => {
            console.error('Error updating SOAP note:', error);
        }
    });
};

