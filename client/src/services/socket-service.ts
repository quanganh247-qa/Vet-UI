import { config } from "@/config/api";

interface TestResultData {
  testId: number;
  appointmentId: number;
  testType: string;
  status: string;
  petId: number;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  id?: string;
  patientId?: string;
  message?: string;
}

let socket: WebSocket | null = null;
const listeners: Map<string, Set<Function>> = new Map();
let clientId: string = "";

// Initialize socket connection
export const initializeSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) return socket;

  const token = localStorage.getItem("access_token");
  if (!token) return null;

  // Generate a client ID - use doctor ID if available or generate a unique ID
  try {
    // Attempt to extract userId from token
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    clientId = tokenData.userId || tokenData.id || `user_${Date.now()}`;
  } catch (e) {
    clientId = `user_${Date.now()}`;
  }

  // Use wsUrl from config or fallback to WebSocket URL with the correct port (8088)
  //   const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  //   const host = window.location.hostname;
  //   const wsBaseUrl = config.wsUrl || `${protocol}//${host}:8088/ws`;

  const wsBaseUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8088/ws";
  const wsUrlWithParams = `${wsBaseUrl}?clientId=${clientId}`;

  try {
    console.log(`Connecting to WebSocket at: ${wsUrlWithParams}`);
    socket = new WebSocket(wsUrlWithParams);

    socket.onopen = () => {
      console.log("WebSocket connected successfully");
      notifyListeners("connect", { connected: true });
    };

    socket.onclose = (event) => {
      console.log(
        `WebSocket disconnected with code: ${event.code}, reason: ${event.reason}`
      );
      notifyListeners("disconnect", { connected: false });

      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          initializeSocket();
        }
      }, 5000);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      notifyListeners("error", { error });
    };

    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log("Received WebSocket message:", message);

        // Handle different message types
        if (message.type === "connected") {
          console.log("Connection established:", message.message);
        } else if (message.type === "notification") {
          handleNotification(message.data);
        } else if (message.type === "testResultReady") {
          notifyListeners("testResultReady", message.data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error, event.data);
      }
    };
  } catch (error) {
    console.error("Failed to establish WebSocket connection:", error);
  }

  return socket;
};

// Notify all listeners of a specific event
const notifyListeners = (event: string, data: any) => {
  if (listeners.has(event)) {
    listeners.get(event)?.forEach((listener) => listener(data));
  }
};

// Handle notification messages
const handleNotification = (notification: any) => {
  // Check for test result notifications
  if (notification.type === "test_result") {
    notifyListeners("testResultReady", {
      testId: parseInt(notification.entityId),
      appointmentId: parseInt(notification.appointmentId),
      testType: notification.title,
      status: "Completed",
      petId: parseInt(notification.petId),
    });
  }
};

// Add event listener
export const addSocketListener = (event: string, callback: Function) => {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event)?.add(callback);
};

// Remove event listener
export const removeSocketListener = (event: string, callback: Function) => {
  if (listeners.has(event)) {
    listeners.get(event)?.delete(callback);
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

// Reconnect socket
export const reconnectSocket = () => {
  if (socket && socket.readyState === WebSocket.CLOSED) {
    initializeSocket();
  } else if (!socket) {
    initializeSocket();
  }
};

// Send a message to the server
export const sendMessage = (message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket is not connected");
  }
};

// Check connection status
export const isConnected = () => {
  return socket && socket.readyState === WebSocket.OPEN;
};
