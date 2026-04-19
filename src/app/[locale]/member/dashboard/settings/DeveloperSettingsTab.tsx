'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Globe, Landmark, Sparkles, Send, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { toast } from 'react-toastify';
import { getSdk } from '@/lib/sdk';
import { DeveloperProfile } from '@chanomhub/sdk';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';

export function DeveloperSettingsTab() {
  const t = useTranslations('DeveloperSettingsTab');
  const searchParams = useSearchParams();
  const rawToken = searchParams.get('token');
  const urlToken = rawToken === 'undefined' ? null : rawToken;
  const cookieToken = Cookies.get('dev_verification_token');
  const activeToken = urlToken || cookieToken;

  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(!!activeToken); 
  const [verificationToken, setVerificationToken] = useState<string | null>(activeToken || null);

  // Form states
  const [realName, setRealName] = useState("");
  const [bankType, setBankType] = useState<"LOCAL" | "INTERNATIONAL">("LOCAL");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [citizenId, setCitizenId] = useState("");

  const fetchProfile = async () => {
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
        setProfile(null);
      }
    } catch (error: any) {
      console.error("General fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleStartApplication = () => {
    setIsApplying(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const sdk = await getSdk();
      
      if (verificationToken) {
        // Step 2: Final Activation using the token received from Admin
        await sdk.developer.verifyDeveloper(verificationToken, {
          realName,
          bankType,
          bankName,
          bankAccount,
          swiftCode: bankType === "INTERNATIONAL" ? swiftCode : undefined,
          bankAddress: bankType === "INTERNATIONAL" ? bankAddress : undefined,
          citizenId: citizenId || undefined,
        });
        toast.success("Account activated! You are now a verified developer.");
        Cookies.remove('dev_verification_token');
      } else {
        // Step 1: Initial submission of identity info for Admin review
        await sdk.developer.submitApplication({
          realName,
          bankType,
          bankName,
          bankAccount,
          swiftCode: bankType === "INTERNATIONAL" ? swiftCode : undefined,
          bankAddress: bankType === "INTERNATIONAL" ? bankAddress : undefined,
          citizenId: citizenId || undefined,
        });
        toast.success("Information submitted! Admin will review and send your verification link.");
      }

      setIsApplying(false);
      window.history.replaceState({}, '', window.location.pathname + '?tab=developer');
      fetchProfile();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to process application");
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
            <CardTitle>{verificationToken ? 'Activate Developer Status' : 'Developer Identity & Payouts'}</CardTitle>
            <CardDescription>
              {verificationToken 
                ? 'Your link is valid. Click the button below to receive your developer role.'
                : 'Enter your legal identity and payout details. Admin will review this to generate your activation link.'}
            </CardDescription>
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
                <Button type="submit" disabled={saving} className={`flex-1 gap-2 ${verificationToken ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : verificationToken ? <Key className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  {verificationToken ? 'Activate Developer Account' : 'Submit for Admin Review'}
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
              Applications are reviewed manually. After review, you will receive an activation link.
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
            <AlertTitle className="font-bold">{profile.isVerified ? 'Developer Verified' : 'Awaiting Final Activation'}</AlertTitle>
            <AlertDescription className="text-xs opacity-90">
              {profile.isVerified
                ? `Your account was successfully verified on ${new Date(profile.verifiedAt!).toLocaleDateString()}.`
                : 'Admin has received your data. Once they approve, they will send you a link to activate your developer role.'}
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
              <Label htmlFor="updateCitizenId">Identification (Citizen ID / Passport)</Label>
              <Input id="updateCitizenId" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} placeholder="For verification purpose" />
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

      {profile.isVerified && (
        <Card className="border-amber-500/20 shadow-sm overflow-hidden">
          <CardHeader className="bg-amber-500/5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Patreon Integration</CardTitle>
                <CardDescription>Connect your Patreon to allow members to unlock your content on ChanomHub.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/30 dark:border-amber-500/20 dark:bg-amber-500/5">
              <div className="space-y-1">
                <p className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                  {profile.patreonCampaignId ? (
                    <><CheckCircle2 className="h-4 w-4 text-green-500" /> Connected to Patreon</>
                  ) : (
                    "Not connected to Patreon"
                  )}
                </p>
                <p className="text-xs text-amber-700/70 dark:text-amber-400/70">
                  {profile.patreonCampaignId 
                    ? `Campaign ID: ${profile.patreonCampaignId}` 
                    : "Connect your Patreon account to sync your campaign and enable membership checks."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white hover:bg-amber-50 border-amber-200 text-amber-700 font-bold"
                  onClick={async () => {
                    try {
                      const sdk = await getSdk();
                      const { url } = await sdk.patreon.getAuthUrl();
                      if (url) window.location.href = url;
                    } catch (e) {
                      toast.error("Failed to start Patreon connection");
                    }
                  }}
                >
                  {profile.patreonCampaignId ? "Reconnect Patreon" : "Connect Patreon"}
                </Button>
                {profile.patreonCampaignId ? (
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-amber-700 hover:bg-amber-100"
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const sdk = await getSdk();
                        const { campaignId } = await sdk.patreon.syncCampaign();
                        if (campaignId) {
                          toast.success("Patreon campaign synced successfully!");
                          fetchProfile();
                        }
                      } catch (e) {
                        toast.error("Failed to sync Patreon campaign");
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                   >
                     {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sync Campaign"}
                   </Button>
                ) : null}
              </div>
            </div>
            
            <Alert className="bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-[10px] leading-relaxed">
                {t('patreonIntegrationDesc')}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
