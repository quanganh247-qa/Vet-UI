export const config = {
  apiUrl: import.meta.env?.VITE_API_URL || 'http://localhost:8088', // Thay đổi theo URL của backend
  wsUrl: import.meta.env?.VITE_WS_URL || 'ws://localhost:8088/ws', // URL cho WebSocket
}; 