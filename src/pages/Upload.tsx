import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
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
}

export default function UploadDocument() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const acceptedTypes = [
    ".pdf",
    ".docx",
    ".doc",
    ".ppt",
    ".pptx",
    ".epub",
    ".odt",
    ".png",
    ".jpg",
    ".jpeg",
    ".heic",
  ];

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return Image;
    if (type.includes("pdf")) return FileText;
    return File;
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: "uploading",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload process
    newFiles.forEach((uploadedFile) => {
      simulateUpload(uploadedFile.id);
    });
  };

  const simulateUpload = async (fileId: string) => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress: i } : f))
      );
    }

    // Switch to processing
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: "processing" } : f))
    );

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mark as ready
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: "ready" } : f))
    );

    toast.success("Document processed and aligned to syllabus!");
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const readyFiles = files.filter((f) => f.status === "ready");

  const actions = [
    { icon: Sparkles, label: "Generate Summary", route: "/summaries" },
    { icon: Target, label: "Create Quiz", route: "/quiz" },
    { icon: LayoutGrid, label: "Make Flashcards", route: "/flashcards" },
    { icon: Brain, label: "Ask AI Tutor", route: "/tutor" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        {/* Upload Area */}
        <div
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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

          <h2 className="text-xl font-display font-semibold mb-2">
            Drop your lecture notes here
          </h2>
          <p className="text-muted-foreground mb-6">
            or click to browse files
          </p>

          <Button
            variant="gradient"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Supports PDF, DOCX, PPT, EPUB, Images (Max 30MB each)
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="font-display font-semibold">Uploaded Files</h3>

            <div className="space-y-3">
              {files.map((uploadedFile) => {
                const FileIcon = getFileIcon(uploadedFile.file.type);

                return (
                  <div
                    key={uploadedFile.id}
                    className="neuraal-card p-4 flex items-center gap-4"
                  >
                    <div className="p-2 rounded-lg bg-secondary">
                      <FileIcon className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {uploadedFile.file.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>

                      {/* Progress bar */}
                      {uploadedFile.status === "uploading" && (
                        <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {uploadedFile.status === "uploading" && (
                        <span className="text-xs text-muted-foreground">
                          {uploadedFile.progress}%
                        </span>
                      )}
                      {uploadedFile.status === "processing" && (
                        <div className="flex items-center gap-2 text-xs text-primary">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </div>
                      )}
                      {uploadedFile.status === "ready" && (
                        <div className="flex items-center gap-1.5 text-xs text-neuraal-emerald">
                          <Check className="w-4 h-4" />
                          Ready
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFile(uploadedFile.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions after upload */}
        {readyFiles.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="font-display font-semibold">What would you like to do?</h3>

            <div className="grid grid-cols-2 gap-3">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate(action.route)}
                >
                  <action.icon className="w-5 h-5 text-primary" />
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