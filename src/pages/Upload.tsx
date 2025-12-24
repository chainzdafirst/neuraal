import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Upload,
  FileText,
  Image,
  File,
  X,
  Check,
  Loader2,
  Sparkles,
  Brain,
  Target,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  file: File;
  status: "uploading" | "processing" | "ready" | "error";
  progress: number;
  documentId?: string;
}

export default function UploadDocument() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const acceptedTypes = [".pdf", ".docx", ".doc", ".ppt", ".pptx", ".txt"];

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return Image;
    if (type.includes("pdf")) return FileText;
    return File;
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || !user) return;

    for (const file of Array.from(selectedFiles)) {
      const fileId = Math.random().toString(36).substr(2, 9);
      const uploadedFile: UploadedFile = {
        id: fileId,
        file,
        status: "uploading",
        progress: 0,
      };

      setFiles((prev) => [...prev, uploadedFile]);

      try {
        // Upload to storage
        const filePath = `${user.id}/${fileId}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress: 50, status: "processing" } : f))
        );

        // Save to database
        const { data: docData, error: dbError } = await supabase
          .from("documents")
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            status: "uploaded",
          })
          .select()
          .single();

        if (dbError) throw dbError;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: "ready", documentId: docData.id } : f
          )
        );

        toast.success("Document uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f))
        );
        toast.error("Failed to upload document");
      }
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          documentText: "Generate a summary for pharmacy and medical sciences topics.",
          summaryType: "concise",
          userProfile: profile,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate summary");
      
      const data = await response.json();
      toast.success("Summary generated!");
      navigate("/tutor");
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const readyFiles = files.filter((f) => f.status === "ready");

  const actions = [
    { icon: Sparkles, label: "Generate Summary", action: handleGenerateSummary, loading: generatingSummary },
    { icon: Target, label: "Create Quiz", route: "/quiz" },
    { icon: LayoutGrid, label: "Make Flashcards", route: "/flashcards" },
    { icon: Brain, label: "Ask AI Tutor", route: "/tutor" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-semibold">Upload Notes</h1>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">Drop your lecture notes here</h2>
          <p className="text-muted-foreground mb-6">or click to browse files</p>
          <Button variant="gradient" onClick={() => fileInputRef.current?.click()}>
            Select Files
          </Button>
          <p className="text-xs text-muted-foreground mt-4">Supports PDF, DOCX, PPT, TXT (Max 30MB)</p>
        </div>

        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="font-display font-semibold">Uploaded Files</h3>
            <div className="space-y-3">
              {files.map((uploadedFile) => {
                const FileIcon = getFileIcon(uploadedFile.file.type);
                return (
                  <div key={uploadedFile.id} className="neuraal-card p-4 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-secondary">
                      <FileIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{uploadedFile.file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      {uploadedFile.status === "uploading" && (
                        <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${uploadedFile.progress}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadedFile.status === "processing" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                      {uploadedFile.status === "ready" && <Check className="w-4 h-4 text-neuraal-emerald" />}
                      <Button variant="ghost" size="icon-sm" onClick={() => removeFile(uploadedFile.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {readyFiles.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="font-display font-semibold">What would you like to do?</h3>
            <div className="grid grid-cols-2 gap-3">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => action.action ? action.action() : navigate(action.route!)}
                  disabled={action.loading}
                >
                  {action.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <action.icon className="w-5 h-5 text-primary" />}
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
