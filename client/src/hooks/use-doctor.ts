import { useMutation, useQuery } from "@tanstack/react-query";
import { addNewStaff, createShift, CreateStaffRequest, deleteShift, editDoctorProfile, EditDoctorProfileRequest, getDoctorProfile, getDoctors, getDoctorById, getShiftByDoctorId, getShifts, updateShift, updatePassword, UpdatePasswordParams, updateUserAvatar, updateUser, UpdateUserParams } from "@/services/doctor-services"; // Added updateUserAvatar, updateUser, UpdateUserParams
import { queryClient } from "@/lib/queryClient";
import { getAllStaff } from "@/services/staff-services";
import { toast } from "./use-toast";

export const useDoctors = () => {
    return useQuery({
        queryKey: ['doctors'],
        queryFn: getDoctors,
    });
};

export const useDoctorProfile = (id?: number) => {
    return useQuery({
        queryKey: ['doctor-profile', id],
        queryFn: () => id ? getDoctorById(id) : getDoctorProfile(),
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

export const useEditDoctorProfile = () => {
    return useMutation({
        mutationFn: (data: EditDoctorProfileRequest) => editDoctorProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
            toast({
                title: "Success",
                description: "Profile updated successfully!",
                className: "bg-green-50 border-green-200 text-green-800",
            });
        },
        onError: (error) => {
            console.error('Error editing doctor profile:', error);
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive",
            });
        },
    });
};

export const useAllStaff = () => {
    return useQuery({
        queryKey: ['all-staff'],
        queryFn: getAllStaff,
    });
};

export const useAddNewStaff = () => {
    return useMutation({
        mutationFn: (data: CreateStaffRequest) => addNewStaff(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-staff'] });
            toast({
                title: "Success",
                description: "Staff added successfully!",
                className: "bg-green-50 border-green-200 text-green-800",
              });
        },
        onError: (error) => {
            console.error('Error adding new staff:', error);
            toast({
                title: "Error",
                description: "Failed to add staff",
                variant: "destructive",
            });
        },
    });
};

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: (data: UpdatePasswordParams) => updatePassword(data),
        onSuccess: () => {
            // Optionally invalidate queries if password change affects other data
            // queryClient.invalidateQueries({ queryKey: ['some-key'] });
            toast({
                title: "Success",
                description: "Password updated successfully!",
                className: "bg-green-50 border-green-200 text-green-800",
            });
        },
        onError: (error) => {
            console.error('Error updating password:', error);
            toast({
                title: "Error",
                description: "Failed to update password",
                variant: "destructive",
            });
        },
    });
};

export const useUpdateUserAvatar = () => {
    return useMutation({
        mutationFn: (data: FormData) => updateUserAvatar(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
            toast({
                title: "Success",
                description: "Avatar updated successfully!",
                className: "bg-green-50 border-green-200 text-green-800",
            });
        },
        onError: (error) => {
            console.error('Error updating avatar:', error);
            toast({
                title: "Error",
                description: "Failed to update avatar",
                variant: "destructive",
            });
        },
    });
};

export const useUpdateUser = () => {
    return useMutation({
        mutationFn: (data: UpdateUserParams) => updateUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
            toast({
                title: "Success",
                description: "User profile updated successfully!",
                className: "bg-green-50 border-green-200 text-green-800",
            });
        },
        onError: (error) => {
            console.error('Error updating user profile:', error);
            toast({
                title: "Error",
                description: "Failed to update user profile",
                variant: "destructive",
            });
        },
    });
};

