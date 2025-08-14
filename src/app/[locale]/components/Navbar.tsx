// Navbar.tsx
"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import NavbarLinks from "./Navbar/NavbarLinks";
import NotificationDropdown from "./Navbar/NotificationDropdown";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Navbar = () => {
  const t = useTranslations("Navbar");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState({ left: "0%", width: "0%" });
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Handle mouse movement to update underline position
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const link = linkRef.current;
    if (!link) return;

    const rect = link.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const linkWidth = rect.width;
    const underlineWidth = linkWidth * 0.5;
    const leftPosition = Math.max(0, Math.min(mouseX - underlineWidth / 2, linkWidth - underlineWidth));

    setUnderlineStyle({
      left: `${(leftPosition / linkWidth) * 100}%`,
      width: `${(underlineWidth / linkWidth) * 100}%`,
    });
  };

  // Reset underline when mouse leaves
  const handleMouseLeave = () => {
    setUnderlineStyle({ left: "0%", width: "0%" });
  };

  // Client-side only logic for token
  useEffect(() => {
    const token = Cookies.get("token");
    setHasToken(!!token);
    
    // Force dark theme
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  // Handle resize for mobile menu
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const debounceResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        if (window.innerWidth >= 768) setIsMenuOpen(false);
      }, 100);
    };

    window.addEventListener("resize", debounceResize);
    debounceResize();

    return () => {
      window.removeEventListener("resize", debounceResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-b from-neutral-950 to-neutral-900">
      <div className="flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <div className="relative group">
            <Link
              href="/"
              ref={linkRef}
              className="text-2xl md:text-3xl font-extrabold tracking-wide transition-transform duration-300 ease-in-out transform hover:scale-105"
              style={{
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                backgroundImage: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)",
                color: "transparent",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3), 0 0 8px rgba(255,255,255,0.3)",
              }}
              onClick={() => setIsMenuOpen(false)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              Chanomhub
              <span
                className="absolute -bottom-1 h-1.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent transition-all duration-300"
                style={{
                  left: underlineStyle.left,
                  width: underlineStyle.width,
                }}
              />
            </Link>
          </div>
        </div>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-4">
          <NavbarLinks onCloseMenu={() => setIsMenuOpen(false)} theme="dark" />

          {/* Notification Bell - only show when user has token */}
          {typeof window !== "undefined" && hasToken && (
            <NotificationDropdown />
          )}

          {typeof window !== "undefined" && !hasToken && (
            <Link href="/login">
              <Button variant="secondary" size="sm" className="h-8">
                {t('signUp')}
              </Button>
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Notification Bell */}
          {typeof window !== "undefined" && hasToken && (
            <NotificationDropdown isMobile />
          )}

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
              <div className="flex flex-col gap-4 py-4">
                <NavbarLinks onCloseMenu={() => setIsMenuOpen(false)} theme="dark" />
                {typeof window !== "undefined" && !hasToken && (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      {t('signUp')}
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

// Export as a dynamic component with SSR disabled
import dynamic from "next/dynamic";
export default dynamic(() => Promise.resolve(Navbar), { ssr: false });