import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShifts, getShiftByDoctorId, createShift, updateShift, deleteShift } from '@/services/doctor-services';
import { Shift, WorkShift } from '@/types';

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