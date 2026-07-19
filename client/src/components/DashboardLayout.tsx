import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/useMobile";
import {
  BarChart3,
  BookOpenText,
  ExternalLink,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  MapPinned,
  PanelLeft,
  ShieldAlert,
  Tags,
} from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const menuItems = [
  { icon: LayoutDashboard, label: "概览 Overview", path: "/admin" },
  { icon: MapPinned, label: "导游 Guides", path: "/admin/guides" },
  { icon: BookOpenText, label: "文章 Articles", path: "/admin/articles" },
  { icon: Tags, label: "标签 Tags", path: "/admin/tags" },
  { icon: FileCheck2, label: "申请 Requests", path: "/admin/requests" },
  { icon: BarChart3, label: "分析 Analytics", path: "/admin/analytics" },
];

const SIDEBAR_WIDTH_KEY = "localmate-admin-sidebar-width";
const DEFAULT_WIDTH = 276;
const MIN_WIDTH = 230;
const MAX_WIDTH = 380;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  const submitAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setSigningIn(true);
    setLoginError(null);
    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Sign-in failed");
      }
      window.location.reload();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Sign-in failed");
      setSigningIn(false);
    }
  };

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5eddf] p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 text-center shadow-xl">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground"><ShieldAlert className="size-6" /></div>
          <h1 className="mt-6 font-serif text-3xl font-semibold tracking-[-0.03em]">管理员登录 / Admin sign-in</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">请输入管理员密码以继续。/ Enter the admin password to continue.</p>
          <form onSubmit={submitAdminLogin} className="mt-7 grid gap-3">
            <Input
              type="password"
              required
              autoFocus
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="管理员密码 / Admin password"
              className="h-12 rounded-xl text-center"
            />
            {loginError && <p className="text-sm text-destructive">{loginError}</p>}
            <Button type="submit" size="lg" disabled={signingIn} className="w-full rounded-full">
              {signingIn ? "登录中… / Signing in…" : "登录并继续 / Sign in"}
            </Button>
          </form>
          <Button asChild variant="ghost" className="mt-2 w-full rounded-full"><a href="/">返回网站 / Back to site</a></Button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5eddf] p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 text-center shadow-xl">
          <ShieldAlert className="mx-auto size-10 text-destructive" />
          <h1 className="mt-6 font-serif text-3xl font-semibold tracking-[-0.03em]">无管理员权限</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">This account is signed in but does not have the admin role.</p>
          <Button asChild className="mt-7 rounded-full"><a href="/">返回公共网站 / Back to site</a></Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => location === item.path || (item.path !== "/admin" && location.startsWith(`${item.path}/`)));
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = event.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
          <SidebarHeader className="h-20 justify-center border-b border-sidebar-border">
            <div className="flex w-full items-center gap-3 px-2">
              <button onClick={toggleSidebar} className="grid size-9 shrink-0 place-items-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring" aria-label="Toggle navigation"><PanelLeft className="size-4" /></button>
              {!isCollapsed && <div className="min-w-0"><p className="truncate font-serif text-lg font-semibold text-sidebar-foreground">LocalMate China</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/48">运营后台 · Admin</p></div>}
            </div>
          </SidebarHeader>
          <SidebarContent className="gap-0 py-3">
            <SidebarMenu className="px-2">
              {menuItems.map(item => {
                const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(`${item.path}/`));
                return <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={isActive} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-11 font-normal"><item.icon className={isActive ? "text-sidebar-primary" : ""} /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>;
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-3">
            <Button variant="ghost" onClick={() => window.open("/", "_blank", "noopener,noreferrer")} className="mb-2 w-full justify-start text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><ExternalLink className="size-4" /><span className="group-data-[collapsible=icon]:hidden">查看网站 / View site</span></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"><Avatar className="size-9 shrink-0 border border-sidebar-border"><AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name || "-"}</p><p className="mt-1 truncate text-xs text-sidebar-foreground/55">{user?.email || "-"}</p></div></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52"><DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive"><LogOut className="mr-2 size-4" />退出登录 / Sign out</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/20 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => !isCollapsed && setIsResizing(true)} style={{ zIndex: 50 }} />
      </div>
      <SidebarInset className="bg-[#f8f5ee]">
        {isMobile && <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur"><SidebarTrigger className="size-9 rounded-lg" /><span className="text-sm font-semibold">{activeMenuItem?.label ?? "运营后台"}</span></div>}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}
