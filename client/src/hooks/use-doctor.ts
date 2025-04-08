import { useMutation, useQuery } from "@tanstack/react-query";
import { createShift, deleteShift, getDoctorProfile, getDoctors, getShiftByDoctorId, getShifts, updateShift } from "@/services/doctor-services";
import { queryClient } from "@/lib/queryClient";
import { getAllStaff } from "@/services/staff-services";

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

export const useDoctorShiftsByDoctorId = (doctorId: number) => {
    return useQuery({
        queryKey: ['doctor-shifts', doctorId],
        queryFn: () => getShiftByDoctorId(doctorId),
        enabled: !!doctorId,
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

export const useUpdateShift = () => {
    return useMutation({
        mutationFn: ({ shiftId, data }: { shiftId: number, data: { start_time: Date; end_time: Date; doctor_id: number } }) => 
            updateShift(shiftId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-shifts'] });
        },
        onError: (error) => {
            console.error('Error updating shift:', error);
        },
    });
};

export const useDeleteShift = () => {
    return useMutation({
        mutationFn: deleteShift,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-shifts'] });
        },
        onError: (error) => {
            console.error('Error deleting shift:', error);
        },
    });
};



export const useAllStaff = () => {
    return useQuery({
        queryKey: ['all-staff'],
        queryFn: getAllStaff,
    });
};