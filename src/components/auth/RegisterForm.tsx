'use client';

import { useState, useEffect, useMemo, SVGProps } from "react";
import { useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import Cookies from 'js-cookie';
import { createChanomhubClient, type LoginResponse } from '@chanomhub/sdk';
import { Loader2, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface RegisterFormProps {
  onSwitch: () => void;
  title: string;
  usernamePlaceholder: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  registerButtonText: string;
  loginLinkText: string;
  loginLinkActionText: string;
}

const GoogleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" {...props}>
    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
  </svg>
);

export function RegisterForm({
  onSwitch,
  title,
  usernamePlaceholder,
  emailPlaceholder,
  passwordPlaceholder,
  confirmPasswordPlaceholder,
  registerButtonText,
  loginLinkText,
  loginLinkActionText,
}: RegisterFormProps) {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const sdk = useMemo(() => createChanomhubClient({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com',
  }), []);

  const handleGoogleLogin = async () => {
    try {
      await sdk.auth.signInWithGoogle({
        redirectTo: `${window.location.origin}/register?oauth=true`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(message);
    }
  };

  const handleOAuthCallback = async (loginData: LoginResponse) => {
    const data = loginData as any;
    const user = data?.data?.user || data?.user || data;
    const token = user?.token || data?.token;
    const refreshToken = data?.data?.refreshToken || data?.refreshToken || user?.refreshToken;

    if (token) {
      toast.success('Registration successful! Redirecting...', { autoClose: 2000 });
      Cookies.set("token", token, { secure: process.env.NODE_ENV === "production", sameSite: "strict", expires: 7 });
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, { secure: process.env.NODE_ENV === "production", sameSite: "strict", expires: 7 });
      }
      setTimeout(() => { window.location.href = "/"; }, 2000);
    }
  };

  useEffect(() => {
    const handleSession = async () => {
      if (searchParams.get('oauth') === 'true') {
        try {
          const loginData = await sdk.auth.handleCallback();
          if (loginData) {
            handleOAuthCallback(loginData);
          }
        } catch (e) {
          console.error("Error processing OAuth callback:", e);
        }
      }
    };
    handleSession();
  }, [sdk, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formData).some((value) => !value)) {
      toast.error("Please fill in all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }
        }),
      });
      const responseJson = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMessage = responseJson?.error?.message || responseJson?.errors?.body?.[0] || responseJson?.message || responseJson?.error || 'Registration failed';
        throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Registration failed');
      }
      toast.success('Registration successful! Redirecting...', { autoClose: 2000 });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 flex flex-col justify-between h-full min-h-full">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="dark" />

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
        <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        <button onClick={onSwitch} className="hover:text-white transition-colors font-semibold">
          {loginLinkActionText || "Log In"}
        </button>
      </div>

      {/* Main Form Content */}
      <div className="my-auto py-4 space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-400">Sign Up</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {title || "Create an account"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Username Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 block">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={usernamePlaceholder || "Username"}
              required
              className="w-full h-10 px-3.5 bg-[#0b0c13] border border-[#232738] text-white text-sm focus:outline-none focus:border-primary rounded-lg transition-colors"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={emailPlaceholder || "your@email.com"}
              required
              className="w-full h-10 px-3.5 bg-[#0b0c13] border border-[#232738] text-white text-sm focus:outline-none focus:border-primary rounded-lg transition-colors"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={passwordPlaceholder || "••••••••"}
                required
                className="w-full h-10 pl-3.5 pr-10 bg-[#0b0c13] border border-[#232738] text-white text-sm focus:outline-none focus:border-primary rounded-lg transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 block">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={confirmPasswordPlaceholder || "••••••••"}
                required
                className="w-full h-10 pl-3.5 pr-10 bg-[#0b0c13] border border-[#232738] text-white text-sm focus:outline-none focus:border-primary rounded-lg transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Main Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-3 bg-[#f6f2d5] hover:bg-[#ebd9a2] active:scale-[0.99] text-[#11131c] font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (registerButtonText || "Create Account")}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#232738]" />
            </div>
            <span className="relative bg-[#11131c] px-3 text-[11px] text-gray-400 font-semibold lowercase">
              or
            </span>
          </div>

          {/* Google Register Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-10 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4" /> ลงชื่อเข้าใช้ด้วย Google
          </button>
        </form>
      </div>

      {/* Footer copyright / TOS note */}
      <div className="text-[11px] text-gray-500">
        This site is protected by reCAPTCHA and ChanomHub Privacy Policy and Terms apply.
      </div>
    </div>
  );
}