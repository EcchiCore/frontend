'use client';

import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Cookies from 'js-cookie';
import { userApi } from "@/lib/api/dashboardApi";
import { createChanomhubClient } from '@chanomhub/sdk';
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/features/auth/authSlice";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Loader2, LogOut, CheckCircle2 } from "lucide-react";
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

    const performLogout = async () => {
      try {
        // 1. Revoke token on backend API
        await userApi.logout().catch(e => console.error("Failed to revoke token on server", e));

        // 2. Sign out from SDK / Better Auth session if present
        await sdk.auth.signOut().catch(e => console.error("Better Auth sign out failed", e));

        // 3. Clear Redux state & remove auth cookies
        dispatch(logout());
        Cookies.remove('token', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setCompleted(true);
        toast.success("ออกจากระบบสำเร็จแล้ว!");

        // 4. Perform full window redirect to clean state completely
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      } catch (e) {
        console.error("Logout failure", e);
        Cookies.remove('token', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        window.location.href = "/login";
      }
    };

    performLogout();
  }, [dispatch]);

  return (
    <AuthLayout>
      <div className="p-6 sm:p-10 flex flex-col justify-between h-full min-h-full">
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="dark" />

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
              {completed ? "Logged out" : "Logging out..."}
            </h1>
          </div>

          <div className="bg-[#0b0c13] border border-[#232738] rounded-xl p-8 flex flex-col items-center text-center gap-4">
            {completed ? (
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-sm font-bold text-white">
                {completed ? "ออกจากระบบสำเร็จเรียบร้อยแล้ว" : "กำลังดำเนินการออกจากระบบ..."}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {completed
                  ? "กำลังนำคุณไปยังหน้าเข้าสู่ระบบอัตโนมัติ..."
                  : "กรุณารอสักครู่ ระบบกำลังล้างข้อมูลเซสชันของคุณเพื่อความปลอดภัย"
                }
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