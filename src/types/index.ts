// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  tier: "free" | "premium";
  createdAt: string;
  subscription?: {
    status: "active" | "expired";
    plan: "weekly" | "monthly" | "annual";
    renewalDate: string;
  };
}

export interface UserProfile {
  educationLevel: "diploma" | "degree";
  institution: string;
  program: string;
  country: string;
  examType: "semester" | "board";
}

// Document Types
export interface UploadedDocument {
  id: string;
  userId: string;
  name: string;
  type: "pdf" | "docx" | "ppt" | "image";
  size: number;
  uploadedAt: string;
  status: "processing" | "ready" | "error";
  syllabusId?: string;
  topics?: string[];
}

// Learning Types
export interface Quiz {
  id: string;
  title: string;
  documentId: string;
  questions: QuizQuestion[];
  difficulty: "easy" | "moderate" | "hard";
  createdAt: string;
  timed: boolean;
  duration?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "mcq" | "short_answer" | "essay";
  options?: string[];
  correctAnswer?: string;
  marks: number;
  topicTag: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  documentId: string;
  topic: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
}

export interface LearningProgress {
  userId: string;
  topicsMastered: number;
  totalTopics: number;
  quizzesTaken: number;
  averageScore: number;
  weakAreas: string[];
  studyStreak: number;
}

// Chat/Tutor Types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

// Usage Types
export interface UsageData {
  aiCalls: number;
  inputTokens: number;
  outputTokens: number;
  featureUsage: {
    tutor: number;
    summary: number;
    quiz: number;
    flashcards: number;
  };
}

export interface TierLimits {
  maxInputTokens: number;
  maxOutputTokens: number;
  features: {
    tutor: boolean;
    summaries: boolean;
    quizzes: boolean;
    examMode: boolean;
    studyPlanner: boolean;
    weaknessAnalytics: boolean;
  };
}