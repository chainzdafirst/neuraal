import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import FileUploader from "@/components/FileUploader";
import {
  ArrowLeft,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

interface FlashcardType {
  id: string;
  front: string;
  back: string;
  topic: string;
  mastered: boolean;
}

type FlashcardState = "setup" | "loading" | "active";

export default function Flashcards() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const [state, setState] = useState<FlashcardState>("setup");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [cardCount, setCardCount] = useState(10);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  const masteredCount = flashcards.filter((c) => c.mastered).length;

  const handleGenerateFlashcards = async () => {
    if (!uploadedDocumentId) {
      toast.error("Please upload a document first before generating flashcards.");
      return;
    }

    // Fetch extracted text
    const { data: doc } = await supabase
      .from("documents")
      .select("extracted_text")
      .eq("id", uploadedDocumentId)
      .single();

    if (!doc?.extracted_text) {
      toast.error("Could not extract text from the document. Please upload a .txt file for best results.");
      return;
    }

    setState("loading");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          documentText: doc.extracted_text,
          count: cardCount,
          userProfile: profile ? {
            program: profile.program,
            institution: profile.institution,
          } : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate flashcards");

      const data = await response.json();
      
      if (data.flashcards && data.flashcards.length > 0) {
        const cardsWithMastery = data.flashcards.map((card: { front: string; back: string; topic: string }, index: number) => ({
          id: String(index + 1),
          front: card.front,
          back: card.back,
          topic: card.topic || "General",
          mastered: false,
        }));
        setFlashcards(cardsWithMastery);

        // Save flashcards to DB
        if (user) {
          await supabase.from("flashcards").insert(
            data.flashcards.map((card: { front: string; back: string; topic: string }) => ({
              user_id: user.id,
              front: card.front,
              back: card.back,
              topic: card.topic || "General",
              document_id: uploadedDocumentId,
            }))
          );
        }

        setState("active");
        toast.success("Flashcards generated!");
      } else {
        throw new Error("No flashcards generated");
      }
    } catch (error) {
      console.error("Flashcard generation error:", error);
      toast.error("Failed to generate flashcards. Please try again.");
      setState("setup");
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowAnswer(false);
    }
  };

  const handleMarkMastered = () => {
    setFlashcards((prev) =>
      prev.map((card) => (card.id === currentCard.id ? { ...card, mastered: true } : card))
    );
    toast.success("Card marked as mastered!");
    handleNext();
  };

  const handleNeedsPractice = () => {
    setFlashcards((prev) =>
      prev.map((card) => (card.id === currentCard.id ? { ...card, mastered: false } : card))
    );
    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
    toast.success("Cards shuffled!");
  };

  const handleFileReady = (documentId: string, fileName: string) => {
    setUploadedDocumentId(documentId);
    setDocumentName(fileName);
  };

  const handleBackToSetup = () => {
    setState("setup");
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const renderSetup = () => (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 rounded-2xl bg-neuraal-emerald/10 mb-4">
          <LayoutGrid className="w-8 h-8 text-neuraal-emerald" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Generate Flashcards</h2>
        <p className="text-muted-foreground">Create flashcards from your notes for effective revision</p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Document
        </h3>
        <FileUploader onFileReady={handleFileReady} />
        {uploadedDocumentId && (
          <p className="text-sm text-neuraal-emerald mt-2 flex items-center gap-1">
            <Check className="w-4 h-4" />
            {documentName} ready for flashcard generation
          </p>
        )}
      </div>

      <div className="neuraal-card p-6 mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" />
          Number of Flashcards
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 15, 20].map((count) => (
            <button
              key={count}
              onClick={() => setCardCount(count)}
              className={`py-3 rounded-lg text-sm font-medium transition-all ${
                cardCount === count
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <Button variant="gradient" size="lg" className="w-full" onClick={handleGenerateFlashcards}>
        <Sparkles className="w-5 h-5 mr-2" />
        Generate Flashcards
      </Button>
    </div>
  );

  const renderLoading = () => (
    <div className="container mx-auto px-4 py-8 max-w-lg text-center">
      <div className="inline-flex p-6 rounded-full bg-primary/10 mb-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
      <h2 className="text-2xl font-display font-bold mb-2">Generating Flashcards...</h2>
      <p className="text-muted-foreground">Creating {cardCount} flashcards from your notes</p>
    </div>
  );

  const renderActive = () => (
    <>
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Card {currentIndex + 1} of {totalCards}</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neuraal-emerald font-medium">{masteredCount} mastered</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-muted-foreground">{totalCards - masteredCount} remaining</span>
          </div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neuraal-emerald to-accent transition-all duration-500"
            style={{ width: `${(masteredCount / totalCards) * 100}%` }}
          />
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-4">
            <span className="inline-flex px-3 py-1 rounded-full bg-secondary text-sm">{currentCard?.topic}</span>
          </div>

          <div className="relative cursor-pointer" onClick={handleFlip} style={{ minHeight: "300px" }}>
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div
                className="absolute inset-0 neuraal-card p-8 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Question</div>
                <p className="text-xl font-display font-semibold">{currentCard?.front}</p>
                <div className="mt-6 text-sm text-muted-foreground">Tap to reveal answer</div>
              </div>
              <div
                className="absolute inset-0 neuraal-card p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-accent/5"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="text-xs text-primary uppercase tracking-wide mb-4">Answer</div>
                <p className="text-lg whitespace-pre-line">{currentCard?.back}</p>
              </div>
            </div>
          </div>

          {showAnswer && (
            <div className="mt-6 flex items-center justify-center gap-4 animate-fade-up">
              <Button variant="outline" size="lg" onClick={handleNeedsPractice} className="flex-1 border-destructive/50 hover:bg-destructive/10">
                <X className="w-5 h-5 mr-2 text-destructive" />
                Needs Practice
              </Button>
              <Button variant="outline" size="lg" onClick={handleMarkMastered} className="flex-1 border-neuraal-emerald/50 hover:bg-neuraal-emerald/10">
                <Check className="w-5 h-5 mr-2 text-neuraal-emerald" />
                Got It
              </Button>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShuffle}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Shuffle
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentIndex === totalCards - 1}>
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="p-4 border-t border-border">
        <div className="container mx-auto max-w-lg">
          <Button variant="outline" className="w-full" onClick={handleBackToSetup}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate More Flashcards
          </Button>
        </div>
      </footer>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-neuraal-emerald/10">
                <LayoutGrid className="w-5 h-5 text-neuraal-emerald" />
              </div>
              <h1 className="font-display font-semibold">Flashcards</h1>
            </div>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>
      {state === "setup" && renderSetup()}
      {state === "loading" && renderLoading()}
      {state === "active" && renderActive()}
    </div>
  );
}