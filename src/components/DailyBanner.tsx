import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Megaphone, AlertTriangle, CheckCircle, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Banner {
  id: string;
  title: string;
  content: string;
  banner_type: string;
}

const STORAGE_KEY = "neuraal_banners_seen_date";

export function DailyBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen === today) return;

    const fetchBanners = async () => {
      const { data } = await supabase
        .from("system_banners")
        .select("id, title, content, banner_type")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (data && data.length > 0) {
        setBanners(data);
      }
    };
    fetchBanners();
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toDateString());
    setDismissed(true);
  };

  if (dismissed || banners.length === 0) return null;

  const typeStyles = (type: string) => {
    switch (type) {
      case "warning": return { bg: "bg-neuraal-amber/10 border-neuraal-amber/30", icon: AlertTriangle, iconColor: "text-neuraal-amber" };
      case "success": return { bg: "bg-neuraal-emerald/10 border-neuraal-emerald/30", icon: CheckCircle, iconColor: "text-neuraal-emerald" };
      case "promo": return { bg: "bg-primary/10 border-primary/30", icon: Sparkles, iconColor: "text-primary" };
      default: return { bg: "bg-accent/10 border-accent/30", icon: Info, iconColor: "text-accent" };
    }
  };

  return (
    <div className="space-y-2 mb-4">
      {banners.map((banner) => {
        const style = typeStyles(banner.banner_type);
        const Icon = style.icon;
        return (
          <div key={banner.id} className={`rounded-xl border p-4 ${style.bg} flex items-start gap-3`}>
            <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{banner.title}</p>
              <p className="text-muted-foreground text-sm mt-0.5">{banner.content}</p>
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0 h-7 w-7" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
