export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isReconnecting = false;
  private pendingMessages: Array<any> = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private serverAvailabilityChecked = false;
  private currentPath: string = '/ws/messages'; // Default WebSocket path

  constructor(private baseUrlResolver: () => string) {}

  // Get authentication token from local storage
  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  async checkServerAvailability(): Promise<boolean> {
    try {
      let wsUrl = this.baseUrlResolver();
      const url = wsUrl.replace(/^ws(s?):\/\//, 'http$1://');
      const healthUrl = url.split('/ws')[0] + '/health';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      this.serverAvailabilityChecked = true;
      return response.ok;
    } catch (error) {
      this.serverAvailabilityChecked = true;
      return false;
    }
  }

  async connect(path?: string): Promise<void> {
    if (path) {
      this.currentPath = path;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (!this.serverAvailabilityChecked) {
      const isAvailable = await this.checkServerAvailability();
      if (!isAvailable) {
        console.error('WebSocket server appears to be unavailable. Will retry later.');
      }
    }

    return new Promise((resolve, reject) => {
      try {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
          this.ws.close();
        }

        // Build the base URL
        let baseUrl = this.baseUrlResolver();
        const urlWithoutPath = baseUrl.split('/ws')[0];
        const normalizedPath = this.currentPath.startsWith('/') ? this.currentPath : `/${this.currentPath}`;
        
        // Get the authentication token
        const token = this.getAuthToken();
        
        // Add token to URL if available
        let url = `${urlWithoutPath}${normalizedPath}`;
        if (token) {
          // Add token as query parameter
          const separator = url.includes('?') ? '&' : '?';
          url = `${url}${separator}token=${encodeURIComponent(token)}`;
        }

        console.log(`Attempting WebSocket connection to: ${url.split('?')[0]} (with auth)`);

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connection established successfully');
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.notifyListeners('connect', { connected: true });

          if (this.pendingMessages.length > 0) {
            console.log(`Sending ${this.pendingMessages.length} pending messages`);
            this.pendingMessages.forEach((msg) => this.sendMessage(msg));
            this.pendingMessages = [];
          }

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (!this._hasLoggedFirstMessage) {
              console.log('First WebSocket message received:', message);
              this._hasLoggedFirstMessage = true;
            }
            this.notifyListeners(message.type || 'message', message.data || message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(`WebSocket disconnected with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
          this.logCloseCodeDetails(event.code);
          this.notifyListeners('disconnect', { connected: false, code: event.code, reason: event.reason });

          if (event.code !== 1000 && event.code !== 4001) {
            this.attemptReconnect();
          } else if (event.code === 4001) {
            this.notifyListeners('auth_error', { message: 'Authentication failed' });
          }
        };

        this.ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          console.log('Current WebSocket state:', this.getReadyStateDescription());
          this.notifyListeners('error', {
            error: event,
            readyState: this.ws?.readyState,
            readyStateDescription: this.getReadyStateDescription(),
          });
          reject(event);
        };

        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            const timeoutError = new Error('WebSocket connection timeout');
            console.error('WebSocket connection attempt timed out. This could indicate:');
            console.error('1. The server is not running on the expected host/port');
            console.error('2. A network issue is preventing the connection');
            console.error('3. CORS or firewall issues are blocking the WebSocket connection');
            console.error(`Attempted to connect to: ${url.split('?')[0]}`);
            this.notifyListeners('error', { error: timeoutError });
            reject(timeoutError);
          }
        }, 10000);

        this.ws.addEventListener('open', () => clearTimeout(connectionTimeout));
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        this.notifyListeners('error', { error });
        reject(error);
      }
    });
  }

  private _hasLoggedFirstMessage = false;

  private logCloseCodeDetails(code: number): void {
    switch (code) {
      case 1000:
        console.log('Normal closure - The connection successfully completed the purpose for which it was created.');
        break;
      case 1001:
        console.log('Going away - The endpoint is going away (e.g. server shutdown).');
        break;
      case 1002:
        console.log('Protocol error - The endpoint terminated the connection due to a protocol error.');
        break;
      case 1003:
        console.log('Unsupported data - The endpoint received data of a type it cannot accept.');
        break;
      case 1005:
        console.log('No status received - No status code was provided even though one was expected.');
        break;
      case 1006:
        console.log('Abnormal closure - The connection was closed abnormally (no close frame received).');
        console.log('This typically means the server is not responding or not available at the specified URL.');
        break;
      case 1007:
        console.log('Invalid frame payload data - The endpoint is terminating the connection because a message was received that contained inconsistent data.');
        break;
      case 1008:
        console.log('Policy violation - The endpoint is terminating the connection because it received a message that violates its policy.');
        break;
      case 1009:
        console.log('Message too big - The endpoint is terminating the connection because a data frame was received that is too large.');
        break;
      case 1010:
        console.log('Missing extension - The client is terminating the connection because it expected the server to negotiate one or more extensions, but the server didn\'t.');
        break;
      case 1011:
        console.log('Internal error - The server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.');
        break;
      case 1012:
        console.log('Service restart - The server is terminating the connection because it is restarting.');
        break;
      case 1013:
        console.log('Try again later - The server is terminating the connection due to a temporary condition.');
        break;
      case 1014:
        console.log('Bad gateway - The server was acting as a gateway or proxy and received an invalid response from the upstream server.');
        break;
      case 1015:
        console.log('TLS handshake failure - The connection was closed due to a failure to perform a TLS handshake.');
        break;
      case 4001:
        console.log('Authentication failed - The server rejected the authentication token.');
        break;
      default:
        console.log(`Unknown close code: ${code} - This could be a custom code from your server.`);
    }
  }

  private getReadyStateDescription(): string {
    if (!this.ws) {
      return 'No WebSocket instance exists (null)';
    }

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING (0): The connection is not yet open.';
      case WebSocket.OPEN:
        return 'OPEN (1): The connection is open and ready to communicate.';
      case WebSocket.CLOSING:
        return 'CLOSING (2): The connection is in the process of closing.';
      case WebSocket.CLOSED:
        return 'CLOSED (3): The connection is closed or couldn\'t be opened.';
      default:
        return `Unknown readyState: ${this.ws.readyState}`;
    }
  }

  private attemptReconnect(): void {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Maximum reconnect attempts reached. Giving up.');
        this.notifyListeners('reconnect_failed', { attempts: this.reconnectAttempts });
      }
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    this.notifyListeners('reconnecting', { attempt: this.reconnectAttempts, max: this.maxReconnectAttempts });

    const timeout = this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts - 1);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        this.isReconnecting = false;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      });
    }, timeout);
  }

  subscribe<T>(type: string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)?.add(callback);

    return () => {
      const callbacks = this.listeners.get(type);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  private notifyListeners(type: string, data: any): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for type '${type}':`, error);
        }
      });
    }
  }

  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.pendingMessages.push(message);
      }
    } else {
      console.warn('WebSocket is not connected. Message queued for later delivery.');
      this.pendingMessages.push(message);

      if (!this.isReconnecting && (!this.ws || this.ws.readyState !== WebSocket.CONNECTING)) {
        this.connect().catch((err) => {
          console.error('Failed to reconnect when sending message:', err);
        });
      }
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }

    this.pendingMessages = [];
    this.listeners.clear();
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }
}

export const websocketService = new WebSocketService(() => {
  const apiBaseUrl = getWebSocketUrl();
  return apiBaseUrl;
});

function getWebSocketUrl(): string {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  if (typeof window !== 'undefined') {
    const isSecure = window.location.protocol === 'https:';
    const protocol = isSecure ? 'wss:' : 'ws:';
    const host = window.location.host;

    if (import.meta.env.DEV) {
      return 'ws://localhost:8088/ws/messages';
    }

    return `${protocol}//${host}/ws/messages`;
  }

  console.warn('Could not determine WebSocket URL, using default');
  return 'ws://localhost:8088/ws/messages';
}

export const useWebSocketSubscription = <T>(type: string, callback: (data: T) => void) => {
  return websocketService.subscribe<T>(type, callback);
};