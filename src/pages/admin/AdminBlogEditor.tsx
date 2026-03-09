import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminBlogEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [publishedAt, setPublishedAt] = useState<Date | undefined>(new Date());
  const [coverImage, setCoverImage] = useState("");

  useEffect(() => {
    if (!isNew && id) {
      fetchPost(id);
    }
  }, [id, isNew]);

  // Auto-generate slug from title if it's empty
  useEffect(() => {
    if (isNew && title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [title, slug, isNew]);

  const fetchPost = async (postId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      toast.error("Failed to fetch post");
      navigate("/admin/blog");
    } else if (data) {
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt || "");
      setContent(data.content);
      setStatus(data.status as any);
      setCoverImage(data.cover_image || "");
      setPublishedAt(data.published_at ? new Date(data.published_at) : undefined);
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Uploading image...");
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setCoverImage(data.publicUrl);
      toast.dismiss();
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to upload image");
    }
  };

  const handleSave = async () => {
    if (!title || !slug || !content) {
      toast.error("Title, slug, and content are required");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to save a post");
      return;
    }

    setIsSaving(true);
    
    const postData = {
      title,
      slug,
      excerpt,
      content,
      status,
      cover_image: coverImage || null,
      published_at: publishedAt ? publishedAt.toISOString() : null,
      author_id: user.id
    };

    try {
      if (isNew) {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);
          
        if (error) throw error;
        toast.success("Post created successfully");
        navigate("/admin/blog");
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);
          
        if (error) throw error;
        toast.success("Post updated successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/blog")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl sm:text-3xl font-display font-bold flex-1">{isNew ? "Create New Post" : "Edit Post"}</h2>
        </div>
        <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => navigate("/admin/blog")}>Cancel</Button>
          <Button className="flex-1 sm:flex-none" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isNew ? "Publish" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="text-lg font-semibold h-12"
              placeholder="e.g. How AI is changing education"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea 
              id="content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="min-h-[500px] font-mono text-sm"
              placeholder="Write your post content here..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 bg-card border rounded-xl space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Publishing</h3>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Publish Date (Scheduling)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !publishedAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {publishedAt ? format(publishedAt, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={publishedAt}
                    onSelect={setPublishedAt}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Set a future date to schedule the post.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input 
                id="slug" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)} 
                placeholder="how-ai-is-changing-education"
              />
            </div>
          </div>

          <div className="p-5 bg-card border rounded-xl space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Metadata</h3>
            
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea 
                id="excerpt" 
                value={excerpt} 
                onChange={(e) => setExcerpt(e.target.value)} 
                className="h-24 resize-none"
                placeholder="A short summary for the blog grid..."
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              {coverImage && (
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted mb-2 group">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" onClick={() => setCoverImage("")}>Remove</Button>
                  </div>
                </div>
              )}
              {!coverImage && (
                <Button 
                  variant="outline" 
                  className="w-full h-24 border-dashed gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Upload Image</span>
                </Button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}