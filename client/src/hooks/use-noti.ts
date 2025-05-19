import { useMutation } from "@tanstack/react-query";
import { sendNotification } from "@/services/noti-services";

// Define a type for the notification payload
type NotificationPayload = {
  userId: string;
  title: string;
  body: string;
};

export const useSendNotification = () => {
  return useMutation<any, Error, NotificationPayload>({
    mutationFn: ({ userId, title, body }) => sendNotification(userId, title, body),
  });
};
