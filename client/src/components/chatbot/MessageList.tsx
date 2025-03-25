import React, { useRef, useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Bot, User, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string | number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: string;
  isError?: boolean;
  isPending?: boolean;
  sourceDetails?: string;
  botType?: string;
  drugInfo?: string | Record<string, string>;
  sideEffectReport?: string | Record<string, string>;
}

interface MessageListProps {
  messages: ChatMessage[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render HTML content safely
  const renderHTML = (html: string) => {
    return { __html: html };
  };

  // Get bot name from bot type
  const getBotName = (botType?: string) => {
    switch(botType) {
      case 'HealthTrendBot':
        return 'Health Trend Bot';
      case 'MediBot':
        return 'Medication Assistant';
      case 'SideEffectHelper':
        return 'Side Effect Advisor';
      default:
        return 'Vet Assistant';
    }
  };

  return (
    <div className="message-list overflow-y-auto p-4 space-y-6 flex-grow">
      {messages.length === 0 ? (
        <div className="welcome-message flex flex-col items-center text-center py-12">
          <div className="mb-6 bg-indigo-100 rounded-full p-4">
            <Bot className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Veterinary Assistant</h2>
          <p className="text-gray-600 mb-4 max-w-xl">
            Ask me questions about your pet's health, treatments, medications, and more.
            I'll provide you with information based on veterinary data.
          </p>
          <div className="text-sm text-gray-500 max-w-xl">
            <p className="mb-2">Here are some things you can ask:</p>
            <ul className="text-left space-y-1">
              <li>• What are the most common side effects of antibiotics for dogs?</li>
              <li>• Show me trends in pet vaccinations over recent years</li>
              <li>• What are the recommended vaccinations for a new puppy?</li>
              <li>• Compare the safety profiles of common flea treatments</li>
            </ul>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "message flex items-start gap-3",
              message.sender === 'user' ? "flex-row-reverse" : ""
            )}
          >
            <div className="flex-shrink-0 mt-1">
              <Avatar className={cn(
                "h-8 w-8 border-2",
                message.sender === 'user' 
                  ? "bg-indigo-100 border-indigo-200" 
                  : "bg-gray-100 border-gray-200"
              )}>
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-indigo-600" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-600" />
                )}
              </Avatar>
            </div>
            
            <div className={cn(
              "flex flex-col max-w-[85%] rounded-lg px-4 py-3",
              message.sender === 'user' 
                ? "bg-indigo-600 text-white" 
                : message.isError 
                  ? "bg-red-50 text-red-700 border border-red-200" 
                  : "bg-gray-100 text-gray-800",
              message.isPending ? "opacity-70" : ""
            )}>
              <div className="message-header flex items-center justify-between mb-1">
                <span className="message-sender text-xs font-medium">
                  {message.sender === 'user' ? 'You' : getBotName(message.botType)}
                </span>
                <span className="message-time text-xs opacity-70 flex items-center gap-1">
                  {message.isPending ? (
                    <>
                      <Clock className="h-3 w-3" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {message.sender === 'user' && <Check className="h-3 w-3" />}
                      <span>{formatTimestamp(message.timestamp)}</span>
                    </>
                  )}
                </span>
              </div>
              
              <div 
                className="message-content whitespace-pre-wrap text-sm"
                dangerouslySetInnerHTML={renderHTML(message.text)}
              />
              
              {message.sourceDetails && (
                <div className="message-footer mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <small className="text-xs opacity-70">{message.sourceDetails}</small>
                </div>
              )}

              {message.drugInfo && (
                <div className="message-footer mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs font-medium text-indigo-700 mb-1">Medication Information:</div>
                  <div className="text-xs text-gray-700">
                    {typeof message.drugInfo === 'string' 
                      ? message.drugInfo 
                      : message.drugInfo && typeof message.drugInfo === 'object' 
                        ? (
                          <div className="space-y-1">
                            {Object.entries(message.drugInfo).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        ) 
                        : 'No medication information available'
                    }
                  </div>
                </div>
              )}

              {message.sideEffectReport && (
                <div className="message-footer mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs font-medium text-amber-700 mb-1">Side Effect Report:</div>
                  <div className="text-xs text-gray-700">
                    {typeof message.sideEffectReport === 'string' 
                      ? message.sideEffectReport 
                      : message.sideEffectReport && typeof message.sideEffectReport === 'object' 
                        ? (
                          <div className="space-y-1">
                            {Object.entries(message.sideEffectReport).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        ) 
                        : 'No side effect information available'
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 