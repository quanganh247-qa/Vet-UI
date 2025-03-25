import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Mic,
  ChevronRight,
  Pill,
  AlertTriangle,
  TrendingUp,
  Bot,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lightbulb,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  botType?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSendMessage,
  isLoading,
  botType = 'HealthTrendBot'
}) => {
  const [message, setMessage] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState<boolean>(false);
  const [activeExampleTab, setActiveExampleTab] = useState<string>("suggestions");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus the input field when the component mounts or bot changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [botType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Allow sending message with Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    // This would be implemented with actual voice recording functionality
    setIsRecording(!isRecording);
  };

  // Get placeholder text based on bot type
  const getPlaceholder = () => {
    if (isLoading) return "Processing your request...";
    
    switch(botType) {
      case 'MediBot':
        return "Ask about medications (e.g., 'What is Metacam used for?')";
      case 'SideEffectHelper':
        return "Ask about side effects (e.g., 'Is vomiting common with antibiotics?')";
      case 'HealthTrendBot':
      default:
        return "Ask about health trends (e.g., 'Vaccination trends in the last 5 years')";
    }
  };

  // Get suggestion chips based on bot type
  const getSuggestionChips = () => {
    switch(botType) {
      case 'MediBot':
        return [
          "What is Metacam used for?",
          "Side effects of antibiotics",
          "Interactions between Rimadyl and Tramadol"
        ];
      case 'SideEffectHelper':
        return [
          "How to report side effects?",
          "Common side effects of vaccines",
          "Side effects of antibiotics in cats"
        ];
      case 'HealthTrendBot':
      default:
        return [
          "Vaccination trends",
          "Common pet medical conditions",
          "Preventative care statistics"
        ];
    }
  };

  // Get detailed examples for each bot type
  const getDetailedExamples = () => {
    switch(botType) {
      case 'MediBot':
        return [
          {
            title: "Medication Information",
            description: "Get details about specific medications",
            query: "Tell me about Metacam for dogs",
            icon: <Pill className="h-5 w-5 text-indigo-600" />
          },
          {
            title: "Drug Interactions",
            description: "Learn about potential drug interactions",
            query: "Are there interactions between Rimadyl and Tramadol?",
            icon: <AlertTriangle className="h-5 w-5 text-indigo-600" />
          },
          {
            title: "Medication Usage",
            description: "Proper administration and usage",
            query: "How should I administer amoxicillin to my cat?",
            icon: <Lightbulb className="h-5 w-5 text-indigo-600" />
          }
        ];
      case 'SideEffectHelper':
        return [
          {
            title: "Report Side Effects",
            description: "Learn how to report medication side effects",
            query: "How do I report a side effect my dog experienced?",
            icon: <AlertTriangle className="h-5 w-5 text-indigo-600" />
          },
          {
            title: "Common Side Effects",
            description: "Learn about common side effects",
            query: "What are common side effects of antibiotics in cats?",
            icon: <Pill className="h-5 w-5 text-indigo-600" />
          },
          {
            title: "Side Effect Management",
            description: "How to manage side effects",
            query: "How to manage vomiting after vaccination?",
            icon: <Sparkles className="h-5 w-5 text-indigo-600" />
          }
        ];
      case 'HealthTrendBot':
      default:
        return [
          {
            title: "Vaccination Trends",
            description: "View statistics on pet vaccination rates",
            query: "Show me trends in pet vaccinations",
            icon: <TrendingUp className="h-5 w-5 text-indigo-600" />
          },
          {
            title: "Disease Prevalence",
            description: "Information about common conditions",
            query: "What are the most common diseases in golden retrievers?",
            icon: <Bot className="h-5 w-5 text-indigo-600" />
          },
          {
            title: "Breed Statistics",
            description: "Health statistics for specific breeds",
            query: "Health statistics for Labrador Retrievers vs German Shepherds",
            icon: <Sparkles className="h-5 w-5 text-indigo-600" />
          }
        ];
    }
  };

  // Get samples for query conversation examples
  const getConversationExamples = () => {
    switch(botType) {
      case 'MediBot':
        return [
          {
            title: "Asking about medication dosage",
            queries: [
              "What's the proper dosage of Metacam for a 20kg dog?",
              "When should Metacam be administered?",
              "Does Metacam need to be given with food?"
            ]
          },
          {
            title: "Investigating side effects",
            queries: [
              "What are the side effects of Rimadyl?",
              "How common is liver damage with long-term Rimadyl use?",
              "What monitoring is recommended for pets on Rimadyl?"
            ]
          }
        ];
      case 'SideEffectHelper':
        return [
          {
            title: "Reporting a side effect",
            queries: [
              "My dog had vomiting after taking antibiotics, should I report it?",
              "Who should I contact about a medication side effect?",
              "What information do I need when reporting a side effect?"
            ]
          },
          {
            title: "Understanding severe vs normal reactions",
            queries: [
              "Is lethargy normal after vaccination?",
              "What vaccine side effects require immediate vet attention?",
              "How long should mild side effects last?"
            ]
          }
        ];
      case 'HealthTrendBot':
      default:
        return [
          {
            title: "Investigating breed health",
            queries: [
              "What health issues are trending in French Bulldogs?",
              "How has the prevalence of hip dysplasia changed in the last decade?",
              "Which breeds show the most improvement in genetic health?"
            ]
          },
          {
            title: "Comparing treatment approaches",
            queries: [
              "How has treatment for canine lymphoma evolved over time?",
              "Are there trends showing benefits of early spay/neuter vs waiting?",
              "What preventative measures have increased most in the past 5 years?"
            ]
          }
        ];
    }
  };
  
  const suggestions = getSuggestionChips();
  const detailedExamples = getDetailedExamples();
  const conversationExamples = getConversationExamples();

  return (
    <div className="chat-interface bg-white border-t border-gray-200 flex-shrink-0">
      {/* SECTION 1: Main input area */}
      <form onSubmit={handleSubmit} className="p-3">
        <div className="relative">
          <Textarea
            ref={inputRef}
            className="resize-none min-h-[50px] pr-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder={getPlaceholder()}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className={cn(
              "absolute right-2 bottom-2 h-8 w-8",
              !message.trim() || isLoading ? "opacity-50" : ""
            )}
            disabled={isLoading || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* SECTION 2: Quick suggestion chips */}
      <div className="suggestion-chips px-3 pb-2 flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="bg-gray-50 text-gray-700 text-xs rounded-full px-3 py-1 border-gray-200 hover:bg-gray-100"
            onClick={() => !isLoading && onSendMessage(suggestion)}
            disabled={isLoading}
          >
            {suggestion}
          </Button>
        ))}
      </div>

      {/* SECTION 3: Collapsible examples section */}
      <Collapsible
        open={isExamplesOpen}
        onOpenChange={setIsExamplesOpen}
        className="border-t border-gray-200 mt-2"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center justify-center w-full py-1 text-xs text-gray-500 hover:bg-gray-50"
          >
            {isExamplesOpen ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                <span>Hide examples</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                <span>Show examples</span>
              </>
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-3 pt-1">
            <Tabs defaultValue="suggestions" value={activeExampleTab} onValueChange={setActiveExampleTab}>
              <TabsList className="grid grid-cols-3 h-8 bg-gray-100 rounded-md">
                <TabsTrigger 
                  value="suggestions" 
                  className="text-xs h-7 rounded-md"
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  <span>Suggestions</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="conversation" 
                  className="text-xs h-7 rounded-md"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  <span>Conversations</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="about" 
                  className="text-xs h-7 rounded-md"
                >
                  <Bot className="h-3 w-3 mr-1" />
                  <span>About</span>
                </TabsTrigger>
              </TabsList>

              {/* Suggestions Tab */}
              <TabsContent value="suggestions" className="mt-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {detailedExamples.map((example, index) => (
                    <div
                      key={index}
                      onClick={() => !isLoading && onSendMessage(example.query)}
                      className="cursor-pointer bg-white hover:bg-indigo-50 transition-colors border border-gray-200 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-start">
                        <div className="bg-indigo-100 rounded-lg p-2 mr-3 flex-shrink-0">
                          {example.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {example.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Conversation Examples Tab */}
              <TabsContent value="conversation" className="mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {conversationExamples.map((convo, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 shadow-sm">
                      <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 text-indigo-600 mr-2" />
                        {convo.title}
                      </h3>
                      <div className="space-y-2">
                        {convo.queries.map((query, qIndex) => (
                          <div 
                            key={qIndex}
                            onClick={() => !isLoading && onSendMessage(query)}
                            className="text-sm text-gray-600 py-1 px-2 rounded hover:bg-indigo-50 cursor-pointer flex items-center"
                          >
                            <span className="w-4 h-4 inline-flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-xs mr-2">
                              {qIndex + 1}
                            </span>
                            {query}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="mt-3">
                <div className="bg-indigo-50 rounded-lg p-3">
                  <h3 className="font-medium text-indigo-700 mb-2 flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    About {(() => {
                      switch(botType) {
                        case 'MediBot': return 'Medication Assistant';
                        case 'SideEffectHelper': return 'Side Effect Advisor';
                        case 'HealthTrendBot': default: return 'Health Trend Bot';
                      }
                    })()}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {(() => {
                      switch(botType) {
                        case 'MediBot':
                          return 'This assistant provides detailed information about pet medications, including dosages, side effects, contraindications, and interactions. Ask about specific medications or general pharmaceutical questions.';
                        case 'SideEffectHelper':
                          return 'This assistant helps you understand and report medication side effects. Get information about expected vs. concerning reactions, reporting procedures, and managing common side effects.';
                        case 'HealthTrendBot':
                        default:
                          return 'This assistant analyzes veterinary health data to provide insights on trends, statistics, and patterns. Ask about disease prevalence, breed-specific health issues, or treatment efficacy over time.';
                      }
                    })()}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ChatInterface;
