import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
      if (isScheduled) return <Badge variant="outline">Scheduled</Badge>;
      return <Badge>Published</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Blog Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage, write and schedule your blog posts</p>
          </div>
          <Link to="/admin/blog/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="w-4 h-4" /> New Post
            </Button>
          </Link>
        </div>

        {/* Mobile card view */}
        <div className="block md:hidden space-y-3">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No posts found. Create your first post!</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="border rounded-xl bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">/{post.slug}</p>
                  </div>
                  {getStatusBadge(post.status, post.published_at)}
                </div>
                {post.published_at && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.published_at) > new Date() ? 'Scheduled' : 'Published'}: {format(new Date(post.published_at), 'PP')}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Link to={`/admin/blog/${post.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block border rounded-xl bg-card overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Published/Scheduled At</TableHead>
                <TableHead className="hidden xl:table-cell">Created</TableHead>
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
                    <TableCell className="font-medium max-w-[200px] lg:max-w-none">
                      <span className="truncate block">{post.title}</span>
                      <div className="text-xs text-muted-foreground font-normal mt-1 truncate">
                        /{post.slug}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(post.status, post.published_at)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {post.published_at ? format(new Date(post.published_at), 'PP p') : '-'}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground">
                      {post.created_at ? format(new Date(post.created_at), 'PP') : '-'}
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
    </AdminLayout>
  );
}