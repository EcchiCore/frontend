'use client';

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

const inputClass = "auth-input-glow w-full h-11 px-4 rounded-xl border border-border bg-background/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300 focus:border-[#8b7bf5]/50 focus:bg-background/80";
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-2";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!token) {
      toast.error('No reset token found.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success('Password reset successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to reset password. The token may be invalid or expired.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="dark" />
        <div className="mt-8 mb-8">
          <h1 className="text-[28px] font-bold m-0 mb-2 tracking-tight text-white">Reset password</h1>
          <p className="m-0 text-muted-foreground text-[13px]">There was a problem with your reset link.</p>
        </div>
        <div className="flex flex-col items-center text-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-amber-500/10 animate-pulse" />
            <AlertTriangle className="relative z-10 w-7 h-7 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium mb-1.5">Invalid or expired link</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              The reset link may have expired or is invalid.
              <br />
              Please request a new one.
            </p>
          </div>
          <Link href="/auth/forgot-password" className="w-full">
            <Button className="auth-btn-shine w-full h-12 rounded-xl border-none bg-gradient-to-r from-[#8b7bf5] to-[#6a5cd4] text-white text-sm font-semibold cursor-pointer transition-all duration-300 active:scale-[.98] hover:shadow-[0_8px_32px_-4px_rgba(139,123,245,0.5)] hover:brightness-110">
              Request New Link
            </Button>
          </Link>
        </div>
        <div className="text-center mt-6 text-[13px]">
          <Link href="/login" className="group text-muted-foreground/60 no-underline hover:text-foreground transition-all duration-300 inline-flex items-center gap-1.5 font-medium">
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to login
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="dark" />

      <div className="mt-8 mb-8">
        <h1 className="text-[28px] font-bold m-0 mb-2 tracking-tight text-white">Reset password</h1>
        <p className="m-0 text-white/40 text-[13px]">
          {success
            ? "Your password has been reset successfully."
            : "Choose a strong new password for your account."
          }
        </p>
      </div>

      {success ? (
        <div className="flex flex-col items-center text-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl bg-[#8b7bf5]/10 border border-[#8b7bf5]/20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-[#8b7bf5]/10 animate-ping opacity-30" />
            <CheckCircle2 className="relative z-10 w-7 h-7 text-[#8b7bf5]" />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium mb-1.5">Password changed!</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Your password has been successfully reset.
              <br />
              You can now sign in with your new password.
            </p>
          </div>
          <Link href="/login" className="w-full">
            <Button className="auth-btn-shine w-full h-12 rounded-xl border-none bg-gradient-to-r from-[#8b7bf5] to-[#6a5cd4] text-white text-sm font-semibold cursor-pointer transition-all duration-300 active:scale-[.98] hover:shadow-[0_8px_32px_-4px_rgba(139,123,245,0.5)] hover:brightness-110">
              Go to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                minLength={8}
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
            className="auth-btn-shine mt-2 w-full h-12 rounded-xl border-none bg-gradient-to-r from-[#8b7bf5] to-[#6a5cd4] text-white text-sm font-semibold cursor-pointer transition-all duration-300 active:scale-[.98] hover:shadow-[0_8px_32px_-4px_rgba(139,123,245,0.5)] hover:brightness-110 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Reset Password"}
          </Button>
        </form>
      )}

      <div className="text-center mt-6 text-[13px]">
        <Link href="/login" className="group text-muted-foreground/60 no-underline hover:text-foreground transition-all duration-300 inline-flex items-center gap-1.5 font-medium">
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to login
        </Link>
      </div>
    </>
  );
}
