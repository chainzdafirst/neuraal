import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, logout, isAuthenticated, isLoading } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const mainActions = [
    {
      id: "tutor",
      title: "AI Tutor",
      description: "Get step-by-step explanations",
      icon: Brain,
      color: "from-primary to-neuraal-indigo-light",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      route: "/tutor",
    },
    {
      id: "quiz",
      title: "Quizzes & Tests",
      description: "Practice with exam-style questions",
      icon: Target,
      color: "from-neuraal-amber to-neuraal-rose",
      bgColor: "bg-neuraal-amber/10",
      iconColor: "text-neuraal-amber",
      route: "/quiz",
    },
    {
      id: "flashcards",
      title: "Flashcards",
      description: "Master concepts with spaced repetition",
      icon: LayoutGrid,
      color: "from-neuraal-emerald to-accent",
      bgColor: "bg-neuraal-emerald/10",
      iconColor: "text-neuraal-emerald",
      route: "/flashcards",
    },
    {
      id: "summary",
      title: "Smart Summaries",
      description: "Transform notes into exam-ready content",
      icon: FileText,
      color: "from-accent to-neuraal-cyan-light",
      bgColor: "bg-accent/10",
      iconColor: "text-accent",
      route: "/upload",
    },
  ];

  const quickStats = [
    { label: "Study Streak", value: "0 days", icon: Zap },
    { label: "Quizzes Taken", value: "0", icon: Target },
    { label: "Topics Mastered", value: "0", icon: BookOpen },
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <NeuraalLogo size="sm" />
          
          <div className="flex items-center gap-3">
            {/* Tier badge */}
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
        {/* Greeting Section */}
        <section className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
            Welcome, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            {profile?.program || "Your personalized study dashboard"}
            {profile?.institution && ` • ${profile.institution}`}
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-4 mb-8">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="neuraal-card p-4 flex items-center gap-3"
            >
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

        {/* Main Actions Grid */}
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
                <h3 className="text-lg font-display font-semibold mt-4 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Secondary Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* View Progress */}
          <button
            onClick={() => navigate("/progress")}
            className="neuraal-card p-6 text-left hover:border-primary/50 transition-all group"
          >
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

        {/* Upgrade Banner */}
        <section className="neuraal-card p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-neuraal-amber to-neuraal-rose">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Upgrade to Premium</h3>
                <p className="text-sm text-muted-foreground">
                  Get unlimited quizzes, exam mode, and study planner
                </p>
              </div>
            </div>
            <Button variant="gradient" onClick={() => navigate("/upgrade")}>
              Upgrade Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-8">
          <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Recent Activity
          </h2>
          <div className="neuraal-card p-8 text-center">
            <p className="text-muted-foreground">No recent activity yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Start studying to see your activity here!</p>
          </div>
        </section>
      </main>
    </div>
  );
}
