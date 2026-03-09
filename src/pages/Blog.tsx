import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  published_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id, title, slug, excerpt, cover_image, published_at,
        profiles:author_id (full_name)
      `)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });

    if (!error && data) {
      // @ts-ignore - Supabase join typing
      setPosts(data as BlogPost[]);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/">
            <NeuraalLogo />
          </Link>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">
            Insights on Learning & AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover the latest strategies, updates, and research on how AI is transforming education and exam preparation.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[16/10] bg-muted animate-pulse rounded-xl" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                  <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-full" />
                  <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No posts yet</h2>
              <p className="text-muted-foreground">Check back soon for new articles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {posts.map((post) => (
                <article key={post.id} className="group cursor-pointer flex flex-col h-full">
                  <Link to={`/blog/${post.slug}`} className="block flex-1">
                    <div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted mb-6">
                      {post.cover_image ? (
                        <img 
                          src={post.cover_image} 
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <NeuraalLogo size="sm" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
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
                    <h2 className="text-2xl font-bold font-display leading-tight mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center text-primary font-medium text-sm">
                      Read article <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
