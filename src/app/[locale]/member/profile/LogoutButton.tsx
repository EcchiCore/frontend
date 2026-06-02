"use client";

import { useRouter } from "@/i18n/navigation";
import { LogOut } from "lucide-react";

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
      className="btn btn-error btn-outline btn-sm md:btn-md rounded-2xl bg-red-500/10 backdrop-blur-md border-red-500/20 hover:bg-red-500 hover:border-red-500 text-red-400 hover:text-white transition-all duration-300 group shadow-lg hover:shadow-red-500/20"
    >
      <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      <span className="hidden md:inline font-bold uppercase tracking-wider text-xs">Logout</span>
    </button>
  );
}