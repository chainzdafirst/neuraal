import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      toast.error(error?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-block mb-8">
          <NeuraalLogo size="md" />
        </Link>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold">Check your email</h1>
            <p className="text-muted-foreground">
              We sent a password reset link to <span className="font-medium text-foreground">{email}</span>. Click the link in the email to reset your password.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2">Forgot password?</h1>
              <p className="text-muted-foreground">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <Button type="submit" variant="gradient" className="w-full h-12" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send reset link"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
