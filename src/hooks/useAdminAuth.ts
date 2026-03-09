import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type AdminRole = "super_admin" | "academic_admin" | "support_admin";

export function useAdminAuth() {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (authLoading) return;
      
      if (!user) {
        setIsAdmin(false);
        setRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const userRoles = data.map(r => r.role as AdminRole);
        setIsAdmin(userRoles.length > 0);
        setRoles(userRoles);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, authLoading]);

  return {
    isAdmin,
    roles,
    hasRole: (role: AdminRole) => roles.includes(role),
    isSuperAdmin: () => roles.includes("super_admin"),
    isLoading: authLoading || isLoading,
    user,
  };
}

