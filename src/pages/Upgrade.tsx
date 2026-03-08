import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft, Crown, Zap, Star } from "lucide-react";

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
    <div className="min-h-screen bg-background">
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

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neuraal-amber/20 to-neuraal-rose/20 text-neuraal-amber mb-4">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-semibold">Upgrade to Premium</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            Unlock Your Full Potential
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Choose the plan that fits your study schedule. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isPopular = plan.popular;

            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative neuraal-card p-6 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col ${
                  isPopular
                    ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                    : isSelected
                    ? "border-primary/50"
                    : ""
                }`}
              >
                {/* Badges */}
                <div className="flex items-center gap-2 mb-4 min-h-[28px]">
                  {isPopular && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                      Most Popular
                    </Badge>
                  )}
                  {plan.discount && (
                    <Badge variant="secondary" className="text-neuraal-emerald bg-neuraal-emerald/10 border-neuraal-emerald/20 text-[10px] px-2 py-0.5">
                      Save {plan.discount}%
                    </Badge>
                  )}
                </div>

                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isPopular
                        ? "bg-primary/10"
                        : plan.id === "yearly"
                        ? "bg-neuraal-amber/10"
                        : "bg-secondary"
                    }`}
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
                  <h3 className="text-lg font-display font-semibold">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">ZMW {plan.price}</span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                  {plan.id === "yearly" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      That's ZMW {(plan.price / 12).toFixed(2)}/month
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-neuraal-emerald shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={isPopular ? "gradient" : "outline"}
                  className="w-full"
                >
                  Start 7-Day Free Trial
                </Button>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          All plans include a 7-day free trial. No commitment, cancel anytime.
        </p>
      </main>
    </div>
  );
}
