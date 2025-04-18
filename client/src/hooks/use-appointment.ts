import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AppointmentRequest,
  confirmAppointment,
  ConfirmAppointmentResponse,
  createWalkInAppointment,
  getAllAppointments,
  getAppointmentAnalytics,
  getAppointmentById,
  getAppointmentsQueue,
  getHistoryAppointments,
  markMessageDelivered,
  updateAppointmentById,
} from "@/services/appointment-services";
import { getPatientById } from "@/services/pet-services";
import { toast } from "@/components/ui/use-toast";

export const useAppointmentData = (id: string | undefined) => {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => getAppointmentById(parseInt(id!)),
    enabled: !!id,
  });
};

export const useListAppointments = (
  date: Date,
  option: string,
  page: number = 1,
  pageSize: number = 10
) => {
  return useQuery({
    queryKey: [
      "appointments",
      date.toISOString().split("T")[0],
      option,
      page,
      pageSize,
    ],
    queryFn: () => getAllAppointments(date, option, page, pageSize),
  });
};

export const useListAppointmentsQueue = () => {
  return useQuery({
    queryKey: ["appointmentsQueue"],
    queryFn: async () => {
      try {
        const data = await getAppointmentsQueue();
        return data;
      } catch (error) {
        console.error("Error in useListAppointmentsQueue:", error);
        return [];
      }
    },
    // refetchOnWindowFocus: false,
  });
};

export const useHistoryAppointments = (pet_id: number) => {
  return useQuery({
    queryKey: ["historyAppointments", pet_id],
    queryFn: () => getHistoryAppointments(pet_id),
    enabled: !!pet_id,
  });
};

export const useUpdateAppointmentStatus = (
  id: number,
  updateData: {
    payment_status?: string;
    state_id?: number;
    room_id?: number;
    notes?: string;
    appointment_reason?: string;
    reminder_send?: boolean;
    arrival_time?: string;
  }
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => updateAppointmentById(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointmentsQueue"] });
    },
    onError: (error) => {
      console.error("Error in useUpdateAppointmentStatus:", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["appointmentsQueue"] });
    },
  });
};

export const useAppointmentAnalytics = (payload: {
  start_date: string;
  end_date: string;
}) => {
  return useQuery({
    queryKey: ["appointmentAnalytics"],
    queryFn: () => getAppointmentAnalytics(payload),
  });
};

export const useCreateWalkInAppointment = (): UseMutationResult<
  any, // response type
  Error, // error type
  AppointmentRequest // variables type
> => {
  return useMutation({
    mutationFn: createWalkInAppointment,
  });
};

// --- Hook useMutation ---
export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ConfirmAppointmentResponse,
    Error,
    number
  >({
    mutationFn: confirmAppointment,
    onSuccess: (data, variables) => {
      toast({
        title: "Appointment Confirmed",
        description: data.message || "Appointment Confirmed",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error, variables) => {
      toast({
        title: "Confirmation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useMarkMessageDelivered = () => {
  return useMutation({
    mutationFn: (id: number) => markMessageDelivered(id),
    onSuccess: () => {
      toast({
        title: "Message Delivered",
        description: "The message has been delivered successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error) => {
      toast({
        title: "Delivery Failed",
        description: "Unable to deliver the message. Please try again.",
        variant: "destructive",
      });
    },
  });
};
