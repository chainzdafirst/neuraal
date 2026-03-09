import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, status, published_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to fetch posts");
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete post");
    } else {
      toast.success("Post deleted successfully");
      fetchPosts();
    }
  };

  const getStatusBadge = (status: string, published_at: string | null) => {
    if (status === 'draft') return <Badge variant="secondary">Draft</Badge>;
    if (status === 'published') {
      const isScheduled = published_at && new Date(published_at) > new Date();
      if (isScheduled) return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-200">Scheduled</Badge>;
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Published</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold">Blog Management</h2>
          <p className="text-muted-foreground mt-1">Manage, write and schedule your blog posts</p>
        </div>
        <Link to="/admin/blog/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </Link>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published/Scheduled At</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading posts...
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No posts found. Create your first post!
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    {post.title}
                    <div className="text-xs text-muted-foreground font-normal mt-1">
                      /{post.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(post.status, post.published_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {post.published_at ? format(new Date(post.published_at), 'PP p') : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(post.created_at), 'PP')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/blog/${post.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}