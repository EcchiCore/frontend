'use client';
import { useState } from "react";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Switch from "../components/Switch/switch";

export default function RegisterPage() {
  const [showLogin, setShowLogin] = useState(false);

  const handleSwitch = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <Switch />
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="container mx-auto flex items-center justify-center">
        {showLogin ? (
          <LoginForm onSwitch={handleSwitch} />
        ) : (
          <RegisterForm onSwitch={handleSwitch} />
        )}
      </div>
    </div>
  );
}
