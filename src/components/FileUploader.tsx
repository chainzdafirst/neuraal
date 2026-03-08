import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Upload,
  FileText,
  Image,
  File,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  file: File;
  status: "uploading" | "processing" | "ready" | "error";
  progress: number;
  documentId?: string;
}

interface FileUploaderProps {
  onFileReady?: (documentId: string, fileName: string) => void;
}

export default function FileUploader({ onFileReady }: FileUploaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const acceptedTypes = [".pdf", ".docx", ".doc", ".ppt", ".pptx", ".txt", ".epub"];

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
        const isTxt = file.type === "text/plain" || file.name.endsWith(".txt");
        let extractedText: string | null = null;

        if (isTxt) {
          extractedText = await file.text();
        }

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
            status: extractedText ? "ready" : "processing",
            extracted_text: extractedText,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // For non-txt files, call the extract-text edge function
        if (!isTxt) {
          try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-text`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                filePath,
                fileType: file.type,
                fileName: file.name,
              }),
            });

            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(errData.error || "Extraction failed");
            }

            const { extractedText: extracted } = await response.json();

            await supabase
              .from("documents")
              .update({ extracted_text: extracted, status: "ready" })
              .eq("id", docData.id);

            extractedText = extracted;
          } catch (extractError) {
            console.error("Text extraction error:", extractError);
            toast.error("Text extraction failed. Summary features may be limited.");
            await supabase
              .from("documents")
              .update({ status: "error" })
              .eq("id", docData.id);
          }
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: extractedText ? "ready" : "error", documentId: docData.id } : f
          )
        );

        if (extractedText) {
          toast.success("Document uploaded and processed!");
        }
        onFileReady?.(docData.id, file.name);
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

  return (
    <div className="space-y-4">
      <div
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
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
        <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-3">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-display font-semibold mb-1">Upload your notes first</h3>
        <p className="text-sm text-muted-foreground mb-4">Drop files here or click to browse</p>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          Select Files
        </Button>
        <p className="text-xs text-muted-foreground mt-3">Supports PDF, DOCX, PPT, EPUB, TXT (Max 20MB)</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadedFile) => {
            const FileIcon = getFileIcon(uploadedFile.file.type);
            return (
              <div key={uploadedFile.id} className="neuraal-card p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <FileIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{uploadedFile.file.name}</div>
                  {uploadedFile.status === "uploading" && (
                    <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${uploadedFile.progress}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {uploadedFile.status === "processing" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {uploadedFile.status === "ready" && <Check className="w-4 h-4 text-neuraal-emerald" />}
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(uploadedFile.id)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { FileUploader };
export type { UploadedFile };