import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Message,
  getUserConversations, 
  getConversationMessages, 
  sendMessage as apiSendMessage, 
  createConversation as apiCreateConversation,
  markMessagesAsRead,
  WebSocketStatus,
  connectToMessagingWebSocket,
  subscribeToNewMessages,
  subscribeToTypingStatus,
  subscribeToReadReceipts,
  sendTypingStatus,
  sendReadReceipt,
  getStaffList
} from '@/services/messaging-services';

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: getUserConversations,
  });
};

export const useConversationMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: () => conversationId ? getConversationMessages(conversationId) : null,
    enabled: !!conversationId,
  });
};

export const useStaffList = () => {
  return useQuery({
    queryKey: ['staff-list'],
    queryFn: getStaffList,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { content: string; conversationId: string }) => 
      apiSendMessage(data.content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ 
        queryKey: ['conversation-messages', variables.conversationId] 
      });
    },
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { type: 'private' | 'group'; participantIds: number[]; name?: string }) => 
      apiCreateConversation({
        type: data.type,
        participantIds: data.participantIds,
        name: data.name
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageIds }: { messageIds: number[] }) => 
      markMessagesAsRead({ messageIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// Hook for real-time messaging
export const useRealtimeMessaging = (conversationId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const connectToWebSocket = async () => {
      const status = await connectToMessagingWebSocket();
      setIsConnected(status === WebSocketStatus.Connected);
    };
    
    if (!isConnected) {
      connectToWebSocket();
    }
    
    return () => {
      // Cleanup subscriptions if needed
    };
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeNewMessages = subscribeToNewMessages((message: Message) => {
      // Update messages when a new message arrives
      if (conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: ['conversation-messages', conversationId] 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    const unsubscribeTypingStatus = subscribeToTypingStatus((data: {
      conversation_id: number;
      user_id: string;
      user_name: string;
      is_typing: boolean;
    }) => {
      if (data.conversation_id) {
        setIsTyping(prev => ({
          ...prev,
          [data.user_id]: data.is_typing
        }));
        
        if (data.is_typing) {
          setTimeout(() => {
            setIsTyping(prev => ({
              ...prev,
              [data.user_id]: false
            }));
          }, 3000);
        }
      }
    });

    const unsubscribeReadReceipts = subscribeToReadReceipts(() => {
      if (conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: ['conversation-messages', conversationId] 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    return () => {
      unsubscribeNewMessages();
      unsubscribeTypingStatus();
      unsubscribeReadReceipts();
    };
  }, [isConnected, conversationId, queryClient]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (conversationId && isConnected) {
      sendTypingStatus(Number(conversationId), isTyping);
    }
  }, [conversationId, isConnected]);

  const markAsRead = useCallback((messageId: number) => {
    if (conversationId && isConnected) {
      sendReadReceipt(messageId, Number(conversationId));
    }
  }, [conversationId, isConnected]);

  return {
    isConnected,
    isTyping,
    sendTypingIndicator,
    markAsRead
  };
};

export const useDoctorPatientChat = () => {
  const createConversationMutation = useCreateConversation();
  const queryClient = useQueryClient();
  
  const findOrCreateConversation = async (doctorId: number, patientId: number) => {
    const conversations = await queryClient.fetchQuery({
      queryKey: ['conversations'], 
      queryFn: getUserConversations
    });
    
    const existingConversation = conversations.find((conversation: any) => {
      return !conversation.is_group && 
             conversation.members.includes(doctorId) && 
             conversation.members.includes(patientId);
    });
    
    if (existingConversation) {
      return existingConversation;
    }
    
    const result = await createConversationMutation.mutateAsync({
      type: 'private',
      participantIds: [doctorId, patientId]
    });
    
    return result;
  };
  
  return {
    findOrCreateConversation,
    isCreating: createConversationMutation.isPending
  };
};