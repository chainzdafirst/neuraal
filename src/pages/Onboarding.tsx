import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, 
  Building2, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4 | 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile, isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [educationLevel, setEducationLevel] = useState<"diploma" | "degree" | "">("");
  const [institution, setInstitution] = useState("");
  const [program, setProgram] = useState("");
  const [examType, setExamType] = useState<"semester" | "board" | "">("");
  const [yearOfStudy, setYearOfStudy] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => (prev + 1) as Step);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const handleComplete = async () => {
    if (!educationLevel || !institution || !program || !examType || !yearOfStudy) {
      toast.error("Please complete all steps");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        education_level: educationLevel,
        institution,
        program,
        exam_type: examType,
        year_of_study: yearOfStudy,
      });

      toast.success("Your study space is ready!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!educationLevel;
      case 2:
        return !!institution;
      case 3:
        return !!program;
      case 4:
        return !!examType;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">
                What's your education level?
              </h2>
              <p className="text-muted-foreground">
                This helps us tailor content to your academic stage
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "diploma", label: "Diploma", desc: "2-3 year programs" },
                { value: "degree", label: "Degree", desc: "4+ year programs" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setEducationLevel(option.value as "diploma" | "degree")}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    educationLevel === option.value
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">{option.label}</span>
                    {educationLevel === option.value && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-2xl bg-accent/10 mb-4">
                <Building2 className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">
                Where do you study?
              </h2>
              <p className="text-muted-foreground">
                Enter your university or college name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Institution Name</Label>
              <Input
                id="institution"
                placeholder="e.g., University of Zambia"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="h-14 text-lg"
              />
            </div>

            {/* Quick select for popular institutions */}
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Popular choices:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  "University of Zambia",
                  "Copperbelt University",
                  "Mulungushi University",
                  "ZCAS University",
                ].map((inst) => (
                  <button
                    key={inst}
                    onClick={() => setInstitution(inst)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      institution === inst
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-2xl bg-neuraal-amber/10 mb-4">
                <BookOpen className="w-8 h-8 text-neuraal-amber" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">
                What's your program?
              </h2>
              <p className="text-muted-foreground">
                Your course or field of study
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">Program / Course Name</Label>
              <Input
                id="program"
                placeholder="e.g., BSc Pharmacy, Nursing Diploma"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="h-14 text-lg"
              />
            </div>

            {/* Popular programs */}
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Popular programs:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  "BSc Pharmacy",
                  "Nursing",
                  "Medicine",
                  "Business Admin",
                  "Computer Science",
                  "Accounting",
                ].map((prog) => (
                  <button
                    key={prog}
                    onClick={() => setProgram(prog)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      program === prog
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {prog}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-2xl bg-neuraal-emerald/10 mb-4">
                <GraduationCap className="w-8 h-8 text-neuraal-emerald" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">
                What's your exam type?
              </h2>
              <p className="text-muted-foreground">
                How are you assessed?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "semester", label: "Semester Exams", desc: "Mid-year only" },
                { value: "board", label: "Board Exams", desc: "End of year" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExamType(option.value as "semester" | "board")}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    examType === option.value
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">{option.label}</span>
                    {examType === option.value && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <NeuraalLogo size="sm" />
        <span className="text-sm text-muted-foreground">
          Step {step} of {totalSteps}
        </span>
      </header>

      {/* Progress bar */}
      <div className="px-4">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {renderStep()}
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className={step === 1 ? "invisible" : ""}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            variant="gradient"
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : step === 4 ? (
              <>
                Complete Setup
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
