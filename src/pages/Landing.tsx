import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Brain,
  FileText,
  Target,
  Sparkles,
  BarChart3,
  ChevronRight,
} from "lucide-react";

import { PreviewAITutor, PreviewQuiz, PreviewSummary, PreviewFlashcards, PreviewProgress } from "@/components/FeaturePreviews";

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

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  preview: React.ReactNode;
  gradient: string;
  reverse?: boolean;
}

function FeatureCard({ icon: Icon, title, description, preview, gradient, reverse }: FeatureCardProps) {
  return (
    <div className={`flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} gap-6 sm:gap-10 items-center`}>
      <div className="flex-1 w-full lg:w-auto">
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold tracking-[-0.01em]">{title}</h3>
        </div>
        <p className="text-muted-foreground text-[15px] sm:text-base leading-relaxed max-w-md">
          {description}
        </p>
      </div>
      <div className="flex-1 w-full lg:w-auto">
        {preview}
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Brain,
      title: "AI Tutor",
      description: "Get step-by-step explanations tailored to your syllabus. Ask questions and get instant, curriculum-aware answers.",
      gradient: "from-[hsl(234,89%,54%)] to-[hsl(270,80%,60%)]",
      preview: <PreviewAITutor />,
    },
    {
      icon: FileText,
      title: "Smart Summaries",
      description: "Transform bulky lecture notes into exam-ready summaries. Structured and easy to revise from.",
      gradient: "from-[hsl(187,85%,43%)] to-[hsl(210,90%,55%)]",
      preview: <PreviewSummary />,
    },
    {
      icon: Target,
      title: "Quizzes & Tests",
      description: "Practice with auto-generated exam-style questions. Track your accuracy and improve weak areas.",
      gradient: "from-[hsl(38,92%,50%)] to-[hsl(350,89%,60%)]",
      preview: <PreviewQuiz />,
    },
    {
      icon: Sparkles,
      title: "Flashcards",
      description: "Master concepts with spaced repetition. AI generates flashcards from your notes automatically.",
      gradient: "from-[hsl(160,84%,39%)] to-[hsl(187,85%,43%)]",
      preview: <PreviewFlashcards />,
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "Monitor your study performance over time. See how much you've revised and where you need to focus.",
      gradient: "from-[hsl(350,89%,60%)] to-[hsl(38,92%,50%)]",
      preview: <PreviewProgress />,
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
      {/* Navigation */}
      <nav className="max-w-[1360px] px-5 sm:px-[70px] mx-auto flex items-center justify-between py-4">
        <NeuraalLogo size="lg" />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
          <a href="#pricing" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <Button variant="hero" size="default" className="text-sm font-extrabold" onClick={() => navigate("/signup")}>
            Get Started for Free
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10" aria-label="Open menu">
              <span className="block w-6 h-[2.5px] rounded-full bg-foreground" />
              <span className="block w-6 h-[2.5px] rounded-full bg-foreground" />
              <span className="block w-6 h-[2.5px] rounded-full bg-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] pt-12">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-6">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-foreground">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-foreground">How it Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-foreground">Pricing</a>
              <Button variant="hero" size="default" className="text-sm font-extrabold mt-4" onClick={() => { setMobileMenuOpen(false); navigate("/signup"); }}>
                Get Started for Free
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      {/* Hero Section */}
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

      {/* Feature Sections — Alternating layout with screenshots */}
      <section id="features" className="max-w-[1360px] px-5 sm:px-[70px] mx-auto py-16 sm:py-24 space-y-16 sm:space-y-28">
        {features.map((feature, i) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            preview={feature.preview}
            gradient={feature.gradient}
            reverse={i % 2 !== 0}
          />
        ))}
      </section>

      {/* Social Proofid="pricing"  / Stats */}
 id="pricing"      <section className="py-24 max-w-[1360px] px-5 sm:px-[70px] mx-auto">
        <div>
          <div className="rounded-[16px] border border-border bg-card p-10 md:p-14">
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

      {/* How iid="how-it-works" t works */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-[1360px] px-5 sm:px-[70px] mx-auto max-w-3xl">
          <h2 className="text-[28px] sm:text-[40px] font-display font-bold text-center mb-16 tracking-[-0.02em]">
            Simple to get started
          </h2>

          <div className="space-y-12">
            {steps.map((item) => (
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
      <section className="py-28 max-w-[1360px] px-5 sm:px-[70px] mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <NeuraalLogo size="lg" showText={false} className="justify-center mb-8" />
          <h2 className="text-[28px] sm:text-[40px] font-display font-bold mb-4 tracking-[-0.02em]">
            Ready to study smarter?
          </h2>
          <p className="text-muted-foreground text-[15px] sm:text-lg font-semibold max-w-xl mx-auto mb-10">
            Join thousands of students transforming their academic performance with Neuraal.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/signup")} className="h-[57px] leading-[57px] px-10 text-sm font-extrabold">
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
