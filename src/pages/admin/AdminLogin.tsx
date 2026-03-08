import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Lock, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);

  // If already authenticated, check admin status and redirect
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const checkAndRedirect = async () => {
      setChecking(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (data && data.length > 0) {
        navigate("/admin");
      } else {
        toast.error("Access denied. You are not an admin.");
        await supabase.auth.signOut();
      }
      setChecking(false);
    };

    checkAndRedirect();
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
      // The useEffect above will handle admin check + redirect
    } catch (error: any) {
      const message = error?.message || "Login failed.";
      if (message.includes("Invalid login")) {
        toast.error("Invalid credentials");
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(222,47%,6%)] relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(234 89% 64%) 1px, transparent 1px), linear-gradient(90deg, hsl(234 89% 64%) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-[hsl(210,40%,98%)]">
            Neuraal Admin
          </h1>
          <p className="text-[hsl(215,20%,65%)] mt-1 text-sm">
            Authorized personnel only
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-[hsl(217,33%,17%)] bg-[hsl(222,47%,8%)] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[hsl(210,40%,98%)]">
                Admin Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,65%)]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@neuraal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-[hsl(222,47%,6%)] border-[hsl(217,33%,17%)] text-[hsl(210,40%,98%)] placeholder:text-[hsl(215,20%,45%)] focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[hsl(210,40%,98%)]">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(215,20%,65%)]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-[hsl(222,47%,6%)] border-[hsl(217,33%,17%)] text-[hsl(210,40%,98%)] placeholder:text-[hsl(215,20%,45%)] focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={isLoading || checking}
            >
              {isLoading || checking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign in to Admin"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[hsl(215,20%,45%)] text-xs mt-6">
          This portal is restricted to Neuraal administrators.
        </p>
      </div>
    </div>
  );
}
