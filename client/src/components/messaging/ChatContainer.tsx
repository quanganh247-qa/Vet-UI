import React, { useState, useEffect } from "react";
import { useMessaging } from "@/context/messaging-context";
import { ConversationResponse, connectToMessagingWebSocket } from "@/services/messaging-services";
import { ConversationList } from "./ConversationList";
import ChatArea from "./ChatArea";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth-context";
import { useMediaQuery } from "@/hooks/use-mobile";
import NewConversationDialog from "./NewConversationDialog";

interface ChatContainerProps {
  conversationId?: string;
  onNavigate: (path: string) => void;
}

export function ChatContainer({ conversationId, onNavigate }: ChatContainerProps) {
  const { conversations, setCurrentConversation, currentConversation, messages, setMessages, isLoading } = useMessaging();
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const { doctor } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showMobileConversationList, setShowMobileConversationList] = useState(!conversationId);

  // Connect to WebSocket when the component mounts
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        await connectToMessagingWebSocket();
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
      }
    };

    initializeWebSocket();
  }, []);

  // Update the selected conversation when conversationId changes
  useEffect(() => {
    if (conversationId) {
      const conversation = conversations.find(c => c.id.toString() === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        setShowMobileConversationList(false);
      }
    } else if (isMobile) {
      setShowMobileConversationList(true);
      setCurrentConversation(null);
    }
  }, [conversationId, conversations, setCurrentConversation, isMobile]);

  const handleSelectConversation = (conversation: ConversationResponse) => {
    setCurrentConversation(conversation);
    onNavigate(`/messaging/${conversation.id}`);
  };

  const handleNewConversation = () => {
    setShowNewChatDialog(true);
  };

  const handleConversationCreated = (conversation: ConversationResponse) => {
    onNavigate(`/messaging/${conversation.id}`);
  };

  const handleBackToList = () => {
    setShowMobileConversationList(true);
    onNavigate('/messaging');
  };

  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        {showMobileConversationList ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border flex items-center">
              <h2 className="font-semibold text-lg">Messages</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <ConversationList
                selectedConversationId={conversationId || null}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={handleBackToList}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="font-semibold">Chat</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatArea 
                currentConversation={currentConversation || undefined} 
                messages={messages} 
                setMessages={setMessages}
              />
            </div>
          </div>
        )}
        <NewConversationDialog
          isOpen={showNewChatDialog}
          onClose={() => setShowNewChatDialog(false)}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-[320px_1fr]">
      <ConversationList
        selectedConversationId={conversationId || null}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />
      
      <div className="flex-1 h-full">
        <ChatArea 
          currentConversation={currentConversation || undefined} 
          messages={messages} 
          setMessages={setMessages}
        />
      </div>
      
      <NewConversationDialog
        isOpen={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
