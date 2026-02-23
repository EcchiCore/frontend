"use client";
import Link from "next/link";
import React, { useState, useEffect, Suspense } from "react";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Pattern สำหรับตรวจจับรหัสเกม เช่น HJ294, Hj103, hj999
const GAME_CODE_PATTERN = /^[Hh][Jj]\d+$/;

// Lazy load heavy client-only components
const NavbarLinks = dynamic(() => import("./Navbar/NavbarLinks"), {
  ssr: false,
  loading: () => <div className="flex items-center gap-4 min-w-[200px]" />,
});

const NotificationDropdown = dynamic(() => import("./Navbar/NotificationDropdown"), {
  ssr: false,
  loading: () => <div className="w-9 h-9" />,
});

// Simple logo component for the navbar
const Logo = (props: React.SVGAttributes<SVGElement>) => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 324 323"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="88.1023"
        y="144.792"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 88.1023 144.792)"
        fill="currentColor"
      />
      <rect
        x="85.3459"
        y="244.537"
        width="151.802"
        height="36.5788"
        rx="18.2894"
        transform="rotate(-38.5799 85.3459 244.537)"
        fill="currentColor"
      />
    </svg>
  );
};

// Hamburger icon component
const HamburgerIcon = ({
  className,
  ...props
}: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn('pointer-events-none', className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.75)]"
    />
    <path
      d="M4 12L20 12"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.75)]"
    />
    <path
      d="M4 12L20 12"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.75)]"
    />
  </svg>
);

const Navbar = () => {
  const t = useTranslations("Navbar");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
    const token = Cookies.get("token");
    setHasToken(!!token);
  }, []);

  // Handle resize for mobile menu with proper cleanup
  useEffect(() => {
    if (!isClient) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const updateViewport = () => {
      const desktop = window.innerWidth >= 768;
      // Only update state if value has changed
      setIsDesktop((prev) => {
        if (prev !== desktop) {
          if (desktop) setIsMenuOpen(false);
          return desktop;
        }
        return prev;
      });
    };

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewport, 100);
    };

    window.addEventListener("resize", handleResize);
    updateViewport();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isClient]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      // ตรวจจับรหัสเกม (HJ294, Hj103, hj999 etc.)
      if (GAME_CODE_PATTERN.test(trimmedQuery)) {
        // Navigate to games page with sequential code
        window.location.href = `/games?sequentialCode=${encodeURIComponent(trimmedQuery.toUpperCase())}`;
      } else {
        // Navigate to games page with search query
        window.location.href = `/games?q=${encodeURIComponent(trimmedQuery)}`;
      }
    }
  };

  if (!isClient) {
    // Render minimal navbar during SSR
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md lg:backdrop-blur-xl py-4 shadow-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold tracking-tight transition-all duration-300 hover:text-primary group"
            >
              <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Logo className="h-5 w-5 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Chanom<span className="text-primary">Hub</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md lg:backdrop-blur-xl py-4 shadow-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left Section: Logo + Left Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold tracking-tight transition-all duration-300 hover:text-primary flex-shrink-0 group"
            onClick={closeMenu}
          >
            <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <Logo className="h-5 w-5 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
              Chanom<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Left Navigation Links (Desktop Only) */}
          <div className="hidden lg:flex items-center text-foreground">
            <NavbarLinks section="left" onCloseMenu={closeMenu} />
          </div>
        </div>

        {/* Center Section: Search Bar (Desktop Only) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="w-full relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ค้นหากระทู้..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-9 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-foreground"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-accent/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Right Section: Right Navigation */}
        <div className="flex items-center gap-2 text-foreground">
          {/* Search Button (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden hover:bg-accent/50 transition-all duration-200"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Right Navigation Links (Desktop Only) */}
          <div className="hidden md:flex items-center gap-4">
            <NavbarLinks section="right" onCloseMenu={closeMenu} />

            {hasToken && isDesktop && <NotificationDropdown />}

            {!hasToken && (
              <Link href="/login">
                <Button variant="outline" size="sm" className="h-9 px-4 font-medium hover:bg-primary/5 hover:border-primary/20 transition-all duration-200">
                  {t('signUp')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Section */}
          <div className="flex md:hidden items-center gap-2 ">
            {hasToken && !isDesktop && <NotificationDropdown isMobile />}

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'group h-9 w-9 rounded-full data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800',
                    isMenuOpen &&
                    'data-[state=open]:[&>svg>path:first-child]:-translate-y-0 data-[state=open]:[&>svg>path:first-child]:rotate-45 data-[state=open]:[&>svg>path:last-child]:-translate-y-0 data-[state=open]:[&>svg>path:last-child]:-rotate-45 data-[state=open]:[&>svg>path:nth-child(2)]:opacity-0'
                  )}
                  aria-label="Toggle Menu"
                >
                  <HamburgerIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-0 text-foreground rounded-l-2xl border-l-0">
                <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/95">
                  <SheetHeader className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                    <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      เมนู
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-6">
                      {/* Left Section Links */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                          หลัก
                        </h3>
                        <NavbarLinks section="left" onCloseMenu={closeMenu} isMobile />
                      </div>

                      {/* Right Section Links */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                          บัญชี
                        </h3>
                        <NavbarLinks section="right" onCloseMenu={closeMenu} isMobile />
                      </div>

                      {/* Login Button for non-authenticated users */}
                      {!hasToken && (
                        <div className="pt-4 border-t border-border/50">
                          <Link href="/login" onClick={closeMenu} className="block">
                            <Button variant="outline" className="w-full h-11 font-medium hover:bg-primary/5 hover:border-primary/20 transition-all duration-200">
                              {t('signUp')}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm lg:hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="ค้นหากระทู้..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-foreground"
                    autoFocus
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-accent/50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </form>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(false)}
                className="h-11 w-11 hover:bg-accent/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              กด Enter เพื่อค้นหา
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;