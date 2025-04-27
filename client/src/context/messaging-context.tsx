import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { websocketService } from '@/services/websocket-service';
import { 
  getUserConversations, 
  getConversationMessages,
  sendMessage as apiSendMessage,
  createConversation as apiCreateConversation,
  markMessagesAsRead,
  ConversationResponse, 
  WebSocketChatMessage,
  Message, 
  ConversationType,
  CreateConversationRequest,
  connectToMessagingWebSocket,
  subscribeToNewMessages,
  subscribeToTypingStatus,
  subscribeToReadReceipts,
  sendReadReceipt,
  WebSocketStatus
} from '@/services/messaging-services';
import { useAuth } from './auth-context';
import { toast } from '@/components/ui/use-toast';
import { DoctorDetail } from '@/types';
import { getAllStaff } from '@/services/staff-services';

// Define the messaging context type
interface MessagingContextType {
  conversations: ConversationResponse[];
  currentConversation: ConversationResponse | null;
  messages: Message[];
  staff: DoctorDetail[];
  isLoading: boolean;
  unreadCount: number;
  setCurrentConversation: (conversation: ConversationResponse | null) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (content: string, conversationId?: string) => Promise<any>;
  createConversation: (data: CreateConversationRequest) => Promise<any>;
  refreshConversations: () => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

interface MessagingProviderProps {
  children: ReactNode;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children }) => {
  const { doctor } = useAuth();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [staff, setStaff] = useState<DoctorDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketStatus, setSocketStatus] = useState<WebSocketStatus>(WebSocketStatus.Disconnected);

  // Calculate unread messages count
  const calculateUnreadCount = (convos: ConversationResponse[]) => {
    const count = convos.reduce((total, convo) => total + (convo.unreadCount || 0), 0);
    setUnreadCount(count);
  };

  // Initialize WebSocket and fetch initial data
  useEffect(() => {
    if (!doctor) return;

    const setupWebSocket = async () => {
      try {
        const status = await connectToMessagingWebSocket();
        setSocketStatus(status);

        // Subscribe to new messages
        const unsubscribeMessage = subscribeToNewMessages((message: WebSocketChatMessage) => {
          // If the message is for the current conversation, add it to messages
          if (currentConversation && message.conversationId === currentConversation.id) {
            const newMessage: Message = {
              id: message.messageId,
              content: message.content,
              senderId: message.senderId,
              senderName: message.senderName,
              createdAt: new Date(message.createdAt).toISOString(),
              messageType: message.messageType
            };
            
            setMessages(prev => [...prev, newMessage]);
            
            // Mark message as read since we're viewing the conversation
            sendReadReceipt(message.messageId, message.conversationId);
          }

          // Update conversations list with new message
          updateConversationsWithNewMessage(message);
        });

        // Subscribe to typing status
        const unsubscribeTyping = subscribeToTypingStatus((data) => {
          // Handle typing status in the component that needs it
        });

        // Subscribe to read receipts
        const unsubscribeReadReceipts = subscribeToReadReceipts((data) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === data.message_id ? { ...msg, read: true } : msg
            )
          );
        });

        return () => {
          unsubscribeMessage();
          unsubscribeTyping();
          unsubscribeReadReceipts();
        };
      } catch (error) {
        console.error("WebSocket connection error:", error);
        return () => {};
      }
    };

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch conversations
        const conversationsData = await getUserConversations();
        if (Array.isArray(conversationsData)) {
          setConversations(conversationsData);
          calculateUnreadCount(conversationsData);
        } else {
          setConversations([]);
        }

        // Fetch staff
        try {
          const staffData = await getAllStaff();
          if (staffData && Array.isArray(staffData.data)) {
            setStaff(staffData.data);
          } else {
            setStaff([]);
          }
        } catch (staffError) {
          console.error("Error fetching staff:", staffError);
          setStaff([]);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load messaging data",
          variant: "destructive"
        });
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    const cleanupPromise = setupWebSocket();
    fetchInitialData();

    return () => {
      cleanupPromise.then(cleanup => cleanup());
    };
  }, [doctor]);

  // Helper function to update conversations with new message
  const updateConversationsWithNewMessage = (message: WebSocketChatMessage) => {
    setConversations(prev => {
      const updatedConversations = prev.map(convo => {
        if (convo.id === message.conversationId) {
          // Update the conversation with the new message
          return {
            ...convo,
            lastMessage: {
              id: message.messageId,
              conversationId: message.conversationId,
              senderId: message.senderId,
              content: message.content,
              messageType: message.messageType,
              createdAt: new Date(message.createdAt),
              senderUsername: message.senderUsername,
              senderName: message.senderName,
              read: false
            },
            // Increment unread count only if it's not the current conversation
            unreadCount: currentConversation?.id === convo.id ? 
              0 : (convo.unreadCount + 1)
          };
        }
        return convo;
      });
      
      calculateUnreadCount(updatedConversations);
      return updatedConversations;
    });
  };

  // Update messages when switching conversations
  useEffect(() => {
    if (currentConversation) {
      const fetchMessages = async () => {
        try {
          setIsLoading(true);
          const messagesData = await getConversationMessages(currentConversation.id.toString());
          
          if (Array.isArray(messagesData)) {
            setMessages(messagesData.map(msg => ({
              id: msg.id,
              content: msg.content,
              senderId: msg.senderId,
              senderName: msg.senderName,
              createdAt: new Date(msg.createdAt).toISOString(),
              messageType: msg.messageType
            })));

            // Mark all unread messages as read
            const unreadMessages = messagesData
              .filter(msg => !msg.read && msg.senderId !== Number(doctor?.id))
              .map(msg => msg.id);
              
            // if (unreadMessages.length > 0) {
            //   try {
            //     await markMessagesAsRead(unreadMessages, currentConversation.id);
                
            //     // Update unread count in conversations
            //     setConversations(prev => prev.map(convo => 
            //       convo.id === currentConversation.id ? 
            //         { ...convo, unreadCount: 0 } : convo
            //     ));
                
            //     calculateUnreadCount(conversations);
            //   } catch (error) {
            //     console.error("Error marking messages as read:", error);
            //   }
            // }
          } else {
            setMessages([]);
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive"
          });
          setMessages([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [currentConversation, doctor?.id]);

  // Create new conversation
  const createNewConversation = async (data: CreateConversationRequest) => {
    try {
      const response = await apiCreateConversation(data);
      await refreshConversations();
      return response;
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Send message
  const sendNewMessage = async (content: string, conversationId?: string) => {
    const convoId = conversationId || currentConversation?.id?.toString();
    
    if (!convoId) {
      throw new Error("No conversation selected");
    }

    try {
      // Create optimistic message
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        content,
        senderId: Number(doctor?.id),
        senderName: doctor?.username || 'You',
        createdAt: new Date().toISOString(),
        messageType: 'text',
        isOptimistic: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Send actual message
      const response = await apiSendMessage(content, convoId);
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? {
          id: response.id,
          content: response.content,
          senderId: response.senderId,
          senderName: response.senderName,
          createdAt: new Date(response.createdAt).toISOString(),
          messageType: response.messageType
        } : msg
      ));
      
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Update optimistic message to show error
      setMessages(prev => prev.map(msg => 
        typeof msg.id === 'string' && msg.id.startsWith('temp-') ? 
          { ...msg, error: true } : msg
      ));
      
      throw error;
    }
  };

  // Refresh conversations
  const refreshConversations = async () => {
    try {
      setIsLoading(true);
      const conversationsData = await getUserConversations();
      
      if (Array.isArray(conversationsData)) {
        setConversations(conversationsData);
        calculateUnreadCount(conversationsData);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Error refreshing conversations:", error);
      toast({
        title: "Error",
        description: "Failed to refresh conversations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    staff,
    isLoading,
    unreadCount,
    setCurrentConversation,
    setMessages,
    sendMessage: sendNewMessage,
    createConversation: createNewConversation,
    refreshConversations
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};