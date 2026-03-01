import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-xl font-display font-bold mt-6 mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-display font-semibold mt-5 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-display font-semibold mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="my-2 leading-relaxed text-foreground">{children}</p>,
          ul: ({ children }) => <ul className="list-disc ml-5 space-y-1 my-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-5 space-y-1 my-3">{children}</ol>,
          li: ({ children }) => <li className="text-foreground">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-secondary text-sm font-mono">{children}</code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 my-3 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}