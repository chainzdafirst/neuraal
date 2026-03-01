import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import FileUploader from "@/components/FileUploader";
import {
  ArrowLeft,
  Upload,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function UploadDocument() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleFileReady = (documentId: string, fileName: string) => {
    setUploadedDocumentId(documentId);
    setDocumentName(fileName);
  };

  const handleGenerateSummary = async () => {
    if (!uploadedDocumentId) {
      toast.error("Please upload a document first before generating a summary.");
      return;
    }

    // Fetch extracted text from document
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("extracted_text")
      .eq("id", uploadedDocumentId)
      .single();

    if (docError || !doc?.extracted_text) {
      toast.error("Could not extract text from the document. Please upload a .txt file for best results.");
      return;
    }

    setGeneratingSummary(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          documentText: doc.extracted_text,
          summaryType: "detailed",
          userProfile: profile,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate summary");
      
      const data = await response.json();
      
      if (data.summary) {
        // Save summary to document record
        await supabase
          .from("documents")
          .update({ summary: data.summary })
          .eq("id", uploadedDocumentId);

        toast.success("Summary generated!");
        navigate(`/summary/${uploadedDocumentId}`);
      } else {
        throw new Error("No summary generated");
      }
    } catch (error) {
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-semibold">Smart Summaries</h1>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-accent/10 mb-4">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Generate Smart Summary</h2>
          <p className="text-muted-foreground">
            Upload your notes and get an exam-ready summary
          </p>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Document
          </h3>
          <FileUploader onFileReady={handleFileReady} />
          {uploadedDocumentId && (
            <p className="text-sm text-neuraal-emerald mt-2 flex items-center gap-1">
              <Check className="w-4 h-4" />
              {documentName} ready for summary generation
            </p>
          )}
        </div>

        <div className="mt-8">
          <Button 
            variant="gradient" 
            size="lg" 
            className="w-full" 
            onClick={handleGenerateSummary}
            disabled={generatingSummary}
          >
            {generatingSummary ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Smart Summary
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}