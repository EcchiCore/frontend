"use client";

import { useRouter } from "@/i18n/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Redirect to logout page to perform clean server-side and client-side sign out
    router.push("/logout");
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