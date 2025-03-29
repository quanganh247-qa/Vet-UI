export const config = {
  apiUrl: import.meta.env?.VITE_API_URL || 'http://localhost:8080/api', // Thay đổi theo URL của backend
  wsUrl: import.meta.env?.VITE_WS_URL || 'ws://localhost:8080/ws', // URL cho WebSocket
}; 