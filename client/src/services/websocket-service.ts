// We'll use a simpler token function directly in this file
// instead of importing from auth.ts to avoid circular dependencies

/**
 * Gets the user's authentication token from localStorage
 */
function getUserToken(): string | null {
  return localStorage.getItem('access_token');
}


export enum WebSocketStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Error = 'error'
}

interface WebSocketMessage {
  type: string;
  data?: any;
}

interface MessageStore {
  storeMessage: (clientId: string, username: string, messageType: string, message: any) => Promise<void>;
  getStoredMessages: (clientId: string) => Promise<any[]>;
  clearStoredMessages: (clientId: string) => Promise<void>;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private status: WebSocketStatus = WebSocketStatus.Disconnected;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10; // Increased from 5 to 10
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private statusListeners: ((status: WebSocketStatus) => void)[] = [];
  private messageListeners: Map<string, ((data: any) => void)[]> = new Map();
  private lastConnectionError: Error | null = null;
  public MessageStore: MessageStore;

  constructor() {
    this.MessageStore = {
      storeMessage: async (clientId, username, messageType, message) => {
        // In a real app, we'd store this in a database or localStorage
        console.log(`Storing message for ${clientId}:`, message);
        // For now, just queue it
        this.messageQueue.push({
          type: messageType,
          data: message
        });
        return Promise.resolve();
      },
      getStoredMessages: async (clientId) => {
        // In a real app, we'd fetch from storage
        return Promise.resolve([]);
      },
      clearStoredMessages: async (clientId) => {
        // In a real app, we'd clear from storage
        return Promise.resolve();
      }
    };
  }

  public connect(): Promise<WebSocketStatus> {
    return new Promise((resolve, reject) => {
      // If already connected or connecting, don't try to connect again
      if (this.status === WebSocketStatus.Connected) {
        console.log("WebSocket already connected, reusing connection");
        resolve(WebSocketStatus.Connected);
        return;
      }

      if (this.status === WebSocketStatus.Connecting) {
        // Wait for connection to complete
        const checkInterval = setInterval(() => {
          if (this.status === WebSocketStatus.Connected) {
            clearInterval(checkInterval);
            resolve(WebSocketStatus.Connected);
          } else if (this.status === WebSocketStatus.Error || this.status === WebSocketStatus.Disconnected) {
            clearInterval(checkInterval);
            reject(this.lastConnectionError || new Error("WebSocket connection failed"));
          }
        }, 100);
        return;
      }

      this.setStatus(WebSocketStatus.Connecting);

      const token = getUserToken();
      if (!token) {
        const error = new Error("No auth token available");
        this.lastConnectionError = error;
        this.setStatus(WebSocketStatus.Error);
        reject(error);
        return;
      }

      try {
        // Get server URL with proper protocol and port
        const wsUrl = this.getWebSocketUrl(token);

        // Create new WebSocket connection
        this.socket = new WebSocket(wsUrl);

        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.status !== WebSocketStatus.Connected) {
            const error = new Error("WebSocket connection timeout");
            this.lastConnectionError = error;
            this.setStatus(WebSocketStatus.Error);
            
            // Close socket if it exists
            if (this.socket) {
              this.socket.close();
              this.socket = null;
            }
            
            reject(error);
          }
        }, 10000); // 10 second timeout

        this.socket.onopen = () => {
          clearTimeout(connectionTimeout);
          this.setStatus(WebSocketStatus.Connected);
          this.reconnectAttempts = 0;
          this.lastConnectionError = null;
          console.log("WebSocket connected successfully");
          
          // Process any queued messages
          this.processQueue();
          
          resolve(WebSocketStatus.Connected);
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleIncomingMessage(message);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error, "Raw data:", event.data);
          }
        };

        this.socket.onclose = (event) => {
          clearTimeout(connectionTimeout);
          this.setStatus(WebSocketStatus.Disconnected);
          console.log(`WebSocket disconnected: code=${event.code}, reason=${event.reason || "No reason provided"}, wasClean=${event.wasClean}`);
          
          // Attempt to reconnect unless this was a clean close
          if (!event.wasClean) {
            this.attemptReconnect();
          }
        };

        this.socket.onerror = (event) => {
          const error = new Error(`WebSocket error: ${event.type}`);
          this.lastConnectionError = error;
          this.setStatus(WebSocketStatus.Error);
          console.error("WebSocket error:", event);
          
          // Don't reject here, let onclose handle the reconnection
          // The socket will move to closed state after an error
        };
      } catch (error) {
        this.lastConnectionError = error instanceof Error ? error : new Error(String(error));
        this.setStatus(WebSocketStatus.Error);
        console.error("Error creating WebSocket:", error);
        reject(error);
      }
    });
  }

  /**
   * Constructs a proper WebSocket URL with authentication token
   */
  private getWebSocketUrl(token: string): string {
    // Use secure WebSocket if on HTTPS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Determine host based on environment
    let host = window.location.host; // Default to current host
    
    // For local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      host = 'localhost:8088';
    }
    
    // Construct and return the full URL
    return `${protocol}//${host}/api/v1/ws/chat`;
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`Max reconnect attempts (${this.maxReconnectAttempts}) reached, giving up`);
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000); // Using 1.5 as base for smoother backoff
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Executing reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      this.connect().then(() => {
        console.log(`Reconnect attempt ${this.reconnectAttempts} successful`);
      }).catch(error => {
        console.error(`Reconnect attempt ${this.reconnectAttempts} failed:`, error);
        // Will try again on the next cycle if needed
      });
    }, delay);
  }

  private handleIncomingMessage(message: any) {
    if (!message) {
      console.error("Received empty message");
      return;
    }

    // Try to extract message type, handling different possible formats
    let messageType: string | undefined;
    let messageData: any = message;

    // Handle different message formats
    // Format 1: { type: "some_type", ...otherData }
    if (message.type) {
      messageType = message.type;
    }
    // Format 2: { type: "some_type", data: {...actualData} }
    else if (message.type && message.data) {
      messageType = message.type;
      messageData = message.data;
    }
    // Format 3: { event: "some_event", data: {...} }
    else if (message.event) {
      messageType = message.event;
      messageData = message.data || message;
    }

    if (!messageType) {
      console.error("Invalid message format - no type or event property:", message);
      return;
    }

    // Get listeners for this message type
    const listeners = this.messageListeners.get(messageType) || [];
    
    if (listeners.length === 0) {
      console.log(`No listeners for message type: ${messageType} (data:`, messageData, ")");
    } else {
      // Debug log for received messages
      console.log(`Received message of type: ${messageType}`, messageData);
      
      // Call all listeners with the message data
      listeners.forEach(listener => {
        try {
          listener(messageData);
        } catch (error) {
          console.error(`Error in message listener for ${messageType}:`, error);
        }
      });
    }
  }

  public disconnect() {
    if (this.socket && (this.status === WebSocketStatus.Connected || this.status === WebSocketStatus.Connecting)) {
      console.log("Manually disconnecting WebSocket");
      this.socket.close(1000, "User initiated disconnect"); // 1000 = normal closure
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      console.log("Clearing reconnect timeout");
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.setStatus(WebSocketStatus.Disconnected);
  }

  public sendMessage(message: any): boolean {
    // Ensure message has a type
    if (!message.type) {
      console.error("Message must have a type");
      return false;
    }

    // If not connected, queue message
    if (this.status !== WebSocketStatus.Connected) {
      console.warn("WebSocket is not connected. Message queued for later delivery. Current status:", this.status);
      this.messageQueue.push({
        type: message.type,
        data: message
      });
      
      // Try to reconnect if disconnected
      if (this.status === WebSocketStatus.Disconnected || this.status === WebSocketStatus.Error) {
        console.log("Attempting to reconnect before sending message");
        this.connect().catch(error => {
          console.error("Failed to reconnect WebSocket:", error);
        });
      }
      
      return false;
    }

    try {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const messageStr = JSON.stringify(message);
        this.socket.send(messageStr);
        // Debug log for sent messages
        console.log(`Sent message of type: ${message.type}`, message);
        return true;
      } else {
        console.warn("Socket not in OPEN state, cannot send message. Current state:", this.socket?.readyState);
        this.messageQueue.push({
          type: message.type,
          data: message
        });
        return false;
      }
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
      this.messageQueue.push({
        type: message.type,
        data: message
      });
      return false;
    }
  }

  private processQueue() {
    if (this.status !== WebSocketStatus.Connected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log("Cannot process queue: WebSocket not ready", {
        status: this.status,
        readyState: this.socket?.readyState
      });
      return;
    }

    const queueLength = this.messageQueue.length;
    if (queueLength > 0) {
      console.log(`Processing message queue: ${queueLength} messages`);
    }

    // Process any queued messages
    while (this.messageQueue.length > 0) {
      const queuedMessage = this.messageQueue.shift();
      if (queuedMessage) {
        try {
          const messageStr = JSON.stringify(queuedMessage.data || queuedMessage);
          this.socket.send(messageStr);
          console.log("Sent queued message:", queuedMessage.type);
        } catch (error) {
          console.error("Error sending queued message:", error);
          // Put the message back in the queue for retry
          this.messageQueue.unshift(queuedMessage);
          break;
        }
      }
    }
  }

  public subscribe(messageType: string, callback: (data: any) => void): () => void {
    if (!this.messageListeners.has(messageType)) {
      this.messageListeners.set(messageType, []);
    }

    const listeners = this.messageListeners.get(messageType)!;
    listeners.push(callback);

    console.log(`Added listener for message type: ${messageType}, total listeners: ${listeners.length}`);

    // Return a function to unsubscribe
    return () => {
      const listenersArray = this.messageListeners.get(messageType) || [];
      const index = listenersArray.indexOf(callback);
      if (index !== -1) {
        listenersArray.splice(index, 1);
        console.log(`Removed listener for message type: ${messageType}, remaining listeners: ${listenersArray.length}`);
      }
    };
  }

  public onStatusChange(callback: (status: WebSocketStatus) => void): () => void {
    this.statusListeners.push(callback);

    // Call immediately with current status
    try {
      callback(this.status);
    } catch (error) {
      console.error("Error in status listener on initialization:", error);
    }

    // Return a function to unregister the listener
    return () => {
      const index = this.statusListeners.indexOf(callback);
      if (index !== -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  private setStatus(status: WebSocketStatus) {
    if (this.status !== status) {
      console.log(`WebSocket status changed: ${this.status} -> ${status}`);
      this.status = status;
      this.statusListeners.forEach(listener => {
        try {
          listener(status);
        } catch (error) {
          console.error("Error in status listener:", error);
        }
      });
    }
  }

  public isConnected(): boolean {
    return this.status === WebSocketStatus.Connected && 
           this.socket !== null && 
           this.socket.readyState === WebSocket.OPEN;
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  public getLastError(): Error | null {
    return this.lastConnectionError;
  }

  public resetConnection(): Promise<WebSocketStatus> {
    console.log("Resetting WebSocket connection");
    this.disconnect();
    this.reconnectAttempts = 0;
    return this.connect();
  }
}

// Singleton instance of the WebSocketService
export const websocketService = new WebSocketService();