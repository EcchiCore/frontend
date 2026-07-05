'use client';
import { useState, useEffect, useMemo, SVGProps } from "react";
import { useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from 'js-cookie';
import { createChanomhubClient, type LoginResponse } from '@chanomhub/sdk';
import { Loader2, Eye, EyeOff } from "lucide-react";

// Apple Icon Component
const AppleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="apple" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" {...props}>
    <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C39.2 141.2 0 184.8 0 249.4c0 37.3 18.6 76.3 53.3 102.6 30.9 25.2 62.2 40.2 103.6 40.2 35.4 0 73.8-20.7 88.5-20.7 14.4 0 48.7 21.2 78.5 21.2 35.1 0 71.7-13.5 98.2-31.4-1.5-1.1-3-2.1-4.5-3.2-12.8-9-31.6-20.5-31.6-51.6zM288.7 93.3C268.1 73.1 241.6 60 206.5 60c-20.7 0-44.5 12.1-63.8 12.1-18.8 0-42.5-11.1-63.4-11.1-34.3 0-66.4 21.7-84.7 54.9-22.3 40.3-15.8 94.2-1.7 132.9 14.6 38.6 51.2 66.8 89.9 66.8 20.1 0 44.8-12.1(63.8-12.1s43.7 12.1 63.8 12.1c38.2 0 74.8-28.2 89.9-66.8 14.9-38.6 20.4-92.6-1.9-132.9z" />
  </svg>
);

// Google Icon Component
const GoogleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" {...props}>
    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
  </svg>
);

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

const inputClass = "auth-input-glow w-full h-11 px-4 rounded-xl border border-border bg-background/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300 focus:border-[#8b7bf5]/50 focus:bg-background/80";
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-2";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // Logic from the old component for form submission...
      // This part is kept as is.
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
    <>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="dark" />

      <div className="mt-6 mb-6">
        <h1 className="text-[28px] font-bold m-0 mb-2 tracking-tight text-foreground">Create account</h1>
        <p className="m-0 text-muted-foreground text-[13px]">Join Chanomhub and start exploring.</p>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="group w-full h-11 rounded-xl border border-border bg-background/40 text-[13px] text-muted-foreground flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 hover:bg-background/80 hover:border-border/80 hover:text-foreground active:scale-[0.98] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
        >
          <GoogleIcon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
          Continue with Google
        </button>
        <button
          type="button"
          className="group w-full h-11 rounded-xl border border-border bg-background/40 text-[13px] text-muted-foreground flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 hover:bg-background/80 hover:border-border/80 hover:text-foreground active:scale-[0.98] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
        >
          <AppleIcon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
          Continue with Apple
        </button>
      </div>

      <div className="flex items-center gap-4 my-6 text-muted-foreground/40 text-[10px] tracking-[0.2em] uppercase">
        <hr className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent border-none" />
        or continue with email
        <hr className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent border-none" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className={labelClass}>Username</label>
          <Input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder={usernamePlaceholder}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={emailPlaceholder}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={passwordPlaceholder}
              required
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-all duration-300 cursor-pointer hover:scale-110"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Confirm Password</label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={confirmPasswordPlaceholder}
              required
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-all duration-300 cursor-pointer hover:scale-110"
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="auth-btn-shine mt-3 w-full h-12 rounded-xl border-none bg-gradient-to-r from-[#8b7bf5] to-[#6a5cd4] text-white text-sm font-semibold cursor-pointer transition-all duration-300 active:scale-[.98] hover:shadow-[0_8px_32px_-4px_rgba(139,123,245,0.5)] hover:brightness-110 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : registerButtonText}
        </Button>
      </form>

      <div className="text-center mt-5 text-[13px] text-muted-foreground">
        {loginLinkText}{' '}
        <button onClick={onSwitch} className="text-[#8b7bf5] hover:text-[#a89bff] font-semibold bg-transparent border-none cursor-pointer transition-colors duration-200">
          {loginLinkActionText}
        </button>
      </div>
    </>
  );
}