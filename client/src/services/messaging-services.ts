import api from "@/lib/api";
import { config } from "@/config/api";
import { useQuery } from "@tanstack/react-query";
import { websocketService } from "./websocket-service";

// ChatMessageType defines the types of messages that can be exchanged
export type ChatMessageType = 'text' | 'image' | 'file';

// ConversationType defines the types of conversations 
export type ConversationType = 'private' | 'group';

// WebSocketChatMessage represents a chat message sent over WebSocket
export interface WebSocketChatMessage {
  type: string;           // "chat_message"
  action: string;         // "new", "read", etc.
  messageId: number;      // Set for existing messages
  conversationId: number; // The conversation this message belongs to
  senderId: number;       // User ID of sender
  content: string;        // Message content
  messageType: ChatMessageType;    // text, image, file  
  metadata?: any;       // Additional data
  createdAt: Date;      // When the message was created
  senderUsername: string; // Username of the sender
  senderName: string;     // Full name of the sender
}

// ConversationResponse represents a conversation in the API
export interface ConversationResponse {
  id: number;
  type: ConversationType;
  name?: string;
  participants: ParticipantResponse[];
  lastMessage?: MessageResponse;
  createdAt: Date;
  updatedAt: Date;
  unreadCount: number;
}

// MessageResponse represents a message in the API
export interface MessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  messageType: ChatMessageType;
  metadata?: any;
  createdAt: Date;
  senderUsername: string;
  senderName: string;
  read: boolean;
}

// ParticipantResponse represents a conversation participant in the API
export interface ParticipantResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  joinedAt: Date;
}

// CreateConversationRequest represents a request to create a new conversation
export interface CreateConversationRequest {
  type: 'private' | 'group';
  participantIds: number[];
  name?: string;
}

// SendMessageRequest represents a request to send a new message
export interface SendMessageRequest {
  conversationId: number;
  content: string;
  messageType: ChatMessageType;
  metadata?: any;
}

// ReadMessageRequest represents a request to mark messages as read
export interface ReadMessageRequest {
  messageIds: number[];
}

// AddParticipantsRequest represents a request to add participants to a conversation
export interface AddParticipantsRequest {
  participantIds: number[];
}

// Lấy danh sách tất cả cuộc trò chuyện của người dùng hiện tại
export const getUserConversations = async () => {
  try {
    const response = await api.get('/api/v1/messages/conversations');

    // If the response.data is already an array, return it directly
    if (Array.isArray(response.data)) {
      console.log('Response data is an array, returning directly');
      return response.data;
    }

    // If the response has a data property that's an array, return that
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

// Lấy tin nhắn của một cuộc trò chuyện cụ thể
export const getConversationMessages = async (conversationId: string): Promise<MessageResponse[]> => {
  try {
    const response = await api.get<MessageResponse[]>(`/api/v1/messages/conversations/${conversationId}/messages`);
    
    // Check if response.data is already the array we need
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Check if response has a data property that's an array
    if (response.data && Array.isArray((response.data as any).data)) {
      return (response.data as any).data;
    }
    
    // Default to empty array if no valid data format is found
    return [];
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
};

// Lấy thông tin chi tiết của một cuộc trò chuyện
export const getConversationDetails = async (conversationId: string) => {
  try {
    const response = await api.get(`/api/v1/messages/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    throw error;
  }
};

// Gửi tin nhắn mới
export const sendMessage = async (content: string, conversationId: string) => {
  try {
    // Make sure the content is in a valid format
    let messageContent = content;
    let messageType: ChatMessageType = 'text';
    let metadata = undefined;
    
    // Check if content is a JSON string and extract appropriate values
    try {
      const parsedContent = JSON.parse(content);
      
      // Handle standard message format with text
      if (parsedContent.text !== undefined) {
        messageContent = parsedContent.text;
      }
      
      // Handle metadata if present
      if (parsedContent.metadata) {
        metadata = parsedContent.metadata;
      }
      
      // If there are attachments, treat as appropriate type
      if (parsedContent.attachments && parsedContent.attachments.length > 0) {
        const attachment = parsedContent.attachments[0];
        if (attachment.type === 'image') {
          messageType = 'image';
        } else {
          messageType = 'file';
        }

        // For messages with attachments, add metadata
        metadata = {
          ...(metadata || {}),
          attachments: parsedContent.attachments
        };
      }
    } catch (e) {
      // If not valid JSON, use content as is
      messageContent = content;
    }
    
    // Prepare the request payload following the expected server format
    const messagePayload = {
      conversationId: Number(conversationId),
      content: messageContent,
      messageType: messageType,
      metadata: metadata
    };
    
    const response = await api.post(`/api/v1/messages/messages`, messagePayload);

    // Send a WebSocket message to notify other users
    websocketService.sendMessage({
      type: 'chat_message',
      action: 'send',
      messageId: response.data.id,
      conversationId: Number(conversationId),
      senderId: response.data.senderId,
      content: messageContent,
      messageType: messageType,
      metadata: metadata,
      createdAt: new Date(),
      senderUsername: response.data.senderUsername,
      senderName: response.data.senderName
    });

    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Tạo cuộc trò chuyện mới (1-1 hoặc nhóm)
export const createConversation = async (request: CreateConversationRequest) => {
  try {
    const response = await api.post('/api/v1/messages/conversations', {
      type: request.type,
      name: request.name,
      participantIds: request.participantIds
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

// Đánh dấu các tin nhắn là đã đọc
export const markMessagesAsRead = async (messageIds: number[], conversationId: number) => {
  try {
    // Format payload according to backend expectation
    const payload: ReadMessageRequest = {
      messageIds
    };
    
    const response = await api.post('/api/v1/messages/messages/read', payload);
    
    // Only send WebSocket notifications if the API call succeeded
    if (response && response.data) {
      // Also send WebSocket notification to update read status in real-time
      messageIds.forEach(messageId => {
        // Check if the WebSocket is connected before sending
        if (websocketService.isConnected()) {
          sendReadReceipt(messageId, conversationId);
        }
      });
    }
    
    return response.data;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Thêm người tham gia vào cuộc trò chuyện nhóm
export const addParticipantsToConversation = async (conversationId: string, participantIds: number[]) => {
  try {
    const response = await api.post(`/api/v1/messages/conversations/${conversationId}/participants`, {
      participantIds
    });
    return response.data;
  } catch (error) {
    console.error("Error adding participants to conversation:", error);
    throw error;
  }
};

// Xóa người tham gia khỏi cuộc trò chuyện nhóm
export const removeParticipantFromConversation = async (conversationId: string, userId: number) => {
  try {
    const response = await api.delete(`/api/v1/messages/conversations/${conversationId}/participants/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing participant from conversation:", error);
    throw error;
  }
};

// Rời khỏi cuộc trò chuyện
export const leaveConversation = async (conversationId: string) => {
  try {
    const response = await api.delete(`/api/v1/messages/conversations/${conversationId}/leave`);
    return response.data;
  } catch (error) {
    console.error("Error leaving conversation:", error);
    throw error;
  }
};

// Lấy danh sách nhân viên
export const getStaffList = async () => {
  try {
    const response = await api.get('/api/v1/doctors');
    return response.data;
  } catch (error) {
    console.error("Error fetching staff list:", error);
    throw error;
  }
};

export enum WebSocketStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Error = 'error'
}

export interface Participant {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  joinedAt: string;
}

export interface Message {
  id: string | number;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  createdAt: string;
  messageType: string;
  isOptimistic?: boolean;
  error?: boolean;
}

// Enhanced WebSocket connection with reconnection logic and token authentication
export const connectToMessagingWebSocket = async (): Promise<WebSocketStatus> => {
  try {
    console.log("Connecting to messaging WebSocket with authentication...");
    await websocketService.connect('/ws/messages');
    console.log("WebSocket connection established successfully");
    return WebSocketStatus.Connected;
  } catch (error) {
    console.error("WebSocket connection failed:", error);
    return WebSocketStatus.Error;
  }
};

// Enhanced typing status with timeout
export const sendTypingStatus = (() => {
  let typingTimeout: NodeJS.Timeout | null = null;
  
  return (conversationId: number, isTyping: boolean) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    websocketService.sendMessage({
      type: 'typing',
      conversationId: conversationId,
      isTyping: isTyping
    });
    
    // Automatically clear typing status after 3 seconds
    if (isTyping) {
      typingTimeout = setTimeout(() => {
        websocketService.sendMessage({
          type: 'typing',
          conversationId: conversationId,
          isTyping: false
        });
        typingTimeout = null;
      }, 3000);
    }
  };
})();

// Send a message via WebSocket
export const sendWebSocketMessage = (message: WebSocketChatMessage) => {
  websocketService.sendMessage(message);
};

// Send read receipt for messages
export const sendReadReceipt = (messageId: number, conversationId: number) => {
  websocketService.sendMessage({
    type: 'read_receipt',
    messageId: messageId,
    conversationId: conversationId
  });
};

// Subscribe to new messages
export const subscribeToNewMessages = (callback: (message: any) => void) => {
  return websocketService.subscribe('chat_message', callback);
};

// Subscribe to typing status updates
export const subscribeToTypingStatus = (callback: (data: {
  conversationId: number;
  userId: number;
  username: string;
  fullName: string;
  isTyping: boolean;
  timestamp: Date;
}) => void) => {
  return websocketService.subscribe('typing', callback);
};

// Subscribe to read receipts
export const subscribeToReadReceipts = (callback: (data: {
  messageId: number;
  userId: number;
  conversationId: number;
}) => void) => {
  return websocketService.subscribe('read_receipt', callback);
};

// Subscribe to conversation events (participant added/removed, etc.)
export const subscribeToConversationEvents = (callback: (data: any) => void) => {
  return websocketService.subscribe('chat_event', callback);
};

// File handling functions
export const uploadMessageAttachment = async (file: File, conversationId: number) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('conversation_id', conversationId.toString());

  try {
    const response = await api.post('/api/v1/messages/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading attachment:", error);
    throw error;
  }
};

export const getAttachmentUrl = (attachmentId: string) => {
  return `${config.apiUrl}/api/v1/messages/attachments/${attachmentId}`;
};

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

