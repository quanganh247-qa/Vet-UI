import { useMutation } from "@tanstack/react-query";
import { scheduleAppointment, scheduleNotification, sendNotification } from "@/services/noti-services";

// Define a type for the notification payload
type NotificationPayload = {
  user_id: number;
  title: string;
  body: string;
};

export const useSendNotification = () => {
  return useMutation<any, Error, NotificationPayload>({
    mutationFn: ({ user_id, title, body }) => sendNotification(user_id, title, body),
  });
};

type ScheduleNotificationPayload = NotificationPayload & {
  cronExpression: string;
  schedule_id: string;
  end_date: string;
};

export const useScheduleNotification = () => {
  return useMutation<any, Error, ScheduleNotificationPayload>({
    mutationFn: ({ user_id, title, body, cronExpression, schedule_id, end_date }) => scheduleNotification(user_id, title, body, cronExpression, schedule_id, end_date),
  });
};


type ScheduleAppointmentPayload = {
  user_id: number;
  appointment_id: string;
  pet_name: string;
  date: string;
  start_time: string;
  reason: string;
  doctor_name: string;
  service_name: string;
};

export const useScheduleAppointment = () => {
  return useMutation<any, Error, ScheduleAppointmentPayload>({
    mutationFn: ({ user_id, appointment_id, pet_name, date, start_time, reason, doctor_name, service_name }) => scheduleAppointment(user_id, appointment_id, pet_name, date, start_time, reason, doctor_name, service_name),
  });
};