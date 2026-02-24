
// LogoutPage.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from 'js-cookie';
import { supabase } from "@/lib/supabaseClient";
import { userApi } from "../member/dashboard/utils/api";

const LogoutPage = () => {
  const router = useRouter();



  useEffect(() => {
    const performLogout = async () => {
      try {
        // Revoke token on the server
        await userApi.logout();
      } catch (e) {
        console.error("Failed to revoke token on server", e);
      }

      // Remove tokens from cookies
      Cookies.remove('token');
      Cookies.remove('refreshToken');

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Notify the user
      toast.success("Logged out successfully! Redirecting to login...");

      // Delay for 3 seconds before redirecting
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    };

    performLogout();
  }, [router]);

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