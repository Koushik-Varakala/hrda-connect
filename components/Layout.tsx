import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Facebook, Twitter, Instagram, Youtube, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/use-auth";
import { FloatingInstagram } from "@/components/FloatingInstagram";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Panels", href: "/panels" },
  ];

  const notificationLinks = [
    { name: "Announcements", href: "/announcements", description: "Latest updates and news." },
    { name: "Elections", href: "/election-panel", description: "Election updates and candidate info." },
  ];

  const resourceLinks = [
    { name: "Achievements", href: "/achievements", description: "Our milestones and success stories." },
    { name: "Gallery", href: "/gallery", description: "View our photo gallery." },
    { name: "Media Coverage", href: "/media", description: "News articles and press releases." },
    { name: "Departments", href: "/departments", description: "Various functional committees." },
  ];

  const secondaryLinks = [
    { name: "Search", href: "/search" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-[#1a237e] text-white py-2 text-xs md:text-sm text-center font-medium px-4 tracking-wide z-50 relative">
        Healthcare Reforms Doctors Association (HRDA) - Advocating for Doctors & Public Health
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ease-in-out ${isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-2"
          : "bg-white shadow-sm py-4"
          }`}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="/hrda_full_logo.png"
              alt="Healthcare Reforms Doctors Association Logo"
              className={`object-contain transition-all duration-300 ${isScrolled ? "h-12" : "h-16"}`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Standard Main Links */}
            <div className="flex items-center gap-1">
              {mainLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${isActive(link.href) ? "text-primary font-semibold" : "text-slate-700"
                    }`}
                >
                  <span className="relative">
                    {link.name}
                    <span className={`absolute left-0 -bottom-1 w-full h-0.5 bg-primary origin-left transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100 ${isActive(link.href) ? "scale-x-100" : ""}`} />
                  </span>
                </Link>
              ))}
            </div>

            {/* Notifications Dropdown (Isolated for Alignment) */}
            <NavigationMenu className="mx-1">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-transparent hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-transparent data-[state=open]:!bg-transparent data-[state=open]:text-primary text-slate-700 shadow-none border-none">
                    <span className="relative">
                      Notifications
                      <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-primary origin-left transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[250px] gap-2 p-3 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                      {notificationLinks.map((link) => (
                        <li key={link.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50"
                            >
                              <div className="text-sm font-semibold leading-none text-slate-800">{link.name}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-slate-500 mt-1">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Insights Dropdown (Isolated for Alignment) */}
            <NavigationMenu className="mx-1">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-transparent hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-transparent data-[state=open]:!bg-transparent data-[state=open]:text-primary text-slate-700 shadow-none border-none">
                    <span className="relative">
                      Insights
                      <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-primary origin-left transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[250px] gap-2 p-3 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                      {resourceLinks.map((link) => (
                        <li key={link.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50"
                            >
                              <div className="text-sm font-semibold leading-none text-slate-800">{link.name}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-slate-500 mt-1">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Secondary Links */}
            <div className="flex items-center gap-1">
              {secondaryLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${isActive(link.href) ? "text-primary font-semibold" : "text-slate-700"
                    }`}
                >
                  <span className="relative">
                    {link.name}
                    <span className={`absolute left-0 -bottom-1 w-full h-0.5 bg-primary origin-left transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100 ${isActive(link.href) ? "scale-x-100" : ""}`} />
                  </span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-6">
            {user ? (
              <Link href="/admin/dashboard" className="text-sm font-medium text-slate-700 hover:text-primary transition-colors">
                Admin Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-primary transition-colors">
                Login
              </Link>
            )}

            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 shadow-md transition-all hover:shadow-lg font-medium">
              <Link href="/index.php/new-registration-2/">
                Join HRDA
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-slate-700 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`p-3 rounded-lg font-medium transition-colors ${isActive(link.href) ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </div>
              </Link>
            ))}

            {/* Mobile Notifications Dropdown */}
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-full flex items-center justify-between p-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Notifications
                <ChevronDown className={`w-4 h-4 transition-transform ${isNotificationsOpen ? "rotate-180" : ""}`} />
              </button>
              {isNotificationsOpen && (
                <div className="bg-slate-50 p-2 space-y-1">
                  {notificationLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.href) ? "bg-white text-blue-700 font-medium shadow-sm" : "text-slate-600 hover:bg-white hover:shadow-sm"
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Insights Dropdown */}
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsInsightsOpen(!isInsightsOpen)}
                className="w-full flex items-center justify-between p-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Insights
                <ChevronDown className={`w-4 h-4 transition-transform ${isInsightsOpen ? "rotate-180" : ""}`} />
              </button>
              {isInsightsOpen && (
                <div className="bg-slate-50 p-2 space-y-1">
                  {resourceLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${isActive(link.href) ? "bg-white text-blue-700 font-medium shadow-sm" : "text-slate-600 hover:bg-white hover:shadow-sm"
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {secondaryLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`p-3 rounded-lg font-medium transition-colors ${isActive(link.href) ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </div>
              </Link>
            ))}

            <div className="h-px bg-gray-100 my-4" />

            {user ? (
              <Button asChild variant="outline" className="w-full justify-center border-slate-200 text-slate-700 rounded-lg">
                <Link href="/admin/dashboard">
                  Admin Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" className="w-full justify-center text-slate-700 hover:bg-slate-50 rounded-lg">
                <Link href="/login">
                  Login
                </Link>
              </Button>
            )}

            <Button asChild className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm mt-2">
              <Link href="/index.php/new-registration-2/">
                Join HRDA
              </Link>
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 md:py-16 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/hrda_logo.png" alt="HRDA Logo" className="h-10 w-10 object-contain rounded-full bg-white p-1" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-white leading-tight">HRDA</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Healthcare Reforms Doctors Association</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              Dedicated to improving the healthcare system and protecting the rights of medical professionals in Telangana.
              Join us in our mission to create a better future for healthcare.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors hover:underline decoration-blue-500 underline-offset-4">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors hover:underline decoration-blue-500 underline-offset-4">About Us</Link></li>
              <li><Link href="/panels" className="hover:text-white transition-colors hover:underline decoration-blue-500 underline-offset-4">Leadership Panels</Link></li>
              <li><Link href="/achievements" className="hover:text-white transition-colors hover:underline decoration-blue-500 underline-offset-4">Achievements</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors hover:underline decoration-blue-500 underline-offset-4">Gallery</Link></li>
              <li><Link href="/media" className="hover:text-white transition-colors hover:underline decoration-blue-500 underline-offset-4">Media Coverage</Link></li>
              <li><Link href="/index.php/new-registration-2/" className="hover:text-white transition-colors hover:underline decoration-blue-500 underline-offset-4">Join HRDA</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors hover:underline decoration-blue-500 underline-offset-4">Verify Membership</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Contact & Social</h4>
            <ul className="space-y-3 text-sm mb-6">
              <li className="flex items-start gap-2">
                <span className="text-slate-400">Email:</span>
                <a href="mailto:hrda4people@gmail.com" className="hover:text-white transition-colors">hrda4people@gmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">Loc:</span>
                <span>Hyderabad, Telangana</span>
              </li>
              <li>
                <Link href="/contact" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">Send us a message &rarr;</Link>
              </li>
            </ul>

            <div className="flex gap-3">
              <a href="https://x.com/ReformsHrda" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-full hover:bg-black transition-all text-white hover:scale-110" aria-label="Twitter (X)">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/hrda4people/" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-full hover:bg-blue-700 transition-all text-white hover:scale-110" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/hrda4people/" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-full hover:bg-pink-600 transition-all text-white hover:scale-110" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@healthcarereformsdoctorsas6094" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-full hover:bg-red-600 transition-all text-white hover:scale-110" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Healthcare Reforms Doctors Association. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
      <FloatingInstagram />
    </div>
  );
}
