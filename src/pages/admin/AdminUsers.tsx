import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, MoreHorizontal, Shield, Users, UserCheck, UserX, UserMinus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  education_level: string | null;
  institution: string | null;
  program: string | null;
  account_status: string;
  created_at: string;
}

interface RoleRow {
  user_id: string;
  role: string;
}

interface UserStats {
  [userId: string]: { documents: number; quizzes: number; flashcards: number };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
  deactivated: { label: "Deactivated", variant: "secondary" },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [profilesRes, rolesRes, docsRes, quizzesRes, flashRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("documents").select("user_id"),
      supabase.from("quizzes").select("user_id"),
      supabase.from("flashcards").select("user_id"),
    ]);

    if (profilesRes.data) setUsers(profilesRes.data as UserRow[]);
    if (rolesRes.data) setRoles(rolesRes.data as RoleRow[]);

    // Aggregate stats per user
    const stats: UserStats = {};
    const addStat = (data: any[] | null, key: keyof UserStats[string]) => {
      (data || []).forEach((row: any) => {
        if (!stats[row.user_id]) stats[row.user_id] = { documents: 0, quizzes: 0, flashcards: 0 };
        stats[row.user_id][key]++;
      });
    };
    addStat(docsRes.data, "documents");
    addStat(quizzesRes.data, "quizzes");
    addStat(flashRes.data, "flashcards");
    setUserStats(stats);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getUserRoles = (userId: string) =>
    roles.filter((r) => r.user_id === userId).map((r) => r.role);

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.institution || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.account_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const assignRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role } as any);
    if (error) {
      toast.error(error.code === "23505" ? "User already has this role" : error.message);
      return;
    }
    toast.success(`Role "${role}" assigned`);
    fetchData();
  };

  const removeRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    if (error) { toast.error(error.message); return; }
    toast.success(`Role "${role}" removed`);
    fetchData();
  };

  const updateStatus = async (userId: string, status: string) => {
    const { error } = await supabase.from("profiles").update({ account_status: status } as any).eq("id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Account ${status}`);
    fetchData();
  };

  const activeCount = users.filter((u) => u.account_status === "active").length;
  const suspendedCount = users.filter((u) => u.account_status === "suspended").length;

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage learners, roles, and account status</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-[hsl(var(--neuraal-emerald))]" />
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <UserX className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{suspendedCount}</p>
                <p className="text-xs text-muted-foreground">Suspended</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, or institution..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "active", "suspended", "deactivated"].map((s) => (
              <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading users...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
                ) : (
                  filtered.map((user) => {
                    const userRoles = getUserRoles(user.id);
                    const stats = userStats[user.id] || { documents: 0, quizzes: 0, flashcards: 0 };
                    const sc = statusConfig[user.account_status] || statusConfig.active;
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                        <TableCell className="text-sm">{user.email || "—"}</TableCell>
                        <TableCell className="text-sm">{user.institution || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={sc.variant} className="text-xs">{sc.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {userRoles.length === 0 ? (
                              <span className="text-muted-foreground text-xs">Learner</span>
                            ) : (
                              userRoles.map((role) => (
                                <Badge key={role} variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/20" onClick={() => removeRole(user.id, role)} title="Click to remove">
                                  <Shield className="h-3 w-3 mr-1" />{role.replace("_", " ")}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span title="Documents">{stats.documents} docs</span>
                            <span>·</span>
                            <span title="Quizzes">{stats.quizzes} quiz</span>
                            <span>·</span>
                            <span title="Flashcards">{stats.flashcards} cards</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(user.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {user.account_status !== "active" && (
                                <DropdownMenuItem onClick={() => updateStatus(user.id, "active")}>
                                  <UserCheck className="h-4 w-4 mr-2" /> Activate
                                </DropdownMenuItem>
                              )}
                              {user.account_status !== "suspended" && (
                                <DropdownMenuItem onClick={() => updateStatus(user.id, "suspended")} className="text-destructive">
                                  <UserX className="h-4 w-4 mr-2" /> Suspend
                                </DropdownMenuItem>
                              )}
                              {user.account_status !== "deactivated" && (
                                <DropdownMenuItem onClick={() => updateStatus(user.id, "deactivated")}>
                                  <UserMinus className="h-4 w-4 mr-2" /> Deactivate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => assignRole(user.id, "super_admin")}>Assign Super Admin</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => assignRole(user.id, "academic_admin")}>Assign Academic Admin</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => assignRole(user.id, "support_admin")}>Assign Support Admin</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
