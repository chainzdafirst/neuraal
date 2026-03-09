CREATE TYPE public.blog_post_status AS ENUM ('draft', 'scheduled', 'published');

CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  status public.blog_post_status NOT NULL DEFAULT 'draft',
  author_id UUID NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Public can view published posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- Storage policies
CREATE POLICY "Public can view blog images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can manage blog images" 
ON storage.objects 
FOR ALL
USING (bucket_id = 'blog-images' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'blog-images' AND public.is_admin(auth.uid()));