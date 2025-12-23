import { cn } from "@/lib/utils";

interface NeuraalLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-4xl",
};

export function NeuraalLogo({ className, size = "md", showText = true }: NeuraalLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Brain/Neural Network Icon */}
      <div className={cn("relative", sizeMap[size])}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="neuraal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(234 89% 54%)" />
              <stop offset="100%" stopColor="hsl(187 85% 43%)" />
            </linearGradient>
          </defs>
          {/* Outer brain shape */}
          <path
            d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4z"
            fill="url(#neuraal-gradient)"
            opacity="0.1"
          />
          {/* Neural connections */}
          <circle cx="24" cy="16" r="3" fill="url(#neuraal-gradient)" />
          <circle cx="16" cy="24" r="3" fill="url(#neuraal-gradient)" />
          <circle cx="32" cy="24" r="3" fill="url(#neuraal-gradient)" />
          <circle cx="20" cy="32" r="3" fill="url(#neuraal-gradient)" />
          <circle cx="28" cy="32" r="3" fill="url(#neuraal-gradient)" />
          <circle cx="24" cy="24" r="4" fill="url(#neuraal-gradient)" />
          {/* Connection lines */}
          <line x1="24" y1="16" x2="24" y2="20" stroke="url(#neuraal-gradient)" strokeWidth="2" />
          <line x1="16" y1="24" x2="20" y2="24" stroke="url(#neuraal-gradient)" strokeWidth="2" />
          <line x1="28" y1="24" x2="32" y2="24" stroke="url(#neuraal-gradient)" strokeWidth="2" />
          <line x1="22" y1="27" x2="20" y2="30" stroke="url(#neuraal-gradient)" strokeWidth="2" />
          <line x1="26" y1="27" x2="28" y2="30" stroke="url(#neuraal-gradient)" strokeWidth="2" />
          {/* Outer ring */}
          <circle
            cx="24"
            cy="24"
            r="18"
            stroke="url(#neuraal-gradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
      
      {showText && (
        <span className={cn("font-display font-bold neuraal-gradient-text", textSizeMap[size])}>
          Neuraal
        </span>
      )}
    </div>
  );
}