import React, { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MessageSquare, PlusCircle, Search } from "lucide-react";
import { ConversationResponse } from "@/services/messaging-services";
import { useConversations } from "@/hooks/use-messaging";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversation: ConversationResponse) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: conversations, isLoading, error } = useConversations();
  console.log("Conversations:", conversations);
  const [, setLocation] = useLocation();

  // Filter conversations based on search query
  const filteredConversations = conversations?.filter((conversation: ConversationResponse) => {
    // If search is empty, show all conversations
    if (!searchQuery.trim()) return true;
    
    // For private conversations without a name, use the other participant's name
    if (conversation.type === 'private' && !conversation.name) {
      // Find the other participant (not the current user)
      const otherParticipants = conversation.participants?.filter(
        p => !p.isCurrentUser // Assuming there's an isCurrentUser flag, otherwise use other logic
      );
      // Use the other participant's name for searching
      if (otherParticipants && otherParticipants.length > 0) {
        return otherParticipants[0].fullName?.toLowerCase().includes(searchQuery.toLowerCase());
      }
    }
    
    // For conversations with names, search normally
    return conversation.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
  }) || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    try {
      const date = new Date(timeString);
      return format(date, "h:mm a");
    } catch (error) {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search conversations..."
              className="h-9"
              disabled
            />
            <Button size="icon" variant="ghost" disabled>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 p-3 rounded-md">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
        <h3 className="font-medium">Error loading conversations</h3>
        <p className="text-sm text-muted-foreground">
          Could not load your conversations. Please try again later.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search conversations..."
            className="h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button size="icon" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-2">
        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={onNewConversation}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <div className="overflow-y-auto flex-1 p-2">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "No conversations match your search"
                : "No conversations yet"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation: ConversationResponse) => (
            <div
              key={conversation.id}
              className={`flex items-start gap-3 p-3 rounded-md cursor-pointer ${
                selectedConversationId === conversation.id.toString()
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                {/* Using participant's info if available */}
                <AvatarImage src="" alt={conversation.name || ""} />
                <AvatarFallback>
                  {conversation.name ? getInitials(conversation.name) : "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-start">
                  <p className="font-medium truncate">
                    {conversation.name || "Unnamed Conversation"}
                    {conversation.type === 'group' && conversation.participants && (
                      <span className="text-xs ml-1 text-muted-foreground">
                        ({conversation.participants.length})
                      </span>
                    )}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatTime(conversation.lastMessage?.createdAt?.toString())}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.lastMessage?.content || "No messages yet"}
                </p>
                {conversation.unreadCount > 0 && (
                  <div className="flex justify-end mt-1">
                    <Badge variant="secondary" className="rounded-full">
                      {conversation.unreadCount}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}