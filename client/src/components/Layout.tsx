import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Stethoscope, ChevronDown, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/use-auth";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Achievements", href: "/achievements" },
    { name: "Panels", href: "/panels" },
    { name: "Departments", href: "/departments" },
    { name: "Search", href: "/search" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 text-xs md:text-sm text-center font-medium px-4">
        Healthcare Reforms Doctors Association (HRDA) - Advocating for Doctors & Public Health
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/hrda_logo.png"
              alt="HRDA Logo"
              className="h-12 w-12 object-contain rounded-full"
            />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg leading-tight text-primary tracking-[0.3em]">HRDA</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Healthcare Reforms Doctors Association</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`
                    text-sm font-medium px-4 py-2 rounded-md transition-colors cursor-pointer
                    ${isActive(link.href)
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-primary hover:bg-muted/50"}
                  `}
                >
                  {link.name}
                </div>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/index.php/new-registration-2/">
              <Button size="sm" className="font-semibold shadow-sm hover:shadow-md transition-all">
                Join HRDA
              </Button>
            </Link>
            {user ? (
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">Admin</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-background border-b shadow-lg p-4 flex flex-col gap-2 animate-in slide-in-from-top-5">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`p-3 rounded-md font-medium ${isActive(link.href) ? "bg-primary/10 text-primary" : "text-foreground"}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </div>
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            <Link href="/index.php/new-registration-2/">
              <Button className="w-full justify-center">Join Membership</Button>
            </Link>
            {user ? (
              <Link href="/admin/dashboard">
                <Button variant="outline" className="w-full justify-center mt-2">Admin Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login" className="w-full block mt-2">
                <Button variant="ghost" className="w-full justify-center">Login</Button>
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/hrda_logo.png" alt="HRDA Logo" className="h-10 w-10 object-contain rounded-full bg-white" />
              <span className="font-serif font-bold text-xl text-white">HRDA</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Healthcare Reforms Doctors Association is dedicated to improving the healthcare system
              and protecting the rights of medical professionals in Telangana.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/panels" className="hover:text-white transition-colors">Panels</Link></li>
              <li><Link href="/achievements" className="hover:text-white transition-colors">Achievements</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors">Verify TGMC</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm mb-6">
              <li>hrda4people@gmail.com</li>
              <li>Hyderabad, Telangana</li>
              <li>
                <a href="/contact" className="text-primary hover:text-blue-300 transition-colors">Send a message</a>
              </li>
            </ul>

            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-primary transition-colors text-white">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-primary transition-colors text-white">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-primary transition-colors text-white">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-primary transition-colors text-white">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Healthcare Reforms Doctors Association. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
