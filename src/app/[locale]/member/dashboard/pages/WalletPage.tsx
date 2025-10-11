'use client';

import React, { useState } from 'react';
import { walletApi, ApiError } from '../utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, CircleHelp } from 'lucide-react';
import { useAuthContext } from '../providers/AuthProvider';

export const WalletPage: React.FC = () => {
  const { user, refreshUser } = useAuthContext();
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
      // Not a full URL, continue with pattern matching below
    }

    const directMatch = trimmed.match(/([?&]v=|v=)([^&\s]+)/i);
    if (directMatch && directMatch[2]) {
      return directMatch[2];
    }

    return trimmed;
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
      const successMessage = response?.message || 'Voucher redeemed successfully.';
      setMessage(successMessage);
      setVoucherCode('');
      await refreshUser();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Voucher redemption failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Wallet</h1>
        <p className="text-sm text-muted-foreground">
          Redeem TrueMoney angpao vouchers to convert them into points. Current balance: {user?.points ?? 0} points.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Redeem voucher</CardTitle>
          <CardDescription className="text-muted-foreground">
            Paste the characters after <code>v=</code> from your TrueMoney angpao link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleRedeem}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="voucher-code">
                Voucher code
              </label>
              <Input
                id="voucher-code"
                placeholder="Paste code or full TrueMoney link"
                value={voucherCode}
                onChange={(event) => setVoucherCode(event.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Redeem now
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base text-foreground">Secure redemption</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Codes are validated directly with TrueMoney.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Successfully redeemed vouchers are converted into points instantly. Your new balance will appear above after redemption.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <CircleHelp className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base text-foreground">Need help?</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Make sure your code has not expired or been used.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Double-check that the code includes only letters and numbers. Contact support if the issue persists after multiple attempts.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
