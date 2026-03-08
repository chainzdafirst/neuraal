import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Users, FileText, Brain, TrendingUp, MessageSquare, BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

const COLORS = [
  "hsl(234, 89%, 54%)", "hsl(187, 85%, 43%)", "hsl(38, 92%, 50%)",
  "hsl(160, 84%, 39%)", "hsl(350, 89%, 60%)",
];

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [userGrowth, setUserGrowth] = useState<{ date: string; count: number }[]>([]);
  const [contentBreakdown, setContentBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [dailyActivity, setDailyActivity] = useState<{ date: string; quizzes: number; flashcards: number; documents: number }[]>([]);
  const [topInstitutions, setTopInstitutions] = useState<{ name: string; users: number }[]>([]);
  const [totals, setTotals] = useState({ users: 0, documents: 0, quizzes: 0, flashcards: 0, chatMessages: 0 });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const [profilesRes, docsRes, quizzesRes, flashRes, chatRes] = await Promise.all([
        supabase.from("profiles").select("id, created_at, institution"),
        supabase.from("documents").select("id, created_at"),
        supabase.from("quizzes").select("id, created_at"),
        supabase.from("flashcards").select("id, created_at"),
        supabase.from("chat_messages").select("id, created_at"),
      ]);

      const profiles = profilesRes.data || [];
      const docs = docsRes.data || [];
      const quizzes = quizzesRes.data || [];
      const flash = flashRes.data || [];
      const chats = chatRes.data || [];

      setTotals({
        users: profiles.length,
        documents: docs.length,
        quizzes: quizzes.length,
        flashcards: flash.length,
        chatMessages: chats.length,
      });

      // User growth (last 30 days)
      const last30 = Array.from({ length: 30 }, (_, i) => {
        const d = startOfDay(subDays(new Date(), 29 - i));
        return { date: format(d, "MMM d"), count: 0, _date: d };
      });
      profiles.forEach((p) => {
        const d = startOfDay(new Date(p.created_at));
        const entry = last30.find((e) => e._date.getTime() === d.getTime());
        if (entry) entry.count++;
      });
      setUserGrowth(last30.map(({ date, count }) => ({ date, count })));

      // Content breakdown
      setContentBreakdown([
        { name: "Documents", value: docs.length },
        { name: "Quizzes", value: quizzes.length },
        { name: "Flashcards", value: flash.length },
        { name: "Chat Messages", value: chats.length },
      ]);

      // Daily activity (last 14 days)
      const last14 = Array.from({ length: 14 }, (_, i) => {
        const d = startOfDay(subDays(new Date(), 13 - i));
        return { date: format(d, "MMM d"), quizzes: 0, flashcards: 0, documents: 0, _date: d };
      });
      const mapToDay = (items: any[], key: keyof typeof last14[0]) => {
        items.forEach((item) => {
          const d = startOfDay(new Date(item.created_at));
          const entry = last14.find((e) => e._date.getTime() === d.getTime());
          if (entry) (entry as any)[key]++;
        });
      };
      mapToDay(docs, "documents");
      mapToDay(quizzes, "quizzes");
      mapToDay(flash, "flashcards");
      setDailyActivity(last14.map(({ _date, ...rest }) => rest));

      // Top institutions
      const instMap: Record<string, number> = {};
      profiles.forEach((p) => {
        const inst = p.institution || "Unknown";
        instMap[inst] = (instMap[inst] || 0) + 1;
      });
      setTopInstitutions(
        Object.entries(instMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, users]) => ({ name, users }))
      );

      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Analytics & Reporting</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform-wide engagement, content, and performance insights</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: "Users", value: totals.users, icon: Users, color: "text-primary" },
            { label: "Documents", value: totals.documents, icon: FileText, color: "text-accent" },
            { label: "Quizzes", value: totals.quizzes, icon: Brain, color: "text-[hsl(var(--neuraal-amber))]" },
            { label: "Flashcards", value: totals.flashcards, icon: BookOpen, color: "text-[hsl(var(--neuraal-emerald))]" },
            { label: "AI Chats", value: totals.chatMessages, icon: MessageSquare, color: "text-[hsl(var(--neuraal-rose))]" },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-4 pb-3 flex items-center gap-3">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                <div>
                  <p className="text-2xl font-bold">{loading ? "..." : kpi.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="engagement" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="engagement"><TrendingUp className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Engagement</span><span className="sm:hidden">Engage</span></TabsTrigger>
            <TabsTrigger value="content"><FileText className="h-4 w-4 mr-1 sm:mr-2" />Content</TabsTrigger>
            <TabsTrigger value="institutions"><Users className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Institutions</span><span className="sm:hidden">Schools</span></TabsTrigger>
          </TabsList>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth (Last 30 Days)</CardTitle>
                  <CardDescription>New registrations per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                        <Bar dataKey="count" fill="hsl(234, 89%, 54%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Activity (Last 14 Days)</CardTitle>
                  <CardDescription>Documents, quizzes, and flashcards created</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                        <Legend />
                        <Line type="monotone" dataKey="documents" stroke="hsl(234, 89%, 54%)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="quizzes" stroke="hsl(187, 85%, 43%)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="flashcards" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Breakdown</CardTitle>
                  <CardDescription>Distribution of generated content types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={contentBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {contentBreakdown.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contentBreakdown.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Badge variant="secondary">{item.value.toLocaleString()}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Institutions Tab */}
          <TabsContent value="institutions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Institutions by Users</CardTitle>
                <CardDescription>Institutions with the most registered learners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topInstitutions} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                      <Bar dataKey="users" fill="hsl(187, 85%, 43%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
