import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft, Crown, Zap, Star, Shield, Sparkles } from "lucide-react";

const plans = [
  {
    id: "weekly",
    name: "Weekly",
    price: 14.99,
    period: "week",
    icon: Zap,
    features: [
      "Unlimited AI Summaries",
      "Unlimited Quizzes",
      "AI Tutor Access",
      "Flashcard Generation",
      "Basic Progress Tracking",
    ],
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 24.99,
    period: "month",
    icon: Star,
    popular: true,
    discount: 62,
    features: [
      "Everything in Weekly",
      "Unlimited AI Summaries",
      "Exam Mode",
      "Priority AI Responses",
      "Advanced Analytics",
      "Study Planner",
    ],
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 349.99,
    period: "year",
    icon: Crown,
    discount: 55,
    features: [
      "Everything in Monthly",
      "Offline Access",
      "Custom Study Plans",
      "Priority Support",
      "Early Access to Features",
      "Unlimited Storage",
    ],
  },
];

export default function Upgrade() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <NeuraalLogo size="sm" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 sm:py-16 max-w-5xl relative z-10">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Upgrade to Premium</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold mb-4 tracking-tight">
            Unlock Your{" "}
            <span className="neuraal-gradient-text">Full Potential</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            Choose the plan that fits your study schedule. Start with a free trial, cancel anytime.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-12">
          {plans.map((plan, index) => {
            const isSelected = selectedPlan === plan.id;
            const isPopular = plan.popular;

            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`
                  group relative text-left rounded-2xl p-[1px] transition-all duration-300
                  animate-fade-up
                  ${isPopular
                    ? "bg-gradient-to-b from-primary via-primary/60 to-accent shadow-glow scale-[1.02] md:-mt-4 md:mb-4"
                    : isSelected
                    ? "bg-gradient-to-b from-primary/40 to-primary/10"
                    : "bg-border/60 hover:bg-border"
                  }
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Inner card */}
                <div className={`
                  relative h-full rounded-[15px] p-6 sm:p-7 flex flex-col
                  ${isPopular
                    ? "bg-card"
                    : "bg-card"
                  }
                `}>
                  {/* Popular ribbon */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-primary text-primary-foreground text-xs px-4 py-1 font-bold shadow-md border-0">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {/* Discount badge */}
                  {plan.discount && (
                    <div className="mb-5 flex">
                      <Badge
                        variant="secondary"
                        className="bg-neuraal-emerald/10 text-neuraal-emerald border-neuraal-emerald/20 text-xs font-bold px-3 py-1"
                      >
                        Save {plan.discount}%
                      </Badge>
                    </div>
                  )}
                  {!plan.discount && <div className="mb-5 h-[26px]" />}

                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`
                        p-2.5 rounded-xl transition-colors
                        ${isPopular
                          ? "bg-primary/10"
                          : plan.id === "yearly"
                          ? "bg-neuraal-amber/10"
                          : "bg-secondary"
                        }
                      `}
                    >
                      <plan.icon
                        className={`w-5 h-5 ${
                          isPopular
                            ? "text-primary"
                            : plan.id === "yearly"
                            ? "text-neuraal-amber"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <h3 className="text-lg font-display font-bold text-foreground">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                        ZMW {plan.price}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        /{plan.period}
                      </span>
                    </div>
                    {plan.id === "yearly" && (
                      <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                        That's ZMW {(plan.price / 12).toFixed(2)}/month
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border/60 mb-6" />

                  {/* Features */}
                  <ul className="space-y-3.5 flex-1 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <div className={`
                          mt-0.5 flex-shrink-0 w-4.5 h-4.5 rounded-full flex items-center justify-center
                          ${isPopular ? "text-primary" : "text-neuraal-emerald"}
                        `}>
                          <Check className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                        <span className="text-foreground/80 leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTAs */}
                  <div className="space-y-2.5">
                    <Button
                      variant={isPopular ? "gradient" : "outline"}
                      className="w-full h-12 font-bold text-sm"
                    >
                      Start 7-Day Free Trial
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full h-10 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Subscribe Now
                    </Button>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Trust footer */}
        <div className="text-center space-y-4 animate-fade-up" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Cancel anytime</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant access</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure payment</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60">
            All plans include a 7-day free trial. No commitment required.
          </p>
        </div>
      </main>
    </div>
  );
}
