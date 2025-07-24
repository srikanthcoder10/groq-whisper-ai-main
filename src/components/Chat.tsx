import { useEffect, useRef, useState } from "react";
import { Send, Trash, PanelLeft, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { streamCompletion } from "@/services/groqService";
import { toast } from "sonner";
import ChatMessage from "@/components/ChatMessage";
import { cn } from "@/lib/utils";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import ModelSelector from "@/components/ModelSelector";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  id: string;
  loading?: boolean;
}

const DEFAULT_SYSTEM_MESSAGE = "You are a helpful, intelligent AI assistant powered by Groq. Be concise, accurate, and friendly.";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [apiKey] = useState<string>("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");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama3-8b-8192");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Remove API key check on mount since we have a permanent key
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add user message
    const userMessageId = crypto.randomUUID();
    const userMessage: Message = {
      role: "user",
      content: input,
      id: userMessageId
    };

    // Add assistant message placeholder
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      id: assistantMessageId,
      loading: true
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare messages for the API call (including system message)
      const messagesToSend = [
        {
          role: "system" as const,
          content: DEFAULT_SYSTEM_MESSAGE
        },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: userMessage.role, content: userMessage.content }
      ];

      // Handle streaming response
      await streamCompletion(
        messagesToSend,
        apiKey,
        selectedModel,
        (chunk) => {
          setMessages(prev => 
            prev.map(m => 
              m.id === assistantMessageId 
                ? { ...m, content: m.content + chunk } 
                : m
            )
          );
        }
      );

      // Mark assistant message as complete
      setMessages(prev => 
        prev.map(m => 
          m.id === assistantMessageId 
            ? { ...m, loading: false } 
            : m
        )
      );
    } catch (error) {
      toast.error("Failed to get response from Groq API");
      // Remove the assistant message if there was an error
      setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-sidebar fixed inset-y-0 left-0 z-20 flex h-full flex-col transition-transform duration-300 ease-in-out w-72",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot size={24} />
            Chatbot
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <PanelLeft size={20} />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Model</h3>
              <ModelSelector 
                selectedModel={selectedModel} 
                onChange={setSelectedModel} 
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Actions</h3>
              <Button 
                onClick={handleClearChat}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Trash size={16} />
                Clear chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 p-4 shadow-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-400 hover:text-white md:hidden"
          >
            <PanelLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold text-white">Chatbot</h1>
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              className="text-gray-400 hover:text-white"
            >
              <Trash size={20} />
            </Button>
          </div>
        </div>

        {/* Chat messages */}
        <Card className="flex-1 bg-gradient-to-b from-gray-900 to-gray-950 border-0 rounded-none overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-md p-6">
                <Bot className="mx-auto h-12 w-12 text-purple-400" />
                <h2 className="mt-4 text-2xl font-bold text-white">Welcome to Chatbot</h2>
                <p className="mt-2 text-gray-300">
                  Ask anything and get fast, accurate responses powered by Groq's LLM API.
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              <div className="space-y-4 pb-24">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </Card>

        {/* Chat input */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 shadow-inner">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="bg-gray-800 border-gray-700 text-white"
              disabled={isLoading}
            />
            <Button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
