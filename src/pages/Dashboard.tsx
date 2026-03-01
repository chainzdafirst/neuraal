import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen,
  Brain,
  FileText,
  LayoutGrid,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  Target,
  BarChart3,
  Clock,
  Zap,
  Crown,
  MoreVertical,
  Trash2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

interface Activity {
  id: string;
  type: "quiz" | "summary" | "flashcards";
  title: string;
  date: string;
  details?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, logout, isAuthenticated, isLoading } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [quickStats, setQuickStats] = useState([
    { label: "Study Streak", value: "0 days", icon: Zap },
    { label: "Quizzes Taken", value: "0", icon: Target },
    { label: "Topics Mastered", value: "0", icon: BookOpen },
  ]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchActivities();
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    const [quizzesRes, flashcardsRes, progressRes] = await Promise.all([
      supabase.from("quizzes").select("id").eq("user_id", user.id).not("score", "is", null),
      supabase.from("flashcards").select("mastery_level, topic").eq("user_id", user.id),
      supabase.from("study_progress").select("date").eq("user_id", user.id).order("date", { ascending: false }),
    ]);

    const quizCount = quizzesRes.data?.length || 0;
    const masteredTopics = new Set(
      flashcardsRes.data?.filter((f) => (f.mastery_level || 0) >= 3).map((f) => f.topic)
    );

    // Calculate streak
    let streak = 0;
    if (progressRes.data && progressRes.data.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dates = progressRes.data.map((p) => {
        const d = new Date(p.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });
      const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        expected.setHours(0, 0, 0, 0);
        if (uniqueDates[i] === expected.getTime()) {
          streak++;
        } else {
          break;
        }
      }
    }

    setQuickStats([
      { label: "Study Streak", value: `${streak} days`, icon: Zap },
      { label: "Quizzes Taken", value: String(quizCount), icon: Target },
      { label: "Topics Mastered", value: String(masteredTopics.size), icon: BookOpen },
    ]);
  };

  const fetchActivities = async () => {
    if (!user) return;

    const [quizzesRes, docsRes, flashcardsRes] = await Promise.all([
      supabase.from("quizzes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("documents").select("*").eq("user_id", user.id).not("summary", "is", null).order("created_at", { ascending: false }).limit(10),
      supabase.from("flashcards").select("id, topic, document_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);

    const items: Activity[] = [];

    quizzesRes.data?.forEach((q) =>
      items.push({
        id: q.id,
        type: "quiz",
        title: q.title,
        date: q.created_at,
        details: q.score != null ? `Score: ${q.score}/${q.total_questions}` : "Not completed",
      })
    );

    docsRes.data?.forEach((d) =>
      items.push({
        id: d.id,
        type: "summary",
        title: `Summary: ${d.file_name}`,
        date: d.created_at,
      })
    );

    // Group flashcards by document_id
    const fcGroups = new Map<string, { count: number; topic: string; date: string; docId: string }>();
    flashcardsRes.data?.forEach((f) => {
      const key = f.document_id || f.id;
      if (!fcGroups.has(key)) {
        fcGroups.set(key, { count: 0, topic: f.topic || "General", date: f.created_at, docId: key });
      }
      fcGroups.get(key)!.count++;
    });
    fcGroups.forEach((v, k) => {
      items.push({
        id: k,
        type: "flashcards",
        title: `${v.count} Flashcards - ${v.topic}`,
        date: v.date,
      });
    });

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setActivities(items.slice(0, 10));
  };

  const handleDeleteActivity = async (activity: Activity) => {
    try {
      if (activity.type === "quiz") {
        await supabase.from("quizzes").delete().eq("id", activity.id);
      } else if (activity.type === "summary") {
        await supabase.from("documents").update({ summary: null }).eq("id", activity.id);
      } else if (activity.type === "flashcards") {
        await supabase.from("flashcards").delete().eq("document_id", activity.id);
      }
      setActivities((prev) => prev.filter((a) => a.id !== activity.id));
      toast.success("Activity deleted");
    } catch {
      toast.error("Failed to delete activity");
    }
    setActiveMenu(null);
  };

  const handleShareActivity = async (activity: Activity) => {
    try {
      if (activity.type === "quiz") {
        const { data } = await supabase.from("quizzes").select("questions, title").eq("id", activity.id).single();
        if (data) {
          const text = `${data.title}\n\n${JSON.stringify(data.questions, null, 2)}`;
          if (navigator.share) {
            await navigator.share({ title: data.title, text });
          } else {
            await navigator.clipboard.writeText(text);
            toast.success("Quiz content copied!");
          }
        }
      } else if (activity.type === "summary") {
        const { data } = await supabase.from("documents").select("summary, file_name").eq("id", activity.id).single();
        if (data?.summary) {
          if (navigator.share) {
            await navigator.share({ title: `Summary: ${data.file_name}`, text: data.summary });
          } else {
            await navigator.clipboard.writeText(data.summary);
            toast.success("Summary copied!");
          }
        }
      }
    } catch {
      toast.error("Failed to share");
    }
    setActiveMenu(null);
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.type === "summary") {
      navigate(`/summary/${activity.id}`);
    } else if (activity.type === "quiz") {
      // Could navigate to quiz review
    }
  };

  const mainActions = [
    { id: "tutor", title: "AI Tutor", description: "Get step-by-step explanations", icon: Brain, bgColor: "bg-primary/10", iconColor: "text-primary", route: "/tutor" },
    { id: "quiz", title: "Quizzes & Tests", description: "Practice with exam-style questions", icon: Target, bgColor: "bg-neuraal-amber/10", iconColor: "text-neuraal-amber", route: "/quiz" },
    { id: "flashcards", title: "Flashcards", description: "Master concepts with spaced repetition", icon: LayoutGrid, bgColor: "bg-neuraal-emerald/10", iconColor: "text-neuraal-emerald", route: "/flashcards" },
    { id: "summary", title: "Smart Summaries", description: "Transform notes into exam-ready content", icon: FileText, bgColor: "bg-accent/10", iconColor: "text-accent", route: "/upload" },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <NeuraalLogo size="lg" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";

  const getActivityIcon = (type: string) => {
    if (type === "quiz") return Target;
    if (type === "summary") return FileText;
    return LayoutGrid;
  };

  const getActivityColor = (type: string) => {
    if (type === "quiz") return "text-neuraal-amber";
    if (type === "summary") return "text-accent";
    return "text-neuraal-emerald";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <NeuraalLogo size="sm" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              <Sparkles className="w-3.5 h-3.5" />
              Free Tier
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <section className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">Welcome, {firstName}!</h1>
          <p className="text-muted-foreground">
            {profile?.program || "Your personalized study dashboard"}
            {profile?.institution && ` at ${profile.institution}`}
          </p>
        </section>

        <section className="grid grid-cols-3 gap-4 mb-8">
          {quickStats.map((stat) => (
            <div key={stat.label} className="neuraal-card p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What would you like to do?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mainActions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.route)}
                onMouseEnter={() => setHoveredCard(action.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`neuraal-card p-6 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group ${
                  hoveredCard === action.id ? "border-primary/50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${action.bgColor} transition-transform group-hover:scale-110`}>
                    <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-display font-semibold mt-4 mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button onClick={() => navigate("/progress")} className="neuraal-card p-6 text-left hover:border-primary/50 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold">View Progress</h3>
                <p className="text-sm text-muted-foreground">Track your learning journey</p>
              </div>
            </div>
          </button>
        </section>

        <section className="neuraal-card p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-neuraal-amber to-neuraal-rose">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Upgrade to Premium</h3>
                <p className="text-sm text-muted-foreground">Get unlimited quizzes, exam mode, and study planner</p>
              </div>
            </div>
            <Button variant="gradient" onClick={() => navigate("/upgrade")}>
              Upgrade Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Recent Activity
          </h2>

          {activities.length === 0 ? (
            <div className="neuraal-card p-8 text-center">
              <p className="text-muted-foreground">No recent activity yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Start studying to see your activity here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);

                return (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="neuraal-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className="p-2 rounded-lg bg-secondary">
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{activity.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{activity.type}</span>
                        <span>-</span>
                        <span>{new Date(activity.date).toLocaleDateString()}</span>
                        {activity.details && (
                          <>
                            <span>-</span>
                            <span>{activity.details}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 3-dot menu */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === activity.id ? null : activity.id);
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>

                      {activeMenu === activity.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteActivity(activity);
                              }}
                              className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2 text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                            {activity.type !== "flashcards" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareActivity(activity);
                                }}
                                className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2"
                              >
                                <Share2 className="w-4 h-4" />
                                Share
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}