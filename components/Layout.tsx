"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Facebook, Twitter, Instagram, Youtube, ChevronDown, Search } from "lucide-react";
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
import { appConfig } from "@/lib/app-config";
import { RegionSelectionModal } from "@/components/RegionSelectionModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    (window as any).triggerDonationModal = () => {
      setIsDonationOpen(true);
    };
    return () => {
      delete (window as any).triggerDonationModal;
    };
  }, []);

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
    { name: "About Us", href: "/about" },
    { name: appConfig.region === 'AP' ? "Leadership" : "Panels", href: "/panels" },
  ];

  const rmpLinks = [
    { name: "Who is an RMP?", href: "/rmp?tab=who-is-rmp", description: "Statutory legal definition under NMC Act 2019." },
    { name: "Anti-Quackery Policy", href: "/rmp?tab=policy", description: "Legal provisions prohibiting unqualified allopathic practice." },
    { name: "Anti-Quackery Enforcement", href: "/rmp?tab=enforcement", description: "APMC Section 8 Inspection Committee powers & procedures." },
  ];

  const updateLinks = [
    ...(appConfig.region === 'AP' ? [{ name: "Reform Agenda", href: "/manifesto", description: "HRDA's 18-point APMC reform manifesto." }] : []),
    { name: "Announcements & Events", href: "/announcements", description: "Latest updates, notices and news." },
    { name: "Elections Portal", href: "/election-panel", description: "Election updates and candidate info." },
    ...(appConfig.region === 'TG' ? [{ name: "District Elections", href: "/district-elections", description: "Nomination portal & official documents." }] : []),
  ];

  const resourceLinks = [
    { name: "Achievements", href: "/achievements", description: "Our milestones and success stories." },
    { name: "Photo Gallery", href: "/gallery", description: "View our photo & event gallery." },
    { name: "Media Coverage", href: "/media", description: "News articles and press releases." },
    { name: "Departments", href: "/departments", description: "Various functional committees." },
    { name: "Contact Us", href: "/contact", description: "Get in touch with state leadership." },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Region Selection Modal - Shows on first visit */}
      <RegionSelectionModal />

      {/* Top Announcement Bar */}
      <div className={`text-white py-1.5 md:py-2 text-xs md:text-sm font-medium px-4 tracking-wide z-50 relative shadow-inner ${
        appConfig.region === 'AP'
          ? 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-b border-blue-700/50'
          : 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border-b border-emerald-700/50'
      }`}>
        <div className="container mx-auto flex items-center justify-between sm:justify-center gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="font-bold tracking-wider uppercase text-amber-300 truncate text-[11px] sm:text-xs">
              {appConfig.region === 'AP' ? 'ANDHRA PRADESH STATE COUNCIL' : 'TELANGANA STATE COUNCIL'}
            </span>
            <span className="hidden md:inline text-blue-100">| Healthcare Reforms Doctors Association (HRDA)</span>
          </div>
          <button
            onClick={() => setIsRegionModalOpen(true)}
            className="text-[11px] font-bold underline underline-offset-2 hover:text-amber-200 transition-colors shrink-0 text-amber-300"
          >
            Switch State →
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ease-in-out ${isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-2"
          : "bg-white shadow-sm py-3 sm:py-4"
          }`}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo with State Chapter Tag */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <img
              src="/hrda_full_logo.png"
              alt="Healthcare Reforms Doctors Association Logo"
              className={`object-contain transition-all duration-300 ${isScrolled ? "h-10 sm:h-12" : "h-12 sm:h-16"}`}
            />
            <div className="flex flex-col border-l-2 border-slate-200 pl-2 sm:pl-2.5 py-0.5">
              <span className={`text-xs sm:text-sm font-black tracking-widest uppercase ${
                appConfig.region === 'AP' ? 'text-blue-700' : 'text-emerald-700'
              }`}>
                {appConfig.region === 'AP' ? 'ANDHRA PRADESH' : 'TELANGANA'}
              </span>
            </div>
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

            {/* RMP Legal Portal Dropdown - AP Only or Always Accessible */}
            {appConfig.region === 'AP' && (
              <NavigationMenu className="mx-1">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-transparent hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-transparent data-[state=open]:!bg-transparent data-[state=open]:text-primary text-slate-700 shadow-none border-none">
                      <span className="relative">
                        RMP
                        <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-primary origin-left transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />
                      </span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[270px] gap-2 p-3 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        {rmpLinks.map((link) => (
                          <li key={link.name}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={link.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50"
                              >
                                <div className="text-sm font-semibold leading-none text-slate-800">{link.name}</div>
                                <p className="line-clamp-2 text-xs leading-snug text-slate-500 mt-1">
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
            )}

            {/* Updates Dropdown */}
            <NavigationMenu className="mx-1">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="group inline-flex h-10 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors bg-transparent hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-transparent data-[state=open]:!bg-transparent data-[state=open]:text-primary text-slate-700 shadow-none border-none">
                    <span className="relative">
                      Updates
                      <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-primary origin-left transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[260px] gap-2 p-3 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                      {updateLinks.map((link) => (
                        <li key={link.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50"
                            >
                              <div className="text-sm font-semibold leading-none text-slate-800">{link.name}</div>
                              <p className="line-clamp-2 text-xs leading-snug text-slate-500 mt-1">
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

            {/* Resources Dropdown */}
            <NavigationMenu className="mx-1">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="group inline-flex h-10 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors bg-transparent hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-transparent data-[state=open]:!bg-transparent data-[state=open]:text-primary text-slate-700 shadow-none border-none">
                    <span className="relative">
                      Resources
                      <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-primary origin-left transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[260px] gap-2 p-3 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                      {resourceLinks.map((link) => (
                        <li key={link.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-50 focus:bg-slate-50"
                            >
                              <div className="text-sm font-semibold leading-none text-slate-800">{link.name}</div>
                              <p className="line-clamp-2 text-xs leading-snug text-slate-500 mt-1">
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
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-full transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </Link>

            {user ? (
              <Link href="/admin/dashboard" className="text-xs font-semibold text-slate-700 hover:text-primary transition-colors px-2 py-1 rounded hover:bg-slate-50">
                Admin
              </Link>
            ) : (
              <Link href="/login" className="text-xs font-semibold text-slate-700 hover:text-primary transition-colors px-2 py-1 rounded hover:bg-slate-50">
                Login
              </Link>
            )}

            {/* Clean State Portal Badge / Switcher (Mobile & Desktop Friendly) */}
            <button
              onClick={() => setIsRegionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-xs bg-slate-900 text-white border-slate-700 hover:bg-slate-800"
              title="Click to switch between Andhra Pradesh and Telangana portals"
            >
              <span className="text-amber-400">📍</span>
              <span className="hidden sm:inline">HRDA {appConfig.stateName}</span>
              <span className="sm:hidden">{appConfig.region === 'TG' ? 'TS Portal' : 'AP Portal'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {appConfig.region === 'AP' && (
              <Button
                onClick={() => setIsDonationOpen(true)}
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg px-4 font-semibold shadow-sm"
              >
                Donate
              </Button>
            )}

            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 shadow-md transition-all hover:shadow-lg font-medium">
              <Link href="/register">
                Join HRDA {appConfig.region === 'TG' ? 'TS' : appConfig.region}
              </Link>
            </Button>
          </div>

          {/* Mobile Header Actions (Visible only on mobile screens < lg) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsRegionModalOpen(true)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-xs transition-colors ${
                appConfig.region === 'AP'
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-emerald-600 text-white border-emerald-700'
              }`}
              title="Click to switch between Andhra Pradesh and Telangana portals"
            >
              <span>📍 {appConfig.region} Portal</span>
              <span className="text-[10px] opacity-80">▾</span>
            </button>
            <button
              className="p-2 text-slate-700 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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

            {appConfig.region === 'AP' && (
              <Link href="/rmp">
                <div
                  className={`p-3 rounded-lg font-medium transition-colors flex items-center justify-between ${isActive("/rmp") ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>RMP &amp; Anti-Quackery</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">Legal Portal</span>
                </div>
              </Link>
            )}

            {/* Mobile Updates Dropdown */}
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-full flex items-center justify-between p-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Updates
                <ChevronDown className={`w-4 h-4 transition-transform ${isNotificationsOpen ? "rotate-180" : ""}`} />
              </button>
              {isNotificationsOpen && (
                <div className="bg-slate-50 p-2 space-y-1">
                  {updateLinks.map((link) => (
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

            {/* Mobile Resources Dropdown */}
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsInsightsOpen(!isInsightsOpen)}
                className="w-full flex items-center justify-between p-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Resources
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

            <Link href="/search">
              <div
                className={`p-3 rounded-lg font-medium transition-colors ${isActive("/search") ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search
              </div>
            </Link>

            <div className="h-px bg-gray-100 my-4" />

            {/* Mobile Region Switcher */}
            <Button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsRegionModalOpen(true);
              }}
              variant="outline"
              className="w-full justify-center border-blue-600 text-blue-700 hover:bg-blue-50 font-bold"
            >
              <span>📍 Currently: {appConfig.stateName} — Switch State</span>
            </Button>

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

            {appConfig.region === 'AP' && (
              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsDonationOpen(true);
                }}
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold mt-1"
              >
                Donate to HRDA AP
              </Button>
            )}

            <Button asChild className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm mt-2">
              <Link href="/register">
                Join HRDA {appConfig.region === 'TG' ? 'TS' : appConfig.region}
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
              <img src={appConfig.region === 'AP' ? "/hrda_ap_logo.png" : "/hrda_logo.png"} alt="HRDA Logo" className="h-10 w-10 object-contain rounded-full bg-white p-1" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-white leading-tight">HRDA</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Healthcare Reforms Doctors Association</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              Dedicated to improving the healthcare system and protecting the rights of medical professionals in {appConfig.stateName}.
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
              <li><Link href="/index.php/new-registration-2/" className="hover:text-white transition-colors hover:underline decoration-blue-500 underline-offset-4">Join HRDA {appConfig.region === 'TG' ? 'TS' : appConfig.region}</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors hover:underline decoration-blue-500 underline-offset-4">Verify Membership</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Contact & Social</h4>
            <ul className="space-y-3 text-sm mb-6">
              <li className="flex items-start gap-2">
                <span className="text-slate-400">Email:</span>
                <a href={`mailto:${appConfig.email}`} className="hover:text-white transition-colors break-all">{appConfig.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">{appConfig.whatsappOnly ? 'WhatsApp:' : 'Phone:'}</span>
                <a
                  href={appConfig.whatsappOnly
                    ? `https://wa.me/${appConfig.phone.replace(/[\s+\-]/g, '')}`
                    : `tel:${appConfig.phone.replace(/[\s+\-]/g, '')}`}
                  target={appConfig.whatsappOnly ? '_blank' : undefined}
                  rel={appConfig.whatsappOnly ? 'noopener noreferrer' : undefined}
                  className="hover:text-white transition-colors"
                >
                  {appConfig.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">Loc:</span>
                <span>{appConfig.capital}, {appConfig.stateName}</span>
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
              <a href={appConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-full hover:bg-pink-600 transition-all text-white hover:scale-110" aria-label="Instagram">
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
      
      {/* Donation Modal */}
      <DonationModal open={isDonationOpen} onOpenChange={setIsDonationOpen} />

      {/* State Switcher Modal */}
      <StateSwitcherModal open={isRegionModalOpen} onOpenChange={setIsRegionModalOpen} />
    </div>
  );
}

function StateSwitcherModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const switchRegion = (targetRegion: 'AP' | 'TG') => {
    const targetUrl = targetRegion === 'AP'
      ? (process.env.NODE_ENV === 'production' ? 'https://ap.hrda-india.org' : 'http://localhost:3000')
      : (process.env.NODE_ENV === 'production' ? 'https://hrda-india.org' : 'http://localhost:3000');
    window.location.href = `${targetUrl}${window.location.pathname}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md shadow-2xl rounded-2xl border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-slate-900 flex items-center justify-center gap-2">
            <span>🏛️</span> Select HRDA State Council Portal
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500 text-xs">
            Choose your state medical association portal to access official legal guidelines, leadership panels, and registrations.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 py-4">
          {/* AP Option */}
          <button
            onClick={() => switchRegion('AP')}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              appConfig.region === 'AP'
                ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <img src="/hrda_ap_logo.png" alt="AP Emblem" className="w-12 h-12 object-contain shrink-0 rounded-full bg-white p-0.5 border" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-base">Andhra Pradesh Portal</h4>
                {appConfig.region === 'AP' && (
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">APMC Section 8 Inspection Committee &amp; AP Reform Agenda</p>
            </div>
          </button>

          {/* TS Option */}
          <button
            onClick={() => switchRegion('TG')}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              appConfig.region === 'TG'
                ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
            }`}
          >
            <img src="/hrda_logo.png" alt="TS Emblem" className="w-12 h-12 object-contain shrink-0 rounded-full bg-white p-0.5 border" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-base">Telangana State Portal</h4>
                {appConfig.region === 'TG' && (
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">TSMC Registration, District Elections &amp; Leadership Panels</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DonationModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("500");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      toast({ title: "Required Fields", description: "Please enter your name and phone number.", variant: "destructive" });
      return;
    }
    const finalAmount = amount === "custom" ? customAmount : amount;
    if (!finalAmount || isNaN(Number(finalAmount)) || Number(finalAmount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid donation amount.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create order
      const orderRes = await apiRequest("POST", "/api/donations/order", {
        amount: Number(finalAmount),
        userData: { fullName, phone, email }
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.message || "Failed to create order");

      const pendingDonationId = order.pendingDonationId ?? null;

      // 2. Open Razorpay options
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Healthcare Reforms Doctors Association",
        description: "Support HRDA Reforms",
        order_id: order.id,
        handler: async function (response: any) {
          setIsProcessing(true);
          try {
            await apiRequest("POST", "/api/donations/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              pendingDonationId,
            });
            setIsSuccess(true);
            toast({
              title: "Thank You!",
              description: "Your donation was received successfully. We appreciate your support!",
            });
          } catch (err) {
            toast({
              title: "Verification Failed",
              description: "Donation processed but verification failed. Please contact support.",
              variant: "destructive"
            });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: fullName,
          email: email,
          contact: phone
        },
        theme: { color: "#10b981" }
      };

      if (order.key_id === "rzp_test_mock_key") {
        options.handler({
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_order_id: order.id,
          razorpay_signature: "mock_signature"
        });
        return;
      }

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (error: any) {
      toast({
        title: "Donation Failed",
        description: error.message || "Could not process donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsSuccess(false);
      setFullName("");
      setPhone("");
      setEmail("");
      setAmount("500");
      setCustomAmount("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md shadow-2xl rounded-2xl border border-emerald-100" onInteractOutside={(e) => isProcessing && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-emerald-800 flex items-center justify-center gap-2">
            <span>💝</span> Support HRDA AP
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500 text-xs">
            Your contributions help fund legal support, public reforms, and doctors' rights advocacy.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-3xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-emerald-950">Donation Successful!</h3>
            <p className="text-sm text-emerald-800 max-w-xs mx-auto">
              Thank you so much for your support. A confirmation has been sent to your email.
            </p>
            <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full mt-4">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Select Donation Amount (₹)</label>
              <div className="grid grid-cols-4 gap-2">
                {["250", "500", "1000", "custom"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                      amount === val
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {val === "custom" ? "Custom" : `₹${val}`}
                  </button>
                ))}
              </div>
            </div>

            {amount === "custom" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Enter Amount (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                  min="1"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Full Name</label>
              <Input
                type="text"
                placeholder="Dr. Rajesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-slate-200 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-slate-200 text-sm"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Email Address</label>
                <Input
                  type="email"
                  placeholder="rajesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-200 text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full font-bold mt-4 h-11"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Donate ₹${amount === "custom" ? (customAmount || "0") : amount}`
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
