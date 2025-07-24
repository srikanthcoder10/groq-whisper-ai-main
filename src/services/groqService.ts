
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: string;
  }[];
}

// Handles streaming responses from Groq API
export async function streamCompletion(
  messages: Message[],
  apiKey: string,
  model: string = "llama3-8b-8192",
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API error:", errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to get response reader");

    const decoder = new TextDecoder("utf-8");
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk
        .split("\n")
        .filter(line => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          
          if (data === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || "";
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.error("Error parsing SSE message", e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Stream completion error:", error);
    toast.error("Failed to get response from Groq API");
    throw error;
  }
}

// For non-streaming completions
export async function chatCompletion(
  messages: Message[],
  apiKey: string,
  model: string = "llama3-8b-8192"
): Promise<ChatCompletionResponse> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API error:", errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Chat completion error:", error);
    toast.error("Failed to get response from Groq API");
    throw error;
  }
}
