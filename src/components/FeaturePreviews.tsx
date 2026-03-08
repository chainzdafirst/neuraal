import { Brain, Copy, Target, Check, X, BookOpen, ChevronRight, LayoutGrid, ChevronLeft, Sparkles, BarChart3, Zap, TrendingUp, AlertTriangle, Send } from "lucide-react";

/* ─── AI TUTOR PREVIEW ─── */
export function PreviewAITutor() {
  return (
    <div className="bg-background rounded-[16px] border border-border overflow-hidden shadow-lg text-left">
      {/* Header */}
      <div className="border-b border-border/50 px-4 h-10 flex items-center gap-2 bg-white/80">
        <div className="p-1 rounded-md bg-primary/10"><Brain className="w-3 h-3 text-primary" /></div>
        <span className="text-xs font-semibold">Neuraal Tutor</span>
      </div>
      {/* Chat */}
      <div className="p-3 space-y-3 text-[11px] leading-relaxed max-h-[260px] overflow-hidden">
        {/* User */}
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground rounded-xl rounded-br-sm px-3 py-2 max-w-[75%]">
            Explain the law of diminishing marginal returns
          </div>
        </div>
        {/* Assistant */}
        <div className="flex justify-start">
          <div className="bg-card rounded-xl border border-border/50 p-3 max-w-[85%] space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1 rounded-md bg-primary/10"><Brain className="w-2.5 h-2.5 text-primary" /></div>
              <span className="text-[10px] font-medium">Neuraal</span>
            </div>
            <p className="font-semibold text-[11px]">Law of Diminishing Marginal Returns</p>
            <p>As you add more of one <strong>variable input</strong> (e.g. labour) while keeping others fixed:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Initially</strong> — Output increases at an increasing rate</li>
              <li><strong>Then</strong> — Output still rises but at a decreasing rate</li>
              <li><strong>Eventually</strong> — Additional units may reduce total output</li>
            </ul>
            <p>This explains why firms can't scale infinitely by adding only one factor.</p>
          </div>
        </div>
      </div>
      {/* Input */}
      <div className="border-t border-border/50 px-3 py-2 flex items-center gap-2 bg-white/80">
        <div className="flex-1 h-7 rounded-md border border-border bg-background px-2 text-[10px] text-muted-foreground flex items-center">Ask Neuraal anything...</div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center"><Send className="w-3 h-3 text-white" /></div>
      </div>
    </div>
  );
}

/* ─── QUIZ PREVIEW ─── */
export function PreviewQuiz() {
  return (
    <div className="bg-background rounded-[16px] border border-border overflow-hidden shadow-lg text-left">
      <div className="border-b border-border/50 px-4 h-10 flex items-center gap-2 bg-white/80">
        <div className="p-1 rounded-md bg-neuraal-amber/10"><Target className="w-3 h-3 text-neuraal-amber" /></div>
        <span className="text-xs font-semibold">Quizzes & Tests</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Question 5 of 10</span><span className="font-medium text-foreground">Communication Skills</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: "50%" }} />
        </div>
        <p className="text-sm font-semibold mt-2">What is the worst-case time complexity of QuickSort?</p>
        <div className="space-y-2 text-[11px]">
          {[
            { label: "O(n log n)", correct: false },
            { label: "O(n²)", correct: true },
            { label: "O(n)", correct: false },
            { label: "O(log n)", correct: false },
          ].map((o, i) => (
            <div key={i} className={`p-2.5 rounded-lg border-2 flex items-center gap-2 ${o.correct ? "border-neuraal-emerald bg-neuraal-emerald/10" : "border-border opacity-50"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium ${o.correct ? "bg-neuraal-emerald text-white" : "bg-secondary"}`}>
                {o.correct ? <Check className="w-3 h-3" /> : String.fromCharCode(65 + i)}
              </div>
              <span>{o.label}</span>
            </div>
          ))}
        </div>
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-[11px]">
          <div className="flex items-center gap-1.5 font-semibold mb-1"><BookOpen className="w-3 h-3 text-accent" /> Explanation</div>
          <p className="text-muted-foreground">QuickSort's worst case occurs when the pivot is always the smallest or largest element, leading to O(n²) comparisons.</p>
        </div>
      </div>
    </div>
  );
}

/* ─── SUMMARY PREVIEW ─── */
export function PreviewSummary() {
  return (
    <div className="bg-background rounded-[16px] border border-border overflow-hidden shadow-lg text-left">
      <div className="border-b border-border/50 px-4 h-10 flex items-center gap-2 bg-white/80">
        <div className="p-1 rounded-md bg-accent/10"><Sparkles className="w-3 h-3 text-accent" /></div>
        <div className="min-w-0">
          <span className="text-xs font-semibold">Smart Summary</span>
          <span className="text-[9px] text-muted-foreground ml-2">Project_Management.pdf</span>
        </div>
      </div>
      <div className="p-4 text-[11px] leading-relaxed max-h-[280px] overflow-hidden space-y-3">
        <div>
          <h3 className="text-sm font-bold font-display">Project Management — Chapter 3 Summary</h3>
          <p className="text-[10px] text-muted-foreground">9 key concepts identified</p>
        </div>
        <div>
          <h4 className="font-semibold mb-1.5">📋 Key Concepts</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Triple Constraint</strong> — Scope, Time, and Cost balance</li>
            <li><strong>Critical Path Method</strong> — Longest sequence of dependent tasks</li>
            <li><strong>Stakeholder Analysis</strong> — Power/interest grid for engagement</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-1.5">🔄 Agile Methodology</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Sprints</strong> — Time-boxed iterations (2-4 weeks)</li>
            <li><strong>Scrum Roles</strong> — Product Owner, Scrum Master, Dev Team</li>
            <li><strong>Retrospectives</strong> — Continuous improvement after each sprint</li>
          </ul>
        </div>
        <div className="bg-card rounded-lg border border-border/50 p-2.5 text-[10px] space-y-1">
          <p>✅ Define the triple constraint triangle</p>
          <p>✅ Identify the critical path in a project</p>
          <p>✅ Compare Agile vs Waterfall methodologies</p>
        </div>
      </div>
    </div>
  );
}

/* ─── FLASHCARDS PREVIEW ─── */
export function PreviewFlashcards() {
  return (
    <div className="bg-background rounded-[16px] border border-border overflow-hidden shadow-lg text-left">
      <div className="border-b border-border/50 px-4 h-10 flex items-center gap-2 bg-white/80">
        <div className="p-1 rounded-md bg-neuraal-emerald/10"><LayoutGrid className="w-3 h-3 text-neuraal-emerald" /></div>
        <span className="text-xs font-semibold">Flashcards</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between text-[10px] mb-2">
          <span className="text-muted-foreground">Card 7 of 20</span>
          <div className="flex gap-1.5"><span className="text-neuraal-emerald font-medium">6 mastered</span><span className="text-muted-foreground">· 14 remaining</span></div>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-neuraal-emerald to-accent" style={{ width: "30%" }} />
        </div>
        <div className="text-center mb-3">
          <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary text-[10px]">Economics</span>
        </div>
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-border/50 p-6 text-center min-h-[120px] flex flex-col items-center justify-center">
          <div className="text-[9px] text-primary uppercase tracking-wide mb-2">Answer</div>
          <p className="text-xs leading-relaxed">
            <strong>GDP</strong> measures total value of goods & services produced in a country over a period.<br /><br />
            <strong>GNP</strong> adds income earned abroad and subtracts income earned domestically by foreigners.
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 border border-destructive/30 rounded-lg py-2 flex items-center justify-center gap-1.5 text-[11px]">
            <X className="w-3 h-3 text-destructive" /> Needs Practice
          </div>
          <div className="flex-1 border border-neuraal-emerald/30 rounded-lg py-2 flex items-center justify-center gap-1.5 text-[11px]">
            <Check className="w-3 h-3 text-neuraal-emerald" /> Got It
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-muted-foreground">
          <ChevronLeft className="w-4 h-4" />
          <div className="flex items-center gap-1 text-[10px]"><Sparkles className="w-3 h-3" /> Shuffle</div>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

/* ─── PROGRESS PREVIEW ─── */
export function PreviewProgress() {
  const weeklyData = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 1.8 },
    { day: "Wed", hours: 3.2 },
    { day: "Thu", hours: 0.5 },
    { day: "Fri", hours: 2.0 },
    { day: "Sat", hours: 4.1 },
    { day: "Sun", hours: 1.5 },
  ];
  const maxH = Math.max(...weeklyData.map((d) => d.hours));

  return (
    <div className="bg-background rounded-[16px] border border-border overflow-hidden shadow-lg text-left">
      <div className="border-b border-border/50 px-4 h-10 flex items-center gap-2 bg-white/80">
        <div className="p-1 rounded-md bg-accent/10"><BarChart3 className="w-3 h-3 text-accent" /></div>
        <span className="text-xs font-semibold">Progress</span>
      </div>
      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Streak", value: "12 days", icon: Zap, color: "text-neuraal-amber", bg: "bg-neuraal-amber/10" },
            { label: "Quizzes", value: "24", icon: Target, color: "text-primary", bg: "bg-primary/10" },
            { label: "Avg.", value: "78%", icon: TrendingUp, color: "text-neuraal-emerald", bg: "bg-neuraal-emerald/10" },
            { label: "Mastered", value: "8/12", icon: BookOpen, color: "text-accent", bg: "bg-accent/10" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-lg border border-border/50 p-2">
              <div className={`inline-flex p-1 rounded-md ${s.bg} mb-1`}><s.icon className={`w-3 h-3 ${s.color}`} /></div>
              <div className="text-sm font-bold font-display">{s.value}</div>
              <div className="text-[9px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        {/* Chart */}
        <div className="bg-card rounded-lg border border-border/50 p-3">
          <div className="text-[11px] font-semibold mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-primary" /> This Week
          </div>
          <div className="flex items-end justify-between h-20 gap-1">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-primary to-accent rounded-t" style={{ height: `${(d.hours / maxH) * 100}%`, minHeight: "4px" }} />
                <span className="text-[8px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-border flex justify-between text-[10px]">
            <span className="text-muted-foreground">Total</span><span className="font-semibold">15.6h</span>
          </div>
        </div>
        {/* Strengths/Weak */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-card rounded-lg border border-border/50 p-2.5">
            <div className="text-[10px] font-semibold mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-neuraal-amber" /> Improve</div>
            {[{ t: "Data Structures", s: 35 }, { t: "Microeconomics", s: 42 }].map((a) => (
              <div key={a.t} className="mb-1.5">
                <div className="flex justify-between text-[9px] mb-0.5"><span>{a.t}</span><span className="text-neuraal-amber">{a.s}%</span></div>
                <div className="h-1 bg-secondary rounded-full"><div className="h-full bg-neuraal-amber rounded-full" style={{ width: `${a.s}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-lg border border-border/50 p-2.5">
            <div className="text-[10px] font-semibold mb-2 flex items-center gap-1"><Zap className="w-3 h-3 text-neuraal-emerald" /> Strengths</div>
            {[{ t: "Agile Methods", s: 92 }, { t: "Algorithms", s: 85 }].map((a) => (
              <div key={a.t} className="mb-1.5">
                <div className="flex justify-between text-[9px] mb-0.5"><span>{a.t}</span><span className="text-neuraal-emerald">{a.s}%</span></div>
                <div className="h-1 bg-secondary rounded-full"><div className="h-full bg-neuraal-emerald rounded-full" style={{ width: `${a.s}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
