"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all cookies
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
    // Redirect to login page
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="group relative px-4 py-2 md:px-6 md:py-3 bg-red-500/80 backdrop-blur-sm border border-red-400/30 text-white rounded-2xl hover:bg-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/25 hover:scale-105"
    >
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="hidden md:inline font-medium">ออกจากระบบ</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
}