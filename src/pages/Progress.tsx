import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  BarChart3,
  Target,
  BookOpen,
  Zap,
  TrendingUp,
  Brain,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

export default function Progress() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const progressData = {
    studyStreak: 5,
    totalQuizzes: 12,
    averageScore: 78,
    topicsMastered: 8,
    totalTopics: 24,
    hoursStudied: 23.5,
  };

  const weeklyData = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 1.5 },
    { day: "Wed", hours: 3 },
    { day: "Thu", hours: 0.5 },
    { day: "Fri", hours: 2 },
    { day: "Sat", hours: 4 },
    { day: "Sun", hours: 1 },
  ];

  const weakAreas = [
    { topic: "Drug Metabolism", score: 45, recommendation: "Review CYP450 enzymes" },
    { topic: "Pharmacokinetics", score: 52, recommendation: "Practice ADME calculations" },
    { topic: "Drug Interactions", score: 58, recommendation: "Study enzyme inhibition" },
  ];

  const strengths = [
    { topic: "Drug Classifications", score: 92 },
    { topic: "Mechanism of Action", score: 88 },
    { topic: "Therapeutic Uses", score: 85 },
  ];

  const maxHours = Math.max(...weeklyData.map((d) => d.hours));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <h1 className="font-display font-semibold">Progress</h1>
            </div>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Overview Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Study Streak",
              value: `${progressData.studyStreak} days`,
              icon: Zap,
              color: "text-neuraal-amber",
              bg: "bg-neuraal-amber/10",
            },
            {
              label: "Quizzes Taken",
              value: progressData.totalQuizzes,
              icon: Target,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Avg. Score",
              value: `${progressData.averageScore}%`,
              icon: TrendingUp,
              color: "text-neuraal-emerald",
              bg: "bg-neuraal-emerald/10",
            },
            {
              label: "Topics Mastered",
              value: `${progressData.topicsMastered}/${progressData.totalTopics}`,
              icon: BookOpen,
              color: "text-accent",
              bg: "bg-accent/10",
            },
          ].map((stat) => (
            <div key={stat.label} className="neuraal-card p-4">
              <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-display font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Weekly Activity Chart */}
        <section className="neuraal-card p-6 mb-8">
          <h2 className="font-display font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            This Week's Activity
          </h2>

          <div className="flex items-end justify-between h-40 gap-2">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${(day.hours / maxHours) * 100}%`,
                    minHeight: day.hours > 0 ? "8px" : "2px",
                  }}
                />
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total this week</span>
            <span className="font-semibold">{progressData.hoursStudied} hours</span>
          </div>
        </section>

        {/* Two column layout for strengths and weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Weak Areas */}
          <section className="neuraal-card p-6">
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-neuraal-amber" />
              Areas to Improve
            </h2>

            <div className="space-y-4">
              {weakAreas.map((area) => (
                <div key={area.topic}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{area.topic}</span>
                    <span className="text-sm text-neuraal-amber">{area.score}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-neuraal-amber transition-all duration-500"
                      style={{ width: `${area.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{area.recommendation}</p>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/tutor")}>
              <Brain className="w-4 h-4 mr-2" />
              Get Help with These
            </Button>
          </section>

          {/* Strengths */}
          <section className="neuraal-card p-6">
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-neuraal-emerald" />
              Your Strengths
            </h2>

            <div className="space-y-4">
              {strengths.map((area) => (
                <div key={area.topic}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{area.topic}</span>
                    <span className="text-sm text-neuraal-emerald">{area.score}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neuraal-emerald transition-all duration-500"
                      style={{ width: `${area.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/quiz")}>
              <Target className="w-4 h-4 mr-2" />
              Challenge Yourself
            </Button>
          </section>
        </div>

        {/* Topic Mastery */}
        <section className="neuraal-card p-6">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Topic Mastery
          </h2>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="font-semibold">
                {Math.round((progressData.topicsMastered / progressData.totalTopics) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{
                  width: `${(progressData.topicsMastered / progressData.totalTopics) * 100}%`,
                }}
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            You've mastered {progressData.topicsMastered} out of {progressData.totalTopics} topics
            in {profile?.program || "your program"}. Keep going!
          </p>
        </section>
      </main>
    </div>
  );
}