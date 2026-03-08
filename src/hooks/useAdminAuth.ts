import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export type AdminRole = "super_admin" | "academic_admin" | "support_admin";

export function useAdminAuth() {
  // TODO: Re-enable admin auth check before production
  const { user, isLoading: authLoading } = useAuth();

  return {
    isAdmin: true,
    roles: ["super_admin" as AdminRole],
    hasRole: (_role: AdminRole) => true,
    isSuperAdmin: () => true,
    isLoading: false,
    user,
  };
}
