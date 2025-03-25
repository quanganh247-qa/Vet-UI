import { useQuery } from "@tanstack/react-query";
import {
  getAllAppointments,
  getAppointmentById,
  getAppointmentsQueue,
  getHistoryAppointments,
} from "@/services/appointment-services";
import { getPatientById } from "@/services/pet-services";

export const useAppointmentData = (id: string | undefined) => {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => getAppointmentById(parseInt(id!)),
    enabled: !!id,
  });
};

export const useListAppointments = (date: Date, option: string) => {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: () => getAllAppointments(date, option),
  });
};

export const useListAppointmentsQueue = () => {
  return useQuery({
    queryKey: ["appointmentsQueue"],
    queryFn: () => getAppointmentsQueue(),
  });
};

export const useHistoryAppointments = (pet_id: number) => {
  return useQuery({
    queryKey: ["historyAppointments", pet_id],
    queryFn: () => getHistoryAppointments(pet_id),
    enabled: !!pet_id,
  });
};
