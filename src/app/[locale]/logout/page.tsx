'use client';

import { useEffect, useRef, useState } from "react";
import Cookies from 'js-cookie';
import { userApi } from "@/lib/api/dashboardApi";
import { createChanomhubClient } from '@chanomhub/sdk';
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/features/auth/authSlice";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";

const sdk = createChanomhubClient({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com',
});

export default function LogoutPage() {
  const dispatch = useAppDispatch();
  const logoutPerformed = useRef(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (logoutPerformed.current) return;
    logoutPerformed.current = true;

    // 1. INSTANTLY clear all client-side auth tokens & state (Synchronous)
    try {
      dispatch(logout());
      Cookies.remove('token', { path: '/' });
      Cookies.remove('refreshToken', { path: '/' });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.error("Local cleanup error:", e);
    }

    // 2. Fire background network revoke calls non-blocking (Fire-and-Forget)
    Promise.allSettled([
      userApi.logout().catch(() => null),
      sdk.auth.signOut().catch(() => null),
    ]);

    // 3. Mark completed and redirect to /login immediately (Fast smooth UX)
    setCompleted(true);
    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, 400);

    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <AuthLayout>
      <div className="p-6 sm:p-10 flex flex-col justify-between h-full min-h-full">
        {/* Top Header */}
        <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            ChanomHub
          </Link>
        </div>

        {/* Main Content */}
        <div className="my-auto py-6 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Account Session</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Logged out
            </h1>
          </div>

          <div className="bg-[#0b0c13] border border-[#232738] rounded-xl p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-bold text-white">
                ออกจากระบบสำเร็จเรียบร้อยแล้ว
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-gray-500">
          This site is protected by reCAPTCHA and ChanomHub Privacy Policy and Terms apply.
        </div>
      </div>
    </AuthLayout>
  );
}