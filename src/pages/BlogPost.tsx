import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  cover_image: string | null;
  published_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (slug: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id, title, content, cover_image, published_at,
        profiles:author_id (full_name)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .maybeSingle();

    if (!error && data) {
      // @ts-ignore
      setPost(data as BlogPost);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b bg-background/95 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <NeuraalLogo />
          </div>
        </nav>
        <div className="container mx-auto px-4 py-20 max-w-3xl">
          <div className="space-y-6">
            <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/4 mb-12" />
            <div className="aspect-[21/9] bg-muted animate-pulse rounded-xl mb-12" />
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b bg-background/95 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Link to="/">
              <NeuraalLogo />
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or hasn't been published yet.</p>
          <Link to="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <NeuraalLogo />
          </Link>
          <Link to="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </nav>

      <article className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-12 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <time dateTime={post.published_at}>
                {format(new Date(post.published_at), "MMMM d, yyyy")}
              </time>
              {post.profiles?.full_name && (
                <>
                  <span>•</span>
                  <span>{post.profiles.full_name}</span>
                </>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight mb-8">
              {post.title}
            </h1>
          </header>

          {post.cover_image && (
            <div className="mb-12 aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
              <img 
                src={post.cover_image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  );
}
