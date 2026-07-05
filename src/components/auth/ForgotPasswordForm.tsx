'use client';

import { useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import Link from "next/link";

const inputClass = "auth-input-glow w-full h-11 px-4 rounded-xl border border-border bg-background/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300 focus:border-[#8b7bf5]/50 focus:bg-background/80";
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground block mb-2";

interface ForgotPasswordFormProps {
  backToLoginText?: string;
}

export function ForgotPasswordForm({
  backToLoginText = "Back to login",
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!captchaToken) {
      toast.error('Please complete the CAPTCHA.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, recaptchaToken: captchaToken }),
      });

      if (response.ok) {
        setSent(true);
        toast.success('Password reset link has been sent!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'An error occurred. Please try again.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="dark" />

      <div className="mt-8 mb-8">
        <h1 className="text-[28px] font-bold m-0 mb-2 tracking-tight text-foreground">Forgot password</h1>
        <p className="m-0 text-muted-foreground text-[13px] leading-relaxed">
          {sent
            ? "Check your email for a reset link."
            : "No worries! Enter your email and we'll send you a reset link."
          }
        </p>
      </div>

      {sent ? (
        <div className="flex flex-col items-center text-center gap-5">
          <div className="relative w-16 h-16 rounded-2xl bg-[#8b7bf5]/10 border border-[#8b7bf5]/20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-[#8b7bf5]/10 animate-ping opacity-30" />
            <CheckCircle2 className="relative z-10 w-7 h-7 text-[#8b7bf5]" />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium mb-1.5">Email sent successfully!</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              We&apos;ve sent a password reset link to
              <br />
              <span className="text-[#a89bff] font-medium text-[13px]">{email}</span>
            </p>
          </div>
          <Button
            onClick={() => { setSent(false); setEmail(""); setCaptchaToken(null); captchaRef.current?.resetCaptcha(); }}
            className="group w-full h-11 rounded-xl border border-border bg-background/40 text-[13px] text-muted-foreground cursor-pointer transition-all duration-300 hover:bg-background/80 hover:border-border/80 hover:text-foreground"
          >
            <Mail className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
            Send to a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputClass}
            />
          </div>

          <div className="pt-1">
            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
              onVerify={setCaptchaToken}
              ref={captchaRef}
              theme="dark"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="auth-btn-shine mt-2 w-full h-12 rounded-xl border-none bg-gradient-to-r from-[#8b7bf5] to-[#6a5cd4] text-white text-sm font-semibold cursor-pointer transition-all duration-300 active:scale-[.98] hover:shadow-[0_8px_32px_-4px_rgba(139,123,245,0.5)] hover:brightness-110 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Send Reset Link"}
          </Button>
        </form>
      )}

      <div className="text-center mt-6 text-[13px]">
        <Link href="/login" className="group text-muted-foreground/60 no-underline hover:text-foreground transition-all duration-300 inline-flex items-center gap-1.5 font-medium">
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          {backToLoginText}
        </Link>
      </div>
    </>
  );
}
