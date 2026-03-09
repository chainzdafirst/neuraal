import {
  LayoutDashboard,
  Users,
  Brain,
  BarChart3,
  FileText,
  Shield,
  Settings,
  MessageSquare,
  CreditCard,
  Megaphone,
  LogOut } from
"lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { NeuraalLogo } from "@/components/ui/NeuraalLogo";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar } from
"@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const mainItems = [
{ title: "Overview", url: "/admin", icon: LayoutDashboard },
{ title: "Users", url: "/admin/users", icon: Users },
{ title: "AI Management", url: "/admin/ai", icon: Brain },
{ title: "Content", url: "/admin/content", icon: FileText },
{ title: "Blog", url: "/admin/blog", icon: FileText },
{ title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
{ title: "Banners", url: "/admin/banners", icon: Megaphone }];


const systemItems = [
{ title: "Feedback", url: "/admin/feedback", icon: MessageSquare },
{ title: "Billing", url: "/admin/billing", icon: CreditCard },
{ title: "Security", url: "/admin/security", icon: Shield },
{ title: "Settings", url: "/admin/settings", icon: Settings }];


export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="p-4 flex items-center gap-2">
        <NeuraalLogo size="sm" />
        {!collapsed &&
        <span className="uppercase tracking-widest text-muted-foreground py-0 px-px my-0 pr-0 pb-0 pt-[16px] text-xs font-semibold">
            Admin
Dashboard

          </span>}
      </div>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                    to={item.url}
                    end={item.url === "/admin"}
                    className="hover:bg-muted/50"
                    activeClassName="bg-primary/10 text-primary font-medium">
                    
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) =>
              <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                    to={item.url}
                    className="hover:bg-muted/50"
                    activeClassName="bg-primary/10 text-primary font-medium">
                    
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}>
          
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>);

}