import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shift, WorkShift } from '@/types';
import { getShiftByDoctorId, getShifts, createShift, updateShift, deleteShift } from '@/services/shiftService';
import { queryClient } from '@/lib/queryClient';

export const useShifts = (doctorId?: number) => {
  return useQuery<Shift[]>({
    queryKey: ['shifts', doctorId],
    queryFn: async () => {
      try {
        const data = doctorId ? await getShiftByDoctorId(doctorId) : await getShifts();
        console.log(data.data)
        return data?.data?.map((shift:WorkShift) => ({
          ...shift,
          start_time: new Date(shift.start_time),
          end_time: new Date(shift.end_time),
          created_at: new Date(shift.created_at)
        }));
      } catch (error) {
        console.error('Error fetching shifts:', error);
        return [];
      }
    }
  });
};

export const useShiftMutations = () => {
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: createShift,
    onSuccess: () => {
      // Invalidate and refetch all shifts queries to show new data immediately
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['all-shifts'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { start_time: Date; end_time: Date; doctor_id: number } }) => 
      updateShift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['all-shifts'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['all-shifts'] });
    }
  });

  return { createMutation, updateMutation, deleteMutation };
};

// Fixed implementation of useGetAllShifts
export const useGetAllShifts = () => {
  return useQuery<WorkShift[]>({
    queryKey: ['all-shifts'],
    queryFn: async () => {
      try {
        const response = await getShifts();
        return response?.data?.map((shift: any) => ({
          ...shift,
          start_time: new Date(shift.start_time),
          end_time: new Date(shift.end_time),
          created_at: new Date(shift.created_at)
        })) || [];
      } catch (error) {
        console.error('Error fetching all shifts:', error);
        return [];
      }
    }
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