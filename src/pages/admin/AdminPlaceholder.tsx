import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function AdminPlaceholder({ title }: { title: string }) {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold">{title}</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Construction className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Coming Soon</p>
            <p className="text-sm mt-1">This section is under development.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
