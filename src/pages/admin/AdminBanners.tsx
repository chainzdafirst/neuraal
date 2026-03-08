import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, Trash2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Banner {
  id: string;
  title: string;
  content: string;
  banner_type: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", banner_type: "info" });

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from("system_banners")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setBanners(data);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast.error("Title and content are required");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("system_banners")
        .update({ title: form.title, content: form.content, banner_type: form.banner_type, updated_at: new Date().toISOString() })
        .eq("id", editingId);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Banner updated");
    } else {
      const { error } = await supabase
        .from("system_banners")
        .insert({ title: form.title, content: form.content, banner_type: form.banner_type });
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Banner published");
    }

    setForm({ title: "", content: "", banner_type: "info" });
    setShowForm(false);
    setEditingId(null);
    fetchBanners();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("system_banners").update({ is_active: !current }).eq("id", id);
    fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    await supabase.from("system_banners").delete().eq("id", id);
    toast.success("Banner deleted");
    fetchBanners();
  };

  const startEdit = (banner: Banner) => {
    setForm({ title: banner.title, content: banner.content, banner_type: banner.banner_type });
    setEditingId(banner.id);
    setShowForm(true);
  };

  const typeColor = (type: string) => {
    if (type === "warning") return "bg-neuraal-amber/10 text-neuraal-amber";
    if (type === "success") return "bg-neuraal-emerald/10 text-neuraal-emerald";
    if (type === "promo") return "bg-primary/10 text-primary";
    return "bg-accent/10 text-accent";
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">System Banners</h1>
            <p className="text-muted-foreground text-sm mt-1">Publish ads & announcements shown to users on daily login</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: "", content: "", banner_type: "info" }); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Banner
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{editingId ? "Edit Banner" : "Create Banner"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Banner title..." />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Banner message..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.banner_type} onValueChange={(v) => setForm({ ...form, banner_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="promo">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>{editingId ? "Update" : "Publish"}</Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : banners.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No banners yet. Create one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            banners.map((banner) => (
              <Card key={banner.id}>
                <CardContent className="py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{banner.title}</h3>
                      <Badge variant="secondary" className={typeColor(banner.banner_type)}>
                        {banner.banner_type}
                      </Badge>
                      {!banner.is_active && <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">{banner.content}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {new Date(banner.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch checked={banner.is_active} onCheckedChange={() => toggleActive(banner.id, banner.is_active)} />
                    <Button variant="ghost" size="icon" onClick={() => startEdit(banner)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteBanner(banner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
