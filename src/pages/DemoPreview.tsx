/**
 * DemoPreview — renders isolated, realistic "in-use" snapshots of each feature.
 * This page is only used to capture screenshots for the landing page.
 * Each section is separated by a data-feature attribute for easy screenshotting.
 */
import { Brain, Copy, Target, Check, X, BookOpen, ChevronRight, LayoutGrid, ChevronLeft, Sparkles, BarChart3, Zap, TrendingUp, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";

/* ─── AI TUTOR DEMO ─── */
function DemoAITutor() {
  return (
    <div data-feature="ai-tutor" className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-semibold">Neuraal Tutor</h1>
                <p className="text-xs text-muted-foreground">Your study companion</p>
              </div>
            </div>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
          {/* Assistant welcome */}
          <div className="flex justify-start">
            <div className="max-w-[85%] neuraal-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Neuraal</span>
              </div>
              <p className="text-sm leading-relaxed">Hey there! I'm Neuraal, your study companion. I'm here to help you break down complex topics, answer your questions, and keep you motivated. What would you like to explore today?</p>
            </div>
          </div>

          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3">
              <p className="text-sm">Explain the mechanism of action of aspirin</p>
            </div>
          </div>

          {/* Assistant detailed reply */}
          <div className="flex justify-start">
            <div className="max-w-[85%] neuraal-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Neuraal</span>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <p className="font-semibold">Aspirin (Acetylsalicylic Acid) — Mechanism of Action</p>
                <p>Aspirin works by <strong>irreversibly inhibiting cyclooxygenase (COX) enzymes</strong>, specifically COX-1 and COX-2:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>COX-1 inhibition</strong> — Blocks thromboxane A₂ production in platelets, preventing platelet aggregation (antiplatelet effect)</li>
                  <li><strong>COX-2 inhibition</strong> — Reduces prostaglandin synthesis at sites of inflammation, providing anti-inflammatory and analgesic effects</li>
                  <li><strong>Antipyretic action</strong> — Inhibits prostaglandin E₂ in the hypothalamus, lowering body temperature during fever</li>
                </ul>
                <p>The <strong>irreversible acetylation</strong> of COX is what distinguishes aspirin from other NSAIDs, making its antiplatelet effect last the entire lifespan of the platelet (~7–10 days).</p>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 neuraal-glass border-t border-border/50 p-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <Input placeholder="Ask Neuraal anything about your studies..." className="flex-1 h-12" readOnly />
            <Button variant="gradient" size="icon" className="h-12 w-12 rounded-full">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── QUIZ DEMO ─── */
function DemoQuiz() {
  return (
    <div data-feature="quizzes" className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-neuraal-amber/10">
                <Target className="w-5 h-5 text-neuraal-amber" />
              </div>
              <h1 className="font-display font-semibold">Quizzes & Tests</h1>
            </div>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Question 3 of 10</span>
            <span className="text-sm font-medium">Cell Biology</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: "30%" }} />
          </div>
        </div>

        <div className="neuraal-card p-6 mb-6">
          <h2 className="text-xl font-display font-semibold mb-6">Which of the following best describes the primary function of mitochondria?</h2>
          <div className="space-y-3">
            {[
              { label: "Protein synthesis and folding", correct: false, selected: false },
              { label: "ATP production through cellular respiration", correct: true, selected: true },
              { label: "DNA replication and repair", correct: false, selected: false },
              { label: "Lipid storage and metabolism", correct: false, selected: false },
            ].map((option, index) => (
              <div
                key={index}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  option.correct
                    ? "border-neuraal-emerald bg-neuraal-emerald/10"
                    : option.selected
                    ? "border-destructive bg-destructive/10"
                    : "border-border opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      option.correct
                        ? "bg-neuraal-emerald text-white"
                        : option.selected
                        ? "bg-destructive text-white"
                        : "bg-secondary"
                    }`}
                  >
                    {option.correct ? <Check className="w-4 h-4" /> : option.selected ? <X className="w-4 h-4" /> : String.fromCharCode(65 + index)}
                  </div>
                  <span>{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="neuraal-card p-6 mb-6 bg-accent/5 border-accent/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            Explanation
          </h3>
          <p className="text-muted-foreground text-sm">Mitochondria are known as the "powerhouse of the cell" because they generate most of the cell's supply of adenosine triphosphate (ATP) through oxidative phosphorylation during cellular respiration.</p>
        </div>

        <Button variant="gradient" size="lg" className="w-full">
          Next Question <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </main>
    </div>
  );
}

/* ─── SUMMARY DEMO ─── */
function DemoSummary() {
  return (
    <div data-feature="summaries" className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display font-semibold truncate">Smart Summary</h1>
                <p className="text-xs text-muted-foreground truncate">Biology_Chapter5_Notes.pdf</p>
              </div>
            </div>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="prose prose-sm max-w-none">
          <h1 className="text-2xl font-display font-bold mb-1">Cell Biology — Chapter 5 Summary</h1>
          <p className="text-muted-foreground text-sm mb-6">Generated from Biology_Chapter5_Notes.pdf · 12 key concepts identified</p>

          <h2 className="text-lg font-display font-semibold mt-6 mb-3">🧬 Key Concepts</h2>
          <ul className="space-y-2 text-sm list-disc pl-5">
            <li><strong>Cell Membrane</strong> — A selectively permeable phospholipid bilayer that regulates the passage of substances in and out of the cell</li>
            <li><strong>Fluid Mosaic Model</strong> — Describes the cell membrane as a dynamic structure with proteins floating in a fluid lipid bilayer</li>
            <li><strong>Endocytosis & Exocytosis</strong> — Active transport mechanisms for large molecules using vesicles</li>
          </ul>

          <h2 className="text-lg font-display font-semibold mt-6 mb-3">🔬 Cell Membrane Structure</h2>
          <ul className="space-y-2 text-sm list-disc pl-5">
            <li><strong>Phospholipids</strong> — Amphipathic molecules with hydrophilic heads and hydrophobic tails arranged in a bilayer</li>
            <li><strong>Cholesterol</strong> — Embedded within the bilayer to regulate fluidity and stability</li>
            <li><strong>Integral proteins</strong> — Span the entire membrane, functioning as channels, carriers, and receptors</li>
            <li><strong>Peripheral proteins</strong> — Attached to the surface, involved in signaling and structural support</li>
          </ul>

          <h2 className="text-lg font-display font-semibold mt-6 mb-3">⚡ Active Transport</h2>
          <ul className="space-y-2 text-sm list-disc pl-5">
            <li><strong>Sodium-Potassium Pump</strong> — Moves 3 Na⁺ out and 2 K⁺ into the cell per ATP molecule, maintaining electrochemical gradient</li>
            <li><strong>Proton Pumps</strong> — Establish hydrogen ion gradients essential for ATP synthesis in mitochondria</li>
            <li><strong>Co-transport</strong> — Uses the energy from ion gradients to transport other substances (e.g., glucose-sodium symport)</li>
          </ul>

          <h2 className="text-lg font-display font-semibold mt-6 mb-3">📋 Exam Focus Points</h2>
          <div className="neuraal-card p-4 text-sm space-y-2">
            <p>✅ Differentiate between passive and active transport with examples</p>
            <p>✅ Explain the fluid mosaic model and the role of each component</p>
            <p>✅ Describe the sodium-potassium pump mechanism and its significance</p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── FLASHCARDS DEMO ─── */
function DemoFlashcards() {
  return (
    <div data-feature="flashcards" className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-neuraal-emerald/10">
                <LayoutGrid className="w-5 h-5 text-neuraal-emerald" />
              </div>
              <h1 className="font-display font-semibold">Flashcards</h1>
            </div>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Card 4 of 15</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neuraal-emerald font-medium">3 mastered</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">12 remaining</span>
          </div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neuraal-emerald to-accent" style={{ width: "20%" }} />
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-4">
            <span className="inline-flex px-3 py-1 rounded-full bg-secondary text-sm">Cell Biology</span>
          </div>

          {/* Card — showing the answer side */}
          <div className="neuraal-card p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-accent/5" style={{ minHeight: "300px" }}>
            <div className="text-xs text-primary uppercase tracking-wide mb-4">Answer</div>
            <p className="text-lg leading-relaxed">
              <strong>Mitosis</strong> produces 2 identical diploid cells for growth & repair.
              <br /><br />
              <strong>Meiosis</strong> produces 4 genetically unique haploid cells (gametes) for sexual reproduction, involving crossing over and independent assortment.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <Button variant="outline" size="lg" className="flex-1 border-destructive/50 hover:bg-destructive/10">
              <X className="w-5 h-5 mr-2 text-destructive" />
              Needs Practice
            </Button>
            <Button variant="outline" size="lg" className="flex-1 border-neuraal-emerald/50 hover:bg-neuraal-emerald/10">
              <Check className="w-5 h-5 mr-2 text-neuraal-emerald" />
              Got It
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="sm">
              <Sparkles className="w-4 h-4 mr-1" /> Shuffle
            </Button>
            <Button variant="ghost" size="icon">
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── PROGRESS DEMO ─── */
function DemoProgress() {
  const weeklyData = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 1.8 },
    { day: "Wed", hours: 3.2 },
    { day: "Thu", hours: 0.5 },
    { day: "Fri", hours: 2.0 },
    { day: "Sat", hours: 4.1 },
    { day: "Sun", hours: 1.5 },
  ];
  const maxHours = Math.max(...weeklyData.map((d) => d.hours));

  return (
    <div data-feature="progress" className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            { label: "Study Streak", value: "12 days", icon: Zap, color: "text-neuraal-amber", bg: "bg-neuraal-amber/10" },
            { label: "Quizzes Taken", value: "24", icon: Target, color: "text-primary", bg: "bg-primary/10" },
            { label: "Avg. Score", value: "78%", icon: TrendingUp, color: "text-neuraal-emerald", bg: "bg-neuraal-emerald/10" },
            { label: "Topics Mastered", value: "8/12", icon: BookOpen, color: "text-accent", bg: "bg-accent/10" },
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
                  className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg"
                  style={{ height: `${(day.hours / maxHours) * 100}%`, minHeight: "8px" }}
                />
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total this week</span>
            <span className="font-semibold">15.6 hours</span>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <section className="neuraal-card p-6">
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-neuraal-amber" />
              Areas to Improve
            </h2>
            <div className="space-y-4">
              {[
                { topic: "Organic Chemistry", score: 35, recommendation: "Review organic chemistry flashcards" },
                { topic: "Thermodynamics", score: 42, recommendation: "Practice thermodynamics quizzes" },
              ].map((area) => (
                <div key={area.topic}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{area.topic}</span>
                    <span className="text-sm text-neuraal-amber">{area.score}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-neuraal-amber" style={{ width: `${area.score}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{area.recommendation}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="neuraal-card p-6">
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-neuraal-emerald" />
              Your Strengths
            </h2>
            <div className="space-y-4">
              {[
                { topic: "Cell Biology", score: 92 },
                { topic: "Pharmacology", score: 85 },
                { topic: "Anatomy", score: 78 },
              ].map((area) => (
                <div key={area.topic}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{area.topic}</span>
                    <span className="text-sm text-neuraal-emerald">{area.score}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-neuraal-emerald" style={{ width: `${area.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ─── PAGE ─── */
import { useSearchParams } from "react-router-dom";

export default function DemoPreview() {
  const [searchParams] = useSearchParams();
  const feature = searchParams.get("feature");

  if (feature === "ai-tutor") return <DemoAITutor />;
  if (feature === "quizzes") return <DemoQuiz />;
  if (feature === "summaries") return <DemoSummary />;
  if (feature === "flashcards") return <DemoFlashcards />;
  if (feature === "progress") return <DemoProgress />;

  return (
    <div className="p-8 text-center">
      <p>Add ?feature=ai-tutor|quizzes|summaries|flashcards|progress to URL</p>
    </div>
  );
}
