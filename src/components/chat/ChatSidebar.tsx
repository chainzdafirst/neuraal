import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Trash2, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({
  open,
  onClose,
  activeConversationId,
  onSelectConversation,
  onNewChat,
}: ChatSidebarProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && open) fetchConversations();
  }, [user, open]);

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setConversations(data as Conversation[]);
    }
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete conversation");
      return;
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      onNewChat();
    }
    toast.success("Conversation deleted");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full z-50 w-72 bg-background border-r border-border transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-semibold text-sm">Chat History</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              onNewChat();
              onClose();
            }}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-colors",
                    activeConversationId === conv.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(conv.updated_at)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
