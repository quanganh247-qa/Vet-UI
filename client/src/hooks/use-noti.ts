import { useMutation } from "@tanstack/react-query";
import { scheduleNotification, sendNotification } from "@/services/noti-services";

// Define a type for the notification payload
type NotificationPayload = {
  user_id: string;
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

