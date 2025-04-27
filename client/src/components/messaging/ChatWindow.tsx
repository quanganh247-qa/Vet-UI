import React, { useEffect, useRef } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Message } from "@/services/messaging-services";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "../ui/skeleton";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  typingUsers: string[];
}

export function ChatWindow({ messages, isLoading, typingUsers }: ChatWindowProps) {
  const { doctor, logout } = useAuth();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return format(date, "h:mm a");
    } catch (error) {
      return "";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      try {
        const date = new Date(message.timestamp);
        
        // Check if date is valid before formatting
        if (isNaN(date.getTime())) {
          console.warn("Invalid timestamp encountered:", message.timestamp);
          // Use current date as fallback
          const fallbackDate = new Date();
          const fallbackKey = format(fallbackDate, 'yyyy-MM-dd');
          if (!groups[fallbackKey]) {
            groups[fallbackKey] = [];
          }
          groups[fallbackKey].push(message);
          return; // Skip to next iteration
        }
        
        const dateKey = format(date, 'yyyy-MM-dd');
        
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        
        groups[dateKey].push(message);
      } catch (error) {
        console.error("Error processing message timestamp:", error, message);
        // Add to today's group as fallback
        const today = new Date();
        const todayKey = format(today, 'yyyy-MM-dd');
        if (!groups[todayKey]) {
          groups[todayKey] = [];
        }
        groups[todayKey].push(message);
      }
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4 overflow-y-auto gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              i % 2 === 0 ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <Skeleton className="h-8 w-8 rounded-full" />
            <div
              className={`flex flex-col max-w-[70%] ${
                i % 2 === 0 ? "items-start" : "items-end"
              }`}
            >
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton
                className={`h-16 w-56 rounded-xl ${
                  i % 2 === 0 ? "rounded-tl-none" : "rounded-tr-none"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      {groupedMessages.map(({ date, messages }) => (
        <div key={date} className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
              {formatDate(date)}
            </div>
          </div>
          
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === Number(doctor?.id);
            const showAvatar = index === 0 || 
              messages[index - 1].senderId !== message.senderId;

            return (
              <div key={message.id} className="mb-4">
                <div
                  className={`flex items-start gap-2 ${
                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {showAvatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={message.senderAvatar}
                        alt={message.senderName}
                      />
                      <AvatarFallback>
                        {getInitials(message.senderName)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8" /> // Spacer for alignment
                  )}

                  <div
                    className={`flex flex-col max-w-[70%] ${
                      isCurrentUser ? "items-end" : "items-start"
                    }`}
                  >
                    {showAvatar && (
                      <span className="text-xs text-muted-foreground mb-1">
                        {isCurrentUser ? 'You' : message.senderName}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2 rounded-xl ${
                        isCurrentUser
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatMessageTime(message.timestamp)}
                      {message.read && isCurrentUser && (
                        <span className="ml-2">✓✓</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            <span className="bg-muted px-3 py-2 text-sm rounded-xl rounded-bl-none">
              <span className="typing-animation">Typing</span>
            </span>
          </div>
        </div>
      )}

      <div ref={endOfMessagesRef} />
    </div>
  );
}