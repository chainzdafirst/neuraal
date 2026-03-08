import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, AlertTriangle, CheckCircle, Sparkles, Info } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  content: string;
  banner_type: string;
}

const STORAGE_KEY = "neuraal_banners_seen_date";

const typeConfig = (type: string) => {
  switch (type) {
    case "warning":
      return {
        icon: AlertTriangle,
        bg: "bg-[hsl(38_92%_50%/0.08)]",
        border: "border-[hsl(38_92%_50%/0.2)]",
        iconColor: "text-neuraal-amber",
        pill: "bg-[hsl(38_92%_50%/0.12)] text-neuraal-amber",
      };
    case "success":
      return {
        icon: CheckCircle,
        bg: "bg-[hsl(160_84%_39%/0.08)]",
        border: "border-[hsl(160_84%_39%/0.2)]",
        iconColor: "text-neuraal-emerald",
        pill: "bg-[hsl(160_84%_39%/0.12)] text-neuraal-emerald",
      };
    case "promo":
      return {
        icon: Sparkles,
        bg: "bg-primary/5",
        border: "border-primary/15",
        iconColor: "text-primary",
        pill: "bg-primary/10 text-primary",
      };
    default:
      return {
        icon: Info,
        bg: "bg-accent/5",
        border: "border-accent/15",
        iconColor: "text-accent",
        pill: "bg-accent/10 text-accent",
      };
  }
};

export function DailyBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

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

  const handleDismiss = (id: string) => {
    const next = new Set(dismissedIds);
    next.add(id);
    setDismissedIds(next);

    const remaining = banners.filter((b) => !next.has(b.id));
    if (remaining.length === 0) {
      localStorage.setItem(STORAGE_KEY, new Date().toDateString());
    }
  };

  const visibleBanners = banners.filter((b) => !dismissedIds.has(b.id));
  if (visibleBanners.length === 0) return null;

  return (
    <div className="space-y-2.5 mb-5">
      {visibleBanners.map((banner) => {
        const config = typeConfig(banner.banner_type);
        const Icon = config.icon;
        return (
          <div
            key={banner.id}
            className={`group relative rounded-lg border ${config.border} ${config.bg} px-4 py-3.5 transition-all duration-200 hover:shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.pill}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold leading-tight text-foreground">
                  {banner.title}
                </p>
                <p className="text-[13px] leading-relaxed text-muted-foreground mt-1">
                  {banner.content}
                </p>
              </div>
              <button
                onClick={() => handleDismiss(banner.id)}
                className="shrink-0 rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-foreground/5 hover:text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
