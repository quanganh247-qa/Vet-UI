import React, { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { MessageSquare } from 'lucide-react';
import { ChatContainer } from '@/components/messaging/ChatContainer';
import { connectToMessagingWebSocket } from '@/services/messaging-services';

// Component hiển thị biểu tượng số lượng tin nhắn chưa đọc ở sidebar
export const MessagingIndicator = () => {
  // This would be implemented based on your notification system
  return null;
};

// Component chính của trang tin nhắn
const MessagingPage = () => {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/messaging/:conversationId');
  const conversationId = params?.conversationId;

  // Connect to WebSocket when the page loads
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await connectToMessagingWebSocket();
      } catch (error) {
        console.error('Failed to connect to messaging WebSocket:', error);
      }
    };
    
    connectWebSocket();
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ChatContainer 
            conversationId={conversationId} 
            onNavigate={(path) => setLocation(path)}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;