import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MarkdownContent from "@/components/MarkdownContent";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ChatSidebar from "@/components/chat/ChatSidebar";
import {
  ArrowLeft,
  Send,
  Brain,
  Loader2,
  Copy,
  Check,
  Plus,
  Paperclip,
  Camera,
  X,
  FileText,
  Menu,
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
  const { user, profile, isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const welcomeMessage: Message = {
    id: "welcome",
    role: "assistant",
    content: "Hey! 👋 I'm Neuraal, your study buddy. What are you working on today?",
  };

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Load conversation messages
  const loadConversation = useCallback(async (convId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const loaded: Message[] = data.map((m: any) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      setMessages(loaded);
      setConversationId(convId);
    }
  }, []);

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setInput("");
    setAttachments([]);
  };

  const createConversation = async (firstMessage: string): Promise<string | null> => {
    if (!user) return null;
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Failed to create conversation:", error);
      return null;
    }
    return data.id;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      user_id: user.id,
      role,
      content,
    });
  };

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
    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 5));
    setShowAttachMenu(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const msgAttachments = attachments.map((a) => ({
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

    // Build multimodal content for API
    const imageAttachments = attachments.filter((a) => a.type === "image");
    let userContent: any;
    if (imageAttachments.length > 0) {
      const parts: any[] = [];
      for (const att of imageAttachments) {
        if (att.base64) {
          parts.push({ type: "image_url", image_url: { url: att.base64 } });
        }
      }
      parts.push({
        type: "text",
        text: input.trim() || "What's in this image? Explain it in the context of studying.",
      });
      userContent = parts;
    } else {
      userContent = input.trim();
    }

    const messageText = input.trim();
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    try {
      // Create conversation if new
      let activeConvId = conversationId;
      if (!activeConvId) {
        activeConvId = await createConversation(messageText || "Image chat");
        if (!activeConvId) throw new Error("Failed to create conversation");
        setConversationId(activeConvId);
      }

      // Save user message
      await saveMessage(activeConvId, "user", messageText || "[Image attachment]");

      // Build API messages
      const apiMessages = updatedMessages.map((m, i) => {
        if (i === updatedMessages.length - 1 && m.role === "user") {
          return { role: m.role, content: userContent };
        }
        return { role: m.role, content: m.content };
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: apiMessages,
            userProfile: profile
              ? {
                  program: profile.program,
                  institution: profile.institution,
                  educationLevel: profile.education_level,
                  yearOfStudy: profile.year_of_study,
                }
              : null,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

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
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {}
        }
      }

      // Save assistant message
      if (assistantContent && activeConvId) {
        await saveMessage(activeConvId, "assistant", assistantContent);
        // Update conversation updated_at
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", activeConvId);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
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

  const displayMessages = messages.length > 0 ? messages : [welcomeMessage];

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

      {/* Chat Sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeConversationId={conversationId}
        onSelectConversation={loadConversation}
        onNewChat={handleNewChat}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h1 className="font-display font-semibold text-sm">Neuraal Tutor</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleNewChat}
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-3xl space-y-4">
          {displayMessages.map((message) => (
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
                  <MarkdownContent content={message.content || ""} />
                ) : (
                  message.content && (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )
                )}

                {message.role === "assistant" && message.content && message.id !== "welcome" && (
                  <div className="flex items-center gap-2 mt-2 -mb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2 opacity-50 hover:opacity-100"
                      onClick={() => handleCopy(message.content, message.id)}
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3 h-3 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" /> Copy
                        </>
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

      {/* Input Bar - ChatGPT style */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
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
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg border border-border bg-muted flex flex-col items-center justify-center">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground mt-0.5 truncate max-w-[48px] px-1">
                        {att.file.name.split(".").pop()}
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

          {/* Input row */}
          <div className="relative flex items-end gap-2">
            {/* + Button with popup */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                disabled={isLoading}
              >
                <Plus className="w-5 h-5" />
              </Button>

              {showAttachMenu && (
                <div className="absolute bottom-12 left-0 bg-popover border border-border rounded-xl shadow-lg p-2 flex flex-col gap-1 min-w-[160px] animate-scale-in z-50">
                  <button
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAttachMenu(false);
                      setTimeout(() => fileInputRef.current?.click(), 100);
                    }}
                  >
                    <Paperclip className="w-4 h-4" />
                    Attach File
                  </button>
                  <button
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAttachMenu(false);
                      setTimeout(() => cameraInputRef.current?.click(), 100);
                    }}
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </button>
                </div>
              )}
            </div>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                placeholder="Message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full min-h-[44px] max-h-[120px] resize-none rounded-2xl bg-muted px-4 py-3 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isLoading}
                rows={1}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 bottom-1 h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:bg-muted disabled:text-muted-foreground"
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Close attach menu on click outside */}
      {showAttachMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowAttachMenu(false)} />
      )}
    </div>
  );
}
