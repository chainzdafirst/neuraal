import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, FileText, MoreHorizontal, Trash2, Plus, BookOpen, GraduationCap,
  Upload, Loader2, Eye, EyeOff, Building2, ChevronRight, FolderOpen, Sparkles, AlertCircle, ArrowLeft,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

// ── Types ──────────────────────────────────────────────
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

interface InstitutionGroup {
  institution: string;
  programs: string[];
  resourceCount: number;
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

// ── Main Component ─────────────────────────────────────
export default function AdminContent() {
  const [resources, setResources] = useState<CurriculumResource[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Navigation state: null = institution list, string = selected institution
  const [activeInstitution, setActiveInstitution] = useState<string | null>(null);
  const [activeProgram, setActiveProgram] = useState<string | null>(null);

  // Dialogs
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [classifyFailed, setClassifyFailed] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [classifiedText, setClassifiedText] = useState<string | null>(null);

  // Resource upload form
  const [form, setForm] = useState({
    title: "", description: "", resource_type: "syllabus",
    institution: "", program: "", education_level: "degree", exam_type: "semester",
  });
  const [file, setFile] = useState<File | null>(null);

  // New school form
  const [schoolForm, setSchoolForm] = useState({
    institution: "", programs: "", education_level: "degree", exam_type: "semester",
  });
  const [addingSchool, setAddingSchool] = useState(false);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("curriculum_resources")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setResources(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // ── Derived: group by institution ──
  const institutions: InstitutionGroup[] = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const counts = new Map<string, number>();
    resources.forEach((r) => {
      if (!map.has(r.institution)) map.set(r.institution, new Set());
      map.get(r.institution)!.add(r.program);
      counts.set(r.institution, (counts.get(r.institution) || 0) + 1);
    });
    return Array.from(map.entries()).map(([institution, programs]) => ({
      institution,
      programs: Array.from(programs).sort(),
      resourceCount: counts.get(institution) || 0,
    })).sort((a, b) => a.institution.localeCompare(b.institution));
  }, [resources]);

  // ── Filtered resources for current view ──
  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (activeInstitution && r.institution !== activeInstitution) return false;
      if (activeProgram && r.program !== activeProgram) return false;
      const matchesSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.program.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || r.resource_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [resources, activeInstitution, activeProgram, search, typeFilter]);

  // Programs for current institution
  const currentPrograms = useMemo(() => {
    if (!activeInstitution) return [];
    return institutions.find((i) => i.institution === activeInstitution)?.programs || [];
  }, [activeInstitution, institutions]);

  // ── Selection helpers ──
  const toggleSelect = (id: string) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    selected.size === filtered.length ? setSelected(new Set()) : setSelected(new Set(filtered.map((r) => r.id)));
  };

  // ── CRUD ──
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

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("curriculum_resources").update({ is_active: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(!current ? "Activated" : "Deactivated");
    fetchData();
  };

  // ── Classify file via AI ──
  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    setClassifying(true);
    setClassifyFailed(false);
    setUploadedFilePath(null);
    setClassifiedText(null);

    try {
      // Upload to storage first
      const filePath = `curriculum/${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, selectedFile);
      if (uploadError) throw uploadError;
      setUploadedFilePath(filePath);

      // Call classify-curriculum edge function
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/classify-curriculum`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ filePath, fileName: selectedFile.name }),
      });

      if (!res.ok) throw new Error("Classification failed");

      const { metadata, extractedText } = await res.json();
      
      // Store extracted text from classification to avoid redundant AI call
      if (extractedText) setClassifiedText(extractedText);
      
      setForm((prev) => ({
        ...prev,
        title: metadata.title || prev.title,
        description: metadata.description || prev.description,
        resource_type: metadata.resource_type || prev.resource_type,
        institution: metadata.institution || prev.institution,
        program: metadata.program || prev.program,
        education_level: metadata.education_level || prev.education_level,
        exam_type: metadata.exam_type || prev.exam_type,
      }));
      toast.success("Document classified! Review the details below.");
    } catch (err) {
      console.error("Classification error:", err);
      setClassifyFailed(true);
      toast.warning("AI classification failed. Please fill in details manually.");
    } finally {
      setClassifying(false);
    }
  };

  const handleUpload = async () => {
    if (!form.title || !form.institution || !form.program) {
      toast.error("Title, institution, and program are required"); return;
    }
    setUploading(true);
    try {
      let filePath = uploadedFilePath || "";
      let fileName = file?.name || "";
      let fileSize: number | null = file?.size || null;
      let fileType: string | null = file?.name.split(".").pop()?.toLowerCase() || null;
      let contentText: string | null = null;

      // If file wasn't uploaded during classification (e.g. no file), upload now
      if (file && !uploadedFilePath) {
        filePath = `curriculum/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file);
        if (uploadError) throw uploadError;
      }

      // Use text from classification if available, otherwise extract
      if (filePath) {
        if (classifiedText) {
          // Reuse text already extracted during classification (saves an AI call)
          contentText = classifiedText;
        } else {
          const { data: session } = await supabase.auth.getSession();
          const extractRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-text`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
            body: JSON.stringify({ filePath, fileType, fileName }),
          });
          if (extractRes.ok) { const d = await extractRes.json(); contentText = d.extractedText || null; }
        }
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { error } = await supabase.from("curriculum_resources").insert({
        title: form.title, description: form.description || null, resource_type: form.resource_type,
        institution: form.institution, program: form.program, education_level: form.education_level,
        exam_type: form.exam_type, content_text: contentText,
        file_name: fileName || null, file_path: filePath || null, file_size: fileSize, file_type: fileType,
        uploaded_by: currentUser?.id || null,
      });
      if (error) throw error;
      toast.success("Resource uploaded");
      setResourceDialogOpen(false);
      resetUploadForm();
      fetchData();
    } catch (err: any) { toast.error(err.message || "Upload failed"); }
    finally { setUploading(false); }
  };

  const resetUploadForm = () => {
    setForm({ title: "", description: "", resource_type: "syllabus", institution: activeInstitution || "", program: activeProgram || "", education_level: "degree", exam_type: "semester" });
    setFile(null);
    setUploadedFilePath(null);
    setClassifiedText(null);
    setClassifying(false);
    setClassifyFailed(false);
  };

  // ── Add new school: creates a placeholder resource per program ──
  const handleAddSchool = async () => {
    if (!schoolForm.institution || !schoolForm.programs.trim()) {
      toast.error("Institution and at least one program are required"); return;
    }
    setAddingSchool(true);
    try {
      const programs = schoolForm.programs.split(",").map((p) => p.trim()).filter(Boolean);
      const rows = programs.map((program) => ({
        title: `${program} — Curriculum Placeholder`,
        description: `Initial setup for ${program} at ${schoolForm.institution}`,
        resource_type: "syllabus" as const,
        institution: schoolForm.institution,
        program,
        education_level: schoolForm.education_level,
        exam_type: schoolForm.exam_type,
        is_active: false,
      }));
      const { error } = await supabase.from("curriculum_resources").insert(rows);
      if (error) throw error;
      toast.success(`${schoolForm.institution} added with ${programs.length} program(s)`);
      setSchoolDialogOpen(false);
      setSchoolForm({ institution: "", programs: "", education_level: "degree", exam_type: "semester" });
      fetchData();
    } catch (err: any) { toast.error(err.message || "Failed to add school"); }
    finally { setAddingSchool(false); }
  };

  // ── Open upload dialog pre-filled with current context ──
  const openUploadDialog = () => {
    resetUploadForm();
    setResourceDialogOpen(true);
  };

  // ── Stats ──
  const statCounts = {
    total: resources.length,
    institutions: institutions.length,
    active: resources.filter((r) => r.is_active).length,
    syllabi: resources.filter((r) => r.resource_type === "syllabus").length,
  };

  // ── Tab title summary ──
  const tabSummary = (() => {
    if (activeProgram) return "Program Resources";
    if (activeInstitution) return "Institution Programs";
    return "All Institutions";
  })();

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-display font-bold truncate">Curriculum Content</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage training data by institution and program</p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 text-muted-foreground hover:text-foreground ${!(activeInstitution || activeProgram) ? "invisible" : ""}`}
                onClick={() => {
                  if (activeProgram) {
                    setActiveProgram(null);
                  } else {
                    setActiveInstitution(null);
                  }
                  setSelected(new Set());
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <span className="text-xs text-muted-foreground">{tabSummary}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="sm:size-default" onClick={() => setSchoolDialogOpen(true)}>
              <Building2 className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Add School</span>
            </Button>
            <Button size="sm" className="sm:size-default" onClick={openUploadDialog}>
              <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Add Resource</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Institutions", value: statCounts.institutions, icon: Building2, color: "text-primary" },
            { label: "Total Resources", value: statCounts.total, icon: FileText, color: "text-accent" },
            { label: "Active", value: statCounts.active, icon: BookOpen, color: "text-[hsl(var(--neuraal-emerald))]" },
            { label: "Syllabi", value: statCounts.syllabi, icon: GraduationCap, color: "text-[hsl(var(--neuraal-amber))]" },
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

        {/* ── Institution Grid (when no institution selected) ── */}
        {!activeInstitution && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <p className="text-muted-foreground col-span-full text-center py-8">Loading institutions...</p>
            ) : institutions.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No institutions yet. Add a school to get started.</p>
                </CardContent>
              </Card>
            ) : (
              institutions.map((inst) => (
                <Card
                  key={inst.institution}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => { setActiveInstitution(inst.institution); setSelected(new Set()); }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      {inst.institution}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{inst.programs.length} program{inst.programs.length !== 1 ? "s" : ""}</span>
                      <span>{inst.resourceCount} resource{inst.resourceCount !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {inst.programs.slice(0, 3).map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                      ))}
                      {inst.programs.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{inst.programs.length - 3} more</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* ── Program List (when institution selected but no program) ── */}
        {activeInstitution && !activeProgram && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentPrograms.map((prog) => {
                const count = resources.filter((r) => r.institution === activeInstitution && r.program === prog).length;
                const activeCount = resources.filter((r) => r.institution === activeInstitution && r.program === prog && r.is_active).length;
                return (
                  <Card
                    key={prog}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => { setActiveProgram(prog); setSelected(new Set()); }}
                  >
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <FolderOpen className="h-4 w-4 text-accent shrink-0" />
                        <span className="font-medium">{prog}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{count} resources · {activeCount} active</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* ── Resources Table (when program selected) ── */}
        {activeInstitution && activeProgram && (
          <>
            {/* Filters */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {["all", "syllabus", "past_paper", "reference_material"].map((t) => (
                  <Button key={t} size="sm" variant={typeFilter === t ? "default" : "outline"} onClick={() => setTypeFilter(t)} className="text-xs">
                    {t === "all" ? "All" : resourceTypeLabels[t] || t}
                  </Button>
                ))}
                {selected.size > 0 && (
                  <Button size="sm" variant="destructive" onClick={bulkDelete} className="text-xs ml-auto">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete {selected.size}
                  </Button>
                )}
              </div>
            </div>

            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"><Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} /></TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No resources found for this program</TableCell></TableRow>
                    ) : filtered.map((res) => (
                      <TableRow key={res.id}>
                        <TableCell><Checkbox checked={selected.has(res.id)} onCheckedChange={() => toggleSelect(res.id)} /></TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{res.title}</span>
                            {res.file_name && <p className="text-xs text-muted-foreground truncate max-w-[250px]">{res.file_name} · {formatBytes(res.file_size)}</p>}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{resourceTypeLabels[res.resource_type] || res.resource_type}</Badge></TableCell>
                        <TableCell><Badge variant={res.is_active ? "default" : "secondary"} className="text-xs">{res.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(res.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Add Resource Dialog ── */}
        <Dialog open={resourceDialogOpen} onOpenChange={(open) => { if (!open) resetUploadForm(); setResourceDialogOpen(open); }}>
          <DialogContent className="max-w-lg w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto mx-4">
            <DialogHeader><DialogTitle>Upload Curriculum Resource</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              {/* Step 1: File selection with auto-classify */}
              <div>
                <Label>File (PDF, DOCX, PPTX) *</Label>
                <Input
                  type="file"
                  accept=".pdf,.docx,.pptx,.ppt,.txt,.epub"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelected(f);
                  }}
                />
                {classifying && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>AI is reading the document and classifying...</span>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                )}
                {classifyFailed && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>Auto-classification failed. Please fill in details manually.</span>
                  </div>
                )}
              </div>

              {/* Step 2: Review / edit fields (shown after file selected) */}
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. BPharm Year 2 Pharmacology Syllabus" disabled={classifying} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} disabled={classifying} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Resource Type *</Label>
                  <Select value={form.resource_type} onValueChange={(v) => setForm({ ...form, resource_type: v })} disabled={classifying}>
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
                  <Select value={form.education_level} onValueChange={(v) => setForm({ ...form, education_level: v })} disabled={classifying}>
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
                  <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="e.g. TEVETA" disabled={classifying} />
                </div>
                <div>
                  <Label>Program *</Label>
                  <Input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} placeholder="e.g. Diploma in Business Administration" disabled={classifying} />
                </div>
              </div>
              <div>
                <Label>Exam Type</Label>
                <Select value={form.exam_type} onValueChange={(v) => setForm({ ...form, exam_type: v })} disabled={classifying}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semester">Semester</SelectItem>
                    <SelectItem value="board">Board</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetUploadForm(); setResourceDialogOpen(false); }}>Cancel</Button>
              <Button onClick={handleUpload} disabled={uploading || classifying}>
                {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Upload className="h-4 w-4 mr-2" /> Confirm & Save</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={schoolDialogOpen} onOpenChange={setSchoolDialogOpen}>
          <DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto mx-4">
            <DialogHeader><DialogTitle>Add New School</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div><Label>Institution Name *</Label><Input value={schoolForm.institution} onChange={(e) => setSchoolForm({ ...schoolForm, institution: e.target.value })} placeholder="e.g. University of Nairobi" /></div>
              <div><Label>Programs * (comma-separated)</Label><Textarea value={schoolForm.programs} onChange={(e) => setSchoolForm({ ...schoolForm, programs: e.target.value })} placeholder="e.g. Bachelor of Pharmacy, Bachelor of Medicine, Diploma in Clinical Medicine" rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Education Level</Label>
                  <Select value={schoolForm.education_level} onValueChange={(v) => setSchoolForm({ ...schoolForm, education_level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="degree">Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Exam Type</Label>
                  <Select value={schoolForm.exam_type} onValueChange={(v) => setSchoolForm({ ...schoolForm, exam_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semester">Semester</SelectItem>
                      <SelectItem value="board">Board</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSchoolDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSchool} disabled={addingSchool}>
                {addingSchool ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</> : <><Building2 className="h-4 w-4 mr-2" /> Add School</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
