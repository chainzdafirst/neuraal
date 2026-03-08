import { useState, useEffect } from "react";
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

    setGeneratingSummary(true);

    // Poll for extracted text (extraction may still be running in background)
    let extractedText: string | null = null;
    const maxAttempts = 30; // 30 × 2s = 60s max wait
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .select("extracted_text, status")
        .eq("id", uploadedDocumentId)
        .single();

      if (docError) {
        toast.error("Could not retrieve document.");
        setGeneratingSummary(false);
        return;
      }

      if (doc?.extracted_text) {
        extractedText = doc.extracted_text;
        break;
      }

      if (doc?.status === "error") {
        toast.error("Text extraction failed. Please try uploading a different file.");
        setGeneratingSummary(false);
        return;
      }

      // Still processing — wait and retry
      if (attempt === 0) {
        toast.info("Still extracting text from your document...");
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!extractedText) {
      toast.error("Text extraction timed out. Please try again.");
      setGeneratingSummary(false);
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          documentText: extractedText,
          summaryType: "detailed",
          userProfile: profile ? {
            program: profile.program,
            institution: profile.institution,
            educationLevel: profile.education_level,
            yearOfStudy: profile.year_of_study,
          } : null,
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="shrink-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <h1 className="font-display font-semibold text-sm sm:text-base">Smart Summaries</h1>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl flex flex-col min-h-full">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-3 sm:p-4 rounded-2xl bg-accent/10 mb-3 sm:mb-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-1 sm:mb-2">Generate Smart Summary</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Upload your notes and get an exam-ready summary
            </p>
          </div>

          <div className="mb-4 sm:mb-6">
            <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Upload className="w-4 h-4" />
              Upload Document
            </h3>
            <FileUploader onFileReady={handleFileReady} />
            {uploadedDocumentId && (
              <p className="text-xs sm:text-sm text-neuraal-emerald mt-2 flex items-center gap-1">
                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                {documentName} ready for summary generation
              </p>
            )}
          </div>

          <div className="mt-auto pb-4 sm:pb-6">
            <Button
              variant="gradient"
              size="lg"
              className="w-full text-sm sm:text-base"
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
            >
              {generatingSummary ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Generate Smart Summary
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
