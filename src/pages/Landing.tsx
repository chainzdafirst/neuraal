import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Brain, 
  FileText, 
  GraduationCap, 
  Sparkles, 
  Target,
  ChevronRight,
  Zap,
  Shield,
  Clock
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI Tutor",
      description: "Get step-by-step explanations tailored to your syllabus",
      color: "text-neuraal-indigo",
      bg: "bg-neuraal-indigo/10",
    },
    {
      icon: FileText,
      title: "Smart Summaries",
      description: "Transform bulky notes into exam-ready summaries",
      color: "text-neuraal-cyan",
      bg: "bg-neuraal-cyan/10",
    },
    {
      icon: Target,
      title: "Quizzes & Tests",
      description: "Practice with auto-generated exam-style questions",
      color: "text-neuraal-amber",
      bg: "bg-neuraal-amber/10",
    },
    {
      icon: Sparkles,
      title: "Flashcards",
      description: "Master concepts with spaced repetition",
      color: "text-neuraal-emerald",
      bg: "bg-neuraal-emerald/10",
    },
  ];

  const benefits = [
    { icon: Zap, text: "Syllabus-aligned learning" },
    { icon: Shield, text: "Exam-focused revision" },
    { icon: Clock, text: "Study smarter, not harder" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 neuraal-glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <NeuraalLogo size="sm" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Log in
            </Button>
            <Button variant="gradient" onClick={() => navigate("/signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow animation-delay-300" />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-neuraal-amber/10 rounded-full blur-3xl animate-pulse-slow animation-delay-500" />
        </div>

        <div className="container mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4" />
            AI-Powered Study Companion
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6 animate-fade-up animation-delay-100">
            Your Syllabus-Aligned
            <br />
            <span className="neuraal-gradient-text">AI Study Partner</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-200">
            Turn complex lecture notes into structured, exam-ready learning. 
            Neuraal helps you understand, revise, and prepare — smarter.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up animation-delay-300">
            <Button variant="hero" size="xl" onClick={() => navigate("/signup")}>
              <GraduationCap className="w-5 h-5 mr-2" />
              Start Learning Free
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/login")}>
              I have an account
            </Button>
          </div>

          {/* Benefits pills */}
          <div className="flex flex-wrap justify-center gap-4 animate-fade-up animation-delay-400">
            {benefits.map((benefit) => (
              <div
                key={benefit.text}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm"
              >
                <benefit.icon className="w-4 h-4 text-accent" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Everything You Need to <span className="neuraal-gradient-text">Excel</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powered by curriculum-aware AI that adapts to your learning style
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="neuraal-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="neuraal-card p-8 md:p-12 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "300K+", label: "Students in Zambia" },
                { value: "24/7", label: "AI Availability" },
                { value: "100%", label: "Syllabus Aligned" },
                { value: "$2-6", label: "Monthly Price" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-display font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-primary-foreground/80 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex mb-6">
            <NeuraalLogo size="lg" showText={false} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Ready to Study Smarter?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Join thousands of students transforming their academic performance with Neuraal
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/signup")}>
            Get Started — It's Free
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <NeuraalLogo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2024 Neuraal. Your AI Study Companion.
          </p>
        </div>
      </footer>
    </div>
  );
}