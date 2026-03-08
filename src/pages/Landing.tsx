import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Brain,
  FileText,
  Target,
  Sparkles,
  BarChart3,
  ChevronRight } from
"lucide-react";

import { PreviewAITutor, PreviewQuiz, PreviewSummary, PreviewFlashcards, PreviewProgress } from "@/components/FeaturePreviews";

const rotatingWords = [
"AI Tutoring",
"Smart Summaries",
"Flashcards",
"Quizzes"];


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
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`
      }>
      
      {rotatingWords[index]}
    </span>);

}

function ScrollReveal({ children, className = "", threshold = 0.15, delay = 0 }: {children: React.ReactNode;className?: string;threshold?: number;delay?: number;}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {if (entry.isIntersecting) {setVisible(true);obs.disconnect();}},
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      
      {children}
    </div>);

}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  preview: React.ReactNode;
  gradient: string;
  
}

function FeatureCard({ icon: Icon, title, description, preview, gradient }: FeatureCardProps) {
  return (
    <ScrollReveal>
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold tracking-[-0.01em]">{title}</h3>
        </div>
        <p className="text-muted-foreground text-[15px] sm:text-base leading-relaxed max-w-2xl">
          {description}
        </p>
        <div className="w-full md:aspect-video md:overflow-hidden md:rounded-[16px]">
          {preview}
        </div>
      </div>
    </ScrollReveal>);
}

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !(e.target as Element).closest('button[aria-label]')) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const features = [
  {
    icon: Brain,
    title: "AI Tutoring",
    description: "Get step-by-step explanations tailored to your syllabus. Ask questions and get instant, curriculum-aware answers.",
    gradient: "from-[hsl(234,89%,54%)] to-[hsl(270,80%,60%)]",
    preview: <PreviewAITutor />
  },
  {
    icon: FileText,
    title: "Smart Summaries",
    description: "Transform bulky lecture notes into exam-ready summaries. Structured and easy to revise from.",
    gradient: "from-[hsl(187,85%,43%)] to-[hsl(210,90%,55%)]",
    preview: <PreviewSummary />
  },
  {
    icon: Target,
    title: "Quizzes & Tests",
    description: "Practice with auto-generated exam-style questions. Track your accuracy and improve weak areas.",
    gradient: "from-[hsl(38,92%,50%)] to-[hsl(350,89%,60%)]",
    preview: <PreviewQuiz />
  },
  {
    icon: Sparkles,
    title: "Flashcards",
    description: "Master concepts with spaced repetition. AI generates flashcards from your notes automatically.",
    gradient: "from-[hsl(160,84%,39%)] to-[hsl(187,85%,43%)]",
    preview: <PreviewFlashcards />
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Monitor your study performance over time. See how much you've revised and where you need to focus.",
    gradient: "from-[hsl(350,89%,60%)] to-[hsl(38,92%,50%)]",
    preview: <PreviewProgress />
  }];


  const steps = [
  {
    step: "Step 1",
    title: "Upload your notes",
    description: "PDF, DOCX, PPTX or EPUB — any format works."
  },
  {
    step: "Step 2",
    title: "Choose your study tool",
    description: "Summaries, quizzes, flashcards, or AI tutor."
  },
  {
    step: "Step 3",
    title: "Study smarter, ace your exams",
    description: "Revision material aligned to your syllabus."
  }];


  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="max-w-[1360px] px-5 sm:px-[70px] mx-auto flex items-center justify-between py-4 relative">
        <NeuraalLogo size="lg" />

        {/* Hamburger / X toggle */}
        <div className="relative z-50">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col justify-center items-center w-10 h-10 gap-[5px] group"
            aria-label={menuOpen ? "Close menu" : "Open menu"}>
            
            <span className={`block w-6 h-[2.5px] rounded-full bg-foreground transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[7.5px]" : ""}`} />
            <span className={`block w-6 h-[2.5px] rounded-full bg-foreground transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-6 h-[2.5px] rounded-full bg-foreground transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[7.5px]" : ""}`} />
          </button>

          {/* Dropdown menu */}
          <div
            ref={menuRef}
            className={`absolute right-0 top-[52px] w-[220px] bg-card border border-border rounded-xl shadow-lg overflow-hidden transition-all duration-300 origin-top-right ${menuOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}>
            
            <div className="flex flex-col p-3 gap-1">
              <a href="#features" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-foreground hover:bg-secondary transition-colors">Features</a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-foreground hover:bg-secondary transition-colors">How it Works</a>
              <a href="#pricing" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-foreground hover:bg-secondary transition-colors">Pricing</a>
              <div className="border-t border-border my-1" />
              <Button variant="hero" size="sm" className="text-xs font-extrabold w-full" onClick={() => {setMenuOpen(false);navigate("/signup");}}>
                Get Started for Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <ScrollReveal threshold={0.1}>
        <section className="pt-5 pb-5 sm:pt-9 sm:pb-[74px] max-w-[1360px] px-5 sm:px-[70px] mx-auto">
          <div>
            <h1 className="text-[40px] sm:text-[84px] font-display font-bold tracking-[-0.02em] leading-[48px] sm:leading-[100px] mb-6">
              Syllabus-Aligned
              <br />
              <RotatingText />
            </h1>
            <p className="text-[15px] sm:text-lg font-semibold text-foreground mb-6">
              Turn bulky lecture notes into structured, exam-ready learning within minutes.  
            
            </p>
            <Button variant="hero" size="xl" onClick={() => navigate("/signup")} className="h-[57px] leading-[57px] px-10 text-sm font-extrabold">
              Get Started
            </Button>
          </div>
        </section>
      </ScrollReveal>

      {/* Feature Sections */}
      <section id="features" className="max-w-[1360px] px-5 sm:px-[70px] mx-auto py-16 sm:py-24 space-y-16 sm:space-y-28">
        <ScrollReveal>
          <h2 className="text-[32px] sm:text-[48px] font-display font-bold tracking-[-0.02em] text-center">
            Features
          </h2>
        </ScrollReveal>
        {features.map((feature, i) =>
        <FeatureCard
          key={feature.title}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          preview={feature.preview}
          gradient={feature.gradient}
          reverse={i % 2 !== 0} />

        )}
      </section>

      {/* Social Proof / Stats */}
      <ScrollReveal>
        <section id="pricing" className="max-w-[1360px] px-5 sm:px-[70px] mx-auto py-[9px]">
          <div>
            <div className="rounded-[16px] border border-border bg-card p-10 md:p-14">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                { value: "300K+", label: "Students in Zambia" },
                { value: "24/7", label: "AI Availability" },
                { value: "100%", label: "Syllabus Aligned" },
                { value: "ZMW 25", label: "Monthly Price" }].
                map((stat) =>
                <div key={stat.label}>
                    <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-secondary/30">
        <div className="max-w-[1360px] px-5 sm:px-[70px] mx-auto max-w-3xl">
          <ScrollReveal>
            <h2 className="text-[28px] font-display font-bold text-center tracking-[-0.02em] my-0 sm:text-5xl mb-[30px]">
              How it Works  
            </h2>
          </ScrollReveal>

          <div className="space-y-12 mb-[7px] mt-0">
            {steps.map((item, i) =>
            <ScrollReveal key={item.step} delay={i * 150}>
                <div className="flex gap-6 items-start">
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
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <ScrollReveal>
        <section className="max-w-[1360px] px-5 mx-auto py-[90px] sm:px-[50px]">
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
      </ScrollReveal>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <NeuraalLogo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2026 Neuraal. Your AI Study Companion.
          </p>
        </div>
      </footer>
    </div>);

}