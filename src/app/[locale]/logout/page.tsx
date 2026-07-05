
// LogoutPage.tsx
"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from 'js-cookie';
import { userApi } from "@/lib/api/dashboardApi";
import { createChanomhubClient } from '@chanomhub/sdk';
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/features/auth/authSlice";

const sdk = createChanomhubClient({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com',
});

const LogoutPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const logoutPerformed = useRef(false);

  useEffect(() => {
    if (logoutPerformed.current) return;
    logoutPerformed.current = true;

    const performLogout = async () => {
      try {
        // Revoke token on the server
        await userApi.logout().catch(e => console.error("Failed to revoke token on server", e));
        
        // Sign out from Better Auth
        await sdk.auth.signOut().catch(e => console.error("Better Auth sign out failed", e));

        // Remove tokens from cookies via Redux action
        dispatch(logout());

        // Remove tokens from cookies manually just in case
        Cookies.remove('token');
        Cookies.remove('refreshToken');

        // Notify the user
        toast.success("Logged out successfully! Redirecting to login...");

        // Redirect immediately
        router.push("/login");
      } catch (e) {
        console.error("Critical logout failure", e);
        router.push("/login");
      }
    };

    performLogout();
  }, [router, dispatch]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center mb-6">Logging out...</h1>
        <p className="text-gray-700 text-center">You have been logged out successfully.</p>
      </div>
    </div>
  );
};

export default LogoutPage;