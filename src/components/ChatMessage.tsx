import { cn } from "@/lib/utils";
import { Message } from "./Chat";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg p-4 border border-gray-700/50",
        isUser 
          ? "bg-gradient-to-r from-gray-700/50 to-gray-800/50" 
          : "bg-gradient-to-r from-gray-800/50 to-gray-900/50"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-purple-500" : "bg-blue-500"
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="font-medium text-gray-100">
            {isUser ? "You" : "Assistant"}
          </div>
        </div>
        {message.loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3 bg-gray-700/50" />
            <Skeleton className="h-4 w-1/2 bg-gray-700/50" />
            <Skeleton className="h-4 w-1/4 bg-gray-700/50" />
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-gray-200">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
