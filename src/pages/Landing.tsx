import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  Sparkles,
  Target,
  ChevronRight,
  Upload,
  MessageSquare,
  BarChart3,
} from "lucide-react";

const rotatingWords = [
  "AI Tutor",
  "Smart Summaries",
  "Flashcards",
  "Quizzes",
  "Progress Tracking",
];

function RotatingText() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`neuraal-gradient-text inline-block transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {rotatingWords[index]}
    </span>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI Tutor",
      description:
        "Get step-by-step explanations tailored to your syllabus. Ask questions and get instant, curriculum-aware answers.",
      gradient: "from-[hsl(234,89%,54%)] to-[hsl(270,80%,60%)]",
    },
    {
      icon: FileText,
      title: "Smart Summaries",
      description:
        "Transform bulky lecture notes into exam-ready summaries. Structured and easy to revise from.",
      gradient: "from-[hsl(187,85%,43%)] to-[hsl(210,90%,55%)]",
    },
    {
      icon: Target,
      title: "Quizzes & Tests",
      description:
        "Practice with auto-generated exam-style questions. Track your accuracy and improve weak areas.",
      gradient: "from-[hsl(38,92%,50%)] to-[hsl(350,89%,60%)]",
    },
    {
      icon: Sparkles,
      title: "Flashcards",
      description:
        "Master concepts with spaced repetition. AI generates flashcards from your notes automatically.",
      gradient: "from-[hsl(160,84%,39%)] to-[hsl(187,85%,43%)]",
    },
    {
      icon: Upload,
      title: "Upload Anything",
      description:
        "PDF, DOCX, PPTX, EPUB — upload your notes in any format. We extract the text and make it study-ready.",
      gradient: "from-[hsl(270,80%,60%)] to-[hsl(234,89%,54%)]",
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description:
        "Monitor your study performance over time. See how much you've revised and where you need to focus.",
      gradient: "from-[hsl(350,89%,60%)] to-[hsl(38,92%,50%)]",
    },
  ];

  const steps = [
    {
      step: "Step 1",
      title: "Upload your notes",
      description: "PDF, DOCX, PPTX or EPUB — any format works.",
    },
    {
      step: "Step 2",
      title: "Choose your study tool",
      description: "Summaries, quizzes, flashcards, or AI tutor.",
    },
    {
      step: "Step 3",
      title: "Study smarter, ace your exams",
      description: "Revision material aligned to your syllabus.",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Top Banner */}
      <div className="bg-muted h-[38px] flex items-center justify-center">
        <p className="text-foreground text-sm font-semibold">🎓 Free for Zambian students — Start studying smarter today</p>
      </div>

      {/* Navigation */}
      <nav className="max-w-[1360px] px-5 sm:px-[70px] mx-auto flex items-center justify-between py-4">
        <NeuraalLogo size="sm" />
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="default" className="text-sm font-semibold" onClick={() => navigate("/login")}>
            Sign In
          </Button>
          <Button variant="hero" size="default" className="text-sm font-extrabold" onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
        </div>
      </nav>

      {/* Hero Section — Left-aligned like Flook */}
      <section className="pt-5 pb-5 sm:pt-9 sm:pb-[74px] max-w-[1360px] px-5 sm:px-[70px] mx-auto">
        <div>
          <h1 className="text-[40px] sm:text-[84px] font-display font-bold tracking-[-0.02em] leading-[48px] sm:leading-[100px] mb-6">
            Your Syllabus-Aligned
            <br />
            <RotatingText />
          </h1>

          <p className="text-[15px] sm:text-lg font-semibold text-foreground mb-6">
            Turn complex lecture notes into structured, exam-ready learning.
            Built for students. No developers required.
          </p>

          <Button variant="hero" size="xl" onClick={() => navigate("/signup")} className="h-[57px] leading-[57px] px-10 text-sm font-extrabold">
            Get Started
          </Button>
        </div>
      </section>

      {/* Feature Cards — 2-column grid with gradient backgrounds like Flook */}
      <section className="max-w-[1360px] px-5 sm:px-[70px] mx-auto">
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-9">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`relative rounded-[9px] sm:rounded-[16px] bg-gradient-to-r ${feature.gradient} p-8 min-h-[260px] sm:min-h-[574px] flex flex-col justify-end text-white overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}
              >
                {/* Subtle overlay for readability */}
                <div className="absolute inset-0 bg-black/10 rounded-3xl" />

                {/* Icon floating top-right */}
                <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity">
                  <feature.icon className="w-20 h-20" strokeWidth={1} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-3">
                    <feature.icon className="w-5 h-5" />
                    <h3 className="text-lg font-display font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed max-w-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats — Clean card */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-3xl border border-border bg-card p-10 md:p-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "300K+", label: "Students in Zambia" },
                { value: "24/7", label: "AI Availability" },
                { value: "100%", label: "Syllabus Aligned" },
                { value: "ZMW 25", label: "Monthly Price" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works — Numbered steps like Flook */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-16">
            Simple to get started
          </h2>

          <div className="space-y-12">
            {steps.map((item, i) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 text-xs font-semibold text-accent uppercase tracking-wider pt-1">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <NeuraalLogo size="lg" showText={false} className="justify-center mb-8" />
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Ready to study smarter?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands of students transforming their academic performance with Neuraal.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/signup")}>
            Get Started — It's Free
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <NeuraalLogo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2026 Neuraal. Your AI Study Companion.
          </p>
        </div>
      </footer>
    </div>
  );
}
