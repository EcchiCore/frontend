'use client';

import React, { useState } from 'react';
import { walletApi, ApiError } from '@/lib/api/dashboardApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, CircleHelp, Coins, Gift, ArrowRight, Clipboard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUser } from '@/store/features/auth/authSlice';

export const WalletPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const extractVoucherCode = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';

    try {
      const url = new URL(trimmed);
      const codeFromUrl = url.searchParams.get('v') || url.searchParams.get('voucher');
      if (codeFromUrl) {
        return codeFromUrl.trim();
      }
    } catch {
      // Not a full URL
    }

    const directMatch = trimmed.match(/([?&]v=|v=)([^&\s]+)/i);
    if (directMatch && directMatch[2]) {
      return directMatch[2];
    }

    return trimmed;
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setVoucherCode(text);
      }
    } catch (e) {
      console.error("Clipboard permission error:", e);
    }
  };

  const handleRedeem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = extractVoucherCode(voucherCode);

    if (!normalizedCode) {
      setError('Please enter a voucher code.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      setVoucherCode(normalizedCode);
      const response = await walletApi.redeemTrueMoney({ voucherCode: normalizedCode });
      const successMessage = response?.message || 'Voucher redeemed successfully!';
      setMessage(successMessage);
      setVoucherCode('');
      await dispatch(fetchUser());
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Voucher redemption failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" /> Wallet & Points
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Redeem TrueMoney angpao vouchers to convert them into points for unlocked content.
        </p>
      </div>

      {/* Credit Card / Balance Banner */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#8b7bf5] via-[#6a5cd4] to-[#4c3fb5] text-white shadow-xl shadow-primary/20 overflow-hidden">
        {/* Glow & Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-black/20 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80 font-medium text-xs uppercase tracking-wider">
              <Gift className="h-4 w-4" /> Available Balance
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight flex items-baseline gap-2">
              {user?.points ?? 0} <span className="text-lg font-semibold text-white/80">Points</span>
            </div>
            <p className="text-xs text-white/70">
              Account: <span className="font-semibold text-white">{user?.username || 'User'}</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-xs text-white/90 max-w-xs space-y-1">
            <p className="font-bold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-300" /> Instant Conversion
            </p>
            <p className="text-white/75">
              TrueMoney Angpao links are automatically processed into Points immediately upon redemption.
            </p>
          </div>
        </div>
      </div>

      {/* Alert notifications */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Redemption Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* TrueMoney Voucher Form Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" /> Redeem TrueMoney Angpao Voucher
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Paste the full TrueMoney Angpao link or code (characters after <code>v=</code>) below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleRedeem}>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="voucher-code">
                Voucher Link / Code
              </label>
              <div className="flex gap-2">
                <Input
                  id="voucher-code"
                  placeholder="https://gift.truemoney.com/campaign/?v=xxxxxx"
                  value={voucherCode}
                  onChange={(event) => setVoucherCode(event.target.value)}
                  disabled={loading}
                  className="h-11"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePaste}
                  disabled={loading}
                  className="h-11 px-4 gap-2"
                  title="Paste from Clipboard"
                >
                  <Clipboard className="h-4 w-4" /> Paste
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 font-semibold gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Redeem Voucher Now
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base text-foreground">Secure Redemption</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Verified with TrueMoney Gateway API
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Voucher redemption is executed in real-time. Once validated, your points will update instantly without needing to log out.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <CircleHelp className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base text-foreground">Troubleshooting</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Having issues with your voucher?
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Make sure the TrueMoney Angpao voucher hasn't expired or been claimed by another person already. Ensure the link contains the parameter <code className="text-primary font-mono">v=...</code>.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletPage;
