'use client';
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Switch from "@/components/shared/Switch/switch";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <Switch />
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="container mx-auto flex items-center justify-center">
        <RegisterForm onSwitch={() => router.push("/login")} />
      </div>
    </div>
  );
}
