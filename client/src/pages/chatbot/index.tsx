import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Bot, 
  Download, 
  Users, 
  Stethoscope, 
  Info, 
  HelpCircle, 
  Activity,
  Pill,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

import MessageList, { ChatMessage } from '@/components/chatbot/MessageList';
import ChatInterface from '@/components/chatbot/ChatInterface';
import HealthTrendChart from '@/components/chatbot/HealthTrendChart';
import { sendChatMessage } from '@/components/chatbot/api';

const Chatbot = () => {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isExamplesOpen, setIsExamplesOpen] = useState<boolean>(true);
  const [activeBotType, setActiveBotType] = useState<string>('HealthTrendBot');
  const queryClient = useQueryClient();

  // Query for fetching chat messages
  const { data: messages = [] } = useQuery({
    queryKey: ['chatMessages', activeBotType],
    queryFn: () => Promise.resolve<ChatMessage[]>([]),
    initialData: [],
  });

  // Query for chart data if available
  const { data: chartData } = useQuery({
    queryKey: ['chartData', activeBotType],
    queryFn: () => Promise.resolve({
      data: {
        labels: ['2019', '2020', '2021', '2022', '2023'],
        datasets: [{
          label: 'Vaccination Rate',
          data: [65, 59, 80, 81, 86],
          backgroundColor: 'rgba(79, 70, 229, 0.5)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 2
        }]
      },
      type: 'line',
      title: 'Pet Vaccination Trends (2019-2023)'
    }),
    enabled: activeTab === 'analytics' && activeBotType === 'HealthTrendBot',
  });

  // Bot type definitions
  const botTypes = [
    {
      id: 'HealthTrendBot',
      name: 'Health Trend Bot',
      description: 'Analyze health trends using veterinary data',
      icon: <Activity className="h-5 w-5" />
    },
    {
      id: 'MediBot',
      name: 'Medication Assistant',
      description: 'Get detailed information about medications, including uses, side effects, and indications',
      icon: <Pill className="h-5 w-5" />
    },
    {
      id: 'SideEffectHelper',
      name: 'Side Effect Advisor',
      description: 'Learn about potential side effects and how to report them',
      icon: <AlertTriangle className="h-5 w-5" />
    }
  ];

  // Find the current bot
  const currentBot = botTypes.find(bot => bot.id === activeBotType) || botTypes[0];

  // Mutation for sending messages
  const messageMutation = useMutation({
    mutationFn: async (message: string) => {
      const userMessage: ChatMessage = {
        id: Date.now(),
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        botType: activeBotType
      };

      // Optimistically update the messages
      queryClient.setQueryData<ChatMessage[]>(['chatMessages', activeBotType], (oldMessages) => 
        [...(oldMessages || []), userMessage]
      );

      // Show a pending message
      const pendingId = Date.now() + 1;
      queryClient.setQueryData<ChatMessage[]>(['chatMessages', activeBotType], (oldMessages) => [
        ...(oldMessages || []),
        {
          id: pendingId,
          text: 'Processing your request...',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          isPending: true,
          botType: activeBotType
        }
      ]);

      try {
        // Send the message to the API with the bot type
        const apiResponse = await sendChatMessage(message, activeBotType);

        // Remove the pending message and add the real response
        queryClient.setQueryData<ChatMessage[]>(['chatMessages', activeBotType], (oldMessages) => {
          const filteredMessages = oldMessages?.filter(m => m.id !== pendingId) || [];
          return [
            ...filteredMessages,
            {
              id: Date.now() + 2,
              text: apiResponse.message,
              sender: 'bot',
              timestamp: new Date().toISOString(),
              sourceDetails: apiResponse.sourceDetails,
              drugInfo: apiResponse.drugInfo,
              sideEffectReport: apiResponse.sideEffectReport,
              botType: apiResponse.botType || activeBotType
            }
          ];
        });

        // If a new bot type was suggested, update it
        if (apiResponse.botType && apiResponse.botType !== activeBotType) {
          setActiveBotType(apiResponse.botType);
        }

        // If we got chart data, update it
        if (apiResponse.chartData) {
          queryClient.setQueryData(['chartData', activeBotType], {
            data: apiResponse.chartData,
            type: apiResponse.chartType || 'bar',
            title: apiResponse.chartTitle || 'Pet Health Trend'
          });
        }

        return apiResponse;
      } catch (error) {
        // Remove the pending message and add an error message
        queryClient.setQueryData<ChatMessage[]>(['chatMessages', activeBotType], (oldMessages) => {
          const filteredMessages = oldMessages?.filter(m => m.id !== pendingId) || [];
          return [
            ...filteredMessages,
            {
              id: Date.now() + 2,
              text: `Sorry, there was an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
              sender: 'bot',
              timestamp: new Date().toISOString(),
              isError: true,
              botType: activeBotType
            }
          ];
        });
        throw error;
      }
    }
  });

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    messageMutation.mutate(message);
  };

  const handleBotChange = (botType: string) => {
    setActiveBotType(botType);
    
    // Clear messages when switching bots
    queryClient.setQueryData(['chatMessages', botType], []);
    
    // Clear chart data
    queryClient.setQueryData(['chartData', botType], null);
    
    // Show a temporary notification that bot has changed
    const notification = document.getElementById('bot-change-notification');
    if (notification) {
      notification.classList.remove('opacity-0');
      notification.classList.add('opacity-100');
      setTimeout(() => {
        notification.classList.remove('opacity-100');
        notification.classList.add('opacity-0');
      }, 2000);
    }
  };

  // Examples for quick reference based on bot type
  const botExamples = {
    'HealthTrendBot': [
      {
        title: 'Vaccination Trends',
        description: 'Trends in diabetes drugs in the last 5 years',
        query: 'Show me trends in pet vaccinations',
        icon: <Stethoscope className="h-5 w-5 text-indigo-600" />
      },
      {
        title: 'Common Side Effects',
        description: 'Learn about potential medication side effects',
        query: 'What are common side effects of antibiotics for dogs?',
        icon: <Info className="h-5 w-5 text-indigo-600" />
      }
    ],
    'MediBot': [
      {
        title: 'Medication Information',
        description: 'Get details about specific medications',
        query: 'Tell me about Metacam for dogs',
        icon: <Pill className="h-5 w-5 text-indigo-600" />
      },
      {
        title: 'Drug Interactions',
        description: 'Learn about potential drug interactions',
        query: 'Are there interactions between Rimadyl and Tramadol?',
        icon: <AlertTriangle className="h-5 w-5 text-indigo-600" />
      }
    ],
    'SideEffectHelper': [
      {
        title: 'Report Side Effects',
        description: 'Learn how to report medication side effects',
        query: 'How do I report a side effect my dog experienced?',
        icon: <AlertTriangle className="h-5 w-5 text-indigo-600" />
      },
      {
        title: 'Common Side Effects',
        description: 'Learn about common side effects of pet medications',
        query: 'What are common side effects of antibiotics in cats?',
        icon: <Info className="h-5 w-5 text-indigo-600" />
      }
    ]
  };

  const examples = botExamples[activeBotType as keyof typeof botExamples] || botExamples['HealthTrendBot'];

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg overflow-hidden">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-white flex items-center hover:bg-white/10 rounded-lg px-3 py-2 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-white font-semibold ml-4 text-lg">Veterinary Assistant</h1>
        </div>
        {/* <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-1"
            onClick={() => {
              if (messages.length > 0) {
                const text = messages.map(m => `${m.sender === 'user' ? 'You: ' : 'Assistant: '}${m.text.replace(/<[^>]*>/g, '')}`).join('\n\n');
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'conversation.txt';
                a.click();
              }
            }}
          >
            <Download className="h-4 w-4" />
            <span>Export Conversation</span>
          </Button>
        </div> */}
      </div>

      {/* Bot Type Selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 relative">
        <div className="flex flex-wrap items-center gap-3">
          {botTypes.map((bot) => (
            <Button
              key={bot.id}
              variant={activeBotType === bot.id ? "default" : "outline"}
              className={`flex items-center gap-2 ${activeBotType === bot.id ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}
              onClick={() => handleBotChange(bot.id)}
            >
              {bot.icon}
              <span>{bot.name}</span>
            </Button>
          ))}
          <p className="ml-2 text-gray-600 text-sm">{currentBot.description}</p>
        </div>
        
        {/* Bot change notification */}
        <div 
          id="bot-change-notification" 
          className="absolute top-full left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 opacity-0 z-10"
        >
          Switched to {currentBot.name}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="p-5">
        <TabsList className="grid grid-cols-3 max-w-xs mb-4 bg-indigo-50 p-1">
          <TabsTrigger value="chat" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">
            Chat
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="help" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">
            Help
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-0 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Main Chat Area - Full Width */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-14rem)]">
              <MessageList messages={messages} />
              <ChatInterface 
                onSendMessage={handleSendMessage} 
                isLoading={messageMutation.isPending}
                botType={activeBotType}
              />
            </div>

            {/* Examples Section (Collapsible) */}
            <Collapsible 
              open={isExamplesOpen} 
              onOpenChange={setIsExamplesOpen}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Bot className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Example Questions</h3>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isExamplesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {examples.map((example: any, index: number) => (
                    <div 
                      key={index}
                      onClick={() => handleSendMessage(example.query)}
                      className="cursor-pointer bg-white hover:bg-indigo-50 transition-colors border border-gray-200 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-start">
                        <div className="bg-indigo-100 rounded-lg p-2 mr-3 flex-shrink-0">
                          {example.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{example.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <div className="space-y-6">
            {chartData ? (
              <>
                <HealthTrendChart 
                  data={chartData.data} 
                  type={chartData.type} 
                  title={chartData.title} 
                />
                
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      This data visualization shows trends based on your conversation with the veterinary assistant. 
                      You can ask more specific questions to get more detailed analytics.
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="shadow-sm border-gray-200 py-12">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <div className="bg-indigo-100 rounded-full p-4 mb-4">
                    <Bot className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Analytics Data Available</h3>
                  <p className="text-gray-600 max-w-md">
                    Ask the veterinary assistant about trends, statistics, or data-related queries to generate analytics visualizations.
                    <br /><br />
                    Note: Analytics are primarily available with the Health Trend Bot.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('chat')}
                    className="mt-6"
                  >
                    Return to Chat
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="help" className="mt-0">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">How to Use the Veterinary Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-medium text-indigo-700 mb-2">About This Tool</h3>
                <p className="text-gray-700">
                  The Veterinary Assistant is an AI-powered tool designed to provide information and assistance related to veterinary medicine, pet health, and animal care.
                  You can switch between different specialized assistants using the buttons at the top.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {botTypes.map(bot => (
                  <div key={bot.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-indigo-100 rounded-lg p-2 mr-3">
                        {bot.icon}
                      </div>
                      <h3 className="font-medium text-gray-900">{bot.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{bot.description}</p>
                  </div>
                ))}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Things You Can Ask About:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Common medical conditions in pets</li>
                  <li>Vaccination schedules and recommendations</li>
                  <li>Medication side effects and dosages</li>
                  <li>Breed-specific information</li>
                  <li>Nutrition and dietary questions</li>
                  <li>Preventative care tips</li>
                  <li>Statistical trends in veterinary medicine</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="font-medium text-amber-700 mb-2">Important Note</h3>
                <p className="text-gray-700">
                  While this assistant provides information based on veterinary knowledge, it should not replace professional veterinary care. Always consult with a licensed veterinarian for medical advice regarding your pets.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Chatbot;
