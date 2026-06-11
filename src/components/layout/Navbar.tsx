"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { User, CircleUser } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NavbarSearch from "./Navbar/NavbarSearch";

// Lazy load heavy client-only components
const NavbarLinks = dynamic(() => import("./Navbar/NavbarLinks"), {
  ssr: false,
  loading: () => <div className="flex items-center gap-4 min-w-[200px]" />,
});

const NotificationDropdown = dynamic(() => import("./Navbar/NotificationDropdown"), {
  ssr: false,
  loading: () => <div className="w-9 h-9" />,
});

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
      className="origin-center -translate-y-[7px] transition-all duration-200 ease-in-out"
    />
    <path
      d="M4 12L20 12"
      className="origin-center transition-all duration-200 ease-in-out"
    />
    <path
      d="M4 12L20 12"
      className="origin-center translate-y-[7px] transition-all duration-200 ease-in-out"
    />
  </svg>
);

const Navbar = () => {
  const t = useTranslations("Navbar");
  const user = useAppSelector((state) => state.auth.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [isClient, setIsClient] = useState(false);
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
          if (desktop) {
            setIsMenuOpen(false);
          }
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

  if (!isClient) {
    // Render minimal navbar during SSR
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md lg:backdrop-blur-xl shadow-sm relative">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold tracking-tight transition-all duration-300 hover:text-primary group"
            >
              <Image
                src="https://chanomhub.com/favicon.ico"
                alt="ChanomHub"
                width={28}
                height={28}
                className="rounded-md group-hover:scale-110 transition-transform duration-300"
                unoptimized
              />

            </Link>
          </div>
          <div className="flex items-center gap-4" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md lg:backdrop-blur-xl shadow-sm relative">
      <div className="container mx-auto flex h-14 items-center gap-3 px-4 lg:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight transition-all duration-300 hover:text-primary flex-shrink-0 group"
          onClick={closeMenu}
        >
          <Image
            src="https://chanomhub.com/favicon.ico"
            alt="ChanomHub"
            width={28}
            height={28}
            className="rounded-md group-hover:scale-110 transition-transform duration-300"
            unoptimized
          />
        </Link>

        {/* Search bar — Desktop: fixed width; Mobile: flex-1 fills space */}
        <div className="flex md:w-[240px] lg:w-[360px] flex-1 md:flex-none flex-shrink-0">
          <NavbarSearch />
        </div>

        {/* Left Navigation Links (Desktop Only) — Games, Extensions */}
        <div className="hidden lg:flex items-center text-foreground">
          <NavbarLinks section="left" onCloseMenu={closeMenu} />
        </div>

        {/* Spacer — pushes right section to far right */}
        <div className="flex-1" />

        {/* Right Section: Language + Notifications + User + Register */}
        <div className="flex items-center gap-2 text-foreground">

          {/* Right Nav Links (Language, Member) — Desktop Only */}
          <div className="hidden md:flex items-center">
            <NavbarLinks section="right" onCloseMenu={closeMenu} />
          </div>

          {hasToken && isDesktop && <NotificationDropdown />}

          {/* User Account / Login Icon */}
          <Link href={hasToken ? "/member/dashboard" : "/login"}>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/50 transition-all duration-200 rounded-full p-0 overflow-hidden"
              title={hasToken ? "Dashboard" : "Login"}
            >
              {hasToken ? (
                <Avatar className="h-8 w-8">
                  {user?.image ? (
                    <AvatarImage src={user.image} alt={user?.username || "User"} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold w-full h-full flex items-center justify-center">
                      {user?.username?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  )}
                </Avatar>
              ) : (
                <CircleUser className="h-6 w-6 text-muted-foreground/60" />
              )}
            </Button>
          </Link>

          {!hasToken && (
            <Link href="/register" className="hidden md:block">
              <Button variant="outline" size="sm" className="h-9 px-4 font-medium hover:bg-primary/5 hover:border-primary/20 transition-all duration-200">
                {t('signUp')}
              </Button>
            </Link>
          )}

          {/* Mobile Section (Hamburger) */}
          <div className="flex md:hidden items-center gap-1.5">
            {hasToken && !isDesktop && <NotificationDropdown isMobile />}

            <Sheet open={isMenuOpen} onOpenChange={(open) => {
              setIsMenuOpen(open);
            }}>
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
                      {t("menu")}
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-6">
                      {/* Left Section Links */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                          {t("main")}
                        </h3>
                        <NavbarLinks section="left" onCloseMenu={closeMenu} isMobile />
                      </div>

                      {/* Right Section Links */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                          {t("account")}
                        </h3>
                        <NavbarLinks section="right" onCloseMenu={closeMenu} isMobile />
                      </div>

                      {/* Login Button for non-authenticated users */}
                      {!hasToken && (
                        <div className="pt-4 border-t border-border/50">
                          <Link href="/register" onClick={closeMenu} className="block">
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
    </nav>
  );
};

export default Navbar;