import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/onboarding");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      await signup(email, password, name);
      toast.success("Account created! Let's set up your study profile.");
      navigate("/onboarding");
    } catch (error: any) {
      const message = error?.message || "Signup failed. Please try again.";
      if (message.includes("Load failed") || message.includes("fetch")) {
        toast.error("Unable to connect to the server. Please check your internet connection and try again.");
      } else if (message.includes("already registered")) {
        toast.error("This email is already registered. Please log in instead.");
      } else {
        toast.error(message);
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error?.message || "Failed to sign up with Google");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent to-neuraal-emerald items-center justify-center p-12">
        <div className="max-w-lg text-accent-foreground text-center">
          <div className="mb-8">
            <NeuraalLogo size="xl" showText={false} />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">
            Begin Your Journey
          </h2>
          <p className="text-accent-foreground/80 text-lg">
            Join thousands of students excelling with personalized AI study support
          </p>
          
          {/* Feature list */}
          <div className="mt-8 space-y-3 text-left">
            {[
              "Syllabus-aligned explanations",
              "Auto-generated quizzes",
              "Smart flashcards",
              "Progress tracking",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent-foreground/20 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            <NeuraalLogo size="md" />
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground">
              Start your free learning journey today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password requirements */}
              <div className="flex gap-4 mt-2">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-1.5 text-xs ${
                      req.met ? "text-neuraal-emerald" : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                        req.met ? "bg-neuraal-emerald/20" : "bg-muted"
                      }`}
                    >
                      {req.met && <Check className="w-2 h-2" />}
                    </div>
                    {req.label}
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full h-12" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login link */}
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => navigate("/login")}
          >
            Log in instead
          </Button>
        </div>
      </div>
    </div>
  );
}
