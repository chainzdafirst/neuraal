import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, FileText, MoreHorizontal, Trash2, Plus, BookOpen, GraduationCap, Upload, Loader2, Eye, EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

interface CurriculumResource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  institution: string;
  program: string;
  education_level: string | null;
  exam_type: string | null;
  content_text: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  is_active: boolean;
  created_at: string;
}

const resourceTypeLabels: Record<string, string> = {
  syllabus: "Syllabus",
  past_paper: "Past Paper",
  reference_material: "Reference Material",
};

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function AdminContent() {
  const [resources, setResources] = useState<CurriculumResource[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    resource_type: "syllabus",
    institution: "",
    program: "",
    education_level: "degree",
    exam_type: "semester",
  });
  const [file, setFile] = useState<File | null>(null);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("curriculum_resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setResources(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.institution.toLowerCase().includes(search.toLowerCase()) ||
      r.program.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || r.resource_type === typeFilter;
    return matchesSearch && matchesType;
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
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    const { error } = await supabase.from("curriculum_resources").delete().in("id", Array.from(selected));
    if (error) { toast.error(error.message); return; }
    toast.success(`${selected.size} resource(s) deleted`);
    setSelected(new Set());
    fetchData();
  };

  const deleteResource = async (id: string) => {
    const { error } = await supabase.from("curriculum_resources").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Resource deleted");
    fetchData();
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase.from("curriculum_resources").update({ is_active: !currentActive }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(!currentActive ? "Resource activated" : "Resource deactivated");
    fetchData();
  };

  const handleUpload = async () => {
    if (!form.title || !form.institution || !form.program) {
      toast.error("Title, institution, and program are required");
      return;
    }

    setUploading(true);
    try {
      let filePath = "";
      let fileName = "";
      let fileSize: number | null = null;
      let fileType: string | null = null;
      let contentText: string | null = null;

      if (file) {
        fileName = file.name;
        fileSize = file.size;
        fileType = file.name.split(".").pop()?.toLowerCase() || null;
        filePath = `curriculum/${Date.now()}_${file.name}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        // Extract text via edge function
        const { data: session } = await supabase.auth.getSession();
        const extractRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-text`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ filePath, fileType }),
          }
        );

        if (extractRes.ok) {
          const extractData = await extractRes.json();
          contentText = extractData.text || null;
        }
      }

      const { error } = await supabase.from("curriculum_resources").insert({
        title: form.title,
        description: form.description || null,
        resource_type: form.resource_type,
        institution: form.institution,
        program: form.program,
        education_level: form.education_level,
        exam_type: form.exam_type,
        content_text: contentText,
        file_name: fileName || null,
        file_path: filePath || null,
        file_size: fileSize,
        file_type: fileType,
      });

      if (error) throw error;

      toast.success("Curriculum resource uploaded successfully");
      setDialogOpen(false);
      setForm({ title: "", description: "", resource_type: "syllabus", institution: "", program: "", education_level: "degree", exam_type: "semester" });
      setFile(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload resource");
    } finally {
      setUploading(false);
    }
  };

  const statCounts = {
    total: resources.length,
    active: resources.filter((r) => r.is_active).length,
    syllabi: resources.filter((r) => r.resource_type === "syllabus").length,
    pastPapers: resources.filter((r) => r.resource_type === "past_paper").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Curriculum Content</h1>
            <p className="text-muted-foreground mt-1">
              Upload syllabi, past papers, and reference materials to tailor AI outputs
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Resource</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Curriculum Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. BPharm Year 2 Pharmacology Syllabus" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this resource" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Resource Type *</Label>
                    <Select value={form.resource_type} onValueChange={(v) => setForm({ ...form, resource_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="syllabus">Syllabus</SelectItem>
                        <SelectItem value="past_paper">Past Paper</SelectItem>
                        <SelectItem value="reference_material">Reference Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Education Level</Label>
                    <Select value={form.education_level} onValueChange={(v) => setForm({ ...form, education_level: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="degree">Degree</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Institution *</Label>
                    <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="e.g. University of Nairobi" />
                  </div>
                  <div>
                    <Label>Program *</Label>
                    <Input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} placeholder="e.g. Bachelor of Pharmacy" />
                  </div>
                </div>
                <div>
                  <Label>Exam Type</Label>
                  <Select value={form.exam_type} onValueChange={(v) => setForm({ ...form, exam_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semester">Semester</SelectItem>
                      <SelectItem value="board">Board</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>File (PDF, DOCX, PPTX)</Label>
                  <Input type="file" accept=".pdf,.docx,.pptx,.ppt,.txt,.epub" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4 mr-2" /> Upload</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Resources", value: statCounts.total, icon: FileText, color: "text-primary" },
            { label: "Active", value: statCounts.active, icon: BookOpen, color: "text-[hsl(var(--neuraal-emerald))]" },
            { label: "Syllabi", value: statCounts.syllabi, icon: GraduationCap, color: "text-[hsl(var(--neuraal-amber))]" },
            { label: "Past Papers", value: statCounts.pastPapers, icon: FileText, color: "text-accent" },
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by title, institution, or program..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              {["all", "syllabus", "past_paper", "reference_material"].map((t) => (
                <Button key={t} size="sm" variant={typeFilter === t ? "default" : "outline"} onClick={() => setTypeFilter(t)}>
                  {t === "all" ? "All" : resourceTypeLabels[t] || t}
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
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No curriculum resources found</TableCell></TableRow>
                ) : (
                  filtered.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell>
                        <Checkbox checked={selected.has(res.id)} onCheckedChange={() => toggleSelect(res.id)} />
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{res.title}</span>
                          {res.file_name && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{res.file_name} · {formatBytes(res.file_size)}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{resourceTypeLabels[res.resource_type] || res.resource_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{res.institution}</TableCell>
                      <TableCell className="text-sm">{res.program}</TableCell>
                      <TableCell>
                        <Badge variant={res.is_active ? "default" : "secondary"} className="text-xs">
                          {res.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(res.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleActive(res.id, res.is_active)}>
                              {res.is_active ? <><EyeOff className="h-4 w-4 mr-2" /> Deactivate</> : <><Eye className="h-4 w-4 mr-2" /> Activate</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteResource(res.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
