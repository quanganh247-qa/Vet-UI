import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/auth-context";
import { NotificationsProvider } from "@/context/notifications-context";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationsProvider>
        <App />
        <Toaster />
      </NotificationsProvider>
    </AuthProvider>
  </QueryClientProvider>
);
