import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2 } from "lucide-react";

export function AdminLayout({ children }: {children: ReactNode;}) {
  const { isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>);

  }

  if (!isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border px-4 bg-background/80 backdrop-blur-md sticky top-0 z-40 flex-row flex items-center justify-start my-[25px]">
            <SidebarTrigger className="mr-4" />
            <span className="text-sm font-medium text-muted-foreground text-left px-0 my-0 mx-0 pl-0 pr-[47px] pb-0">
              ​
            </span>
          </header>
          <main className="flex-1 p-2 sm:p-3 md:p-5 overflow-auto max-h-[calc(60vh-3.5rem)] max-w-[60%] border border-border rounded-lg m-2 sm:m-3 md:m-4 bg-card py-[20px] my-[45px] mx-auto text-sm">{children}</main>
        </div>
      </div>
    </SidebarProvider>);

}