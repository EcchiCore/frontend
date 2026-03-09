'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Globe, Landmark, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getSdk } from '@/lib/sdk';
import { DeveloperProfile } from '@chanomhub/sdk';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

export function DeveloperSettingsTab() {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get('token');

  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(!!urlToken); // Set to true if token exists in URL
  const [verificationToken, setVerificationToken] = useState<string | null>(urlToken);

  // Form states
  const [realName, setRealName] = useState("");
  const [bankType, setBankType] = useState<"LOCAL" | "INTERNATIONAL">("LOCAL");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [citizenId, setCitizenId] = useState("");

  const fetchProfile = async () => {
    // Optimization: If we are already applying with a token, don't even try to fetch profile
    if (urlToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const sdk = await getSdk();

      try {
        const response = await sdk.developer.getProfile();
        const data = (response as any)?.data || response;
        setProfile(data);

        if (data) {
          setRealName(data.realName || "");
          setBankType(data.bankType as any || "LOCAL");
          setBankName(data.bankName || "");
          setBankAccount(data.bankAccount || "");
          setSwiftCode(data.swiftCode || "");
          setBankAddress(data.bankAddress || "");
          setCitizenId(data.citizenId || "");
        }
      } catch (sdkError: any) {
        // If 404, just set profile to null and don't log error
        const errorStr = typeof sdkError === 'string' ? sdkError : (sdkError?.message || "");
        if (errorStr.includes('404') || sdkError?.status === 404) {
          setProfile(null);
        } else {
          // Real errors should still be logged
          console.error("SDK fetch error:", sdkError);
        }
      }
    } catch (error: any) {
      console.error("General fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [urlToken]);

  const handleStartApplication = async () => {
    setSaving(true);
    try {
      const token = Cookies.get('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com';
      const apiPath = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

      const response = await fetch(`${apiPath}/developer/generate-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) throw new Error('Failed to start application');

      const data = await response.json();
      setVerificationToken(data.token);
      setIsApplying(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to start application process");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationToken) return;

    setSaving(true);
    try {
      const token = Cookies.get('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com';
      const apiPath = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

      const response = await fetch(`${apiPath}/developer/verify/${verificationToken}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          realName,
          bankType,
          bankName,
          bankAccount,
          swiftCode: bankType === "INTERNATIONAL" ? swiftCode : undefined,
          bankAddress: bankType === "INTERNATIONAL" ? bankAddress : undefined,
          citizenId: citizenId || undefined,
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to submit application');
      }

      toast.success("Application submitted! Our administrators will review it shortly.");
      setIsApplying(false);
      // Clean up URL token after submission
      window.history.replaceState({}, '', window.location.pathname + '?tab=developer');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const sdk = await getSdk();
      const updated = await sdk.developer.updateProfile({
        realName,
        bankType,
        bankName,
        bankAccount,
        swiftCode: bankType === "INTERNATIONAL" ? swiftCode : undefined,
        bankAddress: bankType === "INTERNATIONAL" ? bankAddress : undefined,
        citizenId: citizenId || undefined,
      });

      setProfile(updated);
      toast.success("Developer profile updated successfully!");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="animate-pulse">Loading developer portal...</p>
      </div>
    );
  }

  // Application Form UI (For New Applicants)
  if (!profile && isApplying) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle>Developer Application</CardTitle>
            <CardDescription>Enter your payout and identity details for verification.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitApplication} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="realName">Legal Full Name</Label>
                <Input
                  id="realName"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  required
                  placeholder="Enter your real name as shown in bank account"
                />
              </div>

              <div className="space-y-2">
                <Label>Payout Method</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={bankType === "LOCAL" ? "secondary" : "outline"}
                    className={bankType === "LOCAL" ? "border-primary bg-primary/10" : ""}
                    onClick={() => setBankType("LOCAL")}
                  >
                    <Landmark className="h-4 w-4 mr-2" />
                    Thai Bank
                  </Button>
                  <Button
                    type="button"
                    variant={bankType === "INTERNATIONAL" ? "secondary" : "outline"}
                    className={bankType === "INTERNATIONAL" ? "border-primary bg-primary/10" : ""}
                    onClick={() => setBankType("INTERNATIONAL")}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    International
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    placeholder={bankType === "LOCAL" ? "e.g. KBank, SCB" : "Bank Name"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Account Number</Label>
                  <Input
                    id="bankAccount"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    required
                    placeholder="Account number or IBAN"
                  />
                </div>
              </div>

              {bankType === "INTERNATIONAL" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
                    <Input id="swiftCode" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAddress">Bank Branch Address</Label>
                    <Input id="bankAddress" value={bankAddress} onChange={(e) => setBankAddress(e.target.value)} required />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="citizenId">Identification (Citizen ID / Passport)</Label>
                <Input id="citizenId" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} placeholder="For verification purpose" />
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <Button type="button" variant="ghost" onClick={() => setIsApplying(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1 gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // CTA for non-developers
  if (!profile) {
    return (
      <div className="animate-in fade-in duration-700">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="h-32 w-32 text-primary" />
          </div>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Landmark className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Become a Creator</CardTitle>
            <CardDescription className="max-w-md mx-auto text-base">
              Monetize your creations, reach thousands of players, and build your gaming legacy on ChanomHub.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <ul className="text-sm text-muted-foreground space-y-2 mb-8 inline-block text-left">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Upload and manage your games/mods</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Earn revenue from subscriptions & purchases</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Verified developer badge on your profile</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="px-8 font-bold gap-2 shadow-lg hover:shadow-primary/20 transition-all" onClick={handleStartApplication} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Apply for Developer Status
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t py-3 justify-center">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" />
              Applications are usually reviewed within 24-48 hours.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Main Developer Dashboard (For existing developers)
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Alert className={`border-none shadow-sm ${profile.isVerified ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'}`}>
        <div className="flex items-center gap-3">
          {profile.isVerified ? <CheckCircle2 className="h-5 w-5" /> : <Loader2 className="h-5 w-5 animate-spin" />}
          <div className="flex-1">
            <AlertTitle className="font-bold">{profile.isVerified ? 'Developer Verified' : 'Pending Verification'}</AlertTitle>
            <AlertDescription className="text-xs opacity-90">
              {profile.isVerified
                ? `Your account was successfully verified on ${new Date(profile.verifiedAt!).toLocaleDateString()}.`
                : 'Your application is currently being reviewed by our moderation team. You can still manage your data below.'}
            </AlertDescription>
          </div>
          <Badge variant={profile.isVerified ? 'default' : 'outline'} className={profile.isVerified ? 'bg-green-600 text-white hover:bg-green-700' : 'text-yellow-700 border-yellow-700/30 dark:text-yellow-400 dark:border-yellow-400/30'}>
            {profile.isVerified ? 'Active' : 'Under Review'}
          </Badge>
        </div>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Developer Identity & Payouts</CardTitle>
          <CardDescription>
            Update your legal and financial information. This data is kept secure and used only for payout purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="realName">Legal Full Name</Label>
              <Input id="realName" value={realName} onChange={(e) => setRealName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Payout Destination</Label>
              <div className="flex gap-4">
                <Button type="button" variant={bankType === "LOCAL" ? "secondary" : "outline"} className={`flex-1 ${bankType === "LOCAL" ? "bg-primary/5 border-primary" : ""}`} onClick={() => setBankType("LOCAL")}>
                  <Landmark className="h-4 w-4 mr-2" /> Thai Bank
                </Button>
                <Button type="button" variant={bankType === "INTERNATIONAL" ? "secondary" : "outline"} className={`flex-1 ${bankType === "INTERNATIONAL" ? "bg-primary/5 border-primary" : ""}`} onClick={() => setBankType("INTERNATIONAL")}>
                  <Globe className="h-4 w-4 mr-2" /> International
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Account Number</Label>
                <Input id="bankAccount" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} required />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
