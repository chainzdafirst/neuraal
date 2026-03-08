import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export type AdminRole = "super_admin" | "academic_admin" | "support_admin";

export function useAdminAuth() {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setRoles([]);
      setIsLoading(false);
      navigate("/login");
      return;
    }

    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error || !data || data.length === 0) {
        setIsAdmin(false);
        setRoles([]);
        setIsLoading(false);
        navigate("/dashboard");
        return;
      }

      setRoles(data.map((r) => r.role as AdminRole));
      setIsAdmin(true);
      setIsLoading(false);
    };

    checkAdmin();
  }, [user, authLoading, navigate]);

  const hasRole = (role: AdminRole) => roles.includes(role);
  const isSuperAdmin = () => hasRole("super_admin");

  return { isAdmin, roles, hasRole, isSuperAdmin, isLoading, user };
}
