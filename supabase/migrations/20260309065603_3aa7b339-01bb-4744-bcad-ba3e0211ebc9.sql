
DROP POLICY "Public can view published posts" ON public.blog_posts;

CREATE POLICY "Public can view published posts"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (
  (status = 'published'::blog_post_status) AND ((published_at IS NULL) OR (published_at <= now()))
);
