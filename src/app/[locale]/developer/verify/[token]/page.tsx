'use client';

import { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { getSdk } from '@/lib/sdk';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

/**
 * Developer Verification Automatic Page
 * 
 * When a user visits this link, we automatically call the verification API
 * to grant them the DEVELOPER role and then redirect them to the dashboard.
 */
export default function VerificationRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const locale = params.locale as string || 'en';
  
  const [status, setStatus] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('ERROR');
        setErrorMessage('Invalid verification token.');
        return;
      }

      try {
        setStatus('VERIFYING');
        const sdk = await getSdk();
        
        // Call the API automatically with the token
        // Since we already have the data in Step 1, we pass empty fields 
        // to satisfy the SDK's types (Backend now handles partial body)
        await sdk.developer.verifyDeveloper(token, {} as any);
        
        setStatus('SUCCESS');
        toast.success("Developer status activated successfully!");
        
        // Clean up any pending cookies
        Cookies.remove('dev_verification_token');

        // Redirect after a short delay so they can see the success state
        setTimeout(() => {
          router.push(`/${locale}/member/dashboard/settings?tab=developer`);
        }, 2000);
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus('ERROR');
        setErrorMessage(error.message || 'Failed to activate developer status.');
        toast.error(error.message || "Activation failed.");
      }
    };

    performVerification();
  }, [token, locale, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in fade-in duration-500">
      <div className={`p-6 rounded-full mb-8 transition-colors duration-500 ${
        status === 'VERIFYING' ? 'bg-primary/10' : 
        status === 'SUCCESS' ? 'bg-green-500/10' : 'bg-red-500/10'
      }`}>
        {status === 'VERIFYING' && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
        {status === 'SUCCESS' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
        {status === 'ERROR' && <AlertCircle className="h-16 w-16 text-red-500" />}
      </div>

      <h1 className="text-3xl font-bold mb-3 tracking-tight">
        {status === 'VERIFYING' && 'Activating Developer Account...'}
        {status === 'SUCCESS' && 'Welcome, Creator!'}
        {status === 'ERROR' && 'Verification Failed'}
      </h1>

      <p className="text-muted-foreground text-lg max-w-md mx-auto">
        {status === 'VERIFYING' && 'Connecting to the hub and assigning your new roles. Just a moment...'}
        {status === 'SUCCESS' && 'Your developer role has been granted. Redirecting to your dashboard...'}
        {status === 'ERROR' && (errorMessage || 'We could not verify your token. It might be expired or already used.')}
      </p>

      {status === 'ERROR' && (
        <div className="mt-8">
          <button 
            onClick={() => router.push(`/${locale}/member/dashboard`)}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
