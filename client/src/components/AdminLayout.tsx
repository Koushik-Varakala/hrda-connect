import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Award,
  Building2,
  FileCheck,
  LogOut,
  Menu
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout, isLoading } = useAuth();

  // Protect route
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading]);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Announcements", icon: Megaphone, href: "/admin/announcements" },
    { name: "Panels & Members", icon: Users, href: "/admin/panels" },
    { name: "Achievements", icon: Award, href: "/admin/achievements" },
    { name: "Departments", icon: Building2, href: "/admin/departments" },
    { name: "Registrations", icon: FileCheck, href: "/admin/registrations" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="font-serif font-bold text-white text-lg">HRDA Admin</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${location === item.href
                  ? "bg-primary text-white"
                  : "hover:bg-slate-800 hover:text-white"}
              `}>
                <item.icon className="w-5 h-5" />
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {user.firstName?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            size="sm"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

      </aside >

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <span className="font-serif font-bold text-white text-lg">HRDA Admin</span>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-slate-900 border-r-slate-800 p-0 text-slate-300">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
              <span className="font-serif font-bold text-white text-lg">HRDA Admin</span>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                    ${location === item.href
                      ? "bg-primary text-white"
                      : "hover:bg-slate-800 hover:text-white"}
                  `}>
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-800 absolute bottom-0 left-0 right-0">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  {user?.firstName?.[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                size="sm"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div >

      {/* Main Content */}
      <main className="flex-1 overflow-auto mt-16 md:mt-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main >
    </div >
  );
}
