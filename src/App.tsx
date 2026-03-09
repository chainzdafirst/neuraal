import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import SummaryView from "./pages/SummaryView";
import AITutor from "./pages/AITutor";
import Quiz from "./pages/Quiz";
import Flashcards from "./pages/Flashcards";
import Progress from "./pages/Progress";
import Upgrade from "./pages/Upgrade";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAI from "./pages/admin/AdminAI";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";
import AdminContent from "./pages/admin/AdminContent";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { ProtectedAdminRoute } from "./components/admin/ProtectedAdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/summary/:documentId" element={<SummaryView />} />
            <Route path="/tutor" element={<AITutor />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* Admin routes — secret entry via /portal/n3ur44l-8f42 then standard /admin/* after auth */}
            <Route path="/portal/n3ur44l-8f42" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedAdminRoute><AdminOverview /></ProtectedAdminRoute>} />
            <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
            <Route path="/admin/ai" element={<ProtectedAdminRoute><AdminAI /></ProtectedAdminRoute>} />
            <Route path="/admin/content" element={<ProtectedAdminRoute><AdminContent /></ProtectedAdminRoute>} />
            <Route path="/admin/blog" element={<ProtectedAdminRoute><AdminBlog /></ProtectedAdminRoute>} />
            <Route path="/admin/blog/:id" element={<ProtectedAdminRoute><AdminBlogEditor /></ProtectedAdminRoute>} />
            <Route path="/admin/analytics" element={<ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute>} />
            <Route path="/admin/banners" element={<ProtectedAdminRoute><AdminBanners /></ProtectedAdminRoute>} />
            <Route path="/admin/feedback" element={<ProtectedAdminRoute><AdminPlaceholder title="Feedback & Support" /></ProtectedAdminRoute>} />
            <Route path="/admin/billing" element={<ProtectedAdminRoute><AdminPlaceholder title="Billing & Monetization" /></ProtectedAdminRoute>} />
            <Route path="/admin/security" element={<ProtectedAdminRoute><AdminPlaceholder title="Security & Compliance" /></ProtectedAdminRoute>} />
            <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminPlaceholder title="Admin Settings" /></ProtectedAdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;