// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext.jsx";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/projects", label: "Projects", icon: FolderKanban },
  { path: "/tasks", label: "My Tasks", icon: CheckSquare },
  { path: "/team", label: "Team", icon: Users },
];

export default function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  const isAdmin = user?.role === "admin";

  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <FolderKanban className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            ProjectHub
          </span>
          <
// @ts-ignore
          Button
            variant="ghost"
            size="icon"
            className="lg:hidden ml-auto text-sidebar-foreground hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-primary text-xs text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.full_name || "User"}
              </p>
              <p className="text-xs text-sidebar-foreground truncate">
                {isAdmin ? "Admin" : "Member"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground hover:text-white"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-sm">ProjectHub</span>
        </div>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet context={{ user, isAdmin }} />
        </div>
      </main>
    </div>
  );
}
