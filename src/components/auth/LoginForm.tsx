'use client';

import { useState, useEffect, useMemo, SVGProps } from "react";
import { useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import Cookies from 'js-cookie';
import { createChanomhubClient, type LoginResponse } from '@chanomhub/sdk';
import { Loader2, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface LoginFormProps {
  onSwitch: () => void;
  title: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  loginButtonText: string;
  registerLinkText: string;
}

const GoogleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" {...props}>
    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
  </svg>
);

export function LoginForm({
  onSwitch,
  title,
  emailPlaceholder,
  passwordPlaceholder,
  loginButtonText,
  registerLinkText,
}: LoginFormProps) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sdk = useMemo(() => createChanomhubClient({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com',
  }), []);

  const handleGoogleLogin = async () => {
    try {
      const oauthParam = 'oauth=true';
      const redirectParam = redirectTo !== '/' ? `redirect=${encodeURIComponent(redirectTo)}` : '';
      const query = [oauthParam, redirectParam].filter(Boolean).join('&');
      await sdk.auth.signInWithGoogle({
        redirectTo: `${window.location.origin}/login?${query}`,
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
      toast.success('Login successful! Redirecting...', { autoClose: 2000 });
      Cookies.set("token", token, { secure: process.env.NODE_ENV === "production", sameSite: "strict", expires: 7 });
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, { secure: process.env.NODE_ENV === "production", sameSite: "strict", expires: 7 });
      }
      setTimeout(() => { window.location.href = redirectTo; }, 1000);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { email, password } }),
      });
      const responseJson = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(responseJson?.error?.message || 'Invalid credentials');
      }
      const { user, refreshToken } = responseJson.data || responseJson;
      if (user?.token) {
        toast.success('Login successful! Redirecting...', { autoClose: 2000 });
        Cookies.set("token", user.token, { secure: process.env.NODE_ENV === "production", sameSite: "strict", expires: rememberMe ? 30 : 1 });
        if (refreshToken) {
          Cookies.set("refreshToken", refreshToken, { secure: process.env.NODE_ENV === "production", sameSite: "strict", expires: rememberMe ? 30 : 1 });
        }
        setTimeout(() => { window.location.href = redirectTo; }, 1000);
      } else {
        toast.error('Login failed: Invalid response');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
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
          {registerLinkText || "Sign Up"}
        </button>
      </div>

      {/* Main Form Content */}
      <div className="my-auto py-6 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-400">Log In</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {title || "Welcome back!"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={emailPlaceholder || "your@email.com"}
              required
              className="w-full h-11 px-3.5 bg-[#0b0c13] border border-[#232738] text-white text-sm focus:outline-none focus:border-primary rounded-lg transition-colors"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={passwordPlaceholder || "••••••••"}
                required
                className="w-full h-11 pl-3.5 pr-10 bg-[#0b0c13] border border-[#232738] text-white text-sm focus:outline-none focus:border-primary rounded-lg transition-colors"
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

          {/* Remember me row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#0b0c13] border-[#232738] text-primary focus:ring-0"
                />
                Remember me
              </label>
            </div>
            <span className="text-[11px] text-gray-500">Login remembered for 30 days</span>
          </div>

          {/* Main Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 bg-[#f6f2d5] hover:bg-[#ebd9a2] active:scale-[0.99] text-[#11131c] font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (loginButtonText || "Sign In")}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#232738]" />
            </div>
            <span className="relative bg-[#11131c] px-3 text-[11px] text-gray-400 font-semibold lowercase">
              or
            </span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-10 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4" /> ลงชื่อเข้าใช้ด้วย Google
          </button>
        </form>

        {/* Reset Password */}
        <div className="pt-2">
          <a href="/auth/forgot-password" className="text-xs font-semibold text-gray-300 hover:text-white transition-colors">
            Reset Password
          </a>
        </div>
      </div>

      {/* Footer copyright / TOS note */}
      <div className="text-[11px] text-gray-500">
        This site is protected by reCAPTCHA and ChanomHub Privacy Policy and Terms apply.
      </div>
    </div>
  );
}