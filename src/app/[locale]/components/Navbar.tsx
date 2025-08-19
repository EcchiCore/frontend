// Navbar.tsx
"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import NavbarLinks from "./Navbar/NavbarLinks";
import NotificationDropdown from "./Navbar/NotificationDropdown";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import dynamic from "next/dynamic";

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
    
    // Force dark theme
    document.documentElement.setAttribute("data-theme", "dark");
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
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="mr-4 flex">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight transition-colors hover:text-primary"
            >
              Chanomhub
            </Link>
          </div>
          <div className="flex-1" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight transition-colors hover:text-primary"
            onClick={closeMenu}
          >
            Chanomhub
          </Link>
        </div>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-4">
          <NavbarLinks onCloseMenu={closeMenu} />
          
          {hasToken && <NotificationDropdown />}

          {!hasToken && (
            <Link href="/login">
              <Button variant="outline" size="sm" className="h-8">
                {t('signUp')}
              </Button>
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          {hasToken && <NotificationDropdown isMobile />}

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
              <div className="flex flex-col gap-4 py-4">
                <NavbarLinks onCloseMenu={closeMenu} />
                {!hasToken && (
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">
                      {t('signUp')}
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default dynamic(() => Promise.resolve(Navbar), { ssr: false });