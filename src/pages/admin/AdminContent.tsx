import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, FileText, FileType, MoreHorizontal, CheckCircle, Clock, XCircle, Eye, Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

interface DocumentRow {
  id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  status: string | null;
  summary: string | null;
  extracted_text: string | null;
  user_id: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const statusIcons: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  uploaded: { icon: Clock, color: "text-[hsl(var(--neuraal-amber))]", label: "Uploaded" },
  processing: { icon: Clock, color: "text-primary", label: "Processing" },
  summarized: { icon: CheckCircle, color: "text-[hsl(var(--neuraal-emerald))]", label: "Indexed" },
  failed: { icon: XCircle, color: "text-destructive", label: "Failed" },
};

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function AdminContent() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; email: string | null }>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [docsRes, profilesRes] = await Promise.all([
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email"),
    ]);

    if (docsRes.data) setDocuments(docsRes.data);
    if (profilesRes.data) {
      const map: Record<string, { full_name: string | null; email: string | null }> = {};
      profilesRes.data.forEach((p) => { map[p.id] = { full_name: p.full_name, email: p.email }; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = documents.filter((d) => {
    const matchesSearch = d.file_name.toLowerCase().includes(search.toLowerCase()) ||
      (profiles[d.user_id]?.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((d) => d.id)));
    }
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    const { error } = await supabase.from("documents").delete().in("id", Array.from(selected));
    if (error) { toast.error(error.message); return; }
    toast.success(`${selected.size} document(s) deleted`);
    setSelected(new Set());
    fetchData();
  };

  const deleteDocument = async (id: string) => {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Document deleted");
    fetchData();
  };

  const statCounts = {
    total: documents.length,
    indexed: documents.filter((d) => d.status === "summarized").length,
    processing: documents.filter((d) => d.status === "processing" || d.status === "uploaded").length,
    failed: documents.filter((d) => d.status === "failed").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Content Management</h1>
          <p className="text-muted-foreground mt-1">Manage curriculum documents and knowledge base</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Documents", value: statCounts.total, icon: FileText, color: "text-primary" },
            { label: "Indexed", value: statCounts.indexed, icon: CheckCircle, color: "text-[hsl(var(--neuraal-emerald))]" },
            { label: "Queued / Processing", value: statCounts.processing, icon: Clock, color: "text-[hsl(var(--neuraal-amber))]" },
            { label: "Failed", value: statCounts.failed, icon: XCircle, color: "text-destructive" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-3 flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{loading ? "..." : s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters & Bulk Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by file name or uploader..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              {["all", "uploaded", "summarized", "failed"].map((s) => (
                <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)}>
                  {s === "all" ? "All" : s === "summarized" ? "Indexed" : s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          {selected.size > 0 && (
            <Button size="sm" variant="destructive" onClick={bulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete {selected.size} selected
            </Button>
          )}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading documents...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No documents found</TableCell></TableRow>
                ) : (
                  filtered.map((doc) => {
                    const si = statusIcons[doc.status || "uploaded"] || statusIcons.uploaded;
                    const profile = profiles[doc.user_id];
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Checkbox checked={selected.has(doc.id)} onCheckedChange={() => toggleSelect(doc.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileType className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium truncate max-w-[200px]">{doc.file_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{doc.file_type || "unknown"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatBytes(doc.file_size)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <si.icon className={`h-4 w-4 ${si.color}`} />
                            <span className="text-xs">{si.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {profile?.full_name || profile?.email || "Unknown"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(doc.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.info("Preview coming soon")}>
                                <Eye className="h-4 w-4 mr-2" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteDocument(doc.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
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
