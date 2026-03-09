import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Brain, BarChart3, TrendingUp, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalQuizzes: 0,
    totalFlashcards: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [profiles, documents, quizzes, flashcards] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase.from("quizzes").select("id", { count: "exact", head: true }),
        supabase.from("flashcards").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: profiles.count || 0,
        totalDocuments: documents.count || 0,
        totalQuizzes: quizzes.count || 0,
        totalFlashcards: flashcards.count || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const kpis = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Quizzes Created", value: stats.totalQuizzes, icon: Brain, color: "hsl(var(--neuraal-amber))" },
    { label: "Flashcards", value: stats.totalFlashcards, icon: BarChart3, color: "hsl(var(--neuraal-emerald))" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform-wide metrics at a glance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <kpi.icon className={`h-5 w-5 ${typeof kpi.color === "string" && kpi.color.startsWith("text-") ? kpi.color : ""}`} 
                  style={typeof kpi.color === "string" && !kpi.color.startsWith("text-") ? { color: kpi.color } : {}}
                />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? "..." : kpi.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Activity feed coming soon. This will show recent user signups, document uploads, and quiz completions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-accent" />
                Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Growth charts coming soon. Track user acquisition, engagement rates, and platform usage trends.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
