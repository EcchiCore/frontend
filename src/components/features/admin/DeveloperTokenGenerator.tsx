'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { getSdk } from '@/lib/sdk';
import { Copy, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DeveloperTokenGenerator() {
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const t = useTranslations('Admin');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setLoading(true);
        setGeneratedToken(null);
        setCopySuccess(false);

        try {
            const sdk = await getSdk();
            const result = await sdk.developer.generateVerificationToken(parseInt(userId));
            setGeneratedToken(result.token);
            toast.success(t('tokenGenerated'));
        } catch (error: any) {
            console.error("Error generating token:", error);
            toast.error(error.message || "Failed to generate token");
        } finally {
            setLoading(false);
        }
    };

    const getVerificationUrl = () => {
        if (!generatedToken) return '';
        const origin = window.location.origin;
        
        // Get locale safely from path or fallback to default
        const pathParts = window.location.pathname.split('/');
        // Path is usually /[locale]/member/dashboard/...
        const locale = pathParts[1] || 'en';
        
        // Final URL should point to the standalone redirector
        return `${origin}/${locale}/developer/verify/${generatedToken}`;
    };

    const copyToClipboard = () => {
        const url = getVerificationUrl();
        navigator.clipboard.writeText(url);
        setCopySuccess(true);
        toast.info(t('copied'));
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {t('developerOnboarding')}
                </CardTitle>
                <CardDescription>
                    {t('generateTokenDescription')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="userId">{t('userIdLabel')}</Label>
                        <div className="flex gap-2">
                            <Input
                                id="userId"
                                type="number"
                                placeholder={t('userIdPlaceholder')}
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="max-w-[200px]"
                                required
                            />
                            <Button 
                                type="submit" 
                                disabled={loading || !userId}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {loading ? t('generating') : t('generateButton')}
                            </Button>
                        </div>
                    </div>
                </form>

                {generatedToken && (
                    <div className="mt-6 p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/30 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
                            {t('oneTimeLink')}
                        </Label>
                        <div className="mt-2 flex gap-2">
                            <Input
                                readOnly
                                value={getVerificationUrl()}
                                className="bg-black/20 border-indigo-500/20 text-indigo-100 font-mono text-sm"
                            />
                            <Button 
                                variant="outline" 
                                size="icon"
                                title={t('copyTooltip')}
                                onClick={copyToClipboard}
                                className="flex-shrink-0 border-indigo-500/30 hover:bg-indigo-500/20"
                            >
                                {copySuccess ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="mt-3 text-xs text-indigo-300/70 italic">
                            {t('linkExpiryNotice')}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
