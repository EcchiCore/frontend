"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import NavbarLinks from "./Navbar/NavbarLinks";
import NotificationDropdown from "./Navbar/NotificationDropdown";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

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

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
    const token = Cookies.get("token");
    setHasToken(!!token);
  }, []);

  // Handle resize for mobile menu with proper cleanup
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const debounceResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        if (window.innerWidth >= 768) {
          setIsMenuOpen(false);
        }
      }, 100);
    };

    const handleResize = () => {
      debounceResize();
    };

    if (isClient) {
      window.addEventListener("resize", handleResize);
      handleResize(); // Call once to set initial state
    }

    return () => {
      if (isClient) {
        window.removeEventListener("resize", handleResize);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isClient]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  if (!isClient) {
    // Render minimal navbar during SSR
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-b-zinc-200 bg-white/80 py-4 backdrop-blur-lg dark:border-b-zinc-800 dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight transition-colors hover:text-primary"
            >
              Chanomhub
            </Link>
          </div>
          <div className="flex items-center gap-4" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-b-zinc-200 bg-white/80 py-4 backdrop-blur-lg dark:border-b-zinc-800 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left Section: Logo + Left Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold tracking-tight transition-colors hover:text-primary flex-shrink-0"
            onClick={closeMenu}
          >
            <Logo className="h-6 w-6" />
            Chanomhub
          </Link>

          {/* Left Navigation Links (Desktop Only) */}
          <div className="hidden lg:flex items-center text-foreground">
            <NavbarLinks section="left" onCloseMenu={closeMenu} />
          </div>
        </div>

        {/* Right Section: Right Navigation */}
        <div className="flex items-center gap-2 text-foreground">
          {/* Right Navigation Links (Desktop Only) */}
          <div className="hidden md:flex items-center gap-4">
            <NavbarLinks section="right" onCloseMenu={closeMenu} />
            
            {hasToken && <NotificationDropdown />}

            {!hasToken && (
              <Link href="/login">
                <Button variant="outline" size="sm" className="h-8">
                  {t('signUp')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Section */}
          <div className="flex md:hidden items-center gap-2 ">
            {hasToken && <NotificationDropdown isMobile />}

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
              <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-0 text-foreground rounded-xl">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">เมนู</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-6">
                      {/* Left Section Links */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                          หลัก
                        </h3>
                        <NavbarLinks section="left" onCloseMenu={closeMenu} isMobile />
                      </div>

                      {/* Right Section Links */}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                          บัญชี
                        </h3>
                        <NavbarLinks section="right" onCloseMenu={closeMenu} isMobile />
                      </div>

                      {/* Login Button for non-authenticated users */}
                      {!hasToken && (
                        <div className="pt-4 border-t">
                          <Link href="/login" onClick={closeMenu} className="block">
                            <Button variant="outline" className="w-full">
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

export default dynamic(() => Promise.resolve(Navbar), { ssr: false });