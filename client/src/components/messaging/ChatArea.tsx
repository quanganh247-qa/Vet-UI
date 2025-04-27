import React, { useState, useRef, useEffect } from 'react';
import { useMessaging } from '@/context/messaging-context';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { Message, MessageResponse } from '@/services/messaging-services';
import { Send, Info, Users, Upload, Image, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { uploadMessageAttachment, getAttachmentUrl, sendTypingStatus, subscribeToTypingStatus } from '@/services/messaging-services';

interface ChatAreaProps {
  currentConversation?: {
    id: number;
    name?: string;
    type: 'private' | 'group';
    participants: Array<{
      id: number;
      username: string;
      email: string;
      fullName: string;
      isAdmin: boolean;
    }>;
  };
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatArea: React.FC<ChatAreaProps> = ({ currentConversation, messages, setMessages }) => {
  const { isLoading, sendMessage } = useMessaging();
  const { doctor } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{[key: string]: string}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentConversation]);

  const formatMessageTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      if (new Date().toDateString() === date.toDateString()) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      return `${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } catch (error) {
      return '';
    }
  };

  const addOptimisticMessage = (content: string) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content,
      senderId: Number(doctor?.id),
      senderName: doctor?.username || 'You',
      createdAt: new Date().toISOString(),
      messageType: 'text',
      isOptimistic: true,
      senderAvatar: undefined
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    return tempId;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && attachments.length === 0) || !currentConversation) return;
    
    try {
      setIsSending(true);
      setIsUploading(true);

      const uploadedAttachments = [];
      for (const file of attachments) {
        const result = await uploadMessageAttachment(file, currentConversation.id);
        uploadedAttachments.push(result);
      }

      if (newMessage.trim() || uploadedAttachments.length > 0) {
        const messageContent = {
          text: newMessage.trim(),
          attachments: uploadedAttachments
        };
        
        await sendMessage(JSON.stringify(messageContent), String(currentConversation.id));
        setNewMessage('');
        setAttachments([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message or upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const isCurrentUser = (message: Message) => {
    return message.senderId === Number(doctor?.id);
  };

  const shouldShowAvatar = (index: number) => {
    if (index === messages.length - 1) return true;
    if (index + 1 >= messages.length) return true;
    
    const currentMsg = messages[index];
    const nextMsg = messages[index + 1];
    
    return currentMsg.senderId !== nextMsg.senderId;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (currentConversation) {
      sendTypingStatus(currentConversation.id, true);
    }
  };

  useEffect(() => {
    if (!currentConversation) return;

    const unsubscribe = subscribeToTypingStatus((data) => {
      if (data.conversation_id === currentConversation.id) {
        if (data.is_typing) {
          setTypingUsers(prev => ({
            ...prev,
            [data.user_id]: data.user_name
          }));
        } else {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[data.user_id];
            return updated;
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentConversation]);

  if (!currentConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="bg-primary/5 p-6 rounded-full mb-4">
          <Info className="h-10 w-10 text-primary/70" />
        </div>
        <h3 className="text-xl font-medium mb-2">No conversations selected yet</h3>
        <p className="text-muted-foreground">
          Select a conversation from the list to start messaging
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b p-3 flex items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="ml-3">
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''} mb-4`}>
              {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full mr-2" />}
              <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-1/3' : 'w-1/2'} rounded-lg`} />
            </div>
          ))}
        </div>
        <div className="border-t p-3">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar>
            <AvatarFallback className={cn(
              currentConversation.type === 'group' ? "bg-indigo-200 text-indigo-700" : ""
            )}>
              {currentConversation.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h3 className="font-medium">{currentConversation.name}</h3>
            {currentConversation.type === 'group' && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto font-normal">
                    <Users className="h-3 w-3 mr-1" />
                    {currentConversation.participants?.length || 0} participants
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Participants</h4>
                    <div className="grid gap-1">
                      {currentConversation.participants?.map((participant) => (
                        <div key={participant.id} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {participant.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <p className="text-sm">{participant.fullName}</p>
                            <p className="text-xs text-muted-foreground">{participant.email}</p>
                          </div>
                          {participant.isAdmin && (
                            <Badge variant="secondary" className="ml-auto text-xs">Admin</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length > 0 ? (
          <>
            {messages.map((message, index) => {
              const isFromCurrentUser = isCurrentUser(message);
              const showAvatar = !isFromCurrentUser && shouldShowAvatar(index);
              const isTemporaryMessage = String(message.id).includes('temp-');
              const hasError = 'error' in message && message.error;

              return (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex mb-2 items-end",
                    isFromCurrentUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!isFromCurrentUser && showAvatar ? (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>
                        {message.senderName?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                      <AvatarImage src={message.senderAvatar} />
                    </Avatar>
                  ) : !isFromCurrentUser && (
                    <div className="w-8 mr-2" /> 
                  )}

                  <div className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 break-words",
                    isFromCurrentUser 
                      ? hasError
                        ? "bg-destructive text-destructive-foreground rounded-br-none"
                        : "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-secondary text-secondary-foreground rounded-bl-none",
                    isTemporaryMessage && "opacity-70"
                  )}>
                    {!isFromCurrentUser && !showAvatar && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {message.senderName || 'Không xác định'}
                      </p>
                    )}
                    <div className="whitespace-pre-wrap">
                      {(() => {
                        try {
                          const messageData = JSON.parse(typeof message.content === 'string' ? message.content : String(message.content));
                          return (
                            <>
                              {messageData.text && <span>{messageData.text}</span>}
                              {messageData.attachments && messageData.attachments.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {messageData.attachments.map((attachment: any, index: number) => (
                                    <div key={index} className="relative group">
                                      {attachment.type.startsWith('image/') ? (
                                        <a 
                                          href={getAttachmentUrl(attachment.id)} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="block"
                                        >
                                          <img
                                            src={getAttachmentUrl(attachment.id)}
                                            alt="attachment"
                                            className="max-w-[200px] max-h-[200px] rounded object-cover"
                                          />
                                        </a>
                                      ) : (
                                        <a 
                                          href={getAttachmentUrl(attachment.id)}
                                          target="_blank"
                                          rel="noopener noreferrer" 
                                          className="flex items-center gap-2 bg-background/10 p-2 rounded hover:bg-background/20 transition-colors"
                                        >
                                          <Paperclip className="h-4 w-4" />
                                          <span className="text-sm truncate max-w-[150px]">
                                            {attachment.filename}
                                          </span>
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        } catch {
                          return typeof message.content === 'string' ? message.content : String(message.content);
                        }
                      })()}
                    </div>
                    <div className="flex items-center justify-end mt-1 gap-1">
                      <span className="text-xs text-muted-foreground/70">
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {hasError ? (
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 h-4 border-destructive/50 text-destructive"
                        >
                          Lỗi
                        </Badge>
                      ) : isTemporaryMessage && (
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 h-4 border-primary/50 text-primary"
                        >
                          Đang gửi...
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {Object.values(typingUsers).length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex gap-1">
                  <span>
                    {Object.values(typingUsers).map(name => name).join(", ")}
                    {" "}
                    {Object.values(typingUsers).length === 1 ? "is" : "are"} typing
                  </span>
                  <span className="dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-gray-500 mb-2">Chưa có tin nhắn nào</p>
            <p className="text-sm text-gray-400">Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {attachments.length > 0 && (
        <div className="border-t p-2 flex gap-2 flex-wrap">
          {attachments.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith('image/') ? (
                <div className="w-20 h-20 relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="attachment preview"
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-secondary p-2 rounded">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm truncate max-w-[100px]">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="border-t p-3 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending || isUploading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          ref={inputRef}
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={handleInputChange}
          className="flex-1"
          disabled={isSending || isUploading}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={(!newMessage.trim() && attachments.length === 0) || isSending || isUploading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatArea;