// Navbar.tsx
"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import NavbarLinks from "./Navbar/NavbarLinks";
import NotificationDropdown from "./Navbar/NotificationDropdown";
import { useTranslations } from "next-intl";

const Navbar = () => {
  const t = useTranslations("Navbar");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("dark");
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

  // Client-side only logic for token and theme
  useEffect(() => {
    const token = Cookies.get("token");
    setHasToken(!!token);

    const cookieTheme = Cookies.get("theme");
    const savedTheme = cookieTheme || "dark";
    if (savedTheme !== document.documentElement.getAttribute("data-theme")) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
    setCurrentTheme(savedTheme);
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

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(newTheme);
    Cookies.set("theme", newTheme, { expires: 365, path: "/" });
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="sticky z-50 bg-base-100 notranslate" data-hydration-marker="navbar">
      <div className="navbar bg-gradient-to-r from-base-300 to-base-200 text-base-content shadow-lg mx-auto">
        <div className="navbar-start">
          <div className="relative group">
            <Link
              href="/"
              ref={linkRef}
              className="text-3xl md:text-4xl font-extrabold tracking-wide transition-transform duration-300 ease-in-out transform hover:scale-105"
              style={{
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                backgroundImage: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)",
                color: "transparent",
                textShadow: `2px 2px 4px ${
                  currentTheme === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"
                }, 0 0 8px rgba(255,255,255,0.3)`,
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

        <div className="navbar-end hidden md:flex">
          <NavbarLinks onCloseMenu={() => setIsMenuOpen(false)} theme={currentTheme} />

          {/* Notification Bell - only show when user has token */}
          {typeof window !== "undefined" && hasToken && (
            <NotificationDropdown />
          )}

          <button onClick={toggleTheme} className="btn btn-circle btn-ghost ml-2" aria-label="Toggle theme">
            {currentTheme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              </svg>
            )}
          </button>
          {typeof window !== "undefined" && !hasToken && (
            <Link href="/login" className="ml-4">
              <button className="btn btn-sm btn-outline btn-primary normal-case font-medium text-xs md:text-sm">
                {t('signUp')}
              </button>
            </Link>
          )}
        </div>

        <div className="navbar-end md:hidden">
          {/* Mobile Notification Bell */}
          {typeof window !== "undefined" && hasToken && (
            <NotificationDropdown isMobile />
          )}

          <button onClick={toggleTheme} className="btn btn-circle btn-ghost mr-1" aria-label="Toggle theme">
            {currentTheme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="btn btn-square btn-ghost text-xl"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden bg-base-300 shadow-lg z-40 transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-96 opacity-100 visible" : "max-h-0 opacity-0 invisible overflow-hidden"
        }`}
      >
        <div className="container mx-auto p-4 space-y-2">
          <NavbarLinks onCloseMenu={() => setIsMenuOpen(false)} theme={currentTheme} />
          {typeof window !== "undefined" && !hasToken && (
            <Link href="/login">
              <button
                className="btn btn-block btn-primary normal-case font-medium text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('signUp')}
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Export as a dynamic component with SSR disabled
import dynamic from "next/dynamic";
export default dynamic(() => Promise.resolve(Navbar), { ssr: false });