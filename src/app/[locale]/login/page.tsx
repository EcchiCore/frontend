"use client";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Switch from "../components/Switch/switch";
import { LoginForm } from "../components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <Switch />
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <LoginForm onSwitch={() => router.push("/register")} />
    </div>
  );
}