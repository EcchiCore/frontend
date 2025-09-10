
// LogoutPage.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from 'js-cookie';

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Remove the JWT token from cookies
    Cookies.remove('token');

    // Notify the user
    toast.success("Logged out successfully! Redirecting to login...");

    // Delay for 3 seconds before redirecting
    setTimeout(() => {
      router.push("/login");
    }, 3000);
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