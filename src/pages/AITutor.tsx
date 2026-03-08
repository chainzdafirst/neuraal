import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MarkdownContent from "@/components/MarkdownContent";
import TypingIndicator from "@/components/chat/TypingIndicator";
import {
  ArrowLeft,
  Send,
  Brain,
  Loader2,
  Copy,
  Check,
  Paperclip,
  Camera,
  X,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface Attachment {
  file: File;
  preview?: string;
  base64?: string;
  type: "image" | "file";
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { preview?: string; name: string; type: "image" | "file" }[];
}

export default function AITutor() {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hey! 👋 I'm Neuraal, your study buddy. What are you working on today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    const newAttachments: Attachment[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const isImage = file.type.startsWith("image/");
      const base64 = await fileToBase64(file);

      newAttachments.push({
        file,
        preview: isImage ? base64 : undefined,
        base64,
        type: isImage ? "image" : "file",
      });
    }

    setAttachments(prev => [...prev, ...newAttachments].slice(0, 5));
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const msgAttachments = attachments.map(a => ({
      preview: a.preview,
      name: a.file.name,
      type: a.type,
    }));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      attachments: msgAttachments.length > 0 ? msgAttachments : undefined,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Build the API message content (multimodal for images)
    const imageAttachments = attachments.filter(a => a.type === "image");
    let userContent: any;

    if (imageAttachments.length > 0) {
      const parts: any[] = [];
      for (const att of imageAttachments) {
        if (att.base64) {
          parts.push({
            type: "image_url",
            image_url: { url: att.base64 },
          });
        }
      }
      if (input.trim()) {
        parts.push({ type: "text", text: input.trim() });
      } else {
        parts.push({ type: "text", text: "What's in this image? Explain it in the context of studying." });
      }
      userContent = parts;
    } else {
      userContent = input.trim();
    }

    setInput("");
    setAttachments([]);
    setIsLoading(true);

    try {
      // Build messages for API - convert previous messages to simple format, last one is multimodal
      const apiMessages = updatedMessages.slice(1).map((m, i) => {
        if (i === updatedMessages.length - 2 && m.role === "user") {
          // This is the current user message
          return { role: m.role, content: userContent };
        }
        return { role: m.role, content: m.content };
      });

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          userProfile: profile ? {
            program: profile.program,
            institution: profile.institution,
            educationLevel: profile.education_level,
            yearOfStudy: profile.year_of_study,
          } : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

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
                <h1 className="font-display font-semibold">Neuraal Tutor</h1>
                <p className="text-xs text-muted-foreground">Your study companion</p>
              </div>
            </div>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3"
                    : "bg-muted rounded-2xl rounded-bl-md px-4 py-3"
                }`}
              >
                {/* Show image attachments in user messages */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {message.attachments.map((att, i) => (
                      <div key={i}>
                        {att.type === "image" && att.preview ? (
                          <img
                            src={att.preview}
                            alt={att.name}
                            className="rounded-lg max-w-[200px] max-h-[150px] object-cover"
                          />
                        ) : (
                          <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs truncate max-w-[120px]">{att.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {message.role === "assistant" ? (
                  <MarkdownContent
                    content={message.content || (isLoading ? "" : "")}
                  />
                ) : (
                  message.content && (
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                  )
                )}

                {message.role === "assistant" && message.content && (
                  <div className="flex items-center gap-2 mt-2 -mb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2 opacity-50 hover:opacity-100"
                      onClick={() => handleCopy(message.content, message.id)}
                    >
                      {copiedId === message.id ? (
                        <><Check className="w-3 h-3 mr-1" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3 mr-1" /> Copy</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <TypingIndicator />
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="sticky bottom-0 neuraal-glass border-t border-border/50 p-4">
        <div className="container mx-auto max-w-3xl">
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((att, i) => (
                <div key={i} className="relative group">
                  {att.type === "image" && att.preview ? (
                    <img
                      src={att.preview}
                      alt={att.file.name}
                      className="w-16 h-16 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-border bg-muted flex flex-col items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1 truncate max-w-[56px] px-1">
                        {att.file.name.split('.').pop()}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isLoading}
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>
            <textarea
              ref={inputRef}
              placeholder="Ask Neuraal anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 min-h-[44px] max-h-[120px] resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isLoading}
              rows={1}
            />
            <Button
              variant="gradient"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={handleSend}
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
