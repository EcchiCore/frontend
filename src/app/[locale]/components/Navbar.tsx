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
      <nav className="sticky top-0 z-50 w-full border-b bg-gray-900/95">
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
    <nav className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left Section: Logo + Left Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight transition-colors hover:text-primary flex-shrink-0"
            onClick={closeMenu}
          >
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
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-0 text-foreground">
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