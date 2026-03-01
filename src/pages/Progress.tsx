import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  BarChart3,
  Target,
  BookOpen,
  Zap,
  TrendingUp,
  Brain,
  AlertTriangle,
} from "lucide-react";

export default function Progress() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [stats, setStats] = useState({
    studyStreak: 0,
    totalQuizzes: 0,
    averageScore: 0,
    topicsMastered: 0,
    totalTopics: 0,
    hoursStudied: 0,
  });

  const [weeklyData, setWeeklyData] = useState([
    { day: "Mon", hours: 0 },
    { day: "Tue", hours: 0 },
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 0 },
    { day: "Fri", hours: 0 },
    { day: "Sat", hours: 0 },
    { day: "Sun", hours: 0 },
  ]);

  const [weakAreas, setWeakAreas] = useState<{ topic: string; score: number; recommendation: string }[]>([]);
  const [strengths, setStrengths] = useState<{ topic: string; score: number }[]>([]);

  useEffect(() => {
    if (user) fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    const [quizzesRes, flashcardsRes, progressRes] = await Promise.all([
      supabase.from("quizzes").select("score, total_questions, questions").eq("user_id", user.id).not("score", "is", null),
      supabase.from("flashcards").select("mastery_level, topic").eq("user_id", user.id),
      supabase.from("study_progress").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    ]);

    const quizzes = quizzesRes.data || [];
    const flashcards = flashcardsRes.data || [];
    const progress = progressRes.data || [];

    // Quiz stats
    const totalQuizzes = quizzes.length;
    const totalCorrect = quizzes.reduce((sum, q) => sum + (q.score || 0), 0);
    const totalPossible = quizzes.reduce((sum, q) => sum + (q.total_questions || 1), 0);
    const averageScore = totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : 0;

    // Topic mastery from flashcards
    const topicMap = new Map<string, { total: number; mastered: number }>();
    flashcards.forEach((f) => {
      const topic = f.topic || "General";
      if (!topicMap.has(topic)) topicMap.set(topic, { total: 0, mastered: 0 });
      const t = topicMap.get(topic)!;
      t.total++;
      if ((f.mastery_level || 0) >= 3) t.mastered++;
    });

    const allTopics = Array.from(topicMap.entries());
    const mastered = allTopics.filter(([, v]) => v.mastered / v.total >= 0.7);
    const weak = allTopics
      .filter(([, v]) => v.mastered / v.total < 0.5 && v.total >= 2)
      .map(([topic, v]) => ({
        topic,
        score: Math.round((v.mastered / v.total) * 100),
        recommendation: `Review ${topic} flashcards`,
      }));

    const strong = allTopics
      .filter(([, v]) => v.mastered / v.total >= 0.7)
      .map(([topic, v]) => ({
        topic,
        score: Math.round((v.mastered / v.total) * 100),
      }));

    setWeakAreas(weak.slice(0, 3));
    setStrengths(strong.slice(0, 3));

    // Calculate streak
    let streak = 0;
    if (progress.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dates = progress.map((p) => {
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

    // Weekly hours
    const thisWeek = progress.filter((p) => {
      const d = new Date(p.date);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays < 7;
    });

    const totalHours = thisWeek.reduce((sum, p) => sum + (p.study_minutes || 0), 0) / 60;

    // Map to days of week
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekHours = new Array(7).fill(0);
    thisWeek.forEach((p) => {
      const dayIndex = new Date(p.date).getDay();
      weekHours[dayIndex] += (p.study_minutes || 0) / 60;
    });

    setWeeklyData([
      { day: "Mon", hours: Math.round(weekHours[1] * 10) / 10 },
      { day: "Tue", hours: Math.round(weekHours[2] * 10) / 10 },
      { day: "Wed", hours: Math.round(weekHours[3] * 10) / 10 },
      { day: "Thu", hours: Math.round(weekHours[4] * 10) / 10 },
      { day: "Fri", hours: Math.round(weekHours[5] * 10) / 10 },
      { day: "Sat", hours: Math.round(weekHours[6] * 10) / 10 },
      { day: "Sun", hours: Math.round(weekHours[0] * 10) / 10 },
    ]);

    setStats({
      studyStreak: streak,
      totalQuizzes,
      averageScore,
      topicsMastered: mastered.length,
      totalTopics: Math.max(allTopics.length, 1),
      hoursStudied: Math.round(totalHours * 10) / 10,
    });
  };

  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1);

  return (
    <div className="min-h-screen bg-background">
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
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Study Streak", value: `${stats.studyStreak} days`, icon: Zap, color: "text-neuraal-amber", bg: "bg-neuraal-amber/10" },
            { label: "Quizzes Taken", value: stats.totalQuizzes, icon: Target, color: "text-primary", bg: "bg-primary/10" },
            { label: "Avg. Score", value: `${stats.averageScore}%`, icon: TrendingUp, color: "text-neuraal-emerald", bg: "bg-neuraal-emerald/10" },
            { label: "Topics Mastered", value: `${stats.topicsMastered}/${stats.totalTopics}`, icon: BookOpen, color: "text-accent", bg: "bg-accent/10" },
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
            <span className="font-semibold">{stats.hoursStudied} hours</span>
          </div>
        </section>

        {(weakAreas.length > 0 || strengths.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {weakAreas.length > 0 && (
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
                        <div className="h-full bg-neuraal-amber transition-all duration-500" style={{ width: `${area.score}%` }} />
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
            )}

            {strengths.length > 0 && (
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
                        <div className="h-full bg-neuraal-emerald transition-all duration-500" style={{ width: `${area.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/quiz")}>
                  <Target className="w-4 h-4 mr-2" />
                  Challenge Yourself
                </Button>
              </section>
            )}
          </div>
        )}

        <section className="neuraal-card p-6">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Topic Mastery
          </h2>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="font-semibold">
                {stats.totalTopics > 0 ? Math.round((stats.topicsMastered / stats.totalTopics) * 100) : 0}%
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${stats.totalTopics > 0 ? (stats.topicsMastered / stats.totalTopics) * 100 : 0}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {stats.topicsMastered > 0
              ? `You have mastered ${stats.topicsMastered} out of ${stats.totalTopics} topics in ${profile?.program || "your program"}. Keep going!`
              : "Start studying to track your topic mastery here!"}
          </p>
        </section>
      </main>
    </div>
  );
}