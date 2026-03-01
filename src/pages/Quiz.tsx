import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import FileUploader from "@/components/FileUploader";
import {
  ArrowLeft,
  Target,
  Play,
  Clock,
  BookOpen,
  ChevronRight,
  Check,
  X,
  Award,
  RotateCcw,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

type QuizState = "setup" | "loading" | "active" | "review";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export default function Quiz() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const [state, setState] = useState<QuizState>("setup");
  const [difficulty, setDifficulty] = useState<"easy" | "moderate" | "hard">("moderate");
  const [questionCount, setQuestionCount] = useState(5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [quizId, setQuizId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const score = answers.filter((a, i) => a === questions[i]?.correctAnswer).length;

  const handleStartQuiz = async () => {
    if (!uploadedDocumentId) {
      toast.error("Please upload a document first before generating a quiz.");
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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          documentText: doc.extracted_text,
          difficulty,
          questionCount,
          userProfile: profile ? {
            program: profile.program,
            institution: profile.institution,
          } : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate quiz");

      const data = await response.json();
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(null));

        // Save quiz to DB
        if (user) {
          const { data: quizData } = await supabase
            .from("quizzes")
            .insert({
              user_id: user.id,
              title: `Quiz - ${documentName || "Document"}`,
              questions: data.questions,
              difficulty,
              total_questions: data.questions.length,
              document_id: uploadedDocumentId,
            })
            .select()
            .single();
          
          if (quizData) setQuizId(quizData.id);
        }

        setState("active");
        toast.success("Quiz started! Good luck!");
      } else {
        throw new Error("No questions generated");
      }
    } catch (error) {
      console.error("Quiz generation error:", error);
      toast.error("Failed to generate quiz. Please try again.");
      setState("setup");
    }
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);

    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Save score to DB
      if (quizId && user) {
        const finalScore = answers.filter((a, i) => a === questions[i]?.correctAnswer).length;
        supabase
          .from("quizzes")
          .update({ score: finalScore, completed_at: new Date().toISOString() })
          .eq("id", quizId)
          .then(() => {});
      }
      setState("review");
    }
  };

  const handleRetry = () => {
    setState("setup");
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setQuestions([]);
    setQuizId(null);
  };

  const handleFileReady = (documentId: string, fileName: string) => {
    setUploadedDocumentId(documentId);
    setDocumentName(fileName);
  };

  const renderSetup = () => (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 rounded-2xl bg-neuraal-amber/10 mb-4">
          <Target className="w-8 h-8 text-neuraal-amber" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Quiz Setup</h2>
        <p className="text-muted-foreground">Practice with exam-style questions from your notes</p>
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
            {documentName} ready for quiz generation
          </p>
        )}
      </div>

      {/* Difficulty */}
      <div className="neuraal-card p-6 mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Difficulty
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(["easy", "moderate", "hard"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`py-3 rounded-lg text-sm font-medium capitalize transition-all ${
                difficulty === level
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Question count */}
      <div className="neuraal-card p-6 mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Number of Questions
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 15, 20].map((count) => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              className={`py-3 rounded-lg text-sm font-medium transition-all ${
                questionCount === count
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Timed mode */}
      <div className="neuraal-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Timed Mode</h3>
              <p className="text-xs text-muted-foreground">Simulate exam conditions</p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            Coming Soon
          </Button>
        </div>
      </div>

      <Button variant="gradient" size="lg" className="w-full" onClick={handleStartQuiz}>
        <Play className="w-5 h-5 mr-2" />
        Start Quiz
      </Button>
    </div>
  );

  const renderLoading = () => (
    <div className="container mx-auto px-4 py-8 max-w-lg text-center">
      <div className="inline-flex p-6 rounded-full bg-primary/10 mb-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
      <h2 className="text-2xl font-display font-bold mb-2">Generating Quiz...</h2>
      <p className="text-muted-foreground">Creating {questionCount} {difficulty} questions from your notes</p>
    </div>
  );

  const renderActive = () => (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Question {currentIndex + 1} of {totalQuestions}</span>
          <span className="text-sm font-medium">{currentQuestion?.topic}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="neuraal-card p-6 mb-6">
        <h2 className="text-xl font-display font-semibold mb-6">{currentQuestion?.question}</h2>
        <div className="space-y-3">
          {currentQuestion?.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showResult = selectedAnswer !== null;

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  showResult
                    ? isCorrect
                      ? "border-neuraal-emerald bg-neuraal-emerald/10"
                      : isSelected
                      ? "border-destructive bg-destructive/10"
                      : "border-border opacity-50"
                    : isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      showResult
                        ? isCorrect
                          ? "bg-neuraal-emerald text-white"
                          : isSelected
                          ? "bg-destructive text-white"
                          : "bg-secondary"
                        : isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {showResult ? (
                      isCorrect ? <Check className="w-4 h-4" /> : isSelected ? <X className="w-4 h-4" /> : String.fromCharCode(65 + index)
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showExplanation && currentQuestion?.explanation && (
        <div className="neuraal-card p-6 mb-6 bg-accent/5 border-accent/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            Explanation
          </h3>
          <p className="text-muted-foreground">{currentQuestion.explanation}</p>
        </div>
      )}

      {selectedAnswer !== null && (
        <Button variant="gradient" size="lg" className="w-full" onClick={handleNext}>
          {currentIndex < totalQuestions - 1 ? (
            <>Next Question <ChevronRight className="w-5 h-5 ml-1" /></>
          ) : (
            <>See Results <Award className="w-5 h-5 ml-2" /></>
          )}
        </Button>
      )}
    </div>
  );

  const renderReview = () => {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return (
      <div className="container mx-auto px-4 py-8 max-w-lg text-center">
        <div className="inline-flex p-6 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 mb-6">
          <Award className="w-16 h-16 text-primary" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-2">Quiz Complete!</h2>
        <p className="text-muted-foreground mb-8">Here is how you did:</p>

        <div className="neuraal-card p-8 mb-6">
          <div className="text-5xl font-display font-bold neuraal-gradient-text mb-2">{percentage}%</div>
          <div className="text-lg text-muted-foreground">{score} out of {totalQuestions} correct</div>
          <div className="mt-4 p-3 rounded-lg bg-secondary">
            {percentage >= 80 ? (
              <span className="text-neuraal-emerald">Excellent work! Keep it up!</span>
            ) : percentage >= 60 ? (
              <span className="text-neuraal-amber">Good effort! Keep practicing.</span>
            ) : (
              <span className="text-muted-foreground">Review the topics and try again. You got this!</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="gradient" size="lg" className="w-full" onClick={handleRetry}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 neuraal-glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} disabled={state === "loading"}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-neuraal-amber/10">
                <Target className="w-5 h-5 text-neuraal-amber" />
              </div>
              <h1 className="font-display font-semibold">Quizzes & Tests</h1>
            </div>
          </div>
          <NeuraalLogo size="sm" showText={false} />
        </div>
      </header>
      <main>
        {state === "setup" && renderSetup()}
        {state === "loading" && renderLoading()}
        {state === "active" && renderActive()}
        {state === "review" && renderReview()}
      </main>
    </div>
  );
}