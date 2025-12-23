import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Send,
  Brain,
  Loader2,
  Sparkles,
  BookOpen,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { ChatMessage } from "@/types";

export default function AITutor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Tutor. What would you like to understand today? I'll explain concepts step-by-step using your uploaded notes and syllabus.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const suggestedQuestions = [
    "Explain the mechanism of action of aspirin",
    "What are the key differences between Type 1 and Type 2 diabetes?",
    "Help me understand pharmacokinetics",
    "Summarize the cardiovascular system",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (will be replaced with actual LLM call)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `Great question! Let me explain this based on your syllabus and uploaded materials.

**Understanding ${input.trim().split(" ").slice(0, 3).join(" ")}...**

This is a simulated response. When connected to the backend, I will:

1. **Retrieve relevant context** from your uploaded documents
2. **Align with your syllabus** objectives
3. **Provide step-by-step explanations** tailored to your level
4. **Highlight exam-relevant points** for your revision

Would you like me to elaborate on any specific aspect?`,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-semibold">AI Tutor</h1>
                <p className="text-xs text-muted-foreground">Syllabus-aligned explanations</p>
              </div>
            </div>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3"
                    : "neuraal-card p-4"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Neuraal Tutor</span>
                  </div>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {message.content.split("\n").map((line, i) => (
                    <p key={i} className={message.role === "user" ? "mb-0" : "mb-2 last:mb-0"}>
                      {line}
                    </p>
                  ))}
                </div>

                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleCopy(message.content, message.id)}
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="neuraal-card p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Suggestions (show when no user messages) */}
      {messages.length === 1 && (
        <div className="container mx-auto px-4 pb-4 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Try asking:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                onClick={() => handleSuggestion(question)}
                className="px-3 py-2 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="sticky bottom-0 neuraal-glass border-t border-border/50 p-4">
        <div className="container mx-auto max-w-3xl">
          {/* Free tier notice */}
          {user?.tier === "free" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Free tier: Shorter explanations. Upgrade for detailed responses.</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Input
              ref={inputRef}
              placeholder="Ask me anything about your syllabus..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 h-12"
              disabled={isLoading}
            />
            <Button
              variant="gradient"
              size="icon-lg"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}