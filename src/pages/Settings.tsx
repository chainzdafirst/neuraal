import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User, GraduationCap, Bell, Shield, Save, LogOut, Crown, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, logout, updateProfile, isAuthenticated, isLoading } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [deleting, setDeleting] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <NeuraalLogo size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        institution,
        program,
        education_level: educationLevel,
        exam_type: examType,
        year_of_study: yearOfStudy ? parseInt(yearOfStudy) : null,
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-4">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Profile Section */}
        <Card className="neuraal-glass border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <Label htmlFor="fullName" className="text-muted-foreground text-xs">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted/50 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Academic Section */}
        <Card className="neuraal-glass border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                <GraduationCap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base">Academic Details</CardTitle>
                <CardDescription>Help us personalise your learning</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Education Level</Label>
                <Select value={educationLevel} onValueChange={setEducationLevel}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="degree">Degree</SelectItem>
                    <SelectItem value="masters">Masters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Year of Study</Label>
                <Select value={yearOfStudy} onValueChange={setYearOfStudy}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                    <SelectItem value="5">Year 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Institution</Label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. University of Zambia"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Program</Label>
              <Input
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="e.g. Computer Science"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Exam Type</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semester">Semester Exams</SelectItem>
                  <SelectItem value="board">Board Exams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="neuraal-glass border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neuraal-amber/10">
                <Bell className="h-5 w-5 text-neuraal-amber" />
              </div>
              <div>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>Manage how you receive updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates about your account</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Study Reminders</p>
                <p className="text-xs text-muted-foreground">Daily reminders to keep your streak</p>
              </div>
              <Switch checked={studyReminders} onCheckedChange={setStudyReminders} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Weekly Report</p>
                <p className="text-xs text-muted-foreground">Summary of your weekly progress</p>
              </div>
              <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="neuraal-glass border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neuraal-emerald/10">
                <Crown className="h-5 w-5 text-neuraal-emerald" />
              </div>
              <div>
                <CardTitle className="text-base">Subscription</CardTitle>
                <CardDescription>Manage your plan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Free Plan</p>
                <p className="text-xs text-muted-foreground">Limited features & AI usage</p>
              </div>
              <Button variant="gradient" size="sm" onClick={() => navigate("/upgrade")}>
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="neuraal-glass border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                <Shield className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-base">Account</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="sticky bottom-6 flex justify-center pb-4">
          <Button variant="gradient" size="lg" className="shadow-lg" onClick={handleSaveProfile} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </main>
    </div>
  );
}
