import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MarkdownContent from "@/components/MarkdownContent";
import {
  ArrowLeft,
  MoreVertical,
  Copy,
  Check,
  Share2,
  Send,
  Loader2,
  Sparkles,
  Brain,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function SummaryView() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (documentId) fetchDocument();
  }, [isAuthenticated, documentId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchDocument = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (error || !data) {
      toast.error("Failed to load summary");
      navigate("/dashboard");
      return;
    }

    setSummary(data.summary || "");
    setDocumentName(data.file_name);
    setExtractedText(data.extracted_text || "");
    setLoading(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Summary: ${documentName}`, text: summary });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(summary);
      toast.success("Summary copied for sharing!");
    }
    setMenuOpen(false);
  };

  const handleAskQuestion = async () => {
    if (!chatInput.trim() || isAsking) return;

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: chatInput.trim() };
    const allMessages = [...chatMessages, userMsg];
    setChatMessages(allMessages);
    setChatInput("");
    setIsAsking(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          context: extractedText,
          userProfile: profile
            ? { program: profile.program, institution: profile.institution, educationLevel: profile.education_level, yearOfStudy: profile.year_of_study }
            : null,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = (Date.now() + 1).toString();
      setChatMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

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
          if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setChatMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
              );
            }
          } catch {}
        }
      }
    } catch {
      toast.error("Failed to get response");
      setChatMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/upload")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display font-semibold truncate">Summary</h1>
                <p className="text-xs text-muted-foreground truncate">{documentName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NeuraalLogo size="sm" showText={false} />
            {/* 3-dot menu */}
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
                <MoreVertical className="w-5 h-5" />
              </Button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
                    <button
                      onClick={handleShare}
                      className="w-full px-4 py-2.5 text-sm text-left hover:bg-secondary flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Summary
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Summary Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <MarkdownContent content={summary} />

        {/* Copy button at end */}
        <div className="mt-8 pt-6 border-t border-border">
          <Button variant="outline" className="w-full" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Summary
              </>
            )}
          </Button>
        </div>

        {/* Chat section */}
        <div className="mt-8">
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full neuraal-card p-4 flex items-center gap-3 hover:border-primary/50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-display font-semibold text-sm">Ask Neuraal about this document</h3>
              <p className="text-xs text-muted-foreground">Get clarification or deeper insights</p>
            </div>
          </button>

          {showChat && (
            <div className="mt-4 neuraal-card p-4">
              {/* Chat messages */}
              <div className="max-h-80 overflow-y-auto space-y-3 mb-4">
                {chatMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Ask me anything about this document!
                  </p>
                )}
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2"
                          : "bg-secondary rounded-2xl rounded-bl-md px-4 py-2"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <MarkdownContent content={msg.content || "Thinking..."} />
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ask about this document..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                  disabled={isAsking}
                  className="flex-1"
                />
                <Button
                  variant="gradient"
                  size="icon"
                  onClick={handleAskQuestion}
                  disabled={!chatInput.trim() || isAsking}
                >
                  {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}