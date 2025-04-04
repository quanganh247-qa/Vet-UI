import { useMutation, useQuery } from "@tanstack/react-query";
import { createShift, getDoctorProfile, getDoctors, getShifts } from "@/services/doctor-services";
import { queryClient } from "@/lib/queryClient";

export const useDoctors = () => {
    return useQuery({
        queryKey: ['doctors'],
        queryFn: getDoctors,
    });
};

export const useDoctorProfile = () => {
    return useQuery({
        queryKey: ['doctor-profile'],
        queryFn: getDoctorProfile,
    });
};

export const useDoctorShifts = () => {
    return useQuery({
        queryKey: ['doctor-shifts'],
        queryFn: getShifts,
    });
};


export const useCreateShift = () => {
    return useMutation({
        mutationFn: createShift,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-shifts'] });
        },
        onError: (error) => {
            console.error('Error creating shift:', error);
        },
    });
};


